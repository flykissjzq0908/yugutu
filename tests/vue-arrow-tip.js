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
    body: JSON.stringify({ title: 'arrow-tip', version: '1.0', canvas: { background: '#ffffff' }, cells: [] })
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
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(400);
    await page.selectOption('#tpl-select', 'classic');
    await page.waitForTimeout(700);

    const rows = [];
    for (const strokeWidth of [2, 10]) {
      await page.evaluate((sw) => {
        const g = window.__ygt.ctx.canvas.graph;
        const edge = g.getCellById('tpl_ge0');
        edge.attr({
          line: {
            strokeWidth: sw,
            targetMarker: window.YGT.shapes.blockMarkerAttrs(24, 17, sw)
          }
        });
      }, strokeWidth);
      await page.waitForTimeout(250);
      const row = await page.evaluate(() => {
        const g = window.__ygt.ctx.canvas.graph;
        const edge = g.getCellById('tpl_ge0');
        const view = edge.findView(g);
        const pathEl = view.container.querySelector('path[marker-end]');
        const len = pathEl.getTotalLength();
        const p1 = pathEl.getPointAtLength(len);
        const p0 = pathEl.getPointAtLength(Math.max(0, len - 3));
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const dl = Math.hypot(dx, dy) || 1;
        const markerUrl = pathEl.getAttribute('marker-end');
        const markerId = (markerUrl.match(/url\(#([^)]+)\)/) || [])[1];
        const markerEl = document.getElementById(markerId);
        const refX = markerEl ? Number(markerEl.getAttribute('refX')) : null;
        const tp = edge.getTargetPoint();
        const tip = { x: p1.x - refX * (dx / dl), y: p1.y - refX * (dy / dl) };
        return {
          strokeWidth: edge.attr('line/strokeWidth'),
          arrow: (edge.attr('line/targetMarker') || {}).width,
          refX,
          distTipToPort: Math.hypot(tip.x - tp.x, tip.y - tp.y)
        };
      });
      rows.push(row);
    }
    const ok = rows.every((r) => r.arrow === 24 && Math.abs(r.distTipToPort) < 0.1);
    console.log(JSON.stringify({ rows, ok, errors }, null, 2));
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
