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
      title: '颜色确认按钮回归',
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
    await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      window.__ygt.ctx.canvas.selection.reset([head]);
      window.__ygt.ctx.props.refresh();
    });

    const fontGroup = page.locator('#props .prop-group', { hasText: '字色' }).first();
    const swatchMargin = await page.evaluate(() => {
      const btn = document.querySelector('#props .color-field .color-swatch');
      return btn ? getComputedStyle(btn).marginTop : null;
    });
    await fontGroup.locator('.color-swatch').click();
    await page.waitForSelector('.color-popup', { timeout: 5000 });

    const before = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      return { labelFill: head.attr('label/fill') };
    });

    await page.locator('.color-swatch-option[data-color="#dc2626"]').click();
    await page.waitForTimeout(200);
    const afterPick = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      return { labelFill: head.attr('label/fill'), popupOpen: !!document.querySelector('.color-popup') };
    });

    await page.locator('.color-confirm').click();
    await page.waitForTimeout(300);
    const afterConfirm = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      return { labelFill: head.attr('label/fill'), popupOpen: !!document.querySelector('.color-popup') };
    });

    await fontGroup.locator('.color-swatch').click();
    await page.waitForSelector('.color-popup', { timeout: 5000 });
    const rgbInputs = await page.locator('.color-popup input[type="number"]').count();
    await page.locator('.color-popup input[type="text"]').fill('#00ff00');
    await page.locator('.color-confirm').click();
    await page.waitForTimeout(300);
    const afterHex = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      return { labelFill: head.attr('label/fill') };
    });

    await page.fill('#doc-title', '颜色确认按钮回归');
    await page.click('#btn-save');
    await page.waitForTimeout(900);
    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(500);
    const afterReload = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      return { labelFill: head.attr('label/fill') };
    });

    const beforeOk = before.labelFill === '#1a73e8';
    const pickWaitOk = afterPick.labelFill === '#1a73e8' && afterPick.popupOpen;
    const confirmOk = afterConfirm.labelFill === '#dc2626' && !afterConfirm.popupOpen;
    const hexOk = afterHex.labelFill === '#00ff00';
    const reloadOk = afterReload.labelFill === '#00ff00' && rgbInputs === 3;

    console.log(JSON.stringify({ swatchMargin, before, afterPick, afterConfirm, afterHex, afterReload, rgbInputs, beforeOk, pickWaitOk, confirmOk, hexOk, reloadOk, errors }, null, 2));
    if (swatchMargin !== '0px' || !beforeOk || !pickWaitOk || !confirmOk || !hexOk || !reloadOk || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
