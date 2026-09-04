const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');

async function clickNodeByLabel(page, label, ratioX) {
  const pt = await page.evaluate((args) => {
    const ctx = window.__ygt.ctx;
    const node = ctx.canvas.graph.getNodes().find((n) => n.attr('label/text') === args.label);
    if (!node) return null;
    const b = node.getBBox();
    const p = ctx.canvas.graph.localToClient({
      x: b.x + b.width * (args.ratioX || 0.5),
      y: b.y + b.height / 2
    });
    return { x: p.x, y: p.y };
  }, { label, ratioX });
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

  // 鱼形预设切换
  await clickNodeByLabel(page, '问题描述', 0.25);
  await page.waitForSelector('#prop-fish-preset', { timeout: 5000 });
  await page.selectOption('#prop-fish-preset', 'ygt2');
  await page.waitForTimeout(400);
  const afterPreset = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const head = g.getNodes().find((n) => n.shape === 'fish-head');
    const tail = g.getNodes().find((n) => n.shape === 'fish-tail');
    return {
      headW: head.getSize().width, headH: head.getSize().height,
      tailW: tail.getSize().width, tailH: tail.getSize().height,
      preset: (head.getData() || {}).ygtPreset
    };
  });
  await page.screenshot({ path: path.join(shots, 'p2-fish.png'), fullPage: true });

  // 朝向切换
  await page.selectOption('#prop-fish-dir', 'toleft');
  await page.waitForTimeout(400);
  const afterDir = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const head = g.getNodes().find((n) => n.shape === 'fish-head');
    return {
      dir: (head.getData() || {}).ygtDir,
      textAnchor: head.attr('label/textAnchor')
    };
  });

  // 多选批量样式
  await page.keyboard.down('Control');
  await clickNodeByLabel(page, '人');
  await clickNodeByLabel(page, '机');
  await page.keyboard.up('Control');
  await page.waitForSelector('#prop-batch-fill', { timeout: 5000 });
  await page.$eval('#prop-batch-fill', (el) => {
    el.value = '#00ff00';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  const batchFills = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return ['人', '机'].map((label) =>
      g.getNodes().find((n) => n.attr('label/text') === label).attr('body/fill'));
  });
  await page.screenshot({ path: path.join(shots, 'p2-batch.png'), fullPage: true });

  // 层级置顶
  await page.click('#prop-front');
  await page.waitForTimeout(200);

  // 保存并重载验证持久化
  await page.click('#btn-save');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(600);
  const afterReload = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const head = g.getNodes().find((n) => n.shape === 'fish-head');
    const fills = ['人', '机'].map((label) =>
      g.getNodes().find((n) => n.attr('label/text') === label).attr('body/fill'));
    return {
      headW: head.getSize().width,
      preset: (head.getData() || {}).ygtPreset,
      dir: (head.getData() || {}).ygtDir,
      fills
    };
  });
  await page.screenshot({ path: path.join(shots, 'p2-reload.png'), fullPage: true });

  console.log(JSON.stringify({ afterPreset, afterDir, batchFills, afterReload, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
