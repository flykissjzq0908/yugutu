const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function main() {
  fs.mkdirSync(shots, { recursive: true });
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

  const scale = () => page.evaluate(() => window.__ygt.ctx.canvas.graph.zoom());
  const pct = () => page.evaluate(() => document.querySelector('.ygt-zoom-val').textContent);

  const afterFit = await scale();
  await page.click('[data-zoom="+"]');
  await page.waitForTimeout(200);
  const afterPlus = await scale();
  await page.click('[data-zoom="-"]');
  await page.waitForTimeout(200);
  const afterMinus = await scale();
  await page.click('[data-zoom="1"]');
  await page.waitForTimeout(200);
  const afterOne = await scale();

  await page.keyboard.press('Control+=');
  await page.waitForTimeout(200);
  const kbPlus = await scale();
  await page.keyboard.press('Control+-');
  await page.waitForTimeout(200);
  const kbMinus = await scale();
  await page.keyboard.press('Control+0');
  await page.waitForTimeout(200);
  const kbOne = await scale();

  console.log(JSON.stringify({
    afterFit, afterPlus, afterMinus, afterOne,
    pct: await pct(),
    buttonOk: afterPlus > afterFit && afterMinus < afterPlus && Math.abs(afterOne - 1) < 0.01,
    kbOk: kbPlus > afterOne && kbMinus < kbPlus && Math.abs(kbOne - 1) < 0.01,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
