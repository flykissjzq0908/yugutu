const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function clickNodeByLabel(page, label) {
  const pt = await page.evaluate((args) => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    const n = g.getNodes().find((x) => x.attr('label/text') === args.label);
    if (!n) return null;
    const b = n.getBBox();
    const p = g.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    return { x: p.x, y: p.y };
  }, { label });
  if (!pt) throw new Error('node not found: ' + label);
  await page.mouse.click(pt.x, pt.y);
}

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

  // 删除节点 → 修改样式 → 点击历史记录跳回“删除前”
  await clickNodeByLabel(page, '人');
  await page.waitForTimeout(200);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  const countAfterDelete = await page.evaluate(() => window.__ygt.ctx.canvas.graph.getNodes().length);

  await clickNodeByLabel(page, '机');
  await page.waitForSelector('#prop-fill', { timeout: 5000 });
  await page.$eval('#prop-fill', (el) => {
    el.value = '#112233';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  const undoSizeBeforeJump = await page.evaluate(() => window.__ygt.ctx.canvas.history.getUndoSize());

  await page.click('#btn-history');
  await page.waitForTimeout(200);
  const deleteRow = page.locator('#history-panel .hp-row').filter({ hasText: '删除元素' }).first();
  await deleteRow.click();
  await page.waitForTimeout(400);

  const afterJump1 = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    return {
      count: g.getNodes().length,
      hasRen: !!g.getNodes().find((n) => n.attr('label/text') === '人'),
      machineFill: g.getNodes().find((n) => n.attr('label/text') === '机').attr('body/fill'),
      undoSize: ctx.canvas.history.getUndoSize()
    };
  });

  const templateRow = page.locator('#history-panel .hp-row').filter({ hasText: '应用模板' }).first();
  await templateRow.click();
  await page.waitForTimeout(400);
  const afterJump2 = await page.evaluate(() => {
    const ctx = window.__ygt.ctx;
    const g = ctx.canvas.graph;
    return {
      count: g.getNodes().length,
      hasRen: !!g.getNodes().find((n) => n.attr('label/text') === '人'),
      machineFill: g.getNodes().find((n) => n.attr('label/text') === '机').attr('body/fill'),
      undoSize: ctx.canvas.history.getUndoSize()
    };
  });
  await page.screenshot({ path: path.join(shots, 'p10-history.png'), fullPage: true });

  // 超宽图 PDF 多页导出
  await page.fill('#doc-title', 'P10多页文档');
  const dlPromise = page.waitForEvent('download', { timeout: 15000 });
  await page.click('#btn-export-pdf');
  const dl = await dlPromise;
  const dlPath = path.join(shots, 'p10.pdf');
  await dl.saveAs(dlPath);
  const pdfSize = fs.statSync(dlPath).size;

  console.log(JSON.stringify({
    countAfterDelete,
    undoSizeBeforeJump,
    jump1ToDeleteState: afterJump1.count === 20 && !afterJump1.hasRen &&
      afterJump1.machineFill === '#e8f0fe' && afterJump1.undoSize === 1,
    jump2ToTemplateState: afterJump2.count === 21 && afterJump2.hasRen &&
      afterJump2.machineFill === '#e8f0fe' && afterJump2.undoSize === 0,
    pdfName: dl.suggestedFilename(),
    pdfSize,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
