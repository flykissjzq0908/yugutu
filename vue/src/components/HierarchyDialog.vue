<template>
  <div v-if="visible" class="hier-overlay" @mousedown.self="emit('close')">
    <div class="hier-panel">
      <div class="hier-head">
        <h3>上下级数据</h3>
      </div>
      <div class="hier-toolbar">
        <button type="button" class="ghost" @click="addRoot">新增一级鱼刺</button>
        <span class="hier-tip">拖拽节点可调整上下级</span>
      </div>
      <div class="hier-tree-wrap">
        <el-tree
          :key="treeKey"
          ref="treeRef"
          :data="treeData"
          node-key="id"
          default-expand-all
          draggable
          :allow-drop="allowDrop"
          @node-drop="onNodeDrop"
        >
          <template #default="{ data }">
            <div class="hier-node">
              <span class="hier-level">{{ levelText(data.level) }}</span>
              <input type="text" :value="data.label" @input="data.label = $event.target.value" @click.stop>
              <label class="hier-important">
                <input type="checkbox" :checked="data.important" @change="data.important = $event.target.checked" @click.stop>
                重要
              </label>
              <span class="hier-ops">
                <button type="button" @click.stop="addChild(data)">子级</button>
                <button type="button" @click.stop="addSibling(data)">同级</button>
                <button type="button" @click.stop="moveUp(data)">上移</button>
                <button type="button" @click.stop="moveDown(data)">下移</button>
                <button type="button" class="danger" @click.stop="removeRow(data)">删除</button>
              </span>
            </div>
          </template>
        </el-tree>
        <div v-if="!rows.length" class="hier-empty">暂无业务节点</div>
      </div>
      <div class="hier-foot">
        <button id="hier-save" type="button" @click="save">保存</button>
        <button id="hier-close" type="button" @click="emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { ElTree } from 'element-plus';
import 'element-plus/es/components/tree/style/css';

const props = defineProps({
  canvas: { type: Object, required: true },
  visible: { type: Boolean, default: false }
});
const emit = defineEmits(['close', 'saved', 'toast']);

const rows = ref([]);
const treeRef = ref(null);
const treeKey = ref(0);
let seq = 1;

function isRed(color) {
  if (!color || typeof color !== 'string') return false;
  const c = color.toLowerCase();
  return c === '#dc2626' || c === 'red' || /^rgb\(220, ?38, ?38\)$/.test(c);
}

function levelText(level) {
  if (level === 1) return '一级';
  if (level === 2) return '二级';
  if (level === 3) return '三级';
  return level > 3 ? level + ' 级' : '根';
}

function buildRows() {
  const g = props.canvas.graph;
  const out = [];
  g.getNodes().forEach((n) => {
    if (n.shape !== 'bone-node' && n.shape !== 'group-node') return;
    const d = n.getData() || {};
    const label = n.attr('label') || {};
    const body = n.attr('body') || {};
    const rawPid = (typeof d.parentId === 'string' && d.parentId !== '' && d.parentId !== '__ROOT__')
      ? d.parentId
      : '';
    const parentCell = rawPid ? g.getCellById(rawPid) : null;
    const pid = parentCell && (parentCell.shape === 'bone-node' || parentCell.shape === 'group-node')
      ? rawPid
      : '';
    const important = !!d.important || String(label.fontWeight || '') === '700' || isRed(label.fill) || isRed(body.fill);
    out.push({
      id: n.id,
      label: label.text || '',
      parentId: pid,
      order: typeof d.order === 'number' ? d.order : 0,
      level: Number(d.level) || (pid ? 2 : 1),
      important,
      origOrder: typeof d.order === 'number' ? d.order : 0,
      origLabel: label.text || '',
      origImportant: important,
      existing: true,
      needsLayout: false
    });
  });
  normalizeOrders();
  rows.value = out;
  bumpTree();
}

const treeData = computed(() => {
  const byParent = {};
  rows.value.forEach((r) => {
    (byParent[r.parentId] = byParent[r.parentId] || []).push(r);
  });
  const build = (pid) => (byParent[pid] || [])
    .slice()
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((r) => {
      r.children = build(r.id);
      return r;
    });
  return build('');
});

function nextId() {
  return 'hier_' + Date.now() + '_' + (seq++);
}

function bumpTree() {
  treeKey.value += 1;
  nextTick(() => {});
}

function addRow(parentId, level) {
  const kids = rows.value.filter((r) => r.parentId === parentId);
  rows.value.push({
    id: nextId(),
    label: '新节点',
    parentId,
    order: kids.length,
    level,
    important: false,
    origOrder: kids.length,
    origLabel: '新节点',
    origImportant: false,
    existing: false,
    needsLayout: true
  });
  normalizeOrders();
  bumpTree();
  applyStructuralNow('新增节点');
}

function addRoot() {
  addRow('', 1);
}

function addChild(row) {
  if (row.level >= 5) {
    emit('toast', '最多支持五级层级', true);
    return;
  }
  addRow(row.id, row.level + 1);
}

function addSibling(row) {
  addRow(row.parentId, row.parentId ? (rows.value.find((r) => r.id === row.parentId) || {}).level + 1 : 1);
}

function removeRow(row) {
  const drop = new Set([row.id]);
  let changed = true;
  while (changed) {
    changed = false;
    rows.value.forEach((r) => {
      if (!drop.has(r.id) && drop.has(r.parentId)) {
        drop.add(r.id);
        changed = true;
      }
    });
  }
  rows.value = rows.value.filter((r) => !drop.has(r.id));
  normalizeOrders();
  bumpTree();
  applyStructuralNow('删除节点');
}

function siblings(row) {
  return rows.value.filter((r) => r.parentId === row.parentId && r.id !== row.id)
    .sort((a, b) => a.order - b.order);
}

function moveUp(row) {
  const prev = siblings(row).filter((r) => r.order < row.order).pop();
  if (!prev) return;
  const tmp = prev.order;
  prev.order = row.order;
  row.order = tmp;
  normalizeOrders();
  bumpTree();
  applyStructuralNow('上移节点');
}

function moveDown(row) {
  const next = siblings(row).filter((r) => r.order > row.order).shift();
  if (!next) return;
  const tmp = next.order;
  next.order = row.order;
  row.order = tmp;
  normalizeOrders();
  bumpTree();
  applyStructuralNow('下移节点');
}

function isDescendant(candidateId, ancestorId) {
  let cur = rows.value.find((r) => r.id === candidateId);
  while (cur && cur.parentId) {
    if (cur.parentId === ancestorId) return true;
    cur = rows.value.find((r) => r.id === cur.parentId);
  }
  return false;
}

function allowDrop(draggingNode, dropNode, type) {
  if (type !== 'inner') return true;
  const dragId = draggingNode.data.id;
  const dropId = dropNode.data.id;
  if (dragId === dropId || isDescendant(dropId, dragId)) return false;
  return dropNode.data.level < 5;
}

function onNodeDrop(draggingNode, dropNode, dropType) {
  const row = draggingNode.data;
  if (dropType === 'inner') {
    row.parentId = dropNode.data.id;
    row.level = dropNode.data.level + 1;
  } else {
    row.parentId = dropNode.data.parentId;
    row.level = dropNode.data.level;
  }
  row.needsLayout = true;
  normalizeOrders();
  bumpTree();
  applyStructuralNow('调整上下级');
}

function normalizeOrders() {
  const groups = {};
  rows.value.forEach((r) => {
    (groups[r.parentId] = groups[r.parentId] || []).push(r);
  });
  Object.keys(groups).forEach((pid) => {
    groups[pid].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    groups[pid].forEach((r, i) => { r.order = i; });
  });
}

function validate() {
  const ids = new Set(rows.value.map((r) => r.id));
  for (const r of rows.value) {
    if (r.parentId && !ids.has(r.parentId)) return '上级不存在：' + r.label;
  }
  const seen = new Set();
  for (const r of rows.value) {
    const chain = new Set();
    let cur = r;
    while (cur && cur.parentId) {
      if (chain.has(cur.id)) return '存在循环层级：' + cur.label;
      chain.add(cur.id);
      cur = rows.value.find((x) => x.id === cur.parentId);
    }
    if (seen.has(r.id)) return '存在重复节点';
    seen.add(r.id);
  }
  return null;
}

function layoutPosition(row) {
  const g = props.canvas.graph;
  const spine = g.getNodes().find((n) => n.shape === 'fish-spine');
  const spineY = spine ? spine.position().y + spine.getSize().height / 2 : 420;
  const spineX = spine ? spine.position().x : 120;
  if (row.level === 1) {
    const index = rows.value.filter((r) => r.level === 1 && r.parentId === row.parentId)
      .sort((a, b) => a.order - b.order).indexOf(row);
    return {
      x: spineX + 80 + Math.max(0, index) * 150,
      y: (Math.max(0, index) % 2 === 0 ? spineY - 180 : spineY + 136)
    };
  }
  const parent = rows.value.find((r) => r.id === row.parentId);
  const node = parent ? g.getCellById(parent.id) : null;
  const px = node ? node.position().x : spineX + 80;
  const py = node ? node.position().y : spineY;
  const kids = rows.value.filter((r) => r.parentId === row.parentId)
    .sort((a, b) => a.order - b.order);
  const k = kids.indexOf(row);
  const n = kids.length;
  return { x: px + 150, y: py + (k - (n - 1) / 2) * 64 };
}

function nodeAttrs(row) {
  return {
    label: {
      text: row.label || '',
      fontSize: 13,
      fill: row.important ? '#dc2626' : '#1f2937',
      fontWeight: row.important ? '700' : '400'
    },
    body: row.important
      ? { fill: '#fef2f2', stroke: '#dc2626' }
      : { fill: '#ffffff', stroke: '#94a3b8' }
  };
}

function incomingEdgeId(nodeId) {
  const g = props.canvas.graph;
  const node = g.getCellById(nodeId);
  const edges = node ? (g.getIncomingEdges(node) || []) : [];
  const edge = edges.find((e) => e.shape === 'bone-edge');
  return edge ? edge.id : null;
}

function moveChildrenOnly(nodeId, dx, dy) {
  rows.value.filter((r) => r.parentId === nodeId).forEach((r) => {
    if (r.needsLayout) return;
    const n = props.canvas.graph.getCellById(r.id);
    if (!n || !n.isNode || !n.isNode()) return;
    const p = n.position();
    n.position(p.x + dx, p.y + dy);
    moveChildrenOnly(r.id, dx, dy);
  });
}

function applyRows(applyStyles) {
  const g = props.canvas.graph;
  const spine = g.getNodes().find((n) => n.shape === 'fish-spine');
  const fishHead = g.getNodes().find((n) => n.shape === 'fish-head');
  const spineY = spine ? spine.position().y + spine.getSize().height / 2 : 420;
  const rootParentId = fishHead ? fishHead.id : '__ROOT__';
  const oldNodes = g.getNodes().filter((n) => n.shape === 'bone-node' || n.shape === 'group-node');
  const keepIds = new Set(rows.value.map((r) => r.id));
  const removeCells = oldNodes.filter((n) => !keepIds.has(n.id));
  const removeEdges = [];
  removeCells.forEach((n) => {
    (g.getIncomingEdges(n) || []).forEach((e) => removeEdges.push(e));
    (g.getOutgoingEdges(n) || []).forEach((e) => removeEdges.push(e));
  });

  props.canvas.batch(() => {
    if (removeCells.length) g.removeCells(removeCells.concat(removeEdges));
    rows.value.forEach((row) => {
      let node = g.getCellById(row.id);
      if (node && node.isNode && node.isNode()) {
        if (applyStyles) {
          const labelChanged = row.label !== row.origLabel;
          const importantChanged = row.important !== row.origImportant;
          if (labelChanged || importantChanged) {
            const labelPatch = {};
            const bodyPatch = {};
            if (labelChanged) labelPatch.text = row.label || '';
            if (importantChanged) {
              labelPatch.fill = row.important ? '#dc2626' : '#1f2937';
              labelPatch.fontWeight = row.important ? '700' : '400';
              bodyPatch.fill = row.important ? '#fef2f2' : '#ffffff';
              bodyPatch.stroke = row.important ? '#dc2626' : '#94a3b8';
            }
            if (Object.keys(labelPatch).length || Object.keys(bodyPatch).length) {
              node.attr({ label: labelPatch, body: bodyPatch });
            }
          }
        }
        const d = node.getData() || {};
        node.setData(Object.assign({}, d, {
          kind: row.level === 1 ? 'group' : 'bone',
          parentId: row.level === 1 ? rootParentId : (row.parentId || '__ROOT__'),
          order: row.order,
          level: row.level,
          important: !!row.important
        }));
      } else {
        const pos = layoutPosition(row);
        node = g.addNode({
          id: row.id,
          shape: 'bone-node',
          x: pos.x,
          y: pos.y,
          width: 120,
          height: 36,
          zIndex: 2,
          attrs: nodeAttrs(row),
          data: {
            kind: row.level === 1 ? 'group' : 'bone',
            parentId: row.level === 1 ? rootParentId : (row.parentId || '__ROOT__'),
            order: row.order,
            level: row.level,
            important: !!row.important
          },
          ports: window.YGT.shapes.portsOf('left|right|top|bottom')
        });
        row.existing = true;
      }
    });
    const byParent = {};
    rows.value.forEach((r) => {
      if (!r.existing || r.needsLayout) return;
      (byParent[r.parentId] = byParent[r.parentId] || []).push(r);
    });
    Object.keys(byParent).forEach((pid) => {
      const group = byParent[pid];
      const current = group.slice().sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
      const original = group.slice().sort((a, b) => a.origOrder - b.origOrder || a.label.localeCompare(b.label));
      const changed = current.some((r, i) => original[i] && r.id !== original[i].id);
      if (!changed) return;
      const slots = original.map((r) => {
        const n = g.getCellById(r.id);
        return n && n.isNode && n.isNode() ? n.position() : null;
      });
      current.forEach((r, i) => {
        const n = g.getCellById(r.id);
        if (!n || !n.isNode || !n.isNode() || !slots[i]) return;
        const old = n.position();
        n.position(slots[i].x, slots[i].y);
        moveChildrenOnly(r.id, slots[i].x - old.x, slots[i].y - old.y);
      });
    });

    const edgeDirtyIds = new Set(rows.value.filter((r) => !r.existing || r.needsLayout).map((r) => r.id));

    rows.value.slice().sort((a, b) => a.level - b.level).forEach((row) => {
      if (!row.needsLayout) return;
      const node = g.getCellById(row.id);
      if (!node || !node.isNode || !node.isNode()) return;
      const pos = layoutPosition(row);
      const old = node.position();
      node.position(pos.x, pos.y);
      moveChildrenOnly(row.id, pos.x - old.x, pos.y - old.y);
      row.needsLayout = false;
    });

    rows.value.forEach((row) => {
      if (!edgeDirtyIds.has(row.id)) return;
      const node = g.getCellById(row.id);
      if (!node) return;
      let edgeId = incomingEdgeId(row.id);
      let edge = edgeId ? g.getCellById(edgeId) : null;
      if (!edge || edge.shape !== 'bone-edge') {
        edge = g.addEdge({
          id: 'hier_e_' + row.id,
          shape: 'bone-edge',
          source: { x: 0, y: 0 },
          target: { cell: row.id, port: 'port-left' },
          attrs: { line: { stroke: '#1a73e8', strokeWidth: 2, targetMarker: window.YGT.shapes.blockMarkerAttrs(10, 8, 2) } }
        });
      }
      const nodePos = node.position();
      if (row.level === 1) {
        edge.setSource({ x: nodePos.x, y: spineY });
        edge.setTarget({ cell: row.id, port: nodePos.y + node.getSize().height / 2 < spineY ? 'port-bottom' : 'port-top' });
      } else {
        const parentEdgeId = incomingEdgeId(row.parentId);
        edge.setSource(parentEdgeId
          ? { cell: parentEdgeId, anchor: { name: 'ratio', args: { ratio: 0.5 } } }
          : { x: nodePos.x - 150, y: nodePos.y + node.getSize().height / 2 });
        edge.setTarget({ cell: row.id, port: 'port-left' });
      }
    });
  });
  rows.value.forEach((row) => { row.origOrder = row.order; });
}

function save() {
  normalizeOrders();
  const err = validate();
  if (err) {
    emit('toast', err, true);
    return;
  }
  applyRows(true);
  if (props.canvas.historyPush) props.canvas.historyPush('层级数据保存');
  emit('saved');
}

function applyStructuralNow(label) {
  normalizeOrders();
  const err = validate();
  if (err) {
    emit('toast', err, true);
    return false;
  }
  applyRows(false);
  if (props.canvas.historyPush) props.canvas.historyPush(label || '调整上下级');
  return true;
}

watch(() => props.visible, (v) => {
  if (v) {
    buildRows();
  }
}, { immediate: true });
</script>

<style scoped>
.hier-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hier-panel {
  width: min(960px, 92vw);
  max-height: 84vh;
  display: flex;
  flex-direction: column;
  background: var(--y-panel, #ffffff);
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 6px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.22);
}
.hier-head,
.hier-toolbar,
.hier-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--y-border, #cbd5e1);
}
.hier-head h3 {
  margin: 0;
  font-size: 15px;
  color: var(--y-text, #1f2937);
}
.hier-tip {
  font-size: 12px;
  color: var(--y-muted, #64748b);
}
.hier-toolbar button {
  height: 30px;
  padding: 0 14px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
  cursor: pointer;
}
.hier-toolbar button:hover {
  border-color: var(--y-accent, #1a73e8);
  color: var(--y-accent, #1a73e8);
  background: var(--y-hover, #f1f5f9);
}
.hier-tree-wrap {
  flex: 1 1 auto;
  overflow: auto;
  padding: 10px 14px;
  min-height: 200px;
}
.hier-empty {
  padding: 30px;
  text-align: center;
  color: var(--y-muted, #64748b);
  font-size: 13px;
}
.hier-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  padding-right: 6px;
}
.hier-level {
  width: 34px;
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--y-muted, #64748b);
}
.hier-node input[type="text"] {
  width: 180px;
  height: 24px;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0 6px;
  font-size: 13px;
  background: transparent;
  color: var(--y-text, #1f2937);
}
.hier-node:hover input[type="text"],
.hier-node input[type="text"]:focus {
  border-color: var(--y-border, #cbd5e1);
  background: var(--y-panel, #ffffff);
  outline: none;
}
.hier-important {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--y-text, #1f2937);
  white-space: nowrap;
}
.hier-ops {
  display: none;
  gap: 4px;
  margin-left: auto;
}
.hier-node:hover .hier-ops {
  display: inline-flex;
}
.hier-ops button {
  height: 22px;
  padding: 0 7px;
  font-size: 11px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
  cursor: pointer;
}
.hier-ops button.danger {
  color: #dc2626;
}
.hier-foot {
  border-top: 1px solid var(--y-border, #cbd5e1);
  border-bottom: none;
  justify-content: center;
}
.hier-foot button {
  min-width: 96px;
  height: 32px;
  padding: 0 18px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
  cursor: pointer;
}
.hier-foot button:hover {
  border-color: var(--y-accent, #1a73e8);
  color: var(--y-accent, #1a73e8);
  background: var(--y-hover, #f1f5f9);
}
</style>
