<template>
  <aside id="props" class="ygt-props" :class="{ hidden: !visible }">
    <div class="prop-group">
      <label class="prop-label">画布背景</label>
      <ColorPickerField :model-value="canvasBg" @apply="onFieldChange('canvasBg', $event)" />
    </div>
    <div class="prop-divider"></div>
    <h3 id="prop-title">{{ mode === 'global' ? '通用鱼刺设置' : (count ? '已选中 ' + count + ' 个元素' : '未选中元素') }}</h3>

    <template v-if="mode === 'global'">
      <div class="prop-group">
        <label class="prop-label">应用层级</label>
        <select id="global-level" :value="globalLevel" @change="onGlobalLevelChange($event.target.value)">
          <option :value="1">一级鱼刺</option>
          <option :value="2">二级鱼刺</option>
          <option :value="3">三级鱼刺</option>
          <option :value="4">四级鱼刺</option>
        </select>
      </div>
      <div class="prop-group">
        <label class="prop-label">斜线角度</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input id="global-angle" type="number" min="0" max="360" step="1"
                 :value="globalAngle" @change="globalAngle = Number($event.target.value)">
          <!-- 按角度刷新按钮暂时隐藏，恢复时删除 v-if="false" 即可 -->
          <button v-if="false" id="global-angle-apply" type="button" class="ghost" @click="applyAngleLayout">按角度刷新</button>
        </div>
      </div>
      <div class="prop-divider"></div>
      <h4 class="prop-section">线条</h4>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">颜色</label>
          <ColorPickerField :model-value="global.lineColor" @apply="global.lineColor = $event" />
        </div>
        <div class="prop-group">
          <label class="prop-label">线宽</label>
          <input type="number" min="1" max="20" :value="global.lineWidth" @change="global.lineWidth = Number($event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">箭头大小</label>
          <input type="number" min="4" max="30" :value="global.arrow" @change="global.arrow = Number($event.target.value)">
        </div>
      </div>
      <h4 class="prop-section">节点控件</h4>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">字号</label>
          <input type="number" min="8" max="72" :value="global.fontSize" @change="global.fontSize = Number($event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">字色</label>
          <ColorPickerField :model-value="global.fontColor" @apply="global.fontColor = $event" />
        </div>
        <div class="prop-group">
          <label class="prop-label">字重</label>
          <select :value="global.fontWeight" @change="global.fontWeight = $event.target.value">
            <option value="400">常规</option>
            <option value="600">半粗</option>
            <option value="700">加粗</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">填充</label>
          <ColorPickerField :model-value="global.fill" @apply="global.fill = $event" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框</label>
          <ColorPickerField :model-value="global.stroke" @apply="global.stroke = $event" />
        </div>
        <div class="prop-group">
          <label class="prop-label">线宽</label>
          <input type="number" min="0" max="12" :value="global.strokeWidth" @change="global.strokeWidth = Number($event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">宽</label>
          <input type="number" min="20" max="2000" :value="global.width" @change="global.width = Number($event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">高</label>
          <input type="number" min="10" max="1200" :value="global.height" @change="global.height = Number($event.target.value)">
        </div>
      </div>
      <button id="global-apply" type="button" class="ghost" @click="applyGlobal">应用</button>
    </template>

    <template v-if="mode === 'node'">
      <h4 v-if="cellInfo.isFish" class="prop-section">鱼形样式</h4>
      <div v-if="cellInfo.isFish" class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">鱼形预设</label>
          <select :value="node.fishPreset" @change="onFieldChange('fishPreset', $event.target.value)">
            <option value="ygt1">预设 1</option>
            <option value="ygt2">预设 2</option>
            <option value="ygt3">预设 3</option>
            <option value="ygt4">预设 4</option>
            <option value="ygt5">预设 5</option>
            <option value="ygt6">预设 6</option>
            <option value="ygt7">预设 7</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">朝向</label>
          <select :value="node.fishDir" @change="onFieldChange('fishDir', $event.target.value)">
            <option value="toright">向右</option>
            <option value="toleft">向左</option>
          </select>
        </div>
        <div v-if="cellInfo.isFishHead" class="prop-group">
          <label class="prop-label">文字方向</label>
          <select id="prop-text-dir" :value="node.textDir" @change="onFieldChange('textDir', $event.target.value)">
            <option value="h">横向</option>
            <option value="v">竖向</option>
          </select>
        </div>
      </div>

      <div v-if="cellInfo.isImage" class="prop-group">
        <label class="prop-label">图片地址</label>
        <input type="text" placeholder="https://... 或选择本地图片" :value="node.imageUrl"
               @change="onFieldChange('imageUrl', $event.target.value)">
        <label class="prop-label">本地图片</label>
        <input type="file" accept="image/*" @change="onImageFile">
        <div class="btn-row">
          <button type="button" class="ghost" @click="setImageBg(true)">设为背景</button>
          <button type="button" class="ghost" @click="setImageBg(false)">取消背景</button>
        </div>
      </div>

      <div v-if="cellInfo.hasLabel" class="prop-group">
        <label class="prop-label">文本</label>
        <textarea class="prop-text" rows="3" placeholder="双击画布也可编辑" :value="node.text"
                  @change="onFieldChange('text', $event.target.value)"></textarea>
      </div>

      <h4 v-if="cellInfo.hasLabel" class="prop-section">文本与样式</h4>
      <div v-if="cellInfo.hasLabel" class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">字号</label>
          <input type="number" min="8" max="72" :value="node.fontSize"
                 @change="onFieldChange('fontSize', $event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">字色</label>
          <ColorPickerField :model-value="node.fontColor" @apply="onFieldChange('fontColor', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">字重</label>
          <select :value="node.fontWeight" @change="onFieldChange('fontWeight', $event.target.value)">
            <option value="400">常规</option>
            <option value="600">半粗</option>
            <option value="700">加粗</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">填充</label>
          <ColorPickerField :model-value="node.fill" @apply="onFieldChange('fill', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框</label>
          <ColorPickerField :model-value="node.stroke" @apply="onFieldChange('stroke', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">线宽</label>
          <input type="number" min="0" max="12" :value="node.strokeWidth"
                 @change="onFieldChange('strokeWidth', $event.target.value)">
        </div>
      </div>

      <div v-if="cellInfo.hasLabel" class="prop-group">
        <label class="prop-label">不透明度 <span>{{ node.opacityLabel }}</span></label>
        <input type="range" min="0" max="100" :value="node.opacity"
               @input="node.opacityLabel = $event.target.value + '%'"
               @change="onFieldChange('opacity', $event.target.value)">
      </div>

      <div v-if="!cellInfo.isFish" class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">宽</label>
          <input type="number" min="20" max="2000" :value="node.width"
                 @change="onFieldChange('nodeWidth', $event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">高</label>
          <input type="number" min="10" max="1200" :value="node.height"
                 @change="onFieldChange('nodeHeight', $event.target.value)">
        </div>
      </div>

      <div v-if="cellInfo.portAxis" class="prop-group">
        <label class="prop-label">连接点方向</label>
        <select :value="node.portDir" @change="onFieldChange('portDir', $event.target.value)">
          <option value="auto">自动</option>
          <option v-if="cellInfo.portAxis === 'v'" value="top">上</option>
          <option v-if="cellInfo.portAxis === 'v'" value="bottom">下</option>
          <option v-if="cellInfo.portAxis === 'h'" value="left">左</option>
          <option v-if="cellInfo.portAxis === 'h'" value="right">右</option>
        </select>
      </div>

      <div v-if="cellInfo.isSpine" class="spine-dot-list">
        <button type="button" class="ghost" @click="addSpineDot">在鱼干上添加连接点</button>
        <div v-for="dot in spineDots" :key="dot.id" class="spine-dot-row">
          <span>{{ dot.name }}</span>
          <button type="button" @click="deleteDot(dot.id)">删除</button>
        </div>
      </div>

      <template v-if="cellInfo.hasLabel">
        <div class="prop-divider"></div>
        <h4 class="prop-section">链接</h4>
        <div class="prop-group">
          <label class="prop-label">超链接</label>
          <input type="text" placeholder="可选，https://..." :value="node.url"
                 @change="onFieldChange('url', $event.target.value)">
        </div>
        <div class="prop-group check">
          <label><input type="checkbox" :checked="node.openNewTab" @change="onFieldChange('openNewTab', $event.target.checked)"> 新窗口打开</label>
        </div>
        <button type="button" id="prop-open-url" :disabled="node.openUrlDisabled" @click="openUrl">打开链接</button>
      </template>
    </template>

    <template v-else-if="mode === 'edge'">
      <div class="prop-group">
        <label class="prop-label">连线预设</label>
        <select :value="edge.preset" @change="onFieldChange('edgePreset', $event.target.value)">
          <option value="custom">自定义</option>
          <option value="default">默认蓝</option>
          <option value="bold">深色加粗</option>
          <option value="warm">暖色</option>
          <option value="dash">蓝色虚线</option>
        </select>
      </div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">线条颜色</label>
          <ColorPickerField :model-value="edge.color" @apply="onFieldChange('lineColor', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">线宽</label>
          <input type="number" min="1" max="20" :value="edge.width"
                 @change="onFieldChange('lineWidth', $event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">箭头大小</label>
          <input type="number" min="4" max="30" :value="edge.arrow"
                 @change="onFieldChange('arrow', $event.target.value)">
        </div>
      </div>
      <div class="prop-group">
        <label class="prop-label">不透明度 <span>{{ edge.opacityLabel }}</span></label>
        <input type="range" min="0" max="100" :value="edge.opacity"
               @input="edge.opacityLabel = $event.target.value + '%'"
               @change="onFieldChange('opacity', $event.target.value)">
      </div>
      <div class="prop-group check">
        <label><input type="checkbox" :checked="edge.dash" @change="onFieldChange('dash', $event.target.checked)"> 虚线线条</label>
      </div>
      <button type="button" class="ghost" @click="addEdgeDot">在线上添加连接点</button>
    </template>

    <template v-else-if="mode === 'batch'">
      <p class="prop-info">样式将应用到全部选中元素</p>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">字体颜色</label>
          <ColorPickerField :model-value="batch.fontColor" @apply="onFieldChange('batch-fontColor', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">填充色</label>
          <ColorPickerField :model-value="batch.fill" @apply="onFieldChange('batch-fill', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框色</label>
          <ColorPickerField :model-value="batch.stroke" @apply="onFieldChange('batch-stroke', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框线宽</label>
          <input type="number" min="0" max="12" :value="batch.strokeWidth"
                 @change="onFieldChange('batch-strokeWidth', $event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">线条颜色</label>
          <ColorPickerField :model-value="batch.lineColor" @apply="onFieldChange('batch-lineColor', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">线宽</label>
          <input type="number" min="1" max="20" :value="batch.lineWidth"
                 @change="onFieldChange('batch-lineWidth', $event.target.value)">
        </div>
      </div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">字号</label>
          <input type="number" min="8" max="72" :value="batch.fontSize"
                 @change="onFieldChange('batch-fontSize', $event.target.value)">
        </div>
        <div class="prop-group">
          <label class="prop-label">字重</label>
          <select :value="batch.fontWeight" @change="onFieldChange('batch-fontWeight', $event.target.value)">
            <option value="">保持</option>
            <option value="400">常规</option>
            <option value="600">半粗</option>
            <option value="700">加粗</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">箭头大小</label>
          <input type="number" min="4" max="30" :value="batch.arrow"
                 @change="onFieldChange('batch-arrow', $event.target.value)">
        </div>
        <div class="prop-group check">
          <label><input type="checkbox" :checked="batch.dash" @change="onFieldChange('batch-dash', $event.target.checked)"> 虚线线条</label>
        </div>
      </div>
      <div class="prop-group">
        <label class="prop-label">不透明度 <span>{{ batch.opacityLabel }}</span></label>
        <input type="range" min="0" max="100" :value="batch.opacity"
               @input="batch.opacityLabel = $event.target.value + '%'"
               @change="onFieldChange('batch-opacity', $event.target.value)">
      </div>
      <div class="align-row">
        <button type="button" :disabled="alignDisabled" @click="alignNodes('left')">左对齐</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('center-h')">水平居中</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('right')">右对齐</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('top')">顶对齐</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('center-v')">垂直居中</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('bottom')">底对齐</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('dist-h')">横向等距</button>
        <button type="button" :disabled="alignDisabled" @click="alignNodes('dist-v')">纵向等距</button>
      </div>
    </template>

    <p class="prop-info">{{ info }}</p>

    <div class="btn-row">
      <button type="button" :disabled="flags.copy" @click="copySelected">复制</button>
      <button type="button" :disabled="flags.paste" @click="pasteCells">粘贴</button>
      <button type="button" :disabled="flags.front" @click="front">置顶</button>
      <button type="button" :disabled="flags.back" @click="back">置底</button>
    </div>
    <button id="prop-delete" type="button" :disabled="flags.delete" @click="removeSelected">删除选中</button>
  </aside>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import ColorPickerField from './ColorPickerField.vue';

const props = defineProps({
  canvas: { type: Object, required: true },
  doc: { type: Object, required: true },
  visible: { type: Boolean, default: true }
});
const emit = defineEmits(['changed', 'toast']);

const mode = ref('none');
const count = ref(0);
const info = ref('');
const canvasBg = ref('#ffffff');
const spineDots = ref([]);
const alignDisabled = ref(true);
const globalLevel = ref(1);
const globalAngle = ref(40);
const global = reactive({
  lineColor: '#1a73e8', lineWidth: 2, arrow: 10,
  fontSize: 14, fontColor: '#1f2937', fontWeight: '400',
  fill: '#ffffff', stroke: '#94a3b8', strokeWidth: 1,
  width: 120, height: 36
});
const cellInfo = reactive({
  hasLabel: false,
  isFish: false,
  isFishHead: false,
  isImage: false,
  isSpine: false,
  portAxis: null
});
const node = reactive({
  text: '', fontSize: 14, fontColor: '#1f2937', fontWeight: '400',
  fill: '#ffffff', stroke: '#94a3b8', strokeWidth: 1, opacity: 100,
  opacityLabel: '100%', url: '', openNewTab: true, openUrlDisabled: true,
  width: 100, height: 60, portDir: 'auto', fishPreset: 'ygt1', fishDir: 'toright',
  textDir: 'h', imageUrl: ''
});
const edge = reactive({
  preset: 'custom', color: '#1a73e8', width: 2, arrow: 10,
  opacity: 100, opacityLabel: '100%', dash: false
});
const batch = reactive({
  fontColor: '#1f2937', fontSize: 14, fontWeight: '', fill: '#ffffff', stroke: '#94a3b8',
  strokeWidth: 1, lineColor: '#1a73e8', lineWidth: 2, arrow: 10, dash: false,
  opacity: 100, opacityLabel: '100%'
});
const flags = reactive({ copy: true, paste: true, front: true, back: true, delete: true });

function selected() {
  return props.canvas.selectedCells();
}

function levelNodes(level) {
  const graph = props.canvas.graph;
  return graph.getNodes().filter((n) => {
    const d = n.getData() || {};
    return Number(d.level) === Number(level) && (n.shape === 'bone-node' || n.shape === 'group-node');
  });
}

function loadGlobalDefaults() {
  const level = globalLevel.value;
  const stored = ((props.doc.canvas && props.doc.canvas.universalLevels) || {})[level];
  if (stored) {
    Object.assign(global, {
      lineColor: stored.lineColor || global.lineColor,
      lineWidth: stored.lineWidth == null ? global.lineWidth : Number(stored.lineWidth),
      arrow: stored.arrow == null ? global.arrow : Number(stored.arrow),
      fontSize: stored.fontSize == null ? global.fontSize : Number(stored.fontSize),
      fontColor: stored.fontColor || global.fontColor,
      fontWeight: stored.fontWeight || global.fontWeight,
      fill: stored.fill || global.fill,
      stroke: stored.stroke || global.stroke,
      strokeWidth: stored.strokeWidth == null ? global.strokeWidth : Number(stored.strokeWidth),
      width: stored.width == null ? global.width : Number(stored.width),
      height: stored.height == null ? global.height : Number(stored.height)
    });
    return;
  }
  const node = levelNodes(level)[0];
  if (!node) return;
  const label = node.attr('label') || {};
  const body = node.attr('body') || {};
  const sz = node.getSize();
  const edge = (props.canvas.graph.getIncomingEdges(node) || []).find((e) => e.shape === 'bone-edge');
  const line = edge ? edge.attr('line') || {} : {};
  const marker = line.targetMarker || {};
  Object.assign(global, {
    lineColor: toHex(line.stroke) || '#1a73e8',
    lineWidth: line.strokeWidth || 2,
    arrow: marker.width || 10,
    fontSize: label.fontSize || 14,
    fontColor: toHex(label.fill) || '#1f2937',
    fontWeight: label.fontWeight || '400',
    fill: toHex(body.fill) || '#ffffff',
    stroke: toHex(body.stroke) || '#94a3b8',
    strokeWidth: body.strokeWidth || 1,
    width: sz.width,
    height: sz.height
  });
}

function onGlobalLevelChange(value) {
  globalLevel.value = Number(value);
  loadGlobalDefaults();
}

function applyGlobal() {
  const level = Number(globalLevel.value);
  const nodes = levelNodes(level);
  if (!nodes.length) {
    emit('toast', '当前层级没有鱼刺', true);
    return;
  }
  const edges = [];
  nodes.forEach((n) => {
    (props.canvas.graph.getIncomingEdges(n) || []).forEach((e) => {
      if (e.shape === 'bone-edge' && !edges.includes(e)) edges.push(e);
    });
  });
  const width = Math.max(20, Number(global.width) || 100);
  const height = Math.max(10, Number(global.height) || 36);
  const arrow = Math.max(4, Number(global.arrow) || 10);
  props.canvas.batch(() => {
    nodes.forEach((n) => {
      n.attr({
        label: {
          fontSize: Number(global.fontSize) || 14,
          fill: global.fontColor,
          fontWeight: global.fontWeight
        },
        body: {
          fill: global.fill,
          stroke: global.stroke,
          strokeWidth: Number(global.strokeWidth) || 1
        }
      });
      const s = n.getSize();
      if (s.width !== width || s.height !== height) n.resize(width, height);
    });
    edges.forEach((e) => {
      e.attr({
        line: {
          stroke: global.lineColor,
          strokeWidth: Number(global.lineWidth) || 2,
          targetMarker: window.YGT.shapes.blockMarkerAttrs(arrow, Math.max(4, Math.round(arrow * 0.7)), Number(global.lineWidth) || 2)
        }
      });
    });
  });
  props.doc.canvas = props.doc.canvas || {};
  props.doc.canvas.universalLevels = props.doc.canvas.universalLevels || {};
  props.doc.canvas.universalLevels[level] = {
    lineColor: global.lineColor,
    lineWidth: Number(global.lineWidth) || 2,
    arrow,
    fontSize: Number(global.fontSize) || 14,
    fontColor: global.fontColor,
    fontWeight: global.fontWeight,
    fill: global.fill,
    stroke: global.stroke,
    strokeWidth: Number(global.strokeWidth) || 1,
    width,
    height
  };
  const levelName = level === 1 ? '一级' : level === 2 ? '二级' : level === 3 ? '三级' : '四级';
  historyPush('应用' + levelName + '鱼刺设置');
  emit('changed');
  emit('toast', '已应用' + levelName + '鱼刺设置', false);
}

function applyAngleLayout() {
  var angle = Math.max(0, Math.min(360, Number(globalAngle.value) || 40));
  globalAngle.value = angle;
  if (!props.canvas || typeof props.canvas.layoutByAngle !== 'function') {
    emit('toast', '当前画布不支持角度布局', true);
    return;
  }
  var changed = props.canvas.layoutByAngle(angle, { silent: false });
  if (!changed) {
    emit('toast', '没有可处理的鱼刺线段', true);
    return;
  }
  emit('changed');
  emit('toast', '已按 ' + angle + '° 刷新鱼骨图', false);
}

function historyPush(label) {
  if (props.canvas.historyPush) props.canvas.historyPush(label);
}

function toHex(color) {
  if (!color || color === 'none' || color === 'transparent') return null;
  if (/^#/.test(color)) return color;
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);
  const rgb = getComputedStyle(div).color;
  document.body.removeChild(div);
  const m = rgb.match(/\d+/g);
  if (!m) return null;
  return '#' + m.slice(0, 3).map((n) => ('0' + Number(n).toString(16)).slice(-2)).join('');
}

function incomingAxis(cell) {
  const graph = props.canvas.graph;
  let axis = null;
  graph.getEdges().forEach((e) => {
    if (axis) return;
    const t = e.getTarget && e.getTarget();
    if (!t || t.cell !== cell.id) return;
    if (t.port === 'port-left' || t.port === 'port-right') axis = 'h';
    else if (t.port === 'port-top' || t.port === 'port-bottom') axis = 'v';
  });
  return axis;
}

function refresh() {
  const cells = selected();
  canvasBg.value = (props.doc.canvas && props.doc.canvas.background) || '#ffffff';
  flags.copy = cells.length === 0;
  flags.front = cells.length === 0;
  flags.back = cells.length === 0;
  const clip = props.canvas.clipboard;
  flags.paste = !clip || !clip.getCellsInClipboard || clip.getCellsInClipboard().length === 0;
  if (!cells.length) {
    mode.value = 'global';
    count.value = 0;
    info.value = '';
    flags.delete = true;
    loadGlobalDefaults();
    return;
  }
  count.value = cells.length;
  flags.delete = false;
  const first = cells[0];
  if (cells.length === 1 && first.isNode && first.isNode()) showNode(first);
  else if (cells.length === 1 && first.isEdge && first.isEdge()) showEdge(first);
  else if (cells.length > 1) showBatch(cells);
  else {
    mode.value = 'none';
    info.value = '多选时仅支持删除操作';
  }
}

function showNode(cell) {
  cellInfo.hasLabel = typeof cell.attr('label/text') === 'string';
  cellInfo.isFish = cell.shape === 'fish-head' || cell.shape === 'fish-tail';
  cellInfo.isFishHead = cell.shape === 'fish-head';
  cellInfo.isImage = cell.shape === 'image-node';
  cellInfo.isSpine = cell.shape === 'fish-spine';
  cellInfo.portAxis = incomingAxis(cell);
  mode.value = 'node';
  info.value = '';
  if (!cellInfo.hasLabel && !cellInfo.isFish && !cellInfo.isImage && !cellInfo.portAxis && !cellInfo.isSpine) {
    info.value = '当前元素无文字属性';
  }
  const label = cell.attr('label') || {};
  const body = cell.attr('body') || {};
  node.text = label.text || '';
  node.fontSize = label.fontSize || 14;
  node.fontColor = toHex(label.fill) || (cellInfo.isFishHead ? toHex(body.fill) : null) || '#1f2937';
  node.fontWeight = label.fontWeight || '400';
  node.fill = toHex(body.fill) || '#ffffff';
  node.stroke = toHex(body.stroke) || '#94a3b8';
  node.strokeWidth = body.strokeWidth || 1;
  node.opacity = Math.round((body.opacity == null ? 1 : body.opacity) * 100);
  node.opacityLabel = node.opacity + '%';
  if (cellInfo.isFish) {
    const d = cell.getData() || {};
    node.fishPreset = d.ygtPreset || 'ygt1';
    node.fishDir = d.ygtDir || 'toright';
  }
  if (cellInfo.isFishHead) {
    node.text = String(label.text || '').replace(/\n/g, '');
    const d = cell.getData() || {};
    node.textDir = d.textDir === 'v' ? 'v' : 'h';
  }
  if (cellInfo.portAxis) {
    const d = cell.getData() || {};
    node.portDir = d.portDir || 'auto';
  }
  if (cellInfo.isImage) {
    const href = cell.attr('image/xlinkHref') || '';
    node.imageUrl = /^data:/.test(href) ? '(本地图片)' : href;
  }
  if (!cellInfo.isFish) {
    const sz = cell.getSize();
    node.width = sz.width;
    node.height = sz.height;
  }
  const d2 = cell.getData() || {};
  node.url = d2.url || '';
  node.openNewTab = d2.openType !== 'self';
  node.openUrlDisabled = !d2.url;
  spineDots.value = cellInfo.isSpine
    ? (props.canvas.getAttachedDots(cell.id) || []).map((dot, i) => ({ id: dot.id, name: '连接点 ' + (i + 1) }))
    : [];
}

function showEdge(cell) {
  mode.value = 'edge';
  info.value = '';
  const line = cell.attr('line') || {};
  const marker = line.targetMarker || {};
  edge.preset = 'custom';
  edge.color = toHex(line.stroke) || '#1a73e8';
  edge.width = line.strokeWidth || 2;
  edge.arrow = marker.width || 10;
  edge.opacity = Math.round((line.opacity == null ? 1 : line.opacity) * 100);
  edge.opacityLabel = edge.opacity + '%';
  edge.dash = !!(line.strokeDasharray && line.strokeDasharray !== 'none');
}

function showBatch(cells) {
  mode.value = 'batch';
  info.value = '';
  const nd = cells.find((c) => c.isNode && c.isNode());
  const ed = cells.find((c) => c.isEdge && c.isEdge());
  const lb = nd ? (nd.attr('label') || {}) : {};
  const nb = nd ? (nd.attr('body') || {}) : {};
  const le = ed ? (ed.attr('line') || {}) : {};
  batch.fontColor = toHex(lb.fill) || '#1f2937';
  batch.fontSize = lb.fontSize || 14;
  batch.fontWeight = lb.fontWeight || '';
  batch.fill = toHex(nb.fill) || '#ffffff';
  batch.stroke = toHex(nb.stroke) || '#94a3b8';
  batch.strokeWidth = nb.strokeWidth || 1;
  batch.lineColor = toHex(le.stroke) || '#1a73e8';
  batch.lineWidth = le.strokeWidth || 2;
  batch.arrow = (le.targetMarker || {}).width || 10;
  batch.dash = !!(le.strokeDasharray && le.strokeDasharray !== 'none');
  batch.opacity = 100;
  batch.opacityLabel = '100%';
  alignDisabled.value = cells.filter((c) => c.isNode && c.isNode()).length < 2;
}

function patchCell(fn) {
  const cells = selected();
  if (cells.length !== 1) return;
  fn(cells[0]);
  historyPush('修改样式');
  emit('changed');
}

function onFieldChange(key, value) {
  if (key === 'canvasBg') {
    props.doc.canvas = props.doc.canvas || {};
    props.doc.canvas.background = value;
    props.canvas.setBackground(value);
    emit('changed');
    return;
  }
  if (key === 'fishPreset' || key === 'fishDir') {
    updateFishPair(
      key === 'fishPreset' ? value : node.fishPreset,
      key === 'fishDir' ? value : node.fishDir
    );
    refresh();
    return;
  }
  if (key === 'imageUrl') {
    const url = String(value || '').trim();
    if (url && !/^(https?:|data:|blob:|file:)/i.test(url)) {
      emit('toast', '图片地址格式可能不正确', true);
    }
    patchCell((cell) => cell.attr({ image: { xlinkHref: url } }));
    refresh();
    return;
  }
  if (key === 'nodeWidth' || key === 'nodeHeight') {
    patchCell((cell) => {
      const s = cell.getSize();
      const w = key === 'nodeWidth' ? Math.max(20, Number(value) || s.width) : s.width;
      const h = key === 'nodeHeight' ? Math.max(10, Number(value) || s.height) : s.height;
      cell.resize(w, h);
    });
    refresh();
    return;
  }
  if (key === 'portDir') {
    props.canvas.batch(() => {
      const cells = selected();
      if (cells.length === 1) {
        const cell = cells[0];
        const d = cell.getData() || {};
        d.portDir = value;
        cell.setData(d);
        if (props.canvas.reanchorPorts) props.canvas.reanchorPorts(cell);
      }
    });
    historyPush('修改连接点方向');
    emit('changed');
    return;
  }
  if (key === 'textDir') {
    patchCell((cell) => {
      if (cell.shape !== 'fish-head') return;
      const d = cell.getData() || {};
      d.textDir = value;
      cell.setData(d);
      const raw = String(cell.attr('label/text') || '').replace(/\n/g, '');
      cell.attr({ label: { text: window.YGT.shapes.fishLabelText(raw, value) } });
    });
    refresh();
    return;
  }
  if (key === 'text' && cellInfo.isFishHead) {
    patchCell((cell) => {
      const d = cell.getData() || {};
      cell.attr({ label: { text: window.YGT.shapes.fishLabelText(value, d.textDir === 'v' ? 'v' : 'h') } });
    });
    refresh();
    return;
  }
  if (key === 'fill' && cellInfo.isFishHead) {
    patchCell((cell) => {
      const oldFill = toHex((cell.attr('body') || {}).fill);
      const labelFill = toHex((cell.attr('label') || {}).fill);
      cell.attr({ body: { fill: value } });
      if (!labelFill || labelFill === oldFill) cell.attr({ label: { fill: value } });
    });
    refresh();
    return;
  }
  if (key.indexOf('batch-') === 0) {
    applyBatch(key.slice(6), value);
    return;
  }
  if (key === 'url' || key === 'openNewTab') {
    patchCell((cell) => {
      const d = cell.getData() || {};
      if (key === 'url') d.url = String(value || '').trim();
      else d.openType = value ? 'blank' : 'self';
      cell.setData(d);
    });
    refresh();
    return;
  }
  if (key === 'edgePreset') {
    const presets = {
      default: { stroke: '#1a73e8', strokeWidth: 2, dash: false },
      bold: { stroke: '#0f172a', strokeWidth: 3, dash: false },
      warm: { stroke: '#f59e0b', strokeWidth: 2, dash: false },
      dash: { stroke: '#1a73e8', strokeWidth: 2, dash: true }
    };
    const preset = presets[value];
    if (preset) {
      patchCell((cell) => {
        const linePatch = { stroke: preset.stroke, strokeWidth: preset.strokeWidth };
        linePatch.strokeDasharray = preset.dash ? '6 3' : 'none';
        cell.attr({ line: linePatch });
      });
      refresh();
    }
    return;
  }
  patchCell((cell) => {
    if (cell.isNode && cell.isNode()) {
      const labelPatch = {};
      const bodyPatch = {};
      if (key === 'text') labelPatch.text = value;
      if (key === 'fontSize') labelPatch.fontSize = Number(value);
      if (key === 'fontColor') labelPatch.fill = value;
      if (key === 'fontWeight') labelPatch.fontWeight = value;
      if (key === 'fill') bodyPatch.fill = value;
      if (key === 'stroke') bodyPatch.stroke = value;
      if (key === 'strokeWidth') bodyPatch.strokeWidth = Number(value);
      if (key === 'opacity') bodyPatch.opacity = Number(value) / 100;
      if (Object.keys(labelPatch).length) cell.attr({ label: labelPatch });
      if (Object.keys(bodyPatch).length) cell.attr({ body: bodyPatch });
    } else if (cell.isEdge && cell.isEdge()) {
      const linePatch = {};
      if (key === 'lineColor') linePatch.stroke = value;
      if (key === 'lineWidth') linePatch.strokeWidth = Number(value);
      if (key === 'opacity') linePatch.opacity = Number(value) / 100;
      if (key === 'arrow') {
        const a = Number(value);
        const mh = Math.max(4, Math.round(a * 0.7));
        linePatch.targetMarker = window.YGT.shapes.blockMarkerAttrs(a, mh, Number(cell.attr('line/strokeWidth')) || 2);
      }
      if (key === 'dash') linePatch.strokeDasharray = value ? '6 3' : 'none';
      if (Object.keys(linePatch).length) cell.attr({ line: linePatch });
    }
  });
  refresh();
}

function applyBatch(key, value) {
  const cells = selected();
  props.canvas.batch(() => {
    cells.forEach((cell) => {
      if (cell.isNode && cell.isNode()) {
        const lp = {};
        const bp = {};
        if (key === 'fontColor') lp.fill = value;
        if (key === 'fontSize') lp.fontSize = Number(value);
        if (key === 'fontWeight') lp.fontWeight = value;
        if (key === 'fill') bp.fill = value;
        if (key === 'stroke') bp.stroke = value;
        if (key === 'strokeWidth') bp.strokeWidth = Number(value);
        if (key === 'opacity') bp.opacity = Number(value) / 100;
        if (Object.keys(lp).length && typeof cell.attr('label/text') === 'string') cell.attr({ label: lp });
        if (Object.keys(bp).length) cell.attr({ body: bp });
      } else if (cell.isEdge && cell.isEdge()) {
        const lp2 = {};
        if (key === 'lineColor') lp2.stroke = value;
        if (key === 'lineWidth') lp2.strokeWidth = Number(value);
        if (key === 'arrow') {
          const a = Number(value);
          const mh = Math.max(4, Math.round(a * 0.7));
          lp2.targetMarker = window.YGT.shapes.blockMarkerAttrs(a, mh, Number(cell.attr('line/strokeWidth')) || 2);
        }
        if (key === 'dash') lp2.strokeDasharray = value ? '6 3' : 'none';
        if (key === 'opacity') lp2.opacity = Number(value) / 100;
        if (Object.keys(lp2).length) cell.attr({ line: lp2 });
      }
    });
  });
  historyPush('批量样式');
  emit('changed');
}

function alignNodes(action) {
  const cells = selected().filter((c) => c.isNode && c.isNode());
  if (cells.length < 2) return;
  props.canvas.batch(() => {
    const boxes = cells.map((n) => {
      const p = n.position();
      const s = n.getSize();
      return { n, x: p.x, y: p.y, w: s.width, h: s.height };
    });
    const minX = Math.min(...boxes.map((b) => b.x));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxY = Math.max(...boxes.map((b) => b.y + b.h));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    boxes.forEach((b) => {
      let x = b.x;
      let y = b.y;
      if (action === 'left') x = minX;
      else if (action === 'right') x = maxX - b.w;
      else if (action === 'center-h') x = cx - b.w / 2;
      else if (action === 'top') y = minY;
      else if (action === 'bottom') y = maxY - b.h;
      else if (action === 'center-v') y = cy - b.h / 2;
      b.n.position(x, y);
    });
    if (action === 'dist-h' || action === 'dist-v') {
      boxes.sort((a, b) => (action === 'dist-h' ? a.x - b.x : a.y - b.y));
      const total = boxes.reduce((s, b) => s + (action === 'dist-h' ? b.w : b.h), 0);
      const span = action === 'dist-h' ? maxX - minX : maxY - minY;
      const gap = boxes.length > 1 ? (span - total) / (boxes.length - 1) : 0;
      let cursor = action === 'dist-h' ? minX : minY;
      boxes.forEach((b) => {
        if (action === 'dist-h') b.n.position(cursor, b.y);
        else b.n.position(b.x, cursor);
        cursor += (action === 'dist-h' ? b.w : b.h) + gap;
      });
    }
  });
  historyPush('对齐/分布');
  emit('changed');
}

function updateFishPair(preset, dir) {
  props.canvas.batch(() => {
    const graph = props.canvas.graph;
    if (window.YGT.shapes && typeof window.YGT.shapes.applyPresetStyle === 'function') {
      window.YGT.shapes.applyPresetStyle(graph, preset, dir);
      return;
    }
    const head = graph.getNodes().find((n) => n.shape === 'fish-head');
    const tail = graph.getNodes().find((n) => n.shape === 'fish-tail');
    if (head) {
      const hd = head.getData() || {};
      const raw = String(head.attr('label/text') || '').replace(/\n/g, '');
      const hs = window.YGT.shapes.headSpec(preset, dir, raw);
      head.resize(hs.width, hs.height);
      head.attr({
        body: { d: hs.path, fill: hs.fill, stroke: hs.stroke },
        label: {
          text: window.YGT.shapes.fishLabelText(raw, hd.textDir),
          refX: hs.labelOffX,
          textAnchor: dir === 'toleft' ? 'end' : 'start',
          textVerticalAnchor: 'middle'
        }
      });
      head.setData(Object.assign({}, hd, { ygtPreset: preset, ygtDir: dir }));
    }
    if (tail) {
      const ts = window.YGT.shapes.tailSpec(preset, dir, tail.position().x, tail.position().y);
      tail.resize(ts.width, ts.height);
      tail.attr({ body: { d: ts.path, fill: ts.fill, stroke: ts.stroke } });
      tail.setData(Object.assign({}, tail.getData(), { ygtPreset: preset, ygtDir: dir }));
    }
  });
  historyPush('鱼形切换');
  emit('changed');
}

function onImageFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    patchCell((cell) => cell.attr({ image: { xlinkHref: String(reader.result) } }));
    node.imageUrl = '(本地图片)';
    emit('changed');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function openUrl() {
  const cells = selected();
  const cell = cells[0];
  const d = cell && cell.getData ? (cell.getData() || {}) : null;
  if (d && d.url) window.open(d.url, d.openType === 'self' ? '_self' : '_blank');
}

function addEdgeDot() {
  const cells = selected();
  if (cells.length === 1 && cells[0].isEdge && cells[0].isEdge()) {
    const b = cells[0].getBBox();
    props.canvas.addDotOnEdge(cells[0], { x: b.x + b.width / 2, y: b.y + b.height / 2 });
    refresh();
  }
}

function addSpineDot() {
  const cells = selected();
  if (cells.length === 1 && cells[0].shape === 'fish-spine') {
    const b = cells[0].getBBox();
    props.canvas.addDotOnNode(cells[0], { x: b.x + b.width / 2, y: b.y + b.height / 2 });
    refresh();
  }
}

function deleteDot(dotId) {
  const dotCell = props.canvas.graph.getCellById(dotId);
  if (dotCell) {
    props.canvas.graph.removeCells([dotCell]);
    historyPush('删除连接点');
    emit('toast', '已删除连接点', false);
  }
  refresh();
}

function setImageBg(on) {
  const cells = selected();
  if (cells.length === 1 && cells[0].shape === 'image-node') {
    props.canvas.setImageBackground(cells[0], on);
    refresh();
  }
}

function removeSelected() {
  props.canvas.removeSelected();
  refresh();
}

function copySelected() {
  props.canvas.copySelected();
  refresh();
}

function pasteCells() {
  props.canvas.pasteCells();
  refresh();
}

function front() {
  selected().forEach((c) => c.toFront());
  emit('changed');
}

function back() {
  selected().forEach((c) => c.toBack());
  emit('changed');
}

function onSelectionChanged() {
  refresh();
}

onMounted(() => {
  props.canvas.selection.on('selection:changed', onSelectionChanged);
  refresh();
});

onBeforeUnmount(() => {
  props.canvas.selection.off('selection:changed', onSelectionChanged);
});

defineExpose({ refresh });
</script>
