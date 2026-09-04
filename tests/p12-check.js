const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function main() {
  fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  const downloads = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());
  page.on('download', (d) => downloads.push(d.suggestedFilename()));

  await page.goto(pathToFileURL(path.join(root, 'editor.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);

  // 鱼干（中脊）添加连接点
  const spineDot = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    ctx.canvas.selection.clean();
    const spine = g.getNodes().find((n) => n.shape === 'fish-spine');
    ctx.canvas.selection.select([spine]);
    return { id: spine.id, x: spine.position().x, width: spine.getSize().width };
  });
  await page.waitForSelector('#prop-spine-add-dot', { timeout: 5000 });
  await page.click('#prop-spine-add-dot');
  await page.waitForTimeout(400);
  const dotInfo = await page.evaluate((spineId) => {
    const g = window.__ygt.ctx.canvas.graph;
    const dots = g.getNodes().filter((n) => n.shape === 'dot-node');
    const dot = dots[dots.length - 1];
    const d = dot.getData() || {};
    const target = g.getNodes().find((n) => n.attr('label/text') === '人');
    const edge = g.addEdge({
      shape: 'bone-edge',
      source: { cell: dot.id, port: 'port-left' },
      target: { cell: target.id, port: 'port-right' }
    });
    return {
      attachNode: d.attachNode,
      ratioX: d.ratioX,
      dotX: dot.position().x,
      edgeId: edge.id
    };
  }, spineDot.id);

  // 拉长鱼干后连接点跟随
  const followInfo = await page.evaluate((spineId) => {
    const g = window.__ygt.ctx.canvas.graph;
    const spine = g.getCellById(spineId);
    const dots = g.getNodes().filter((n) => n.shape === 'dot-node');
    const dot = dots[dots.length - 1];
    const before = dot.position().x;
    spine.resize(spine.getSize().width + 100, spine.getSize().height);
    const after = dot.position().x;
    return { before, after, moved: after > before };
  }, spineDot.id);

  const portCount = await page.evaluate(() =>
    document.querySelectorAll('#container .x6-port-body').length +
    document.querySelectorAll('#container [class*="x6-port"]').length);

  await page.click('#btn-preview');
  await page.waitForTimeout(300);
  const previewState = await page.evaluate((edgeId) => {
    const container = document.getElementById('container');
    const overlay = document.querySelector('.ygt-preview-overlay');
    const port = document.querySelector('#container .x6-port-body') ||
      document.querySelector('#container [class*="x6-port"]');
    const dots = document.querySelectorAll('#container .x6-node[data-shape="dot-node"]');
    const edge = window.__ygt.ctx.canvas.graph.getCellById(edgeId);
    return {
      hasClass: container.classList.contains('ygt-preview'),
      portHidden: port ? getComputedStyle(port).display === 'none' : true,
      dotHidden: dots.length ? getComputedStyle(dots[dots.length - 1]).visibility === 'hidden' : true,
      bridgeVertex: edge.getVertices().length > 0,
      overlayVisible: overlay && getComputedStyle(overlay).display === 'flex',
      buttonText: document.querySelector('#btn-preview').textContent
    };
  }, dotInfo.edgeId);
  await page.screenshot({ path: path.join(shots, 'p12-preview.png'), fullPage: true });

  await page.evaluate(() => window.__ygt.ctx.canvas.setPreview(false));
  await page.waitForTimeout(300);
  const exited = await page.evaluate((edgeId) => {
    const container = document.getElementById('container');
    const port = document.querySelector('#container .x6-port-body') ||
      document.querySelector('#container [class*="x6-port"]');
    const dots = document.querySelectorAll('#container .x6-node[data-shape="dot-node"]');
    const edge = window.__ygt.ctx.canvas.graph.getCellById(edgeId);
    return {
      classRemoved: !container.classList.contains('ygt-preview'),
      portVisible: port ? getComputedStyle(port).display !== 'none' : true,
      dotVisible: dots.length ? getComputedStyle(dots[dots.length - 1]).visibility !== 'hidden' : true
    };
  }, dotInfo.edgeId);

  // 预览模式下导出 PNG（端口与连接点自动隐藏）
  await page.click('#btn-preview');
  await page.waitForTimeout(200);
  await page.click('#btn-export-png');
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__ygt.ctx.canvas.setPreview(false));
  await page.waitForTimeout(300);

  // 属性面板可删除鱼干连接点
  await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    ctx.canvas.selection.clean();
    ctx.canvas.selection.select([
      ctx.canvas.graph.getNodes().find((n) => n.shape === 'fish-spine')
    ]);
  });
  await page.waitForSelector('.spine-dot-row', { timeout: 5000 });
  const dotRowsBefore = await page.locator('.spine-dot-row').count();
  await page.click('.spine-dot-row [data-del-dot]');
  await page.waitForTimeout(300);
  const dotsAfterDelete = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().filter((n) => n.shape === 'dot-node').length);

  console.log(JSON.stringify({
    spineDotOk: dotInfo.attachNode === spineDot.id && typeof dotInfo.ratioX === 'number',
    followOk: followInfo.moved,
    portCount,
    previewState,
    exited,
    pngDownload: downloads.find((f) => f.endsWith('.png')) || null,
    deleteOk: dotRowsBefore >= 1 && dotsAfterDelete === 0,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
