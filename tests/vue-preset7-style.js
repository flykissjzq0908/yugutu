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
    body: JSON.stringify({
      title: '预设7样式回归',
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

    await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      window.__ygt.ctx.canvas.selection.reset([head]);
      window.__ygt.ctx.props.refresh();
    });
    await page.locator('#props .prop-grid select').nth(0).selectOption('ygt7');
    await page.waitForTimeout(400);

    const live = await page.evaluate(() => {
      const g = window.__ygt.ctx.canvas.graph;
      const head = g.getNodes().find((n) => n.shape === 'fish-head');
      const tail = g.getNodes().find((n) => n.shape === 'fish-tail');
      const spine = g.getNodes().find((n) => n.shape === 'fish-spine');
      const group = g.getNodes().find((n) => n.attr('label/text') === '人');
      const sub = g.getNodes().find((n) => n.attr('label/text') === '子原因 1');
      const groupEdge = g.getEdges().find((e) => e.getTarget().cell === group.id);
      const subEdge = g.getEdges().find((e) => e.getTarget().cell === sub.id);
      const backEdge = g.getEdges().find((e) => e.getSource().cell === tail.id);
      const line = (e) => e.attr('line') || {};
      const marker = (e) => line(e).targetMarker || {};
      return {
        head: { fill: head.attr('body/fill'), stroke: head.attr('body/stroke'), preset: (head.getData() || {}).ygtPreset },
        tailFill: tail.attr('body/fill'),
        spineFill: spine.attr('body/fill'),
        group: {
          fill: group.attr('body/fill'),
          stroke: group.attr('body/stroke'),
          text: group.attr('label/fill'),
          fontSize: group.attr('label/fontSize'),
          fontWeight: group.attr('label/fontWeight')
        },
        groupEdge: { stroke: line(groupEdge).stroke, width: line(groupEdge).strokeWidth, arrow: marker(groupEdge).width },
        sub: {
          text: sub.attr('label/fill'),
          fontSize: sub.attr('label/fontSize'),
          fontWeight: sub.attr('label/fontWeight')
        },
        subEdge: { stroke: line(subEdge).stroke, width: line(subEdge).strokeWidth, arrow: marker(subEdge).width },
        backEdge: { stroke: line(backEdge).stroke, width: line(backEdge).strokeWidth, arrow: marker(backEdge).width }
      };
    });

    const template = await page.evaluate(() => {
      const cells = window.YGT.core.templateCells('classic', { preset: 'ygt7' });
      const byId = {};
      cells.forEach((c) => { byId[c.id] = c; });
      return {
        headFill: byId.tpl_head.attrs.body.fill,
        spineFill: byId.tpl_spine.attrs.body.fill,
        spineHeight: byId.tpl_spine.height,
        groupEdge: byId.tpl_ge0.attrs.line,
        groupLabel: byId.tpl_g0.attrs.label
      };
    });

    const styleOk =
      live.head.fill === '#FF9900' && live.head.stroke === '#FF9900' && live.head.preset === 'ygt7' &&
      live.tailFill === '#FF9900' && live.spineFill === '#FF9900' &&
      live.group.fill === '#FF9900' && live.group.text === '#ffffff' &&
      live.group.fontSize === 22 && String(live.group.fontWeight) === '700' &&
      live.groupEdge.stroke === '#FF9900' && live.groupEdge.width === 5.5 &&
      live.groupEdge.arrow === 15 &&
      live.sub.text === '#000000' && live.sub.fontSize === 20 &&
      String(live.sub.fontWeight) === '700' &&
      live.subEdge.stroke === '#FF9900' && live.subEdge.width === 4.8 &&
      live.subEdge.arrow === 12 &&
      live.backEdge.stroke === '#FF9900' && live.backEdge.width === 2 &&
      live.backEdge.arrow === 5 &&
      template.headFill === '#FF9900' && template.spineFill === '#FF9900' &&
      template.spineHeight === 10 && template.groupEdge.stroke === '#FF9900' &&
      template.groupEdge.strokeWidth === 5.5 &&
      template.groupLabel.fill === '#ffffff' && template.groupLabel.fontSize === 22;

    console.log(JSON.stringify({ live, template, styleOk, errors }, null, 2));
    if (!styleOk || errors.length) process.exitCode = 2;
  } finally {
    await browser.close();
    await fetch(`${base}/api/v1/ygt/docs/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
