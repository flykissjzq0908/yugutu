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
  await page.goto(pathToFileURL(path.join(root, 'editor.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);

  const r = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.getCellById('tpl_g0');
    const edge = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g0');
    const b = node.getBBox();
    return {
      port: edge.getTarget().port,
      targetPoint: edge.getTargetPoint(),
      sourcePoint: edge.getSourcePoint(),
      nodeBBox: { x: b.x, y: b.y, w: b.width, h: b.height },
      bottomY: b.y + b.height,
      topY: b.y,
      anchor: edge.getTarget().anchor,
      connectionPoint: edge.getTarget().connectionPoint
    };
  });

  console.log(JSON.stringify(r, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
