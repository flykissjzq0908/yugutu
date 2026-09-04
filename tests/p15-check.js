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
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());

  await page.goto(pathToFileURL(path.join(root, 'editor.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);

  const edgeId = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const e = g.getEdges().find((x) => x.id.indexOf('tpl_ge') === 0);
    return e.id;
  });

  async function addDotOnEdge() {
    await page.evaluate((id) => {
      const ctx = window.__ygt.ctx;
      ctx.canvas.selection.clean();
      ctx.canvas.selection.select([ctx.canvas.graph.getCellById(id)]);
    }, edgeId);
    await page.waitForSelector('#prop-edge-add-dot', { timeout: 5000 });
    await page.click('#prop-edge-add-dot');
    await page.waitForTimeout(400);
  }

  await addDotOnEdge();
  const dotShape = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const dots = g.getNodes().filter((n) => n.shape === 'dot-node');
    const dot = dots[dots.length - 1];
    const el = document.querySelector('#container .x6-node[data-cell-id="' + dot.id + '"]');
    const circles = el ? el.querySelectorAll('circle') : [];
    const body = el ? el.querySelector('circle[data-attribute-id="body"]') || circles[1] : null;
    return {
      count: dots.length,
      fill: dot.attr('body/fill'),
      stroke: dot.attr('body/stroke'),
      ports: el ? el.querySelectorAll('.x6-port').length : -1,
      circles: circles.length,
      magnetAttr: body ? (body.getAttribute('magnet') || body.getAttribute('data-magnet')) : null
    };
  });

  // 同一线段多个连接点
  await addDotOnEdge();
  const multipleOk = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().filter((n) => n.shape === 'dot-node').length === 2);

  // 拖离线段成自由点
  const detached = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const dot = ctx.canvas.graph.getNodes().filter((n) => n.shape === 'dot-node').pop();
    ctx.canvas.testMoveDot(dot, 0, 120);
    const d = dot.getData() || {};
    return !d.attachEdge;
  });

  // 自由点可继续拖动
  const freeMoved = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const dot = ctx.canvas.graph.getNodes().filter((n) => n.shape === 'dot-node').pop();
    const before = dot.position().x;
    ctx.canvas.testMoveDot(dot, 80, 40);
    const d = dot.getData() || {};
    return !d.attachEdge && dot.position().x !== before;
  });
  await page.screenshot({ path: path.join(shots, 'p15-dot.png'), fullPage: true });

  console.log(JSON.stringify({
    dotShape,
    multipleOk,
    detached,
    freeMoved,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
