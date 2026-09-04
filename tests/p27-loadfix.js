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

  const r = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    const topEdge = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g0');
    const bottomEdge = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g1');

    // 模拟旧文档：把竖向端口改回接反的旧值
    topEdge.setTarget({ cell: 'tpl_g0', port: 'port-top' });
    bottomEdge.setTarget({ cell: 'tpl_g1', port: 'port-bottom' });
    const cells = ctx.canvas.getCells();

    // 重新载入（applyCells 内会归一化端口）
    ctx.canvas.applyCells(cells);
    const topAfter = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g0').getTarget().port;
    const bottomAfter = g.getEdges().find((e) => e.getTarget().cell === 'tpl_g1').getTarget().port;

    return { topAfter, bottomAfter };
  });

  console.log(JSON.stringify({ r, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
