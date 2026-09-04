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

  const clientOfRen = () => page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const n = ctx.canvas.graph.getNodes().find((x) => x.attr('label/text') === '人');
    const b = n.getBBox();
    return ctx.canvas.graph.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  });
  const blank = await page.evaluate(() => {
    const r = document.getElementById('container').getBoundingClientRect();
    return { x: r.x + 30, y: r.y + 30 };
  });

  const before = await clientOfRen();
  await page.keyboard.down('Space');
  await page.mouse.move(blank.x, blank.y);
  await page.mouse.down();
  await page.mouse.move(blank.x + 120, blank.y + 80, { steps: 8 });
  await page.mouse.up();
  await page.keyboard.up('Space');
  await page.waitForTimeout(300);
  const after = await clientOfRen();
  const selectedAfter = await page.evaluate(() => window.__ygt.ctx.canvas.selectedCells().length);

  console.log(JSON.stringify({
    before, after,
    moved: Math.abs(after.x - before.x) > 30 && Math.abs(after.y - before.y) > 20,
    noRubberband: selectedAfter === 0,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
