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
    return g.getEdges().find((x) => x.id.indexOf('tpl_ge') === 0).id;
  });

  const result = await page.evaluate((id) => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    [0.4, 0.7].forEach(function (r) {
      var p = ctx.canvas.getEdgePointAt(id, r);
      g.addNode({ shape: 'dot-node', x: p.x - 9, y: p.y - 9, width: 18, height: 18 });
    });
    const dots = g.getNodes().filter((n) => n.shape === 'dot-node');
    const attached = dots.filter((n) => {
      const d = n.getData() || {};
      return d.attachEdge === id;
    });
    const onLine = attached.every((n) => {
      const d = n.getData() || {};
      const p = window.__ygt.ctx.canvas.getEdgePointAt(id, d.ratio);
      const b = n.getBBox();
      return Math.hypot(p.x - (b.x + b.width / 2), p.y - (b.y + b.height / 2)) < 6;
    });
    return {
      dotCount: dots.length,
      attachedCount: attached.length,
      onLine
    };
  }, edgeId);

  await page.screenshot({ path: path.join(shots, 'p17-snap.png'), fullPage: true });

  console.log(JSON.stringify({
    result,
    snapOk: result.dotCount === 2 && result.attachedCount === 2 && result.onLine,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
