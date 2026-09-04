const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');
const editorUrl = pathToFileURL(path.join(root, 'editor.html')).href;

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

async function cdpTouch(client, type, points) {
  await client.send('Input.dispatchTouchEvent', { type, touchPoints: points });
}

async function main() {
  fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });

  // ---------- 桌面回归 ----------
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  const downloads = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());
  page.on('download', (d) => downloads.push(d.suggestedFilename()));

  await page.goto(editorUrl, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);

  await page.selectOption('#tpl-select', 'rca');
  await page.waitForTimeout(700);
  const rcaLabels = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().map((n) => n.attr('label/text')).filter(Boolean));
  const rcaOk = rcaLabels.includes('制度流程') && rcaLabels.includes('监督管理');
  await page.screenshot({ path: path.join(shots, 'p7-qc.png'), fullPage: true });

  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);
  const classicLabels = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().map((n) => n.attr('label/text')).filter(Boolean));
  const classicOk = classicLabels.includes('人') && classicLabels.includes('机');
  await page.screenshot({ path: path.join(shots, 'p7-nursing.png'), fullPage: true });

  // 连线样式预设
  const edgePreset = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const edge = ctx.canvas.graph.getEdges()[0];
    ctx.canvas.selection.select([edge]);
    return edge.id;
  });
  await page.waitForSelector('#prop-edge-preset', { timeout: 5000 });
  await page.selectOption('#prop-edge-preset', 'bold');
  await page.waitForTimeout(300);
  const edgeAfterPreset = await page.evaluate((id) => {
    const e = window.__ygt.ctx.canvas.graph.getCellById(id);
    const line = e.attr('line') || {};
    return { stroke: line.stroke, strokeWidth: line.strokeWidth };
  }, edgePreset);

  // 复制 / 粘贴提示
  await clickNodeByLabel(page, '人');
  await page.waitForSelector('#prop-copy', { timeout: 5000 });
  await page.click('#prop-copy');
  await page.waitForTimeout(250);
  const copyToast = await page.evaluate(() => document.querySelector('.ygt-global-toast').textContent);
  await page.click('#prop-paste');
  await page.waitForTimeout(250);
  const pasteToast = await page.evaluate(() => document.querySelector('.ygt-global-toast').textContent);

  // 删除与撤销恢复
  const countBeforeDelete = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);
  await clickNodeByLabel(page, '机');
  await page.waitForTimeout(200);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  const countAfterDelete = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);
  const deleteToast = await page.evaluate(() => document.querySelector('.ygt-global-toast').textContent);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(400);
  const countAfterUndo = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);

  // 空画布引导
  await page.click('#btn-clear');
  await page.waitForTimeout(300);
  const emptyHintVisible = await page.evaluate(() => {
    const el = document.querySelector('.ygt-empty-hint');
    return el && getComputedStyle(el).display === 'flex';
  });
  await page.click('.ygt-empty-hint button');
  await page.waitForTimeout(500);
  const countAfterEmptyAction = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);
  const emptyHintHidden = await page.evaluate(() => {
    const el = document.querySelector('.ygt-empty-hint');
    return el && getComputedStyle(el).display === 'none';
  });

  // PDF 导出
  await page.click('#btn-export-pdf');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, 'p7-final.png'), fullPage: true });

  // ---------- 触屏模拟回归 ----------
  const touchErrors = [];
  const touchCtx = await browser.newContext({
    viewport: { width: 900, height: 1000 }, hasTouch: true, isMobile: true
  });
  const touchPage = await touchCtx.newPage();
  touchPage.on('pageerror', (e) => touchErrors.push(e.message));
  touchPage.on('dialog', (d) => d.accept());
  await touchPage.goto(editorUrl, { waitUntil: 'load', timeout: 30000 });
  await touchPage.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await touchPage.waitForTimeout(500);
  const client = await touchCtx.newCDPSession(touchPage);
  const nodesBeforeTouch = await touchPage.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);

  const item = touchPage.locator('#stencil .x6-node').filter({ hasText: '内容节点' }).first();
  const ib = await item.boundingBox();
  const cb = await touchPage.locator('#container').boundingBox();
  if (ib && cb) {
    const start = { x: ib.x + ib.width / 2, y: ib.y + ib.height / 2 };
    const end = { x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 };
    await cdpTouch(client, 'touchStart', [{ x: start.x, y: start.y }]);
    for (let i = 1; i <= 8; i++) {
      await cdpTouch(client, 'touchMove', [{
        x: start.x + (end.x - start.x) * i / 8,
        y: start.y + (end.y - start.y) * i / 8
      }]);
      await touchPage.waitForTimeout(40);
    }
    await cdpTouch(client, 'touchEnd', []);
  }
  await touchPage.waitForTimeout(600);
  const nodesAfterTouchDrag = await touchPage.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);

  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await cdpTouch(client, 'touchStart', [{ x: cx - 30, y: cy }, { x: cx + 30, y: cy }]);
  await cdpTouch(client, 'touchMove', [{ x: cx - 90, y: cy }, { x: cx + 90, y: cy }]);
  await cdpTouch(client, 'touchEnd', []);
  await touchPage.waitForTimeout(400);
  await touchPage.screenshot({ path: path.join(shots, 'p7-touch.png'), fullPage: true });

  console.log(JSON.stringify({
    rcaOk, classicOk, edgeAfterPreset, copyToast, pasteToast,
    deleteRestored: countAfterDelete === countBeforeDelete - 1 && countAfterUndo === countBeforeDelete,
    emptyHintVisible, countAfterEmptyAction, emptyHintHidden,
    pdfDownload: downloads.find((f) => f.endsWith('.pdf')) || null,
    touchDragAdded: nodesAfterTouchDrag === nodesBeforeTouch + 1,
    touchErrors, errors
  }, null, 2));

  await browser.close();
  if (errors.length || touchErrors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
