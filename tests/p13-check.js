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

  const stencil = await page.evaluate(() => document.querySelectorAll('#stencil .x6-node').length);

  // 箭头线：可添加、可拉伸
  const arrow = await page.evaluate(() => {
    const g = window.__ygt.ctx.canvas.graph;
    const node = g.addNode({
      id: 'arrow_test', shape: 'arrow-line', x: 120, y: 120,
      width: 160, height: 24,
      ports: window.YGT.shapes.portsOf('left|right')
    });
    const before = node.getSize().width;
    node.resize(300, 24);
    const after = node.getSize().width;
    return { before, after, hasPath: !!node.attr('body') };
  });

  // 箭头线 DOM 渲染检查
  const arrowDom = await page.evaluate(() => {
    const el = document.querySelector('#container .x6-node[data-cell-id="arrow_test"]');
    const path = el && el.querySelector('path');
    return {
      hasPath: !!path,
      d: path ? path.getAttribute('d') : null,
      fill: path ? path.getAttribute('fill') : null
    };
  });
  // 端口小圆点默认隐藏（悬停显示为 CSS 规则）
  const portState = await page.evaluate(() => {
    const port = document.querySelector('#container .x6-port-body');
    return {
      hasPort: !!port,
      hiddenDefault: port ? getComputedStyle(port).opacity === '0' : true
    };
  });
  await page.screenshot({ path: path.join(shots, 'p13-arrow.png'), fullPage: true });

  console.log(JSON.stringify({
    stencil,
    arrowAdded: arrow.after === 300 && arrow.hasPath,
    arrowStretchable: arrow.before === 160 && arrow.after === 300,
    arrowDom,
    portState,
    errors
  }, null, 2));

  await browser.close();
  if (errors.length) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
