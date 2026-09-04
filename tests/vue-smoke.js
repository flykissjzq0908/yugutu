const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const shots = path.join(__dirname, 'shots');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';

async function main() {
  fs.mkdirSync(shots, { recursive: true });
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  const token = execFileSync(py, ['-m', 'app.scripts.make_token'], { encoding: 'utf8' })
    .split(/\r?\n/)[0].trim();

  const createRes = await fetch(`${base}/api/v1/ygt/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'Vue冒烟测试', version: '1.0', canvas: { background: '#ffffff' }, cells: [] })
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

  await page.goto(`${base}/?token=${token}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('.doc-row', { timeout: 15000 });
  const listText = await page.locator('.doc-main').innerText();
  const listOk = listText.includes('Vue冒烟测试');

  await page.goto(`${base}/?docId=${encodeURIComponent(doc.id)}&token=${token}`, {
    waitUntil: 'load', timeout: 30000
  });
  await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);

  const empty = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    edges: window.__ygt.ctx.canvas.graph.getEdges().length
  }));

  await page.selectOption('#tpl-select', 'classic');
  await page.waitForTimeout(800);
  const classic = await page.evaluate(() => ({
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length,
    edges: window.__ygt.ctx.canvas.graph.getEdges().length
  }));
  await page.screenshot({ path: path.join(shots, 'vue-editor.png'), fullPage: true });

  await page.fill('#doc-title', 'Vue冒烟测试-已保存');
  await page.click('#btn-save');
  await page.waitForTimeout(900);
  const savedTitle = await page.evaluate(() => window.__ygt.ctx.doc.title);

  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
  await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
  await page.waitForTimeout(500);
  const afterReload = await page.evaluate(() => ({
    title: window.__ygt.ctx.doc.title,
    nodes: window.__ygt.ctx.canvas.graph.getNodes().length
  }));

  // 无 token 时应显示错误页，而不是无限刷新
  const cleanCtx = await browser.newContext();
  const cleanPage = await cleanCtx.newPage();
  await cleanPage.goto(`${base}/`, { waitUntil: 'load', timeout: 30000 });
  await cleanPage.waitForSelector('.ygt-auth-error', { timeout: 10000 });
  const authText = await cleanPage.locator('.ygt-auth-error').innerText();
  const authErrorOk = authText.includes('缺少 token');
  await cleanCtx.close();

  await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log(JSON.stringify({ listOk, empty, classic, savedTitle, afterReload, authErrorOk, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
