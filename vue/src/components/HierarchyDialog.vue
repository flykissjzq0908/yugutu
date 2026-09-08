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
    <Transition name="hier-toast">
      <div v-if="notice" class="hier-toast">
        <span class="hier-toast-icon" aria-hidden="true">!</span>
        <span>{{ notice }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
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
const notice = ref('');
let seq = 1;
let noticeTimer = null;

function showNotice(msg) {
  notice.value = String(msg || '');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.value = ''; }, 2200);
}

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
  if (row.level >= 4) {
    showNotice('不能新增第5级子节点');
    return;
  }
  addRow(row.id, row.level + 1);
}

function addSibling(row) {
  const parentLevel = row.parentId ? (rows.value.find((r) => r.id === row.parentId) || {}).level + 1 : 1;
  if (parentLevel >= 5) {
    showNotice('不能新增第5级子节点');
    return;
  }
  addRow(row.parentId, parentLevel);
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
  return dropNode.data.level < 4;
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
    showNotice(err);
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
    showNotice(err);
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

onBeforeUnmount(() => {
  if (noticeTimer) clearTimeout(noticeTimer);
});
</script>

<style scoped>
.hier-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(15, 23, 42, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.hier-panel {
  width: min(1080px, 94vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: var(--y-panel, #ffffff);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.hier-head,
.hier-toolbar,
.hier-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
}
.hier-head {
  border-bottom: 1px solid #e2e8f0;
}
.hier-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: var(--y-text, #1f2937);
}
.hier-toolbar {
  border-bottom: 1px solid #eef2f7;
  background: #fbfcfe;
}
.hier-toolbar button {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #1a73e8;
  border-radius: 8px;
  background: #1a73e8;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: background .15s ease;
}
.hier-toolbar button:hover {
  background: #1a64c9;
  border-color: #1a64c9;
}
.hier-tip {
  font-size: 12px;
  color: #8a94a6;
}
.hier-tree-wrap {
  flex: 1 1 auto;
  overflow: auto;
  padding: 8px 18px 12px;
  min-height: 220px;
  background: #f8fafc;
}
.hier-empty {
  padding: 40px;
  text-align: center;
  color: var(--y-muted, #64748b);
  font-size: 13px;
}
.hier-tree-wrap :deep(.el-tree) {
  background: transparent;
  color: #1f2937;
  font-size: 13px;
}
.hier-tree-wrap :deep(.el-tree-node__content) {
  height: auto;
  min-height: 48px;
  padding: 5px 8px;
  border-bottom: 1px solid #e8edf4;
  border-radius: 6px;
  transition: background .12s ease;
}
.hier-tree-wrap :deep(.el-tree-node__content:hover) {
  background: #f0f6ff;
}
.hier-tree-wrap :deep(.el-tree-node:focus > .el-tree-node__content) {
  background: #e8f1fe;
}
.hier-tree-wrap :deep(.el-tree-node__expand-icon) {
  color: #64748b;
}
.hier-node {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;
}
.hier-level {
  flex: 0 0 auto;
  min-width: 38px;
  padding: 3px 7px;
  border-radius: 5px;
  background: #e9edf3;
  color: #526071;
  font-size: 11px;
  text-align: center;
}
.hier-node input[type="text"] {
  flex: 1 1 220px;
  min-width: 120px;
  height: 30px;
  border: 1px solid #dfe5ee;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 13px;
  background: #ffffff;
  color: var(--y-text, #1f2937);
  transition: border-color .12s ease, box-shadow .12s ease;
}
.hier-node:hover input[type="text"],
.hier-node input[type="text"]:focus {
  border-color: #94b8f2;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, .10);
  outline: none;
}
.hier-important {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #4b5563;
  white-space: nowrap;
  padding: 4px 6px;
  border-radius: 6px;
}
.hier-important:hover {
  background: #f1f5f9;
}
.hier-ops {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 1;
  transition: opacity .12s ease;
}
.hier-ops button {
  height: 26px;
  padding: 0 8px;
  border: 1px solid #dfe5ee;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color .12s ease, color .12s ease;
}
.hier-ops button:hover {
  border-color: #94b8f2;
  color: #1a73e8;
}
.hier-ops button.danger {
  color: #dc2626;
  border-color: #f3d2d2;
}
.hier-ops button.danger:hover {
  border-color: #dc2626;
  color: #dc2626;
  background: #fef2f2;
}
.hier-toast {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 6000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border: 1px solid #f1c9c9;
  border-radius: 10px;
  background: rgba(255,255,255,.98);
  box-shadow: 0 14px 38px rgba(127, 29, 29, .18);
  color: #b91c1c;
  font-size: 14px;
  pointer-events: none;
}
.hier-toast-icon {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hier-toast-enter-active,
.hier-toast-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.hier-toast-enter-from,
.hier-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -46%);
}
.hier-foot {
  border-top: 1px solid #e2e8f0;
  background: #fbfcfe;
  justify-content: center;
}
.hier-foot button {
  min-width: 92px;
  height: 34px;
  padding: 0 18px;
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  cursor: pointer;
  font-size: 13px;
  transition: border-color .12s ease, color .12s ease;
}
.hier-foot button:hover {
  border-color: #94b8f2;
  color: #1a73e8;
}
.hier-foot #hier-save {
  background: #1a73e8;
  border-color: #1a73e8;
  color: #fff;
}
.hier-foot #hier-save:hover {
  background: #1a64c9;
  border-color: #1a64c9;
  color: #fff;
}
</style>
