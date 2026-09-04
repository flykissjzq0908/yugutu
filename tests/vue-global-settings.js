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
      title: '通用设置回归',
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

  const groupByLabel = (text) =>
    page.locator('#props .prop-group').filter({
      has: page.locator('label.prop-label', { hasText: new RegExp('^' + text + '$') })
    });

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
      const nodes = g.getNodes().filter((n) => {
        const d = n.getData() || {};
        return Number(d.level) === 1 && (n.shape === 'bone-node' || n.shape === 'group-node');
      });
      return { positions: nodes.map((n) => n.position()) };
    });

    await page.evaluate(() => {
      window.__ygt.ctx.canvas.selection.clean();
      window.__ygt.ctx.props.refresh();
    });
    await page.waitForSelector('#global-level', { timeout: 5000 });

    await page.selectOption('#global-level', '1');
    await groupByLabel('线宽').nth(0).locator('input').fill('5');
    await groupByLabel('箭头大小').locator('input').fill('18');
    await groupByLabel('字号').locator('input').fill('18');
    await groupByLabel('线宽').nth(1).locator('input').fill('3');
    await groupByLabel('宽').locator('input').fill('160');
    await groupByLabel('高').locator('input').fill('60');
    await groupByLabel('填充').locator('.color-swatch').click();
    await page.waitForSelector('.color-popup', { timeout: 5000 });
    await page.locator('.color-swatch-option[data-color="#16a34a"]').click();
    await page.locator('.color-confirm').click();
    await page.click('#global-apply');
    await page.waitForTimeout(500);

    const after = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const nodes = g.getNodes().filter((n) => {
        const d = n.getData() || {};
        return Number(d.level) === 1 && (n.shape === 'bone-node' || n.shape === 'group-node');
      });
      const edges = [];
      nodes.forEach((n) => {
        (g.getIncomingEdges(n) || []).forEach((e) => {
          if (e.shape === 'bone-edge' && !edges.includes(e)) edges.push(e);
        });
      });
      return {
        positions: nodes.map((n) => n.position()),
        sizes: nodes.map((n) => n.getSize()),
        fills: nodes.map((n) => n.attr('body/fill')),
        fontSizes: nodes.map((n) => n.attr('label/fontSize')),
        edgeWidths: edges.map((e) => e.attr('line/strokeWidth')),
        arrowSizes: edges.map((e) => ((e.attr('line/targetMarker') || {}).width) || 0)
      };
    });

    const sizeOk = after.sizes.every((s) => s.width === 160 && s.height === 60);
    const fillOk = after.fills.every((c) => c === '#16a34a');
    const fontOk = after.fontSizes.every((v) => v === 18);
    const edgeOk = after.edgeWidths.length > 0 && after.edgeWidths.every((v) => v === 5) &&
      after.arrowSizes.every((v) => v === 18);
    const posOk = JSON.stringify(after.positions) === JSON.stringify(before.positions);

    await page.fill('#doc-title', '通用设置回归');
    await page.click('#btn-save');
    await page.waitForTimeout(900);
    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.__ygt.ctx.canvas.selection.clean();
      window.__ygt.ctx.props.refresh();
    });
    await page.waitForSelector('#global-level', { timeout: 5000 });
    await page.selectOption('#global-level', '1');
    const reloadDefaults = {
      width: await groupByLabel('宽').locator('input').inputValue(),
      height: await groupByLabel('高').locator('input').inputValue(),
      lineWidth: await groupByLabel('线宽').nth(0).locator('input').inputValue(),
      fontSize: await groupByLabel('字号').locator('input').inputValue()
    };
    const reloadOk = reloadDefaults.width === '160' && reloadDefaults.height === '60' &&
      reloadDefaults.lineWidth === '5' && reloadDefaults.fontSize === '18';

    console.log(JSON.stringify({ before, after, sizeOk, fillOk, fontOk, edgeOk, posOk, reloadDefaults, reloadOk, errors }, null, 2));
    if (!sizeOk || !fillOk || !fontOk || !edgeOk || !posOk || !reloadOk || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
