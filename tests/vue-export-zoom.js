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
      title: '导出与缩放回归',
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

    const zoomVisible = await page.evaluate(() => {
      const el = document.querySelector('.ygt-zoom');
      if (!el) return { exists: false };
      const r = el.getBoundingClientRect();
      return {
        exists: true,
        visible: r.width > 0 && r.height > 0 &&
          r.left >= 0 && r.top >= 0 &&
          r.right <= window.innerWidth && r.bottom <= window.innerHeight,
        value: (el.querySelector('.ygt-zoom-val') || {}).textContent || ''
      };
    });

    const toolbar = await page.evaluate(() => ({
      hasPng: !!document.getElementById('btn-export-png'),
      hasSvg: !!document.getElementById('btn-export-svg'),
      hasPdf: !!document.getElementById('btn-export-pdf'),
      hasJson: !!document.getElementById('btn-export-json')
    }));

    const menuVisible = await page.evaluate(() => {
      const el = document.querySelector('.ygt-export-menu');
      if (!el) return { exists: false };
      const r = el.getBoundingClientRect();
      return { exists: true, visible: r.width > 0 && r.height > 0 && r.bottom <= window.innerHeight };
    });

    const layout = await page.evaluate(() => {
      const z = document.querySelector('.ygt-zoom').getBoundingClientRect();
      const t = document.querySelector('.ygt-export-trigger').getBoundingClientRect();
      const w = document.querySelector('#container-wrap').getBoundingClientRect();
      return {
        zoom: { left: z.left, top: z.top, right: z.right, bottom: z.bottom },
        trigger: { left: t.left, top: t.top, right: t.right, bottom: t.bottom },
        sameLine: Math.abs(z.top - t.top) < 8 && Math.abs(z.bottom - t.bottom) < 8,
        topLeft: (z.left - w.left) < 120 && (z.top - w.top) < 80 && t.left > z.left
      };
    });

    await page.click('.ygt-export-trigger');
    await page.waitForTimeout(200);
    const options = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.ygt-export-options button')).map((b) => b.textContent.trim())
    );
    const optionsVisible = await page.evaluate(() => {
      const el = document.querySelector('.ygt-export-options');
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    await page.click('#btn-preview');
    await page.waitForTimeout(200);
    const hiddenInPreview = await page.evaluate(() => {
      const el = document.querySelector('.ygt-export-menu');
      const r = el.getBoundingClientRect();
      return r.width === 0 && r.height === 0;
    });
    await page.click('#btn-preview');
    await page.waitForTimeout(200);
    const visibleAfterPreview = await page.evaluate(() => {
      const el = document.querySelector('.ygt-export-menu');
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    const result = {
      zoomVisible,
      toolbar,
      menuVisible,
      layout,
      options,
      optionsVisible,
      hiddenInPreview,
      visibleAfterPreview,
      errors
    };
    console.log(JSON.stringify(result, null, 2));

    const ok =
      zoomVisible.exists && zoomVisible.visible &&
      !toolbar.hasPng && !toolbar.hasSvg && !toolbar.hasPdf && toolbar.hasJson &&
      menuVisible.exists && menuVisible.visible &&
      layout.sameLine && layout.topLeft &&
      options.join(',') === 'PNG,SVG,PDF' && optionsVisible &&
      hiddenInPreview && visibleAfterPreview && !errors.length;
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
