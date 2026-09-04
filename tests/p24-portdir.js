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

  const initial = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0s0');
    const edge = g.getCellById('tpl_tpl_g0s0e');
    const group = g.getCellById('tpl_g0');
    const groupEdge = g.getCellById('tpl_ge0');
    return {
      nodeCenter: node.getBBox().x + node.getBBox().width / 2,
      sourcePointX: edge.getSourcePoint().x,
      targetPort: edge.getTarget().port,
      portDir: (node.getData() || {}).portDir || 'auto',
      groupPort: groupEdge.getTarget().port
    };
  });

  const autoFlipped = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0s0');
    const edge = g.getCellById('tpl_tpl_g0s0e');
    node.position(40, 382);
    window.__ygt.ctx.canvas.reanchorPorts(node);
    return { targetPort: edge.getTarget().port };
  });

  const manualLeft = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0s0');
    const edge = g.getCellById('tpl_tpl_g0s0e');
    const d = node.getData() || {};
    d.portDir = 'left';
    node.setData(d);
    window.__ygt.ctx.canvas.reanchorPorts(node);
    return { portDir: node.getData().portDir, targetPort: edge.getTarget().port };
  });

  const groupUntouched = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const group = g.getCellById('tpl_g0');
    const groupEdge = g.getCellById('tpl_ge0');
    window.__ygt.ctx.canvas.reanchorPorts(group);
    return { targetPort: groupEdge.getTarget().port };
  });

  const panel = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0s0');
    window.__ygt.ctx.canvas.selection.reset([node]);
    window.__ygt.ctx.props.refresh();
    const sel = document.getElementById('prop-port-dir');
    return sel ? { exists: true, value: sel.value, options: Array.from(sel.options).map((o) => o.value) } : { exists: false };
  });

  console.log(JSON.stringify({ initial, autoFlipped, manualLeft, groupUntouched, panel, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
