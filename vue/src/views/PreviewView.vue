<template>
  <div class="ygt-preview-page">
    <div class="ygt-preview-canvas">
      <div id="preview-container"></div>
      <p v-if="loading" class="ygt-preview-status">加载中...</p>
      <p v-else-if="error" class="ygt-preview-status">加载失败：{{ error }}</p>
      <div class="ygt-canvas-tools">
        <div v-show="canvas" class="ygt-export-menu">
          <button type="button" class="ygt-export-trigger" title="导出 PNG/SVG/PDF"
                  @click="exportMenuOpen = !exportMenuOpen" @keydown.esc="exportMenuOpen = false">
            导出 ▾
          </button>
          <div v-show="exportMenuOpen" class="ygt-export-options">
            <button type="button" @click="runExport('png')">PNG</button>
            <button type="button" @click="runExport('svg')">SVG</button>
            <button type="button" @click="runExport('pdf')">PDF</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { ygtApi } from '../api/ygt';
import { errorMessage } from '../api/client';

const canvas = shallowRef(null);
const loading = ref(true);
const error = ref('');
const exportMenuOpen = ref(false);
const currentDoc = shallowRef(null);

let wrapObserver = null;

function exportTitle() {
  const d = currentDoc.value;
  return (d && d.title) || '鱼骨图';
}

function exportPNG() {
  if (!canvas.value) return;
  canvas.value.withHiddenPorts(() => {
    canvas.value.exportPlugin.exportPNG(exportTitle(), { padding: 60, backgroundColor: '#ffffff' });
  });
}

function svgContentBox() {
  const g = canvas.value.graph;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  g.getCells().forEach((cell) => {
    const b = cell.getBBox && cell.getBBox();
    if (!b) return;
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  });
  if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 100, height: 100 };
  const pad = 50;
  return { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
}

function prepareSvgExport(root) {
  root.querySelectorAll('*').forEach((el) => {
    if (!el.style) return;
    const cls = String(el.getAttribute('class') || '');
    const hasAttr = el.getAttribute('transform') != null;
    if (cls.indexOf('x6-graph-svg-viewport') >= 0 || cls.indexOf('x6-graph-svg-stage') >= 0 ||
        cls.indexOf('x6-cell') >= 0 || hasAttr) {
      el.style.removeProperty('transform');
    }
  });
  const vp = root.querySelector && root.querySelector('.x6-graph-svg-viewport');
  if (vp) vp.removeAttribute('transform');
  const b = svgContentBox();
  root.setAttribute('viewBox', [b.x, b.y, b.width, b.height].join(' '));
  root.setAttribute('width', String(b.width));
  root.setAttribute('height', String(b.height));
  return root;
}

function exportSVG() {
  if (!canvas.value) return;
  canvas.value.withHiddenPorts(() => {
    canvas.value.exportPlugin.exportSVG(exportTitle(), {
      beforeSerialize: prepareSvgExport
    });
  });
}

function pdfTitleImage(title) {
  const text = String(title || '鱼骨图');
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 52px "Microsoft YaHei", "PingFang SC", "SimHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontSize = 52;
  while (fontSize > 20 && ctx.measureText(text).width > canvas.width - 160) {
    fontSize -= 2;
    ctx.font = '600 ' + fontSize + 'px "Microsoft YaHei", "PingFang SC", "SimHei", sans-serif';
  }
  ctx.fillStyle = '#1f2937';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL('image/png');
}

function exportPDF() {
  const jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF || !canvas.value) return;
  const title = exportTitle();
  canvas.value.withHiddenPorts(() => {
    canvas.value.exportPlugin.toPNG((dataUrl) => {
      if (!dataUrl) return;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const titleImg = pdfTitleImage(title);
      const img = new Image();
      img.onload = () => {
        pdf.addImage(titleImg, 'PNG', 5, 3, 287, 14);
        const pageW = 287;
        const pageH = 183;
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const imgY = 22 + (pageH - h) / 2;
        pdf.addImage(dataUrl, 'PNG', 5 + (pageW - w) / 2, imgY, w, h);
        pdf.save(title + '.pdf');
      };
      img.onerror = () => {};
      img.src = dataUrl;
    }, { padding: 60, backgroundColor: '#ffffff' });
  });
}

function runExport(kind) {
  exportMenuOpen.value = false;
  if (kind === 'png') exportPNG();
  else if (kind === 'svg') exportSVG();
  else exportPDF();
}

function onDocClick(e) {
  if (exportMenuOpen.value && e.target && !e.target.closest('.ygt-export-menu')) {
    exportMenuOpen.value = false;
  }
}

async function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('docId');
    if (!docId) {
      error.value = '缺少 docId 参数';
      loading.value = false;
      return;
    }
    const doc = await ygtApi.get(docId);
    currentDoc.value = doc;
    if (doc.legacyMx && doc.legacyMx.length) {
      doc.cells = window.YGT.shapes.buildFromLegacyMx(
        doc.legacyMx,
        doc.leaftype || 'toright',
        doc.title || '鱼骨图'
      );
    }
    const c = window.YGT.canvas.create({
      containerId: 'preview-container',
      readonly: true
    });
    canvas.value = c;
    window.__ygt = { ctx: { canvas: c, readonly: true } };
    c.applyCells(doc.cells);
    c.setBackground((doc.canvas && doc.canvas.background) || '#ffffff');
    document.title = (doc.title || '鱼骨图') + ' - 鱼骨图预览';

    const wrap = document.querySelector('.ygt-preview-canvas');
    if (wrap && typeof ResizeObserver === 'function' && c.graph && typeof c.graph.resize === 'function') {
      wrapObserver = new ResizeObserver((entries) => {
        const entry = entries && entries[0];
        if (entry && canvas.value && canvas.value.graph && typeof canvas.value.graph.resize === 'function') {
          canvas.value.graph.resize(Math.floor(entry.contentRect.width), Math.floor(entry.contentRect.height));
        }
      });
      wrapObserver.observe(wrap);
    }
    loading.value = false;
  } catch (e) {
    error.value = errorMessage(e);
    loading.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
  init();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
  if (wrapObserver) wrapObserver.disconnect();
  if (canvas.value && canvas.value.graph && typeof canvas.value.graph.dispose === 'function') {
    canvas.value.graph.dispose();
  }
});
</script>
