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

  const valid1 = await page.evaluate(() =>
    window.YGT.core.validateHierarchy(window.__ygt.ctx.canvas.getCells()).ok);

  // 新增节点自动挂根
  const newNodeId = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const n = g.addNode({
      id: 'hier_new', shape: 'bone-node', x: 700, y: 700,
      width: 100, height: 30,
      attrs: { label: { text: '新原因' } }
    });
    return n.id;
  });
  await page.waitForTimeout(300);
  const rootAssigned = await page.evaluate((id) => {
    const n = window.__ygt.ctx.canvas.graph.getCellById(id);
    const d = n.getData() || {};
    return d.parentId === '__ROOT__' && d.level === 0;
  }, newNodeId);

  // 连线自动建立父子关系
  await page.evaluate((id) => {
    const g = window.__ygt.ctx.canvas.graph;
    g.addEdge({
      shape: 'bone-edge',
      source: { cell: 'tpl_g0', port: 'port-right' },
      target: { cell: id, port: 'port-left' }
    });
  }, newNodeId);
  await page.waitForTimeout(400);
  const parentAssigned = await page.evaluate((id) => {
    const g = window.__ygt.ctx.canvas.graph;
    const n = g.getCellById(id);
    const d = n.getData() || {};
    return d.parentId === 'tpl_g0' && d.order === 2 && d.level === 2;
  }, newNodeId);
  const valid2 = await page.evaluate(() =>
    window.YGT.core.validateHierarchy(window.__ygt.ctx.canvas.getCells()).ok);

  // 循环层级：保存被拦截
  await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const ren = g.getCellById('tpl_g0');
    const d = ren.getData() || {};
    d.parentId = 'tpl_g0s0';
    ren.setData(d);
  });
  const cycleDetected = await page.evaluate(() =>
    !window.YGT.core.validateHierarchy(window.__ygt.ctx.canvas.getCells()).ok);
  await page.click('#btn-save');
  await page.waitForTimeout(300);
  const saveBlocked = await page.evaluate(() =>
    (document.querySelector('#ygt-toast').textContent || '').indexOf('保存失败') >= 0);

  // 修复后保存并重载验证持久化
  await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const ren = g.getCellById('tpl_g0');
    const d = ren.getData() || {};
    d.parentId = 'tpl_head';
    d.level = 1;
    d.order = 0;
    ren.setData(d);
  });
  await page.click('#btn-save');
  await page.waitForTimeout(300);
  const saveOk = await page.evaluate(() =>
    (document.querySelector('#ygt-toast').textContent || '').indexOf('已保存') >= 0);
  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  const persisted = await page.evaluate((id) => {
    const g = window.__ygt.ctx.canvas.graph;
    const n = g.getCellById(id);
    const d = n.getData() || {};
    return {
      parentId: d.parentId,
      order: d.order,
      level: d.level,
      valid: window.YGT.core.validateHierarchy(g.toJSON().cells).ok
    };
  }, newNodeId);

  // 非法层级导入被拦截
  const badDoc = JSON.stringify({
    version: '1.0',
    title: 'bad',
    canvas: { background: '#ffffff' },
    cells: [
      { id: 'b1', shape: 'bone-node', x: 10, y: 10, width: 100, height: 30, attrs: { label: { text: 'x' } } }
    ]
  });
  await page.setInputFiles('#file-import', {
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from(badDoc, 'utf-8')
  });
  await page.waitForTimeout(500);
  const importBlocked = await page.evaluate(() =>
    (document.querySelector('#ygt-toast').textContent || '').indexOf('导入失败') >= 0);

  console.log(JSON.stringify({
    valid1, rootAssigned, parentAssigned, valid2,
    cycleDetected, saveBlocked, saveOk,
    persisted, importBlocked, errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
