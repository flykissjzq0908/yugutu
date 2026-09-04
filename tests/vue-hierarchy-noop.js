const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';

async function main() {
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  const token = execFileSync(py, ['-m', 'app.scripts.make_token'], { encoding: 'utf8' })
    .split(/\r?\n/)[0].trim();
  const createRes = await fetch(`${base}/api/v1/ygt/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'noop', version: '1.0', canvas: { background: '#ffffff' }, cells: [] })
  });
  const doc = await createRes.json();
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());
  try {
    await page.goto(`${base}/?docId=${encodeURIComponent(doc.id)}&token=${token}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(400);
    await page.selectOption('#tpl-select', 'classic');
    await page.waitForTimeout(700);

    const snapshot = () => page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      return {
        nodes: g.getNodes().filter((n) => n.shape === 'bone-node' || n.shape === 'group-node').map((n) => ({
          id: n.id,
          pos: n.position(),
          order: (n.getData() || {}).order,
          level: (n.getData() || {}).level
        })),
        edges: g.getEdges().filter((e) => e.shape === 'bone-edge').map((e) => ({
          id: e.id,
          source: e.getSource(),
          target: e.getTarget()
        }))
      };
    });

    const before = await snapshot();
    await page.click('#btn-hierarchy');
    await page.waitForSelector('.hier-panel', { timeout: 5000 });
    await page.click('#hier-save');
    await page.waitForSelector('.hier-panel', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(600);
    const after = await snapshot();

    const nodeDiff = [];
    before.nodes.forEach((b) => {
      const a = after.nodes.find((x) => x.id === b.id);
      if (!a) nodeDiff.push({ id: b.id, action: 'removed' });
      else if (JSON.stringify(a.pos) !== JSON.stringify(b.pos) || a.order !== b.order || a.level !== b.level) {
        nodeDiff.push({ id: b.id, before: b, after: a });
      }
    });
    after.nodes.forEach((a) => { if (!before.nodes.find((x) => x.id === a.id)) nodeDiff.push({ id: a.id, action: 'added' }); });
    const edgeDiff = [];
    before.edges.forEach((b) => {
      const a = after.edges.find((x) => x.id === b.id);
      if (!a) edgeDiff.push({ id: b.id, action: 'removed' });
      else if (JSON.stringify(a.source) !== JSON.stringify(b.source) || JSON.stringify(a.target) !== JSON.stringify(b.target)) {
        edgeDiff.push({ id: b.id, before: b, after: a });
      }
    });
    console.log(JSON.stringify({ nodeDiff, edgeDiff, errors }, null, 2));
    if (nodeDiff.length || edgeDiff.length || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
