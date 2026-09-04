const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';

function node(id, shape, x, y, data, label) {
  const cell = {
    id,
    shape,
    x,
    y,
    width: shape === 'fish-spine' ? 400 : 120,
    height: shape === 'fish-spine' ? 10 : 36,
    data
  };
  if (label) cell.attrs = { label: { text: label } };
  return cell;
}

async function main() {
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  const token = execFileSync(py, ['-m', 'app.scripts.make_token'], { encoding: 'utf8' })
    .split(/\r?\n/)[0].trim();
  const cells = [
    node('ygt_spine', 'fish-spine', 100, 415, {}),
    node('ygt_head', 'fish-head', 520, 360, { parentId: '__ROOT__', order: 0, level: 0, kind: 'head' }, '鱼头'),
    node('human', 'bone-node', 220, 240, { parentId: 'ygt_head', order: 0, level: 1, kind: 'group' }, '人'),
    node('h_2', 'bone-node', 360, 160, { parentId: 'human', order: 0, level: 2, kind: 'bone' }, '责任心与态度'),
    node('h_1_1', 'bone-node', 520, 240, { parentId: 'h_2', order: 0, level: 3, kind: 'bone' }, '理论知识欠缺'),
    { id: 'e_human', shape: 'bone-edge', source: { x: 220, y: 420 }, target: { cell: 'human', port: 'port-bottom' } },
    { id: 'e_h2', shape: 'bone-edge', source: { cell: 'e_human', anchor: { name: 'ratio', args: { ratio: 0.5 } } }, target: { cell: 'h_2', port: 'port-left' } },
    { id: 'e_dangling', shape: 'bone-edge', source: { x: 0, y: 0 }, target: { cell: 'h_1_1', port: 'port-left' } }
  ];
  const createRes = await fetch(`${base}/api/v1/ygt/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'dangling-repair', version: '1.0', canvas: { background: '#ffffff' }, cells })
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
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const node = g.getCellById('h_1_1');
      const incoming = (g.getIncomingEdges(node) || []).find((e) => e.shape === 'bone-edge');
      return {
        repaired: !!incoming,
        source: incoming ? incoming.getSource() : null,
        target: incoming ? incoming.getTarget() : null
      };
    });
    const ok = state.repaired && state.source && state.source.cell === 'e_h2';
    console.log(JSON.stringify({ state, ok, errors }, null, 2));
    if (!ok || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
