/* 鱼骨图编辑器：页面启动（编辑器页 / 文档列表页） */
window.YGT = window.YGT || {};
(function (Y) {
  'use strict';

  function initEditor() {
    var params = new URLSearchParams(location.search);
    var docId = params.get('docId');
    var doc = docId ? Y.core.load(docId) : null;
    var isNew = false;
    if (!doc) {
      doc = Y.core.createDoc('未命名鱼骨图');
      doc.cells = Y.core.templateCells('empty');
      isNew = true;
    }

    var toastEl = document.createElement('div');
    toastEl.className = 'ygt-global-toast';
    document.body.appendChild(toastEl);
    var toastTimer = null;
    window.YGT.toast = function (msg, isErr) {
      toastEl.textContent = msg;
      toastEl.style.color = isErr ? '#dc2626' : '#15803d';
      toastEl.style.opacity = '1';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.style.opacity = '0'; }, 2200);
    };

    var dirty = false;
    function isDirty() { return dirty; }
    function setDirty(v) { dirty = !!v; document.title = (dirty ? '*' : '') + doc.title + ' - 鱼骨图编辑器'; }
    function setDoc(d) {
      doc = d;
      docId = d.id;
      history.replaceState(null, '', 'editor.html?docId=' + encodeURIComponent(d.id));
    }

    var toolbar = null;
    var canvas = Y.canvas.create({
      containerId: 'container',
      paletteId: 'stencil',
      onChanged: function () { setDirty(true); },
      onSelection: function () { if (props) props.refresh(); },
      onSaveShortcut: function () { if (toolbar) toolbar.saveDoc(); },
      onEmptyAction: function () { if (toolbar) toolbar.applyTemplate('empty'); },
      onPreviewChange: function (on) { if (toolbar) toolbar.setPreviewButton(on); }
    });

    var props = Y.props.mount('props', {
      canvas: canvas,
      doc: doc,
      onChanged: function () { setDirty(true); }
    });

    var ctx = {
      doc: doc,
      canvas: canvas,
      props: props,
      isDirty: isDirty,
      setDirty: setDirty,
      setDoc: setDoc
    };
    toolbar = Y.toolbar.mount('toolbar', ctx);

    canvas.applyCells(doc.cells);
    canvas.setBackground(doc.canvas.background);
    toolbar.setTitle(doc.title);
    document.title = doc.title + ' - 鱼骨图编辑器';

    if (isNew) {
      Y.core.save(doc);
      history.replaceState(null, '', 'editor.html?docId=' + doc.id);
    }

    window.addEventListener('beforeunload', function (e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // 开发调试钩子（自动化测试使用）
    window.__ygt = { ctx: ctx, toolbar: toolbar };
  }

  function initIndex() {
    var listEl = document.getElementById('doc-list');
    var btnNew = document.getElementById('btn-new-doc');
    if (!listEl) return;

    function render() {
      var items = Y.core.list();
      listEl.innerHTML = '';
      if (!items.length) {
        listEl.innerHTML = '<p class="empty">暂无鱼骨图，点击右上角新建</p>';
        return;
      }
      items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'doc-row';
        var title = document.createElement('div');
        title.className = 'doc-title';
        title.textContent = item.title || '未命名鱼骨图';
        var time = document.createElement('div');
        time.className = 'doc-time';
        time.textContent = '更新于 ' + (item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-');
        var ops = document.createElement('div');
        ops.className = 'doc-ops';

        var btnOpen = document.createElement('button');
        btnOpen.textContent = '打开';
        btnOpen.addEventListener('click', function () {
          location.href = 'editor.html?docId=' + encodeURIComponent(item.id);
        });

        var btnRename = document.createElement('button');
        btnRename.textContent = '重命名';
        btnRename.addEventListener('click', function () {
          var name = window.prompt('新的文档名称', item.title || '');
          if (name && name.trim()) {
            Y.core.rename(item.id, name.trim());
            render();
          }
        });

        var btnDel = document.createElement('button');
        btnDel.textContent = '删除';
        btnDel.className = 'danger';
        btnDel.addEventListener('click', function () {
          if (window.confirm('确定删除《' + (item.title || '未命名') + '》？该操作不可恢复。')) {
            Y.core.remove(item.id);
            render();
          }
        });

        ops.appendChild(btnOpen);
        ops.appendChild(btnRename);
        ops.appendChild(btnDel);
        row.appendChild(title);
        row.appendChild(time);
        row.appendChild(ops);
        listEl.appendChild(row);
      });
    }

    if (btnNew) {
      btnNew.addEventListener('click', function () {
        var name = window.prompt('新文档名称', '未命名鱼骨图');
        var doc = Y.core.createDoc((name && name.trim()) || '未命名鱼骨图');
        doc.cells = Y.core.templateCells('empty');
        Y.core.save(doc);
        location.href = 'editor.html?docId=' + encodeURIComponent(doc.id);
      });
    }
    render();
  }

  Y.app = { initEditor: initEditor, initIndex: initIndex };
})(window.YGT);
