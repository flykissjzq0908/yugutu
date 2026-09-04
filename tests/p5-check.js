const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function centerOf(page, label) {
  return page.evaluate((args) => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    const n = g.getNodes().find((x) => x.attr('label/text') === args.label);
    if (!n) return null;
    const b = n.getBBox();
    const p = g.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    return { x: p.x, y: p.y };
  }, { label });
}

async function positionsOf(page, labels) {
  return page.evaluate((args) => {
    const g = window.__ygt.ctx.canvas.graph;
    return args.labels.map((label) => {
      const n = g.getNodes().find((x) => x.attr('label/text') === label);
      const p = n.position();
      return { x: p.x, y: p.y };
    });
  }, { labels });
}

function near(a, b) {
  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
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
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message + ' @ ' + (e.stack || '').split('\n')[1] || ''));
  page.on('dialog', (d) => d.accept());

  await page.goto(pathToFileURL(path.join(root, 'editor.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);

  // 对齐：一次操作 = 一步撤销
  await page.keyboard.down('Control');
  for (const label of ['人', '机', '料']) {
    const pt = await centerOf(page, label);
    await page.mouse.click(pt.x, pt.y);
  }
  await page.keyboard.up('Control');
  await page.waitForSelector('button[data-align="top"]', { timeout: 5000 });
  const beforeTop = await positionsOf(page, ['人', '机', '料']);
  await page.click('button[data-align="top"]');
  await page.waitForTimeout(300);
  const afterTop = await positionsOf(page, ['人', '机', '料']);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(400);
  const undoTop = await positionsOf(page, ['人', '机', '料']);
  const alignUndoOneStep = undoTop.every((p, i) => near(p, beforeTop[i]));

  // 分布：用不等距节点验证一步撤销
  await page.evaluate(() => {
    const rect = document.getElementById('container').getBoundingClientRect();
    return { x: rect.x + 8, y: rect.y + 8 };
  }).then(async (p) => { await page.mouse.click(p.x, p.y); });
  await page.waitForTimeout(200);
  await page.keyboard.down('Control');
  for (const label of ['人', '料', '测']) {
    const pt = await centerOf(page, label);
    await page.mouse.click(pt.x, pt.y);
  }
  await page.keyboard.up('Control');
  await page.waitForSelector('button[data-align="top"]', { timeout: 5000 });
  await page.click('button[data-align="top"]');
  await page.waitForTimeout(300);
  const afterTop2 = await positionsOf(page, ['人', '料', '测']);
  await page.click('button[data-align="dist-h"]');
  await page.waitForTimeout(300);
  const afterDist = await positionsOf(page, ['人', '料', '测']);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(400);
  const undoDist = await positionsOf(page, ['人', '料', '测']);
  const distUndoOneStep = undoDist.every((p, i) => near(p, afterTop2[i]));

  // 批量样式：一步撤销
  const fillsBefore = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return ['人', '机'].map((label) => g.getNodes().find((n) => n.attr('label/text') === label).attr('body/fill'));
  });
  await page.waitForSelector('#prop-batch-fill', { timeout: 5000 });
  await page.$eval('#prop-batch-fill', (el) => {
    el.value = '#123456';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(400);
  const fillsAfterUndo = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return ['人', '机'].map((label) => g.getNodes().find((n) => n.attr('label/text') === label).attr('body/fill'));
  });
  const batchUndoOneStep = fillsAfterUndo.every((f, i) => f === fillsBefore[i]);
  await page.screenshot({ path: path.join(shots, 'p5-undo.png'), fullPage: true });

  // 拖拽：一次拖动 = 一步撤销
  const pt = await centerOf(page, '人');
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(200);
  const beforeDrag = await positionsOf(page, ['人']);
  await page.mouse.move(pt.x, pt.y);
  await page.mouse.down();
  await page.mouse.move(pt.x + 60, pt.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const afterDrag = await positionsOf(page, ['人']);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(400);
  const undoDrag = await positionsOf(page, ['人']);
  const dragUndoOneStep = near(undoDrag[0], beforeDrag[0]);

  // 面板折叠
  await page.click('#btn-toggle-palette');
  await page.waitForTimeout(200);
  const paletteHidden = await page.evaluate(() => getComputedStyle(document.getElementById('stencil')).display === 'none');
  await page.click('#btn-toggle-palette');
  await page.click('#btn-toggle-props');
  await page.waitForTimeout(200);
  const propsHidden = await page.evaluate(() => getComputedStyle(document.getElementById('props')).display === 'none');
  await page.screenshot({ path: path.join(shots, 'p5-panels.png'), fullPage: true });

  // 触屏冒烟：验证 touch-action 与平移 API 可用（真实触摸需真机验证）
  const touchInfo = await page.evaluate(() => ({
    hasTranslate: typeof window.__ygt.ctx.canvas.graph.translate === 'function',
    touchAction: getComputedStyle(document.getElementById('container')).touchAction
  }));

  console.log(JSON.stringify({
    alignUndoOneStep, distUndoOneStep, batchUndoOneStep, dragUndoOneStep,
    movedBeforeUndo: afterDrag[0].x !== beforeDrag[0].x,
    paletteHidden, propsHidden, touchInfo, errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
