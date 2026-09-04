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

  const edgeId = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    return g.getEdges().find((x) => x.id.indexOf('tpl_ge') === 0).id;
  });

  async function addDot() {
    await page.evaluate((id) => {
      const ctx = window.__ygt.ctx;
      ctx.canvas.selection.clean();
      ctx.canvas.selection.select([ctx.canvas.graph.getCellById(id)]);
    }, edgeId);
    await page.waitForSelector('#prop-edge-add-dot', { timeout: 5000 });
    await page.click('#prop-edge-add-dot');
    await page.waitForTimeout(400);
  }

  await addDot();
  const before = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const dot = g.getNodes().filter((n) => n.shape === 'dot-node').pop();
    const b = dot.getBBox();
    return {
      id: dot.id,
      x: dot.position().x,
      y: dot.position().y,
      client: g.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
    };
  });

  // 真实鼠标拖离
  await page.mouse.move(before.client.x, before.client.y);
  await page.mouse.down();
  await page.mouse.move(before.client.x, before.client.y + 120, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const dragResult = await page.evaluate((id) => {
    const g = window.__ygt.ctx.canvas.graph;
    const dot = g.getCellById(id);
    const d = dot.getData() || {};
    return { x: dot.position().x, y: dot.position().y, detached: !d.attachEdge };
  }, before.id);

  // 拖离成自由点（同一处理逻辑，通过 helper 触发）
  const detachCheck = await page.evaluate((id) => {
    const ctx = window.__ygt.ctx;
    const dot = ctx.canvas.graph.getCellById(id);
    ctx.canvas.testMoveDot(dot, 0, 160);
    const d = dot.getData() || {};
    return !d.attachEdge;
  }, before.id);

  await page.screenshot({ path: path.join(shots, 'p16-drag.png'), fullPage: true });

  console.log(JSON.stringify({
    moved: dragResult.x !== before.x || dragResult.y !== before.y,
    detached: dragResult.detached,
    detachCheck,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
