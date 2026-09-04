const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function clickNode(page, kind, value) {
  const pt = await page.evaluate((args) => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    const node = g.getNodes().find((n) =>
      args.kind === 'label' ? n.attr('label/text') === args.value : n.shape === args.value);
    if (!node) return null;
    const b = node.getBBox();
    const p = g.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    return { x: p.x, y: p.y };
  }, { kind, value });
  if (!pt) throw new Error('node not found');
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
  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);

  const stencil = await page.evaluate(() => document.querySelectorAll('#stencil .x6-node').length);

  // 多选三个节点：顶对齐 + 横向等距
  await page.keyboard.down('Control');
  await clickNode(page, 'label', '人');
  await clickNode(page, 'label', '机');
  await clickNode(page, 'label', '料');
  await page.keyboard.up('Control');
  await page.waitForSelector('button[data-align="top"]', { timeout: 5000 });
  await page.click('button[data-align="top"]');
  await page.waitForTimeout(300);
  const afterTop = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return ['人', '机', '料'].map((label) => {
      const n = g.getNodes().find((x) => x.attr('label/text') === label);
      const p = n.position();
      return { x: p.x, y: p.y };
    });
  });
  await page.click('button[data-align="dist-h"]');
  await page.waitForTimeout(300);
  const afterDist = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return ['人', '机', '料'].map((label) => {
      const n = g.getNodes().find((x) => x.attr('label/text') === label);
      const p = n.position();
      const s = n.getSize();
      return { x: p.x, w: s.width };
    }).sort((a, b) => a.x - b.x);
  });
  await page.screenshot({ path: path.join(shots, 'p3-align.png'), fullPage: true });

  // 图片节点：URL 设置与持久化
  await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    ctx.canvas.graph.addNode({
      id: 'img_test', shape: 'image-node', x: 220, y: 140,
      width: 120, height: 90,
      ports: window.YGT.shapes.portsOf('left|right|top|bottom')
    });
  });
  await page.waitForTimeout(300);
  await clickNode(page, 'shape', 'image-node');
  await page.waitForSelector('#prop-image-url', { timeout: 5000 });
  await page.$eval('#prop-image-url', (el) => {
    el.value = 'https://example.com/pic.png';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  const imgHref = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getCellById('img_test').attr('image/xlinkHref'));
  await page.screenshot({ path: path.join(shots, 'p3-image.png'), fullPage: true });

  await page.click('#btn-save');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(600);
  const afterReload = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const img = g.getCellById('img_test');
    return {
      hasImage: !!img,
      href: img ? img.attr('image/xlinkHref') : null
    };
  });
  await page.screenshot({ path: path.join(shots, 'p3-reload.png'), fullPage: true });

  console.log(JSON.stringify({
    stencil, afterTop, afterDist,
    topAligned: afterTop.every((p) => Math.abs(p.y - afterTop[0].y) < 0.5),
    distGapsEqual: Math.abs((afterDist[1].x - (afterDist[0].x + afterDist[0].w)) -
      (afterDist[2].x - (afterDist[1].x + afterDist[1].w))) < 0.5,
    imgHref, afterReload, errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
