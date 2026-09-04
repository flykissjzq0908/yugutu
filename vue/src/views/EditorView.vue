<template>
  <div class="ygt-editor">
    <EditorToolbar
      :title="titleText"
      :preview="previewOn"
      :dirty="dirty"
      :history-log="canvas ? canvas.historyLog : []"
      :template-kind="currentTemplate"
      @update:title="onTitleInput"
      @save="saveDoc"
      @new="newDoc"
      @template="applyTemplate"
      @undo="undo"
      @redo="redo"
      @clear="clearCanvas"
      @history-undo="historyUndo"
      @history-redo="historyRedo"
      @history-jump="jumpToHistory"
      @preview-toggle="togglePreview"
      @guide-toggle="showGuide = !showGuide"
      @toggle-stencil="showStencil = !showStencil"
      @toggle-props="showProps = !showProps"
      @hierarchy-toggle="hierarchyOpen = !hierarchyOpen"
      @import-file="importFile"
      @export-json="exportJSON"
      @export-png="exportPNG"
      @export-svg="exportSVG"
      @export-pdf="exportPDF"
    />

    <main class="ygt-main">
      <aside id="stencil" :class="{ hidden: !showStencil }"></aside>
      <section id="container-wrap">
        <div id="container"></div>
        <div class="ygt-canvas-tools">
          <div v-show="!previewOn && !exporting" class="ygt-export-menu">
            <button type="button" class="ygt-export-trigger" title="导出 PNG/SVG/PDF"
                    @click="exportMenuOpen = !exportMenuOpen" @keydown.esc="exportMenuOpen = false">
              <span class="tb-ic" aria-hidden="true" v-html="icons.export"></span>导出 ▾
            </button>
            <div v-show="exportMenuOpen" class="ygt-export-options">
              <button type="button" @click="runExport('png')">PNG</button>
              <button type="button" @click="runExport('svg')">SVG</button>
              <button type="button" @click="runExport('pdf')">PDF</button>
            </div>
          </div>
        </div>
      </section>
      <PropsPanel
        v-if="canvas"
        ref="propsRef"
        :canvas="canvas"
        :doc="currentDoc"
        :visible="showProps"
        @changed="markDirty"
        @toast="toast"
      />
    </main>

    <p v-if="loadingError" class="empty ygt-loading-error">{{ loadingError }}</p>
    <GuideDialog v-if="showGuide" @close="showGuide = false" />
    <HierarchyDialog
      v-if="canvas"
      :canvas="canvas"
      :visible="hierarchyOpen"
      @close="hierarchyOpen = false"
      @saved="onHierarchySaved"
      @toast="toast"
    />
    <div ref="toastEl" class="ygt-global-toast"></div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import EditorToolbar from '../components/EditorToolbar.vue';
import PropsPanel from '../components/PropsPanel.vue';
import GuideDialog from '../components/GuideDialog.vue';
import HierarchyDialog from '../components/HierarchyDialog.vue';
import { icons } from '../components/icons';
import { ygtApi } from '../api/ygt';
import { errorMessage } from '../api/client';

const TEMPLATE_NAMES = {
  empty: '空骨架', classic: '经典六原因', qc: '医疗质控',
  nursing: '护理不良事件', rca: '根因分析', nursing_qc: '护理质量'
};

const canvas = ref(null);
const propsRef = ref(null);
const loadingError = ref('');
const dirty = ref(false);
const previewOn = ref(false);
const showGuide = ref(false);
const hierarchyOpen = ref(false);
const showStencil = ref(true);
const showProps = ref(true);
const exportMenuOpen = ref(false);
const exporting = ref(false);
const currentTemplate = ref('');
const titleText = ref('未命名鱼骨图');
const toastEl = ref(null);
const currentDoc = shallowRef(null);

let toastTimer = null;
let hookCtx = null;
let wrapObserver = null;

function toast(msg, isErr) {
  const el = toastEl.value;
  if (!el) return;
  el.textContent = msg;
  el.style.color = isErr ? '#dc2626' : '#15803d';
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
}

function markDirty() {
  dirty.value = true;
  document.title = '*' + (titleText.value || '未命名鱼骨图') + ' - 鱼骨图编辑器';
}

async function onHierarchySaved() {
  hierarchyOpen.value = false;
  await saveDoc();
}

function onTitleInput(value) {
  titleText.value = value;
  if (currentDoc.value) currentDoc.value.title = value.trim() || '未命名鱼骨图';
  markDirty();
}

function setDoc(doc) {
  currentDoc.value = doc;
  titleText.value = doc.title || '未命名鱼骨图';
  document.title = (dirty.value ? '*' : '') + titleText.value + ' - 鱼骨图编辑器';
  window.history.replaceState(null, '', window.location.pathname + '?docId=' + encodeURIComponent(doc.id));
}

function setDirty(value) {
  dirty.value = !!value;
  document.title = (dirty.value ? '*' : '') + (titleText.value || '未命名鱼骨图') + ' - 鱼骨图编辑器';
}

function isDirty() {
  return dirty.value;
}

async function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('docId');
    let doc;
    if (docId) {
      doc = await ygtApi.get(docId);
    } else {
      doc = await ygtApi.create({
        title: '未命名鱼骨图',
        cells: window.YGT.core.templateCells('empty'),
        canvas: { background: '#ffffff' }
      });
      window.history.replaceState(null, '', window.location.pathname + '?docId=' + encodeURIComponent(doc.id));
    }
    currentDoc.value = doc;
    if (doc.legacyMx && doc.legacyMx.length) {
      doc.cells = window.YGT.shapes.buildFromLegacyMx(
        doc.legacyMx,
        doc.leaftype || 'toright',
        doc.title || '鱼骨图'
      );
    }
    titleText.value = doc.title || '未命名鱼骨图';
    document.title = titleText.value + ' - 鱼骨图编辑器';
    mountEditor(doc);
  } catch (e) {
    loadingError.value = '加载失败：' + errorMessage(e);
  }
}

function mountEditor(doc) {
  window.YGT.toast = toast;
  const c = window.YGT.canvas.create({
    containerId: 'container',
    paletteId: 'stencil',
    onChanged: markDirty,
    onSelection: () => { if (propsRef.value) propsRef.value.refresh(); },
    onSaveShortcut: () => saveDoc(),
    onEmptyAction: () => applyTemplate('empty'),
    onPreviewChange: (on) => { previewOn.value = !!on; }
  });
  canvas.value = c;
  c.applyCells(doc.cells);
  c.setBackground((doc.canvas && doc.canvas.background) || '#ffffff');

  const wrap = document.getElementById('container-wrap');
  if (wrap && typeof ResizeObserver === 'function' && c.graph && typeof c.graph.resize === 'function') {
    wrapObserver = new ResizeObserver((entries) => {
      const entry = entries && entries[0];
      if (entry && c.graph && typeof c.graph.resize === 'function') {
        c.graph.resize(Math.floor(entry.contentRect.width), Math.floor(entry.contentRect.height));
      }
    });
    wrapObserver.observe(wrap);
  }

  const toolbarHandle = {
    saveDoc,
    newDoc,
    applyTemplate,
    exportJSON,
    setPreviewButton: (on) => { previewOn.value = !!on; },
    setTitle: (t) => { titleText.value = t; },
    toastMsg: toast
  };
  hookCtx = {
    canvas: c,
    props: null,
    isDirty,
    setDirty,
    setDoc
  };
  Object.defineProperty(hookCtx, 'doc', {
    get: () => currentDoc.value,
    set: (d) => { currentDoc.value = d; }
  });
  Object.defineProperty(hookCtx, 'props', {
    get: () => propsRef.value,
    set: () => {}
  });
  window.__ygt = { ctx: hookCtx, toolbar: toolbarHandle };

  nextTick(() => {
    if (propsRef.value) propsRef.value.refresh();
  });
}

async function saveDoc() {
  const doc = currentDoc.value;
  if (!doc || !canvas.value) return;
  doc.title = titleText.value.trim() || '未命名鱼骨图';
  titleText.value = doc.title;
  if (canvas.value.syncHierarchyFromLines) canvas.value.syncHierarchyFromLines();
  doc.cells = canvas.value.getCells();
  const v = window.YGT.core.validateHierarchy(doc.cells);
  if (!v.ok) {
    toast('保存失败：' + v.errors[0] + (v.errors.length > 1 ? ' 等 ' + v.errors.length + ' 个问题' : ''), true);
    return;
  }
  try {
    const saved = await ygtApi.save(doc.id, {
      title: doc.title,
      version: doc.version || '1.0',
      canvas: doc.canvas || { background: '#ffffff' },
      cells: doc.cells
    });
    currentDoc.value = saved;
    dirty.value = false;
    document.title = saved.title + ' - 鱼骨图编辑器';
    toast('已保存');
  } catch (e) {
    toast('保存失败：' + errorMessage(e), true);
  }
}

async function newDoc() {
  if (dirty.value && !window.confirm('当前修改尚未保存，确定新建？')) return;
  try {
    const doc = await ygtApi.create({
      title: '未命名鱼骨图',
      cells: window.YGT.core.templateCells('empty'),
      canvas: { background: '#ffffff' }
    });
    setDoc(doc);
    canvas.value.applyCells(doc.cells);
    canvas.value.setBackground(doc.canvas.background);
    if (propsRef.value) propsRef.value.refresh();
    dirty.value = false;
    if (canvas.value.historyPush) canvas.value.historyPush('新建文档');
    currentTemplate.value = '';
    toast('已新建');
  } catch (e) {
    toast('新建失败：' + errorMessage(e), true);
  }
}

function applyTemplate(kind) {
  if (!kind) return;
  if (dirty.value && !window.confirm('应用模板将覆盖当前画布，确定继续？')) return;
  const cells = window.YGT.core.templateCells(kind);
  const doc = currentDoc.value;
  doc.cells = cells;
  canvas.value.applyCells(cells);
  if (propsRef.value) propsRef.value.refresh();
  dirty.value = true;
  if (canvas.value.historyPush) canvas.value.historyPush('应用模板: ' + (TEMPLATE_NAMES[kind] || kind));
  toast('已应用' + (TEMPLATE_NAMES[kind] || kind) + '模板');
  currentTemplate.value = kind;
}

function clearCanvas() {
  if (!window.confirm('确定清空当前画布？')) return;
  canvas.value.graph.clearCells();
  canvas.value.selection.clean();
  if (propsRef.value) propsRef.value.refresh();
  dirty.value = true;
  if (canvas.value.historyPush) canvas.value.historyPush('清空画布');
  currentTemplate.value = '';
  toast('画布已清空');
}

function undo() {
  if (canvas.value) canvas.value.history.undo();
}

function redo() {
  if (canvas.value) canvas.value.history.redo();
}

function historyUndo() {
  if (canvas.value) canvas.value.history.undo();
}

function historyRedo() {
  if (canvas.value) canvas.value.history.redo();
}

function jumpToHistory(index) {
  const log = canvas.value.historyLog || [];
  const entry = log[index];
  if (!entry) return;
  let cur = canvas.value.history.getUndoSize();
  const target = typeof entry.undoDepth === 'number' ? entry.undoDepth : cur;
  let guard = 0;
  while (cur > target && guard < 100) {
    canvas.value.history.undo();
    cur = canvas.value.history.getUndoSize();
    guard++;
  }
  while (cur < target && guard < 100) {
    canvas.value.history.redo();
    cur = canvas.value.history.getUndoSize();
    guard++;
  }
  if (propsRef.value) propsRef.value.refresh();
}

function togglePreview() {
  if (!canvas.value) return;
  canvas.value.setPreview(!previewOn.value);
}

function syncDocBeforeExport() {
  const doc = currentDoc.value;
  if (!doc) return null;
  doc.title = titleText.value.trim() || '未命名鱼骨图';
  titleText.value = doc.title;
  doc.cells = canvas.value.getCells();
  return doc;
}

function downloadText(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function exportJSON() {
  const doc = syncDocBeforeExport();
  if (!doc) return;
  downloadText(JSON.stringify(doc, null, 2), (doc.title || '鱼骨图') + '.json', 'application/json');
  toast('已导出 JSON');
}

function exportPNG() {
  const title = currentDoc.value ? (currentDoc.value.title || '鱼骨图') : '鱼骨图';
  canvas.value.withHiddenPorts(() => {
    canvas.value.exportPlugin.exportPNG(title, { padding: 60, backgroundColor: '#ffffff' });
  });
  toast('已导出 PNG');
}

function exportSVG() {
  const title = currentDoc.value ? (currentDoc.value.title || '鱼骨图') : '鱼骨图';
  canvas.value.withHiddenPorts(() => {
    canvas.value.exportPlugin.exportSVG(title, { padding: 60 });
  });
  toast('已导出 SVG');
}

function exportPDF() {
  const jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF) {
    toast('PDF 组件未加载', true);
    return;
  }
  const title = currentDoc.value ? (currentDoc.value.title || '鱼骨图') : '鱼骨图';
  canvas.value.withHiddenPorts(() => {
    canvas.value.exportPlugin.toPNG((dataUrl) => {
      if (!dataUrl) {
        toast('PDF 生成失败', true);
        return;
      }
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const img = new Image();
      img.onload = () => {
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text(title, 148.5, 13, { align: 'center' });
        const pageW = 287;
        const pageH = 183;
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const pageRatio = pageW / pageH;
        const imgRatio = img.width / img.height;
        const cols = imgRatio > pageRatio * 1.15 ? Math.ceil(imgRatio / pageRatio) : 1;
        const imgY = 22 + (pageH - h) / 2;
        if (cols <= 1) {
          pdf.addImage(dataUrl, 'PNG', 5 + (pageW - w) / 2, imgY, w, h);
        } else {
          const colW = w / cols;
          const cropW = img.width / cols;
          for (let c = 0; c < cols; c++) {
            if (c > 0) {
              pdf.addPage('a4', 'landscape');
              pdf.setFontSize(16);
              pdf.setTextColor(30, 41, 59);
              pdf.text(title, 148.5, 13, { align: 'center' });
            }
            pdf.addImage(dataUrl, 'PNG', 5, imgY, colW, h, undefined, 'FAST', c * cropW, 0, cropW, img.height);
          }
        }
        pdf.save(title + '.pdf');
        toast('已导出 PDF');
      };
      img.onerror = () => toast('PDF 图片处理失败', true);
      img.src = dataUrl;
    }, { padding: 60, backgroundColor: '#ffffff' });
  });
}

function runExport(kind) {
  exportMenuOpen.value = false;
  exporting.value = true;
  if (kind === 'png') exportPNG();
  else if (kind === 'svg') exportSVG();
  else exportPDF();
  setTimeout(() => { exporting.value = false; }, 120);
}

async function importFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const r = window.YGT.core.parseJSON(String(reader.result));
    if (!r.ok) {
      toast(r.msg, true);
      return;
    }
    const hv = window.YGT.core.validateHierarchy(r.doc.cells);
    if (!hv.ok) {
      toast('导入失败：' + hv.errors[0] + (hv.errors.length > 1 ? ' 等 ' + hv.errors.length + ' 个问题' : ''), true);
      return;
    }
    if (dirty.value && !window.confirm('导入将覆盖当前画布，确定继续？')) return;
    try {
      const doc = await ygtApi.create({
        title: r.doc.title || '导入的鱼骨图',
        version: r.doc.version || '1.0',
        canvas: r.doc.canvas || { background: '#ffffff' },
        cells: r.doc.cells
      });
      setDoc(doc);
      canvas.value.applyCells(doc.cells);
      canvas.value.setBackground(doc.canvas.background);
      if (propsRef.value) propsRef.value.refresh();
      dirty.value = true;
      if (canvas.value.historyPush) canvas.value.historyPush('导入 JSON');
      currentTemplate.value = '';
      toast('导入成功');
    } catch (e) {
      toast('导入失败：' + errorMessage(e), true);
    }
  };
  reader.onerror = () => toast('文件读取失败', true);
  reader.readAsText(file, 'utf-8');
}

function onBeforeUnload(e) {
  if (dirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
}

function onDocClick(e) {
  if (exportMenuOpen.value && e.target && !e.target.closest('.ygt-export-menu')) {
    exportMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload);
  document.addEventListener('click', onDocClick);
  init();
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload);
  document.removeEventListener('click', onDocClick);
  if (wrapObserver) {
    wrapObserver.disconnect();
    wrapObserver = null;
  }
  if (canvas.value && canvas.value.graph && typeof canvas.value.graph.dispose === 'function') {
    canvas.value.graph.dispose();
  }
});
</script>
