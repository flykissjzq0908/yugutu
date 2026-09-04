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

  const before = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0s0');
    const edge = g.getCellById('tpl_tpl_g0s0e');
    const b = node.getBBox();
    const c = g.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    return { port: edge.getTarget().port, cx: c.x, cy: c.y };
  });

  // 拖到父端左侧，父端锚点 x≈230，目标节点中心拖到 x≈120
  await page.mouse.move(before.cx, before.cy);
  await page.mouse.down();
  await page.mouse.move(before.cx - 320, before.cy, { steps: 12 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await page.waitForTimeout(400);

  const after = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0s0');
    const edge = g.getCellById('tpl_tpl_g0s0e');
    return { x: node.position().x, port: edge.getTarget().port, sourceX: edge.getSourcePoint().x };
  });

  console.log(JSON.stringify({ before, after, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
