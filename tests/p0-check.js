const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const pageUrl = pathToFileURL(path.join(root, 'tests', 'p0-validation.html')).href;
const shots = path.join(__dirname, 'shots');

async function main() {
  require('fs').mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('[console] ' + msg.text());
  });
  page.on('pageerror', (err) => errors.push('[pageerror] ' + err.message));

  await page.goto(pageUrl, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('.x6-graph', { timeout: 15000 });
  await page.waitForTimeout(800);

  const pluginLogs = await page.$$eval('#log-list li', (lis) =>
    lis.map((li) => li.textContent.trim()).filter((t) => t.includes('插件检查')));
  const counts = await page.evaluate(() => ({
    nodes: document.querySelectorAll('.x6-node').length,
    edges: document.querySelectorAll('.x6-edge').length,
    stencil: document.querySelectorAll('#stencil .x6-node').length
  }));
  await page.screenshot({ path: path.join(shots, '01-loaded.png'), fullPage: true });

  // 从组件库拖拽“内容节点”到画布
  const before = counts.nodes;
  const stencilItem = page.locator('#stencil .x6-node').nth(4);
  const box = await stencilItem.boundingBox();
  const canvasBox = await page.locator('#container').boundingBox();
  if (box && canvasBox) {
    const sx = box.x + box.width / 2;
    const sy = box.y + box.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }
  const after = await page.evaluate(() => document.querySelectorAll('.x6-node').length);
  await page.screenshot({ path: path.join(shots, '02-dragged.png'), fullPage: true });

  // 双击画布上的节点，验证内联编辑
  const nodeEl = page.locator('#container .x6-node').nth(3);
  if (await nodeEl.count()) {
    await nodeEl.dblclick();
    await page.waitForTimeout(300);
    const editorVisible = await page.locator('#inline-editor').isVisible();
    if (editorVisible) {
      await page.locator('#inline-editor').fill('双击编辑成功');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({ path: path.join(shots, '03-edited.png'), fullPage: true });

  const finalTexts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#container .x6-node text'))
      .map((t) => t.textContent)
      .filter(Boolean)
      .slice(0, 12));

  // 导出 SVG/PNG（拦截下载）
  const downloads = [];
  page.on('download', (d) => downloads.push(d.suggestedFilename()));
  await page.click('#btn-svg');
  await page.click('#btn-png');
  await page.waitForTimeout(1200);

  // localStorage 保存 → 清空 → 恢复
  await page.click('#btn-save');
  await page.click('#btn-clear');
  await page.waitForTimeout(400);
  const afterClear = await page.evaluate(() => document.querySelectorAll('#container .x6-node').length);
  await page.click('#btn-load');
  await page.waitForTimeout(600);
  const afterRestore = await page.evaluate(() => document.querySelectorAll('#container .x6-node').length);

  console.log(JSON.stringify({
    pluginLogs, counts, afterDrag: after, before, finalTexts,
    downloads, afterClear, afterRestore, errors
  }, null, 2));
  await browser.close();

  if (errors.length) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
