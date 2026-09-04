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
  const downloads = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('download', (d) => downloads.push(d.suggestedFilename()));
  page.on('dialog', (d) => d.accept());

  const editorUrl = pathToFileURL(path.join(root, 'editor.html')).href;
  await page.goto(editorUrl, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('.x6-graph', { timeout: 15000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(600);

  const initial = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    edges: window.__ygt.ctx.canvas.graph.getEdges().length,
    stencil: document.querySelectorAll('#stencil .x6-node').length
  }));

  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(700);
  const classic = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    edges: window.__ygt.ctx.canvas.graph.getEdges().length
  }));
  await page.screenshot({ path: path.join(shots, 'p1-classic.png'), fullPage: true });

  await page.fill('#doc-title', '测试鱼骨图P1');
  const ren = page.locator('#container .x6-node').filter({ hasText: '人' }).first();
  await ren.click();
  await page.waitForSelector('#prop-fill', { timeout: 5000 });
  const propTitle = await page.locator('#prop-title').textContent();

  await page.$eval('#prop-fill', (el) => {
    el.value = '#ff0000';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  const fillAfter = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().find((n) => n.attr('label/text') === '人').attr('body/fill'));
  await page.screenshot({ path: path.join(shots, 'p1-props.png'), fullPage: true });

  await page.click('#btn-undo');
  await page.waitForTimeout(300);
  const fillAfterUndo = await page.evaluate(() =>
    window.__ygt.ctx.canvas.graph.getNodes().find((n) => n.attr('label/text') === '人').attr('body/fill'));

  await page.click('#btn-save');
  await page.waitForTimeout(300);
  const savedList = await page.evaluate(() =>
    (localStorage.getItem('ygt.documents') || '').includes('测试鱼骨图P1'));
  const docJson = await page.evaluate(() => JSON.stringify(window.__ygt.ctx.doc));

  await page.click('#btn-export-json');
  await page.click('#btn-export-png');
  await page.click('#btn-export-svg');
  await page.waitForTimeout(1200);

  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  const afterReload = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    title: window.__ygt.ctx.doc.title
  }));

  await page.setInputFiles('#file-import', {
    name: 'roundtrip.json',
    mimeType: 'application/json',
    buffer: Buffer.from(docJson, 'utf-8')
  });
  await page.waitForTimeout(600);
  const afterImport = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    title: window.__ygt.ctx.doc.title
  }));
  await page.screenshot({ path: path.join(shots, 'p1-editor.png'), fullPage: true });

  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('.doc-row', { timeout: 10000 });
  const indexText = await page.locator('#doc-list').innerText();
  await page.screenshot({ path: path.join(shots, 'p1-index.png'), fullPage: true });

  console.log(JSON.stringify({
    initial, classic, propTitle, fillAfter, fillAfterUndo, savedList,
    afterReload, afterImport, downloads,
    indexHasDoc: indexText.includes('测试鱼骨图P1'),
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
