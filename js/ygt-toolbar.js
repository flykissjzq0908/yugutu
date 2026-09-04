/* 鱼骨图编辑器：顶部工具条 */
window.YGT = window.YGT || {};
(function (Y) {
  'use strict';

  var TOOLBAR_HTML =
    '<div class="tb-row">' +
      '<a class="ygt-home" href="index.html">文档列表</a>' +
      '<button id="btn-toggle-palette" type="button" title="显示/隐藏组件库">组件</button>' +
      '<button id="btn-toggle-props" type="button" title="显示/隐藏属性面板">属性</button>' +
      '<input id="doc-title" type="text" maxlength="60" placeholder="鱼骨图标题">' +
      '<button id="btn-new" type="button">新建</button>' +
      '<button id="btn-save" type="button">保存</button>' +
      '<span id="ygt-toast" class="ygt-toast"></span>' +
    '</div>' +
    '<div class="tb-row">' +
      '<select id="tpl-select"><option value="">模板</option><option value="empty">空骨架（鱼头/鱼尾/鱼干）</option>' +
      '<option value="classic">经典六原因（人机料法环测）</option><option value="rca">根因分析（流程/人员/设备等）</option></select>' +
      '<span class="ygt-sep"></span>' +
      '<button id="btn-undo" type="button" title="撤销 Ctrl+Z">撤销</button>' +
      '<button id="btn-redo" type="button" title="重做 Ctrl+Y">重做</button>' +
      '<button id="btn-history" type="button" title="操作历史">历史</button>' +
      '<div id="history-panel" class="history-panel" hidden></div>' +
      '<button id="btn-clear" type="button" title="清空当前画布">清空</button>' +
      '<span class="ygt-sep"></span>' +
      '<button id="btn-preview" type="button" title="预览模式">预览</button>' +
      '<button id="btn-theme" type="button" title="切换浅色/深色">主题</button>' +
      '<button id="btn-guide" type="button" title="操作说明">说明</button>' +
      '<span class="ygt-sep"></span>' +
      '<button id="btn-import" type="button">导入 JSON</button>' +
      '<button id="btn-export-json" type="button">导出 JSON</button>' +
      '<button id="btn-export-png" type="button">PNG</button>' +
      '<button id="btn-export-svg" type="button">SVG</button>' +
      '<button id="btn-export-pdf" type="button">PDF</button>' +
      '<input id="file-import" type="file" accept=".json,application/json" hidden>' +
    '</div>';

  var TEMPLATE_NAMES = {
    empty: '空骨架', classic: '经典六原因', qc: '医疗质控',
    nursing: '护理不良事件', rca: '根因分析', nursing_qc: '护理质量'
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(inner) {
    return '<svg class="tb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var ICONS = {
    'btn-new': icon('<path d="M12 5v14M5 12h14"/>'),
    'btn-clear': icon('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    'btn-undo': icon('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
    'btn-redo': icon('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
    'btn-history': icon('<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="8"/>'),
    'btn-save': icon('<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8V3M8 21v-6h8v6"/>'),
    'btn-preview': icon('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>'),
    'btn-theme': icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    'btn-guide': icon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    'btn-import': icon('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M4 17v2h16v-2"/>'),
    'btn-export-json': icon('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>'),
    'btn-export-png': icon('<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/>'),
    'btn-export-svg': icon('<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/>'),
    'btn-export-pdf': icon('<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/>')
  };

  function mount(containerId, ctx) {
    var host = document.getElementById(containerId);
    if (!host) return null;
    host.innerHTML = TOOLBAR_HTML;
    function setLabel(id, text) {
      var s = host.querySelector('#' + id + ' .tb-label');
      if (s) s.textContent = text;
    }
    Object.keys(ICONS).forEach(function (id) {
      var b = host.querySelector('#' + id);
      if (!b) return;
      b.innerHTML = ICONS[id] + '<span class="tb-label">' + b.textContent.trim() + '</span>';
    });

    var titleInput = host.querySelector('#doc-title');
    var toast = host.querySelector('#ygt-toast');
    var tplSelect = host.querySelector('#tpl-select');
    var fileInput = host.querySelector('#file-import');
    var toastTimer = null;

    var paletteEl = document.getElementById('stencil');
    var propsEl = document.getElementById('props');
    if (paletteEl) {
      host.querySelector('#btn-toggle-palette').addEventListener('click', function () {
        paletteEl.classList.toggle('hidden');
      });
    }
    if (propsEl) {
      host.querySelector('#btn-toggle-props').addEventListener('click', function () {
        propsEl.classList.toggle('hidden');
      });
    }

    function toastMsg(msg, isErr) {
      toast.textContent = msg;
      toast.style.color = isErr ? '#dc2626' : '#15803d';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.textContent = ''; }, 2500);
    }

    function syncDoc() {
      ctx.doc.title = titleInput.value.trim() || '未命名鱼骨图';
      titleInput.value = ctx.doc.title;
      ctx.doc.cells = ctx.canvas.getCells();
      return ctx.doc;
    }

    function saveDoc() {
      syncDoc();
      var v = Y.core.validateHierarchy(ctx.doc.cells);
      if (!v.ok) {
        toastMsg('保存失败：' + v.errors[0] + (v.errors.length > 1 ? ' 等 ' + v.errors.length + ' 个问题' : ''), true);
        return;
      }
      if (!Y.core.save(ctx.doc)) {
        toastMsg('保存失败：本地存储不可用或空间不足', true);
        return;
      }
      ctx.setDirty(false);
      toastMsg('已保存');
    }

    function newDoc() {
      if (ctx.isDirty() && !window.confirm('当前修改尚未保存，确定新建？')) return;
      var doc = Y.core.createDoc('未命名鱼骨图');
      doc.cells = Y.core.templateCells('empty');
      Y.core.save(doc);
      ctx.setDoc(doc);
      ctx.canvas.applyCells(doc.cells);
      ctx.canvas.setBackground(doc.canvas.background);
      titleInput.value = doc.title;
      ctx.props.refresh();
      ctx.setDirty(false);
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('新建文档');
      toastMsg('已新建');
    }

    function applyTemplate(kind) {
      if (ctx.isDirty() && !window.confirm('应用模板将覆盖当前画布，确定继续？')) return;
      var cells = Y.core.templateCells(kind);
      ctx.doc.cells = cells;
      ctx.canvas.applyCells(cells);
      ctx.props.refresh();
      ctx.setDirty(true);
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('应用模板: ' + (TEMPLATE_NAMES[kind] || kind));
      toastMsg('已应用' + (TEMPLATE_NAMES[kind] || kind) + '模板');
    }

    function exportJSON() {
      syncDoc();
      var text = Y.core.toJSON(ctx.doc);
      var blob = new Blob([text], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (ctx.doc.title || '鱼骨图') + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      toastMsg('已导出 JSON');
    }

    function exportPDF() {
      var jsPDF = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDF) { toastMsg('PDF 组件未加载', true); return; }
      ctx.canvas.withHiddenPorts(function () {
        ctx.canvas.exportPlugin.toPNG(function (dataUrl) {
        if (!dataUrl) { toastMsg('PDF 生成失败', true); return; }
        var pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        var img = new Image();
        img.onload = function () {
          var title = ctx.doc.title || '鱼骨图';
          pdf.setFontSize(16);
          pdf.setTextColor(30, 41, 59);
          pdf.text(title, 148.5, 13, { align: 'center' });
          var pageW = 287, pageH = 183;
          var ratio = Math.min(pageW / img.width, pageH / img.height);
          var w = img.width * ratio;
          var h = img.height * ratio;
          var pageRatio = pageW / pageH;
          var imgRatio = img.width / img.height;
          var cols = imgRatio > pageRatio * 1.15 ? Math.ceil(imgRatio / pageRatio) : 1;
          var imgY = 22 + (pageH - h) / 2;
          if (cols <= 1) {
            pdf.addImage(dataUrl, 'PNG', 5 + (pageW - w) / 2, imgY, w, h);
          } else {
            var colW = w / cols;
            var cropW = img.width / cols;
            for (var c = 0; c < cols; c++) {
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
          toastMsg('已导出 PDF');
        };
        img.onerror = function () { toastMsg('PDF 图片处理失败', true); };
        img.src = dataUrl;
      }, { padding: 60, backgroundColor: '#ffffff' });
      });
    }

    titleInput.addEventListener('input', function () {
      ctx.doc.title = titleInput.value.trim() || '未命名鱼骨图';
      ctx.setDirty(true);
    });

    host.querySelector('#btn-new').addEventListener('click', newDoc);
    host.querySelector('#btn-clear').addEventListener('click', function () {
      if (!window.confirm('确定清空当前画布？')) return;
      ctx.canvas.graph.clearCells();
      ctx.canvas.selection.clean();
      ctx.props.refresh();
      ctx.setDirty(true);
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('清空画布');
      toastMsg('画布已清空');
    });
    host.querySelector('#btn-undo').addEventListener('click', function () { ctx.canvas.history.undo(); });
    host.querySelector('#btn-redo').addEventListener('click', function () { ctx.canvas.history.redo(); });
    host.querySelector('#btn-save').addEventListener('click', saveDoc);
    var previewOn = false;
    host.querySelector('#btn-preview').addEventListener('click', function () {
      previewOn = !previewOn;
      ctx.canvas.setPreview(previewOn);
      setLabel('btn-preview', previewOn ? '退出预览' : '预览');
    });
    var themeBtn = host.querySelector('#btn-theme');
    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      setLabel('btn-theme', theme === 'dark' ? '深色' : '浅色');
    }
    applyTheme(localStorage.getItem('ygt.theme') === 'dark' ? 'dark' : 'light');
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ygt.theme', next);
      applyTheme(next);
    });
    var guideOverlay = document.getElementById('guide-overlay');
    host.querySelector('#btn-guide').addEventListener('click', function () {
      if (guideOverlay) guideOverlay.hidden = false;
    });
    if (guideOverlay) {
      var guideClose = document.getElementById('guide-close');
      if (guideClose) {
        guideClose.addEventListener('click', function () { guideOverlay.hidden = true; });
      }
      guideOverlay.addEventListener('click', function (e) {
        if (e.target === guideOverlay) guideOverlay.hidden = true;
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && guideOverlay && !guideOverlay.hidden) {
        guideOverlay.hidden = true;
      }
    });
    host.querySelector('#btn-export-json').addEventListener('click', exportJSON);
    host.querySelector('#btn-export-png').addEventListener('click', function () {
      ctx.canvas.withHiddenPorts(function () {
        ctx.canvas.exportPlugin.exportPNG(ctx.doc.title || '鱼骨图', { padding: 60, backgroundColor: '#ffffff' });
      });
      toastMsg('已导出 PNG');
    });
    host.querySelector('#btn-export-svg').addEventListener('click', function () {
      ctx.canvas.withHiddenPorts(function () {
        ctx.canvas.exportPlugin.exportSVG(ctx.doc.title || '鱼骨图', { padding: 60 });
      });
      toastMsg('已导出 SVG');
    });
    host.querySelector('#btn-export-pdf').addEventListener('click', exportPDF);
    host.querySelector('#btn-import').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var r = Y.core.parseJSON(String(reader.result));
        if (!r.ok) { toastMsg(r.msg, true); return; }
        var hv = Y.core.validateHierarchy(r.doc.cells);
        if (!hv.ok) {
          toastMsg('导入失败：' + hv.errors[0] + (hv.errors.length > 1 ? ' 等 ' + hv.errors.length + ' 个问题' : ''), true);
          return;
        }
        if (ctx.isDirty() && !window.confirm('导入将覆盖当前画布，确定继续？')) return;
        ctx.doc = r.doc;
        ctx.setDoc(r.doc);
        ctx.canvas.applyCells(r.doc.cells);
        ctx.canvas.setBackground(r.doc.canvas.background);
        titleInput.value = r.doc.title;
        ctx.props.refresh();
        ctx.setDirty(true);
        if (ctx.canvas.historyPush) ctx.canvas.historyPush('导入 JSON');
        toastMsg('导入成功');
      };
      reader.onerror = function () { toastMsg('文件读取失败', true); };
      reader.readAsText(file, 'utf-8');
      fileInput.value = '';
    });
    tplSelect.addEventListener('change', function () {
      var v = tplSelect.value;
      tplSelect.value = '';
      if (v) applyTemplate(v);
    });

    function renderHistory() {
      var panel = host.querySelector('#history-panel');
      if (!panel) return;
      var log = (ctx.canvas.historyLog || []).slice(0, 20);
      var html = '<div class="hp-title">最近操作</div>';
      if (!log.length) html += '<div class="hp-empty">暂无操作记录</div>';
      log.forEach(function (item, i) {
        html += '<div class="hp-row" data-hp-jump="' + i + '" title="点击跳转到此操作后的状态">' +
          '<span>' + escapeHtml(item.label) + '</span></div>';
      });
      html += '<div class="hp-actions">' +
        '<button id="hp-undo" type="button">撤销一步</button>' +
        '<button id="hp-redo" type="button">重做一步</button>' +
        '</div>';
      panel.innerHTML = html;
    }

    function jumpToHistory(index) {
      var log = ctx.canvas.historyLog || [];
      var entry = log[index];
      if (!entry) return;
      var cur = ctx.canvas.history.getUndoSize();
      var target = typeof entry.undoDepth === 'number' ? entry.undoDepth : cur;
      var guard = 0;
      while (cur > target && guard < 100) {
        ctx.canvas.history.undo();
        cur = ctx.canvas.history.getUndoSize();
        guard++;
      }
      while (cur < target && guard < 100) {
        ctx.canvas.history.redo();
        cur = ctx.canvas.history.getUndoSize();
        guard++;
      }
      ctx.props.refresh();
    }

    host.querySelector('#btn-history').addEventListener('click', function () {
      var panel = host.querySelector('#history-panel');
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderHistory();
    });
    host.addEventListener('click', function (e) {
      if (e.target.id === 'hp-undo') {
        ctx.canvas.history.undo();
        renderHistory();
      } else if (e.target.id === 'hp-redo') {
        ctx.canvas.history.redo();
        renderHistory();
      } else {
        var hit = e.target && e.target.closest ? e.target.closest('[data-hp-jump]') : null;
        if (hit) {
          jumpToHistory(Number(hit.getAttribute('data-hp-jump')));
          renderHistory();
        }
      }
    });
    return {
      saveDoc: saveDoc,
      newDoc: newDoc,
      applyTemplate: applyTemplate,
      exportJSON: exportJSON,
      setPreviewButton: function (on) {
        previewOn = !!on;
        setLabel('btn-preview', previewOn ? '退出预览' : '预览');
      },
      toastMsg: toastMsg,
      setTitle: function (t) { titleInput.value = t; }
    };
  }

  Y.toolbar = { mount: mount };
})(window.YGT);
