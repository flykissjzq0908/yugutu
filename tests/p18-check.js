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

  async function altClickAtRatio(r) {
    const client = await page.evaluate((arg) => {
      const ctx = window.__ygt.ctx;
      const p = ctx.canvas.getEdgePointAt(arg.id, arg.r);
      return ctx.canvas.graph.localToClient(p);
    }, { id: edgeId, r });
    await page.keyboard.down('Alt');
    await page.mouse.click(client.x, client.y);
    await page.keyboard.up('Alt');
    await page.waitForTimeout(500);
  }

  await altClickAtRatio(0.5);

  const result = await page.evaluate((id) => {
    const g = window.__ygt.ctx.canvas.graph;
    const dots = g.getNodes().filter((n) => {
      const d = n.getData() || {};
      return d.attachEdge === id;
    });
    return dots.map((n) => {
      const d = n.getData() || {};
      return { ratio: d.ratio };
    }).sort((a, b) => a.ratio - b.ratio);
  }, edgeId);

  console.log(JSON.stringify({
    result,
    ratios: result.map((x) => x.ratio),
    ok: result.length === 1 && Math.abs(result[0].ratio - 0.5) < 0.05,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
