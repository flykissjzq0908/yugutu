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
    const node = g.getNodes().find((n) => n.attr('label/text') === args.label);
    if (!node) return null;
    const b = node.getBBox();
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
  let popupOpened = false;
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());
  page.on('popup', async (p) => { popupOpened = true; await p.close().catch(() => {}); });

  await page.goto(pathToFileURL(path.join(root, 'editor.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);

  // URL 超链接编辑
  await clickNodeByLabel(page, '人');
  await page.waitForSelector('#prop-url', { timeout: 5000 });
  await page.$eval('#prop-url', (el) => {
    el.value = 'https://example.com/link';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  const urlData = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const n = g.getNodes().find((x) => x.attr('label/text') === '人');
    return (n.getData() || {}).url;
  });
  const openBtnDisabled = await page.locator('#prop-open-url').isDisabled();
  await page.click('#prop-open-url');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, 'p4-url.png'), fullPage: true });

  // 复制 / 粘贴按钮
  const countBeforeCopy = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);
  await page.click('#prop-copy');
  await page.click('#prop-paste');
  await page.waitForTimeout(400);
  const afterPaste = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const nodes = g.getNodes();
    return {
      count: nodes.length,
      uniqueIds: new Set(nodes.map((n) => n.id)).size === nodes.length,
      selected: window.__ygt.ctx.canvas.selectedCells().length
    };
  });
  await page.screenshot({ path: path.join(shots, 'p4-copy.png'), fullPage: true });

  // Ctrl+D 快速复制
  await clickNodeByLabel(page, '机');
  await page.waitForTimeout(200);
  await page.keyboard.press('Control+d');
  await page.waitForTimeout(400);
  const afterDup = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const nodes = g.getNodes();
    return {
      count: nodes.length,
      uniqueIds: new Set(nodes.map((n) => n.id)).size === nodes.length
    };
  });

  await page.click('#btn-save');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(600);
  const afterReload = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const n = g.getNodes().find((x) => x.attr('label/text') === '人');
    return {
      count: g.getNodes().length,
      url: (n.getData() || {}).url
    };
  });
  await page.screenshot({ path: path.join(shots, 'p4-reload.png'), fullPage: true });

  console.log(JSON.stringify({
    urlData, openBtnDisabled, popupOpened,
    countBeforeCopy, afterPaste, afterDup, afterReload, errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
