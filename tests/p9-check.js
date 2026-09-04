const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function clickNodeByLabel(page, label) {
  const pt = await page.evaluate((args) => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    const n = g.getNodes().find((x) => x.attr('label/text') === args.label);
    if (!n) return null;
    const b = n.getBBox();
    const p = g.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    return { x: p.x, y: p.y };
  }, { label });
  if (!pt) throw new Error('node not found: ' + label);
  await page.mouse.click(pt.x, pt.y);
}

async function main() {
  fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());

  await page.goto(pathToFileURL(path.join(root, 'editor.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);

  await page.selectOption('#tpl-select', 'rca');
  await page.waitForTimeout(700);

  // 历史面板：修改样式后可撤销
  await clickNodeByLabel(page, '流程制度');
  await page.waitForSelector('#prop-fill', { timeout: 5000 });
  await page.$eval('#prop-fill', (el) => {
    el.value = '#123456';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  await page.click('#btn-history');
  await page.waitForTimeout(200);
  const panelText = await page.locator('#history-panel').innerText();
  const hasStyleEntry = panelText.includes('修改样式');
  await page.click('#hp-undo');
  await page.waitForTimeout(300);
  const fillAfterUndo = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().find((n) => n.attr('label/text') === '流程制度').attr('body/fill'));
  await page.screenshot({ path: path.join(shots, 'p9-history.png'), fullPage: true });

  // 批量节点样式：字号 + 字重
  const clearPt = await page.evaluate(() => {
    const r = document.getElementById('container').getBoundingClientRect();
    return { x: r.x + 8, y: r.y + 8 };
  });
  await page.mouse.click(clearPt.x, clearPt.y);
  await page.waitForTimeout(200);
  await page.keyboard.down('Control');
  await clickNodeByLabel(page, '流程制度');
  await clickNodeByLabel(page, '人员操作');
  await page.keyboard.up('Control');
  await page.waitForSelector('#prop-batch-font-size', { timeout: 5000 });
  await page.$eval('#prop-batch-font-size', (el) => {
    el.value = '20';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.selectOption('#prop-batch-font-weight', '700');
  await page.waitForTimeout(300);
  const batchFont = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return ['流程制度', '人员操作'].map((label) => {
      const n = g.getNodes().find((x) => x.attr('label/text') === label);
      return { size: n.attr('label/fontSize'), weight: n.attr('label/fontWeight') };
    });
  });
  await page.screenshot({ path: path.join(shots, 'p9-batch.png'), fullPage: true });

  // 批量连线样式：箭头 + 虚线
  await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const edges = ctx.canvas.graph.getEdges().slice(0, 2);
    ctx.canvas.selection.select(edges);
  });
  await page.waitForSelector('#prop-batch-arrow', { timeout: 5000 });
  await page.$eval('#prop-batch-arrow', (el) => {
    el.value = '12';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.$eval('#prop-batch-dash', (el) => {
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  const batchEdge = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return g.getEdges().slice(0, 2).map((e) => {
      const line = e.attr('line') || {};
      return { arrow: (line.targetMarker || {}).width, dash: line.strokeDasharray };
    });
  });

  // 模板应用进入历史面板
  await page.click('#btn-history');
  await page.waitForTimeout(200);
  const panelText2 = await page.locator('#history-panel').innerText();
  const hasTemplateEntry = panelText2.includes('应用模板: 根因分析');

  console.log(JSON.stringify({
    hasStyleEntry, fillAfterUndo,
    batchFont, batchEdge, hasTemplateEntry, errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
