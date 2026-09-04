const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('./pw');

const root = path.resolve(__dirname, '..');
const base = process.env.YGT_BASE || 'http://127.0.0.1:8766';
const shots = path.join(__dirname, 'shots');

async function main() {
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  const token = execFileSync(py, ['-m', 'app.scripts.make_token'], { encoding: 'utf8' })
    .split(/\r?\n/)[0].trim();

  const createRes = await fetch(`${base}/api/v1/ygt/docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: '鱼骨图文字',
      version: '1.0',
      canvas: { background: '#ffffff' },
      cells: []
    })
  });
  const doc = await createRes.json();

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  fs.mkdirSync(shots, { recursive: true });
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('dialog', (d) => d.accept());

  try {
    await page.goto(`${base}/?docId=${encodeURIComponent(doc.id)}&token=${token}`, {
      waitUntil: 'load', timeout: 30000
    });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(400);

    await page.selectOption('#tpl-select', 'classic');
    await page.waitForTimeout(700);

    const selectHead = () => page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      window.__ygt.ctx.canvas.selection.reset([head]);
      window.__ygt.ctx.props.refresh();
      return head.id;
    });

    await selectHead();
    const inputInfo = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#props .prop-group input[type="text"]')).map((i) => ({
        placeholder: i.placeholder || '',
        value: i.value
      }))
    );
    await page.evaluate(() => {
      const input = document.querySelector('#props .prop-group input[placeholder="双击画布也可编辑"]');
      input.value = '鱼骨图文字';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const colors = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      const spec = window.YGT.shapes.headSpec('ygt1', 'toright', '');
      const path = head.attr('body/d');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const pp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pp.setAttribute('d', path);
      svg.appendChild(pp);
      document.body.appendChild(svg);
      const pb = pp.getBBox();
      document.body.removeChild(svg);
      return {
        labelFill: head.attr('label/fill'),
        bodyFill: head.attr('body/fill'),
        text: String(head.attr('label/text') || ''),
        labelOffX: spec.labelOffX,
        headWidth: spec.width,
        pathBBox: { x: pb.x, width: pb.width }
      };
    });
    const defaultColorOk = colors.labelFill === colors.bodyFill && colors.text === '鱼骨图文字';

    await page.selectOption('#prop-text-dir', 'v');
    await page.waitForTimeout(300);
    const vertical = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      const d = head.getData() || {};
      return { text: String(head.attr('label/text') || ''), textDir: d.textDir || '' };
    });
    const verticalOk = vertical.textDir === 'v' && vertical.text === '鱼\n骨\n图\n文\n字';
    await page.screenshot({ path: path.join(shots, 'fish-head-text.png'), fullPage: true });
    const layout = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      const scale = g.zoom() || 1;
      const nodeEl = document.querySelector(`.x6-node[data-cell-id="${head.id}"]`);
      const textEl = nodeEl.querySelector('text');
      const br = nodeEl.querySelector('path').getBoundingClientRect();
      const tr = textEl.getBoundingClientRect();
      const tb = textEl.getBBox();
      return {
        headCenterY: br.top + br.height / 2,
        textCenterY: tr.top + tr.height / 2,
        gapToHead: tr.left - br.right,
        localGapToHead: (tr.left - br.right) / scale,
        scale,
        textHeight: tr.height,
        textXAttr: textEl.getAttribute('x'),
        textBBoxX: tb.x,
        headBBox: (() => { const b = head.getBBox(); return { x: b.x, width: b.width }; })()
      };
    });
    const layoutOk = Math.abs(layout.headCenterY - layout.textCenterY) < 3 &&
      layout.localGapToHead > 27 && layout.localGapToHead < 33 &&
      layout.textHeight > 50;

    await page.fill('#doc-title', '鱼骨图文字');
    await page.click('#btn-save');
    await page.waitForTimeout(900);

    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#container.x6-graph', { timeout: 15000 });
    await page.waitForFunction(() => window.__ygt && window.__ygt.ctx, { timeout: 10000 });
    await page.waitForTimeout(500);

    const afterReload = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      const d = head.getData() || {};
      return {
        textDir: d.textDir || '',
        text: String(head.attr('label/text') || ''),
        labelFill: head.attr('label/fill'),
        bodyFill: head.attr('body/fill')
      };
    });
    const reloadOk = afterReload.textDir === 'v' &&
      afterReload.text === '鱼\n骨\n图\n文\n字' &&
      afterReload.labelFill === afterReload.bodyFill;

    console.log(JSON.stringify({ inputInfo, colors, defaultColorOk, vertical, verticalOk, layout, layoutOk, afterReload, reloadOk, errors }, null, 2));
    if (!defaultColorOk || !verticalOk || !layoutOk || !reloadOk || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
