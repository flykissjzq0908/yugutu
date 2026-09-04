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

  const stencil = await page.evaluate(() => document.querySelectorAll('#stencil .x6-node').length);
  const connector = await page.evaluate(() => {
    const e = window.__ygt.ctx.canvas.graph.getEdges()[0];
    const c = e.getConnector ? e.getConnector() : null;
    return c ? (c.name || c) : 'unknown';
  });

  const dotResult = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    const dot = g.addNode({
      id: 'dot_test', shape: 'dot-node', x: 260, y: 410, width: 18, height: 18,
      ports: window.YGT.shapes.portsOf('left|right|top|bottom')
    });
    const target = g.getNodes().find((n) => n.attr('label/text') === '人');
    const edge = g.addEdge({
      shape: 'bone-edge',
      source: { cell: dot.id, port: 'port-right' },
      target: { cell: target.id, port: 'port-left' }
    });
    return {
      dotAdded: !!dot,
      edgeAdded: !!edge,
      dotCount: g.getNodes().filter((n) => n.shape === 'dot-node').length
    };
  });

  // 双击连线 = 在线上添加连接点
  const edgePt = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const e = ctx.canvas.graph.getEdges().find((x) => x.id.indexOf('tpl_ge') === 0);
    if (!e) return null;
    const b = e.getBBox();
    return ctx.canvas.graph.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  });
  if (!edgePt) throw new Error('group edge not found');
  await page.mouse.dblclick(edgePt.x, edgePt.y);
  await page.waitForTimeout(400);
  const dotsAfterDbl = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().filter((n) => n.shape === 'dot-node').length);

  // 选中连线后点按钮 = 在线上添加连接点
  await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    ctx.canvas.selection.clean();
    ctx.canvas.selection.select([ctx.canvas.graph.getEdges()[1]]);
  });
  await page.waitForSelector('#prop-edge-add-dot', { timeout: 5000 });
  const edgesBefore = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getEdges().length);
  await page.click('#prop-edge-add-dot');
  await page.waitForTimeout(400);
  const afterButton = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const dots = g.getNodes().filter((n) => n.shape === 'dot-node');
    const dot = dots[dots.length - 1];
    const d = dot.getData() || {};
    const edge = d.attachEdge ? g.getCellById(d.attachEdge) : null;
    let onLineDist = null;
    if (edge) {
      const p = window.__ygt.ctx.canvas.getEdgePointAt(edge.id, d.ratio || 0.5);
      const b = dot.getBBox();
      onLineDist = Math.hypot(p.x - (b.x + 9), p.y - (b.y + 9));
    }
    return {
      dots: dots.length,
      edges: g.getEdges().length,
      attachEdge: !!d.attachEdge,
      onLineDist
    };
  });

  // 移动端点后，连接点应跟随线段保持在其上
  await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const n = g.getNodes().find((x) => x.attr('label/text') === '人');
    const p = n.position();
    n.position(p.x + 60, p.y);
  });
  await page.waitForTimeout(400);
  const followOk = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const dots = g.getNodes().filter((n) => n.shape === 'dot-node');
    const dot = dots[dots.length - 1];
    const d = dot.getData() || {};
    const edge = g.getCellById(d.attachEdge);
    const p = window.__ygt.ctx.canvas.getEdgePointAt(edge.id, d.ratio || 0.5);
    const b = dot.getBBox();
    return Math.hypot(p.x - (b.x + 9), p.y - (b.y + 9)) < 6;
  });
  await page.screenshot({ path: path.join(shots, 'p11-dot.png'), fullPage: true });

  console.log(JSON.stringify({
    stencil,
    connector,
    straightLine: connector === 'normal',
    dotResult,
    dotsAfterDbl,
    afterButton,
    continuousOk: afterButton.edges === edgesBefore && afterButton.attachEdge &&
      afterButton.onLineDist !== null && afterButton.onLineDist < 6,
    followOk,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
