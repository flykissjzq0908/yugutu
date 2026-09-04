const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';

function node(id, shape, x, y, data) {
  const cell = {
    id,
    shape,
    x,
    y,
    width: shape === 'fish-spine' ? 620 : shape === 'fish-head' ? 120 : 120,
    height: shape === 'fish-spine' ? 10 : 36,
    data
  };
  return cell;
}

async function main() {
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  const token = execFileSync(py, ['-m', 'app.scripts.make_token'], { encoding: 'utf8' })
    .split(/\r?\n/)[0].trim();
  const cells = [
    node('spine', 'fish-spine', 120, 415, {}),
    node('head', 'fish-head', 690, 380, { parentId: '__ROOT__', order: 0, level: 0, kind: 'head' }),
    node('n0', 'bone-node', 220, 300, { parentId: 'head', order: 0, level: 1, kind: 'group' }),
    node('n1', 'bone-node', 370, 318, { parentId: 'n0', order: 0, level: 2, kind: 'bone' }),
    node('n2', 'bone-node', 520, 318, { parentId: 'n1', order: 0, level: 3, kind: 'bone' }),
    node('n3', 'bone-node', 670, 318, { parentId: 'n2', order: 0, level: 4, kind: 'bone' }),
    node('p0', 'bone-node', 470, 240, { parentId: 'head', order: 1, level: 1, kind: 'group' }),
    { id: 'e0', shape: 'bone-edge', source: { x: 220, y: 420 }, target: { cell: 'n0', port: 'port-bottom' } },
    { id: 'e1', shape: 'bone-edge', source: { cell: 'e0', anchor: { name: 'ratio', args: { ratio: 0.5 } } }, target: { cell: 'n1', port: 'port-left' } },
    { id: 'e2', shape: 'bone-edge', source: { cell: 'e1', anchor: { name: 'ratio', args: { ratio: 0.5 } } }, target: { cell: 'n2', port: 'port-left' } },
    { id: 'e3', shape: 'bone-edge', source: { cell: 'e2', anchor: { name: 'ratio', args: { ratio: 0.5 } } }, target: { cell: 'n3', port: 'port-left' } },
    { id: 'e4', shape: 'bone-edge', source: { cell: 'e3', anchor: { name: 'ratio', args: { ratio: 0.5 } } }, target: { x: 950, y: 380 } },
    { id: 'e_plain', shape: 'bone-edge', source: { x: 470, y: 420 }, target: { cell: 'p0', port: 'port-bottom' } }
  ];
  const createRes = await fetch(`${base}/api/v1/ygt/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'edge-refresh-converge', version: '1.0', canvas: { background: '#ffffff' }, cells })
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
  try {
    await page.goto(`${base}/?docId=${encodeURIComponent(doc.id)}&token=${token}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx && window.__ygt.ctx.canvas, { timeout: 10000 });
    await page.waitForTimeout(900);
    const state = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      function pointAt(edgeId, ratio) {
        const e = g.getCellById(edgeId);
        const v = e && e.findView ? e.findView(g) : null;
        if (!v || typeof v.getPointAtRatio !== 'function') return null;
        const p = v.getPointAtRatio(ratio);
        return { x: +Number(p.x).toFixed(3), y: +Number(p.y).toFixed(3) };
      }
      const chain = [
        { edge: 'e1', parent: 'e0', ratio: 0.5 },
        { edge: 'e2', parent: 'e1', ratio: 0.5 },
        { edge: 'e3', parent: 'e2', ratio: 0.5 },
        { edge: 'e4', parent: 'e3', ratio: 0.5 }
      ].map((item) => {
        const parentPoint = pointAt(item.parent, item.ratio);
        const start = pointAt(item.edge, 0);
        const dist = parentPoint && start
          ? Math.hypot(start.x - parentPoint.x, start.y - parentPoint.y)
          : Infinity;
        return { edge: item.edge, parent: item.parent, ratio: item.ratio, parentPoint, start, dist };
      });
      const plainStart = pointAt('e_plain', 0);
      const plainSource = (g.getCellById('e_plain') || {}).getSource ? g.getCellById('e_plain').getSource() : null;
      const plainDist = plainStart && plainSource && typeof plainSource.x === 'number'
        ? Math.hypot(plainStart.x - plainSource.x, plainStart.y - plainSource.y)
        : Infinity;
      return {
        chain,
        plain: { start: plainStart, source: plainSource, dist: plainDist },
        validation: window.YGT.core.validateHierarchy(window.__ygt.ctx.canvas.getCells())
      };
    });
    const chainOk = state.chain.every((item) => item.dist <= 40);
    const plainOk = state.plain.dist <= 40;
    const ok = chainOk && plainOk && state.validation.ok && !errors.length;
    console.log(JSON.stringify({ state, chainOk, plainOk, ok, errors }, null, 2));
    if (!ok) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
