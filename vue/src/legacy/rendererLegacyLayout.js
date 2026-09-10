const MAX_LAYOUT_LEVEL = 4;
const PADDING = 40;

function levelOf(node) {
  const d = node && node.getData ? (node.getData() || {}) : {};
  return Number(d.level) || 0;
}

function orderOf(node) {
  const d = node && node.getData ? (node.getData() || {}) : {};
  return Number(d.order) || 0;
}

function normalizePreset(value) {
  const valid = new Set(['ygt1', 'ygt2', 'ygt3', 'ygt4', 'ygt5', 'ygt6', 'ygt7']);
  function pick(candidate) {
    if (candidate == null) return null;
    if (typeof candidate === 'object') {
      if (Array.isArray(candidate)) return pick(candidate[0]);
      return pick(candidate.ygtstyle);
    }
    const text = String(candidate).trim();
    if (valid.has(text)) return text;
    try {
      return pick(JSON.parse(text));
    } catch (e) {
      const match = text.match(/["']ygtstyle["']\s*:\s*["'](ygt[1-7])["']/);
      return match ? match[1] : null;
    }
  }
  return pick(value) || 'ygt7';
}

let runnerPromise = null;

function ensureRunner() {
  if (runnerPromise) return runnerPromise;
  runnerPromise = new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-100000px;top:-100000px;width:1px;height:1px;border:0;visibility:hidden;';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.onload = () => {
      try {
        if (!iframe.contentWindow || typeof iframe.contentWindow.__YGT_LEGACY_RUN__ !== 'function') {
          reject(new Error('旧渲染器运行器未加载'));
          return;
        }
        resolve(iframe);
      } catch (e) {
        reject(e);
      }
    };
    iframe.onerror = () => reject(new Error('旧渲染器运行器加载失败'));
    iframe.src = new URL('legacy/runner.html', document.baseURI).href;
    document.body.appendChild(iframe);
  });
  return runnerPromise;
}

function createPayload(canvas, ygtstyleValue) {
  const graph = canvas.graph;
  const head = graph.getNodes().find((node) => node.shape === 'fish-head');
  const headData = head ? (head.getData() || {}) : {};
  const dir = headData.ygtDir === 'toleft' ? 'toleft' : 'toright';
  const nodes = graph.getNodes().filter((node) => node.shape === 'bone-node' || node.shape === 'group-node');
  nodes.sort((a, b) => {
    const ad = a.getData() || {};
    const bd = b.getData() || {};
    return orderOf(a) - orderOf(b) || String(ad.parentId || '').localeCompare(String(bd.parentId || '')) || String(a.id).localeCompare(String(b.id));
  });
  const items = nodes.map((node) => {
    const d = node.getData() || {};
    return {
      ID: node.id,
      PARENT: (!d.parentId || d.parentId === '__ROOT__' || levelOf(node) === 1) ? 'ROOT' : d.parentId,
      NAME: d.label || node.attr('label/text') || '',
      IMPORTANT: d.important ? '1' : '0',
      URL: d.url || '',
      OPENTYPE: d.openType || ''
    };
  });
  return {
    items,
    title: (canvas.graph.getNodes().find((node) => node.shape === 'fish-head') && (canvas.graph.getNodes().find((node) => node.shape === 'fish-head').getData() || {}).title) || '鱼骨图',
    ygtstyle: normalizePreset(ygtstyleValue),
    dir,
    fixedText: false
  };
}

function collectBounds(items, skeleton) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function add(x, y) {
    if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) return;
    minX = Math.min(minX, Number(x));
    minY = Math.min(minY, Number(y));
    maxX = Math.max(maxX, Number(x));
    maxY = Math.max(maxY, Number(y));
  }
  items.forEach((item) => {
    if (item.line) { add(item.line.x1, item.line.y1); add(item.line.x2, item.line.y2); }
    if (item.text) add(item.text.x, item.text.y);
  });
  if (skeleton) {
    if (skeleton.head) add(skeleton.head.x, skeleton.head.y);
    if (skeleton.tail) add(skeleton.tail.x, skeleton.tail.y);
    if (skeleton.spine) { add(skeleton.spine.x1, skeleton.spine.y1); add(skeleton.spine.x2, skeleton.spine.y2); }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

function applyGeometry(canvas, geometry) {
  if (!geometry || !geometry.ok || !geometry.items || !geometry.items.length) return { ok: false, message: '旧渲染器没有返回几何数据' };
  const graph = canvas.graph;
  const bounds = collectBounds(geometry.items, geometry.skeleton);
  const dx = -bounds.minX + PADDING;
  const dy = -bounds.minY + PADDING;
  const preset = geometry.preset || 'ygt1';
  const itemMap = {};
  geometry.items.forEach((item) => { if (item && item.id) itemMap[item.id] = item; });

  const edgeUpdates = [];
  geometry.items.forEach((item) => {
    const node = graph.getCellById(item.id);
    if (!node || !item.text) return;
    const size = node.getSize();
    const incoming = (graph.getIncomingEdges(node) || []).find((edge) => edge.shape === 'bone-edge');
    if (incoming && item.line) {
      edgeUpdates.push({
        edge: incoming,
        item,
        line: {
          x1: Number(item.line.x1) + dx,
          y1: Number(item.line.y1) + dy,
          x2: Number(item.line.x2) + dx,
          y2: Number(item.line.y2) + dy
        }
      });
    }
  });

  if (canvas.setLegacySyncSuppressed) canvas.setLegacySyncSuppressed(true);
  try {
    canvas.batch(() => {
    geometry.items.forEach((item) => {
      const node = graph.getCellById(item.id);
      if (!node || !item.text) return;
      const size = node.getSize();
      node.position(Number(item.text.x) + dx - size.width / 2, Number(item.text.y) + dy - size.height / 2);
    });
    edgeUpdates.forEach((entry) => {
      if (entry.item && entry.item.level === 1 && entry.item.line && typeof entry.edge.setSource === 'function') {
        entry.edge.setSource({ x: Number(entry.item.line.x1) + dx, y: Number(entry.item.line.y1) + dy });
      }
      const data = Object.assign({}, entry.edge.getData() || {}, { legacyLine: entry.line });
      entry.edge.setData(data, { silent: true });
      if (typeof entry.edge.setConnector === 'function') entry.edge.setConnector({ name: 'legacy-line' });
      if (typeof entry.edge.findView === 'function') {
        const view = entry.edge.findView(graph);
        if (view && typeof view.update === 'function') view.update();
      }
    });

    const sk = geometry.skeleton || {};
    const head = graph.getNodes().find((node) => node.shape === 'fish-head');
    const tail = graph.getNodes().find((node) => node.shape === 'fish-tail');
    const spine = graph.getNodes().find((node) => node.shape === 'fish-spine');
    if (head && sk.head) {
      const s = head.getSize();
      head.position(Number(sk.head.x) + dx - s.width / 2, Number(sk.head.y) + dy - s.height / 2);
    }
    if (tail && sk.tail) {
      const s = tail.getSize();
      tail.position(Number(sk.tail.x) + dx - s.width / 2, Number(sk.tail.y) + dy - s.height / 2);
    }
    if (spine && sk.spine) {
      const s = spine.getSize();
      const x1 = Number(sk.spine.x1) + dx;
      const x2 = Number(sk.spine.x2) + dx;
      const y = Number(sk.spine.y1) + dy;
      spine.resize(Math.max(1, Math.abs(x2 - x1)), s.height);
      spine.position(Math.min(x1, x2), y - s.height / 2);
    }
    if (head) {
      const hd = Object.assign({}, head.getData() || {}, { ygtPreset: preset, ygtDir: sk.head && sk.head.dir ? sk.head.dir : 'toright' });
      head.setData(hd);
      if (window.YGT && window.YGT.shapes && typeof window.YGT.shapes.applyPresetStyle === 'function') {
        window.YGT.shapes.applyPresetStyle(graph, preset, hd.ygtDir);
      }
    }
    });
  } finally {
    if (canvas.setLegacySyncSuppressed) canvas.setLegacySyncSuppressed(false);
  }

  const finalHead = graph.getNodes().find((node) => node.shape === 'fish-head');
  if (finalHead) {
    const finalHeadData = Object.assign({}, finalHead.getData() || {}, { ygtPreset: preset, ygtDir: (geometry.skeleton && geometry.skeleton.head && geometry.skeleton.head.dir) || 'toright' });
    finalHead.setData(finalHeadData);
    if (window.YGT && window.YGT.shapes && typeof window.YGT.shapes.applyPresetStyle === 'function') {
      window.YGT.shapes.applyPresetStyle(graph, preset, finalHeadData.ygtDir);
    }
  }
  if (canvas.historyPush) canvas.historyPush('按层级重建布局');
  if (canvas.notifyChanged) canvas.notifyChanged();
  if (finalHead) {
    const lastHeadData = Object.assign({}, finalHead.getData() || {}, { ygtPreset: preset, ygtDir: (geometry.skeleton && geometry.skeleton.head && geometry.skeleton.head.dir) || 'toright' });
    finalHead.setData(lastHeadData);
    if (window.YGT && window.YGT.shapes && typeof window.YGT.shapes.applyPresetStyle === 'function') {
      window.YGT.shapes.applyPresetStyle(graph, preset, lastHeadData.ygtDir);
    }
    finalHead.setData(Object.assign({}, finalHead.getData() || {}, { ygtPreset: preset, ygtDir: lastHeadData.ygtDir }));
  }
  return { ok: true, count: geometry.items.length, engine: 'renderer', preset };
}

export async function rebuildLegacyLayoutRenderer(canvas, ygtstyleValue) {
  if (!canvas || !canvas.graph || !canvas.batch) return { ok: false, message: '当前画布不支持层级重建' };
  const graph = canvas.graph;
  const nodes = graph.getNodes().filter((node) => node.shape === 'bone-node' || node.shape === 'group-node');
  if (!nodes.length) return { ok: false, message: '没有可重建的业务节点' };
  const maxLevel = nodes.reduce((max, node) => Math.max(max, levelOf(node) || 0), 0);
  if (maxLevel > MAX_LAYOUT_LEVEL) return { ok: false, message: '按层级重建布局最多支持 ' + MAX_LAYOUT_LEVEL + ' 级鱼刺' };
  try {
    const iframe = await ensureRunner();
    const payload = createPayload(canvas, ygtstyleValue);
    const geometry = iframe.contentWindow.__YGT_LEGACY_RUN__(payload);
    return applyGeometry(canvas, geometry);
  } catch (e) {
    return { ok: false, message: '旧渲染器布局失败：' + (e && e.message ? e.message : String(e)) };
  }
}
