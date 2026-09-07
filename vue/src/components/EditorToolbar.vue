<template>
  <header id="toolbar" class="ygt-toolbar">
    <div class="tb-row">
      <a class="ygt-home" :href="homeHref">文档列表</a>
      <button type="button" title="显示/隐藏组件库" @click="$emit('toggle-stencil')">组件</button>
      <button type="button" title="显示/隐藏属性面板" @click="$emit('toggle-props')">属性</button>
      <input id="doc-title" type="text" maxlength="60" placeholder="鱼骨图标题"
             :value="title" @input="$emit('update:title', $event.target.value)">
      <button id="btn-new" type="button" @click="$emit('new')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.new"></span><span class="tb-label">新建</span>
      </button>
      <button id="btn-save" type="button" class="btn-save" title="保存 Ctrl+S" @click="$emit('save')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.save"></span><span class="tb-label">保存{{ dirty ? '*' : '' }}</span>
      </button>
      <button id="btn-hierarchy" type="button" title="编辑上下级数据" @click="$emit('hierarchy-toggle')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.data"></span><span class="tb-label">数据</span>
      </button>
      <span class="ygt-toast"></span>
    </div>
    <div class="tb-row">
      <select id="tpl-select" :value="templateVal" @focus="onTemplateFocus" @change="onTemplate">
        <option value="">模板</option>
        <option value="empty">空骨架（鱼头/鱼尾/鱼干）</option>
        <option value="classic">经典六原因（人机料法环测）</option>
        <option value="rca">根因分析（流程/人员/设备等）</option>
      </select>
      <span class="ygt-sep"></span>
      <button id="btn-undo" type="button" title="撤销 Ctrl+Z" @click="$emit('undo')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.undo"></span><span class="tb-label">撤销</span>
      </button>
      <button id="btn-redo" type="button" title="重做 Ctrl+Y" @click="$emit('redo')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.redo"></span><span class="tb-label">重做</span>
      </button>
      <button id="btn-history" type="button" title="操作历史" @click="openHistory">
        <span class="tb-ic" aria-hidden="true" v-html="icons.history"></span><span class="tb-label">历史</span>
      </button>
      <div v-if="historyOpen" class="history-panel" data-testid="history-panel">
        <div class="hp-title">最近操作</div>
        <div v-if="!snapshot.length" class="hp-empty">暂无操作记录</div>
        <div v-for="(item, i) in snapshot" :key="i" class="hp-row" title="点击跳转到此操作后的状态" @click="$emit('history-jump', i)">
          <span>{{ item.label }}</span>
        </div>
        <div class="hp-actions">
          <button type="button" @click="$emit('history-undo')">撤销一步</button>
          <button type="button" @click="$emit('history-redo')">重做一步</button>
        </div>
      </div>
      <button id="btn-clear" type="button" class="btn-clear" title="清空当前画布" @click="$emit('clear')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.clear"></span><span class="tb-label">清空</span>
      </button>
      <span class="ygt-sep"></span>
      <button id="btn-preview" type="button" title="预览模式" @click="$emit('preview-toggle')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.preview"></span><span class="tb-label">{{ preview ? '退出预览' : '预览' }}</span>
      </button>
      <button id="btn-guide" type="button" title="操作说明" @click="$emit('guide-toggle')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.guide"></span><span class="tb-label">说明</span>
      </button>
      <span class="ygt-sep"></span>
      <button id="btn-import" type="button" @click="pickFile">
        <span class="tb-ic" aria-hidden="true" v-html="icons.import"></span><span class="tb-label">导入 JSON</span>
      </button>
      <button id="btn-export-json" type="button" @click="$emit('export-json')">
        <span class="tb-ic" aria-hidden="true" v-html="icons.exportJson"></span><span class="tb-label">导出 JSON</span>
      </button>
      <input ref="fileInput" type="file" accept=".json,application/json" hidden @change="onFile">
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { icons } from './icons';

const props = defineProps({
  title: { type: String, default: '' },
  preview: { type: Boolean, default: false },
  dirty: { type: Boolean, default: false },
  historyLog: { type: Array, default: () => [] },
  templateKind: { type: String, default: '' }
});

const emit = defineEmits([
  'update:title', 'save', 'new', 'template', 'undo', 'redo', 'clear',
  'history-toggle', 'history-undo', 'history-redo', 'history-jump',
  'preview-toggle', 'guide-toggle',
  'toggle-stencil', 'toggle-props', 'hierarchy-toggle', 'import-file',
  'export-json', 'export-png', 'export-svg', 'export-pdf'
]);

const homeHref = computed(() => {
  const p = window.location.pathname;
  const base = p.slice(0, p.lastIndexOf('/') + 1) || '/';
  return base + 'index.html';
});

const templateVal = ref('');
const historyOpen = ref(false);
const snapshot = ref([]);
const fileInput = ref(null);

watch(() => props.templateKind, (v) => { templateVal.value = v || ''; });

function onTemplateFocus() {
  if (templateVal.value) templateVal.value = '';
}

function onTemplate(event) {
  const kind = event.target.value;
  if (kind) {
    templateVal.value = kind;
    emit('template', kind);
  }
}

function openHistory() {
  historyOpen.value = !historyOpen.value;
  if (historyOpen.value) snapshot.value = (props.historyLog || []).slice(0, 20);
}

function pickFile() {
  if (fileInput.value) fileInput.value.click();
}

function onFile(event) {
  const file = event.target.files && event.target.files[0];
  if (file) emit('import-file', file);
  event.target.value = '';
}
</script>
