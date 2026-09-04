const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');

async function main() {
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

  const template = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const g0 = g.getCellById('tpl_g0');
    const g1 = g.getCellById('tpl_g1');
    const e0 = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g0');
    const e1 = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g1');
    return { topPort: e0.getTarget().port, bottomPort: e1.getTarget().port };
  });

  const autoFlip = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0');
    const edge = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g0');
    node.position(200, 560); // 拖到鱼骨下方
    window.__ygt.ctx.canvas.reanchorPorts(node);
    return { targetPort: edge.getTarget().port };
  });

  const manual = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0');
    const edge = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g0');
    const d = node.getData() || {};
    d.portDir = 'bottom';
    node.setData(d);
    window.__ygt.ctx.canvas.reanchorPorts(node);
    return { portDir: node.getData().portDir, targetPort: edge.getTarget().port };
  });

  const panel = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0');
    window.__ygt.ctx.canvas.selection.reset([node]);
    window.__ygt.ctx.props.refresh();
    const sel = document.getElementById('prop-port-dir');
    return sel ? { exists: true, value: sel.value, options: Array.from(sel.options).map((o) => o.value) } : { exists: false };
  });

  console.log(JSON.stringify({ template, autoFlip, manual, panel, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
