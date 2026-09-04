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
    body: JSON.stringify({
      title: '鱼形预设回归',
      version: '1.0',
      canvas: { background: '#ffffff' },
      cells: []
    })
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
    await page.goto(`${base}/?docId=${encodeURIComponent(doc.id)}&token=${token}`, {
      waitUntil: 'load', timeout: 30000
    });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(400);

    await page.selectOption('#tpl-select', 'classic');
    await page.waitForTimeout(700);

    const before = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      window.__ygt.ctx.canvas.selection.reset([head]);
      window.__ygt.ctx.props.refresh();
      const sel = document.querySelector('#props .prop-grid select');
      return {
        preset: (head.getData() || {}).ygtPreset || 'ygt1',
        selectValue: sel ? sel.value : null,
        path: head.attr('body/d')
      };
    });

    await page.locator('#props .prop-grid select').nth(0).selectOption('ygt3');
    await page.waitForTimeout(300);

    const after = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      const sel = document.querySelector('#props .prop-grid select');
      return {
        preset: (head.getData() || {}).ygtPreset || 'ygt1',
        selectValue: sel ? sel.value : null,
        path: head.attr('body/d')
      };
    });

    const presetChanged = after.preset === 'ygt3' && after.selectValue === 'ygt3' && after.path !== before.path;
    console.log(JSON.stringify({ before, after, presetChanged, errors }, null, 2));
    if (!presetChanged || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
