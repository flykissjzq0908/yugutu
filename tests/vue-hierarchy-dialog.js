const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';

async function main() {
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  const token = execFileSync(py, ['-m', 'app.scripts.make_token'], { encoding: 'utf8' })
    .split(/\r?\n/)[0].trim();
  const createRes = await fetch(`${base}/api/v1/ygt/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: '层级编辑回归', version: '1.0', canvas: { background: '#ffffff' }, cells: [] })
  });
  const doc = await createRes.json();
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());
  try {
    await page.goto(`${base}/?docId=${encodeURIComponent(doc.id)}&token=${token}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(400);
    await page.selectOption('#tpl-select', 'classic');
    await page.waitForTimeout(700);

    const before = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const first = g.getNodes().find((n) => {
        const d = n.getData() || {};
        return Number(d.level) === 1;
      });
      return {
        nodes: g.getNodes().length,
        edges: g.getEdges().length,
        firstId: first ? first.id : null,
        positions: g.getNodes().filter((n) => n.shape === 'bone-node' || n.shape === 'group-node').map((n) => n.position())
      };
    });

    await page.click('#btn-hierarchy');
    await page.waitForSelector('.hier-panel', { timeout: 5000 });
    const firstContent = page.locator('.el-tree-node__content').first();
    await firstContent.hover();
    await firstContent.locator('button', { hasText: '子级' }).click();
    const firstRoot = page.locator('.el-tree-node').first();
    const firstChildren = firstRoot.locator(':scope > .el-tree-node__children > .el-tree-node');
    await firstChildren.last().waitFor({ timeout: 5000 });
    const newNode = firstChildren.last().locator('.hier-node');
    await newNode.locator('input[type="text"]').fill('新增原因');
    await newNode.locator('.hier-important input').check();
    await page.click('#hier-save');
    await page.waitForTimeout(3000);
    const earlyAfterSave = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const l1 = g.getNodes().filter((n) => {
        const d = n.getData() || {};
        return Number(d.level) === 1;
      }).sort((a, b) => ((a.getData() || {}).order || 0) - ((b.getData() || {}).order || 0));
      return l1.slice(0, 2).map((n) => ({ id: n.id, order: (n.getData() || {}).order, pos: n.position() }));
    });
    const saveState = await page.evaluate(() => ({
      dialogOpen: !!document.querySelector('.hier-panel'),
      toast: (document.querySelector('.ygt-global-toast') || {}).textContent || ''
    }));
    await page.waitForSelector('.hier-panel', { state: 'detached', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);

    const after = await page.evaluate((parentId) => {
      const g = window.__ygt.ctx.canvas.graph;
      const added = g.getNodes().find((n) => n.attr('label/text') === '新增原因');
      const d = added ? added.getData() || {} : {};
      return {
        nodes: g.getNodes().length,
        edges: g.getEdges().length,
        added: !!added,
        parentId: d.parentId,
        level: d.level,
        important: !!d.important,
        fontWeight: added ? added.attr('label/fontWeight') : null,
        validation: window.YGT.core.validateHierarchy(window.__ygt.ctx.canvas.getCells()),
        positions: g.getNodes().filter((n) => (n.shape === 'bone-node' || n.shape === 'group-node') && n.id !== added.id).map((n) => n.position())
      };
    }, before.firstId);

    const applyOk = after.added && after.nodes === before.nodes + 1 &&
      after.edges === before.edges + 1 && after.parentId === before.firstId &&
      after.level === 2 && after.important && after.fontWeight === '700' &&
      JSON.stringify(after.positions) === JSON.stringify(before.positions);

    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(600);
    const reload = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const added = g.getNodes().find((n) => n.attr('label/text') === '新增原因');
      return {
        exists: !!added,
        nodes: g.getNodes().length,
        edges: g.getEdges().length
      };
    });
    const reloadOk = reload.exists && reload.nodes === after.nodes && reload.edges === after.edges;

    const swapBefore = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const l1 = g.getNodes().filter((n) => {
        const d = n.getData() || {};
        return Number(d.level) === 1;
      }).sort((a, b) => ((a.getData() || {}).order || 0) - ((b.getData() || {}).order || 0));
      return {
        posG0: g.getCellById('tpl_g0').position(),
        posG1: g.getCellById('tpl_g1').position(),
        oG0: (g.getCellById('tpl_g0').getData() || {}).order,
        oG1: (g.getCellById('tpl_g1').getData() || {}).order
      };
    });
    await page.click('#btn-hierarchy');
    await page.waitForSelector('.hier-panel', { timeout: 5000 });
    const secondContent = page.locator('.el-tree > .el-tree-node').nth(1).locator(':scope > .el-tree-node__content');
    await secondContent.hover();
    await secondContent.locator('button', { hasText: '上移' }).click();
    const orderAfterClick = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.el-tree > .el-tree-node > .el-tree-node__content .hier-node input[type="text"]')).map((i) => i.value)
    );
    await page.click('#hier-save');
    await page.waitForTimeout(1000);
    const saveState2 = await page.evaluate(() => ({
      dialogOpen: !!document.querySelector('.hier-panel'),
      toast: (document.querySelector('.ygt-global-toast') || {}).textContent || ''
    }));
    await page.waitForSelector('.hier-panel', { state: 'detached', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const swapAfter = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const l1 = g.getNodes().filter((n) => {
        const d = n.getData() || {};
        return Number(d.level) === 1;
      }).sort((a, b) => ((a.getData() || {}).order || 0) - ((b.getData() || {}).order || 0));
      return {
        posG0: g.getCellById('tpl_g0').position(),
        posG1: g.getCellById('tpl_g1').position(),
        oG0: (g.getCellById('tpl_g0').getData() || {}).order,
        oG1: (g.getCellById('tpl_g1').getData() || {}).order
      };
    });
    const swapOk = JSON.stringify(swapAfter.posG0) === JSON.stringify(swapBefore.posG1) &&
      JSON.stringify(swapAfter.posG1) === JSON.stringify(swapBefore.posG0) &&
      swapAfter.oG0 === swapBefore.oG1 && swapAfter.oG1 === swapBefore.oG0;

    console.log(JSON.stringify({ before, saveState, after, applyOk, reload, reloadOk, orderAfterClick, saveState2, swapBefore, swapAfter, swapOk, errors }, null, 2));
    if (!applyOk || !reloadOk || !swapOk || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
