const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';
const shots = path.join(__dirname, 'shots');

async function main() {
  fs.mkdirSync(shots, { recursive: true });
  const token = execFileSync(
    path.join(root, '.venv', 'Scripts', 'python.exe'),
    ['-m', 'app.scripts.make_token', '--token'],
    { encoding: 'utf8' }
  ).trim();

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1564, height: 1274 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

  await page.goto(`${base}/?docId=1hu8hb2pl1gpcfsinm3kmk1gl60&token=${token}`, {
    waitUntil: 'load', timeout: 30000
  });
  await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    edges: window.__ygt.ctx.canvas.graph.getEdges().length,
    hierarchyOk: window.YGT.core.validateHierarchy(window.__ygt.ctx.canvas.getCells()).ok,
    rootOrders: window.__ygt.ctx.canvas.graph.getNodes()
      .filter((n) => n.shape === 'bone-node' && (n.getData() || {}).parentId === '__ROOT__')
      .map((n) => (n.getData() || {}).order)
      .sort((a, b) => a - b),
    labels: window.__ygt.ctx.canvas.graph.getNodes()
      .filter((n) => n.shape === 'bone-node')
      .map((n) => n.attr('label/text'))
      .filter(Boolean)
      .slice(0, 8)
  }));
  await page.screenshot({ path: path.join(shots, 'vue-legacy-rebuild.png'), fullPage: true });
  console.log(JSON.stringify({ state, errors }, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
