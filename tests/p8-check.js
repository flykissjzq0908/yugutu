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

  const labelsOf = () => page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().map((n) => n.attr('label/text')).filter(Boolean));

  await page.selectOption('#tpl-select', 'rca');
  await page.waitForTimeout(700);
  const rcaLabels = await labelsOf();
  const rcaOk = rcaLabels.includes('流程制度') && rcaLabels.includes('监督管理');

  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);
  const classicLabels = await labelsOf();
  const classicOk = classicLabels.includes('人') && classicLabels.includes('机');
  await page.screenshot({ path: path.join(shots, 'p8-templates.png'), fullPage: true });

  await page.fill('#doc-title', 'P8测试文档');
  const dlPromise = page.waitForEvent('download', { timeout: 15000 });
  await page.click('#btn-export-pdf');
  const dl = await dlPromise;
  const dlPath = path.join(shots, 'p8.pdf');
  await dl.saveAs(dlPath);
  const pdfSize = fs.statSync(dlPath).size;

  console.log(JSON.stringify({
    rcaOk, classicOk,
    pdfName: dl.suggestedFilename(),
    pdfSize,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
