const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');

async function main() {
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
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

  const clickPt = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const n = ctx.canvas.graph.getNodes().find((x) => x.attr('label/text') === '人');
    const b = n.getBBox();
    return ctx.canvas.graph.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  });
  await page.mouse.click(clickPt.x, clickPt.y);
  await page.waitForTimeout(300);

  const pos = () => page.evaluate(() => {
    const n = window.__ygt.ctx.canvas.graph.getNodes().find((x) => x.attr('label/text') === '人');
    return n.position();
  });

  const before = await pos();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Shift+ArrowRight');
  const after = await pos();

  console.log(JSON.stringify({
    before,
    after,
    dx: after.x - before.x,
    dy: after.y - before.y,
    ok: after.x - before.x === 11 && after.y - before.y === 1,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
