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

  const before = await page.evaluate(() => {
    const tb = document.getElementById('toolbar');
    return {
      rows: tb ? tb.querySelectorAll(':scope > .tb-row').length : 0,
      hasGuide: !!document.getElementById('btn-guide'),
      hasHelp: !!document.getElementById('btn-help'),
      hasHelpPanel: !!document.getElementById('help-panel'),
      guideHidden: document.getElementById('guide-overlay').hidden,
      toolbarHeight: tb ? Math.round(tb.getBoundingClientRect().height) : 0
    };
  });

  await page.click('#btn-guide');
  await page.waitForTimeout(200);
  const opened = await page.evaluate(() => ({
    hidden: document.getElementById('guide-overlay').hidden,
    title: document.getElementById('guide-title').textContent,
    bodyLen: document.getElementById('guide-overlay').querySelector('.ygt-guide-body').innerText.length
  }));

  await page.click('#guide-close');
  await page.waitForTimeout(200);
  const closed = await page.evaluate(() => document.getElementById('guide-overlay').hidden);

  await page.click('#btn-guide');
  await page.waitForTimeout(100);
  await page.mouse.click(20, 20);
  await page.waitForTimeout(200);
  const closedByOverlay = await page.evaluate(() => document.getElementById('guide-overlay').hidden);

  console.log(JSON.stringify({ before, opened, closed, closedByOverlay, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
