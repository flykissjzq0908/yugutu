/* 鱼骨图编辑器：画布 / 插件装配 / 组件库 / 内联编辑 */
window.YGT = window.YGT || {};
(function (Y) {
  'use strict';

  function create(opts) {
    var o = opts || {};
    var readonly = !!o.readonly;
    var container = document.getElementById(o.containerId || 'container');
    if (!container) throw new Error('画布容器不存在');

    Y.shapes.registerShapes();

    var graph = new X6.Graph({
      container: container,
      background: { color: '#ffffff' },
      grid: { visible: true, type: 'dot', args: { color: '#e5e7eb', thickness: 1 } },
      panning: { enabled: true, eventTypes: ['leftMouseDown'], modifiers: 'space' },
      mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'], minScale: 0.2, maxScale: 3 },
      preventDefaultContextMenu: true,
      connecting: {
        snap: { radius: 12 },
        allowBlank: false,
        allowLoop: false,
        allowEdge: true,
        highlight: true,
        connector: 'normal',
        connectionPoint: 'boundary',
        anchor: 'center',
        createEdge: function () {
          var edge = graph.createEdge({ shape: 'bone-edge' });
          if (typeof edge.setConnector === 'function') edge.setConnector({ name: 'normal' });
          return edge;
        }
      },
      highlighting: {
        magnetAvailable: { name: 'stroke', args: { padding: 4, attrs: { stroke: '#1a73e8' } } },
        magnetAdsorbed: { name: 'stroke', args: { padding: 4, attrs: { stroke: '#f59e0b' } } }
      }
    });

    var selection = new X6.Selection({ enabled: true, rubberband: true, multiple: true, movable: true, strict: true });
    var snapline = new X6.Snapline({ enabled: true, sharp: true, tolerance: 20 });
    var keyboard = new X6.Keyboard();
    var clipboard = new X6.Clipboard({ useLocalStorage: true });
    var history = new X6.History({ enabled: true });
    var exportPlugin = new X6.Export();
    var transformPlugin = null;
    try {
      transformPlugin = new X6.Transform({ resizing: { enabled: true }, rotating: { enabled: true } });
      graph.use(transformPlugin);
    } catch (e) {
      transformPlugin = null;
    }
    graph.use(selection);
    graph.use(snapline);
    graph.use(keyboard);
    graph.use(clipboard);
    graph.use(history);
    graph.use(exportPlugin);

    if (readonly) {
      if (selection && typeof selection.disable === 'function') selection.disable();
      if (keyboard && typeof keyboard.disable === 'function') keyboard.disable();
      if (clipboard && typeof clipboard.disable === 'function') clipboard.disable();
      if (transformPlugin && typeof transformPlugin.disable === 'function') transformPlugin.disable();
      container.classList.add('ygt-preview');
    }

    function batch(fn) {
      var m = graph.model;
      if (m && m.startBatch && m.stopBatch) {
        m.startBatch('ygt');
        try {
          fn();
        } finally {
          m.stopBatch('ygt');
        }
      } else {
        fn();
      }
    }

    function selectedCells() {
      return selection.getSelectedCells();
    }

    function removeSelected() {
      var cells = selectedCells();
      if (cells.length) {
        graph.removeCells(cells);
        selection.clean();
        notifyToast('已删除 ' + cells.length + ' 个元素，Ctrl+Z 可恢复');
        historyPush('删除元素');
      }
    }

    function notifyToast(msg, isErr) {
      if (window.YGT && typeof window.YGT.toast === 'function') {
        window.YGT.toast(msg, isErr);
      }
    }

    var historyLog = [];
    var suppressChangeNotify = false;
    var MAX_HISTORY_LOG = 30;
    function historyPush(label) {
      historyLog.unshift({ label: label, ts: Date.now(), undoDepth: history.getUndoSize() });
      if (historyLog.length > MAX_HISTORY_LOG) historyLog.pop();
      if (typeof o.onHistoryChange === 'function') o.onHistoryChange();
    }

    function preventDefault(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
    }

    function copySelected() {
      var cells = selectedCells();
      if (cells.length) {
        clipboard.copy(cells);
        notifyToast('已复制 ' + cells.length + ' 个元素');
        historyPush('复制元素');
      }
    }

    function cutSelected() {
      var cells = selectedCells();
      if (cells.length) {
        clipboard.cut(cells);
        notifyToast('已剪切 ' + cells.length + ' 个元素');
        historyPush('剪切元素');
      }
    }

    function pasteCells() {
      var cells = clipboard.paste({ offset: 24 });
      if (cells && cells.length) {
        repairHierarchy();
        selection.reset(cells);
        notifyToast('已粘贴 ' + cells.length + ' 个元素');
        historyPush('粘贴元素');
      }
      return cells || [];
    }

    function duplicateSelected() {
      var cells = selectedCells();
      if (!cells.length) return [];
      clipboard.copy(cells);
      var pasted = clipboard.paste({ offset: 16 });
      if (pasted && pasted.length) {
        repairHierarchy();
        selection.reset(pasted);
        notifyToast('已复制 ' + pasted.length + ' 个元素');
        historyPush('快速复制');
      }
      return pasted || [];
    }

    function repairHierarchy() {
      var cells = graph.toJSON().cells;
      var byId = {};
      cells.forEach(function (c) { if (c && c.id) byId[c.id] = c; });
      cells.forEach(function (c) {
        if (!Y.core.isBusiness(c)) return;
        var pid = c.data && c.data.parentId;
        if (pid && pid !== '__ROOT__' && !byId[pid]) {
          c.data.parentId = '__ROOT__';
          c.data.level = 0;
        }
      });
      graph.fromJSON({ cells: Y.core.ensureHierarchy(cells) });
    }

    // 快捷键统一挂在 document：避免点击面板后焦点离开画布导致失效
    function isTypingTarget(e) {
      var el = e.target;
      return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' || el.isContentEditable));
    }
    function onKeydown(e) {
      if (readonly || isTypingTarget(e)) return;
      var mod = e.ctrlKey || e.metaKey;
      if (mod && !e.altKey) {
        var k = String(e.key || '').toLowerCase();
        if (k === 'z' && !e.shiftKey) { preventDefault(e); history.undo(); return; }
        if (k === 'z' && e.shiftKey) { preventDefault(e); history.redo(); return; }
        if (k === 'y') { preventDefault(e); history.redo(); return; }
        if (k === 'c') { preventDefault(e); copySelected(); return; }
        if (k === 'x') { preventDefault(e); cutSelected(); return; }
        if (k === 'v') { preventDefault(e); pasteCells(); return; }
        if (k === 'd') { preventDefault(e); duplicateSelected(); return; }
        if (k === 's') { preventDefault(e); if (typeof o.onSaveShortcut === 'function') o.onSaveShortcut(); return; }
        if (k === '=' || k === '+') { preventDefault(e); setScale(currentScale() * 1.2); return; }
        if (k === '-') { preventDefault(e); setScale(currentScale() / 1.2); return; }
        if (k === '0') { preventDefault(e); setScale(1); return; }
        if (k === 'a') { preventDefault(e); selection.reset(graph.getNodes()); return; }
      }
      if (!mod && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        var cells = selectedCells();
        if (cells.length) {
          preventDefault(e);
          var step = e.shiftKey ? 10 : 1;
          var dx = e.key === 'ArrowLeft' ? -step : (e.key === 'ArrowRight' ? step : 0);
          var dy = e.key === 'ArrowUp' ? -step : (e.key === 'ArrowDown' ? step : 0);
          cells.forEach(function (cell) {
            if (cell.isNode && cell.isNode()) {
              var p = cell.position();
              cell.position(p.x + dx, p.y + dy);
            } else if (cell.isEdge && cell.isEdge()) {
              var verts = cell.getVertices ? cell.getVertices() : [];
              if (verts && verts.length) {
                cell.setVertices(verts.map(function (v) { return { x: v.x + dx, y: v.y + dy }; }));
              }
            }
          });
        }
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        preventDefault(e);
        removeSelected();
      }
    }
    document.addEventListener('keydown', onKeydown);

    // 空格平移期间禁用框选，避免出现拖动选择矩形
    var spacePanning = false;
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' || isTypingTarget(e)) return;
      preventDefault(e);
      if (!spacePanning) {
        spacePanning = true;
        if (typeof selection.disableRubberband === 'function') selection.disableRubberband();
        container.classList.add('ygt-panning');
      }
    });
    document.addEventListener('keyup', function (e) {
      if (e.code !== 'Space') return;
      spacePanning = false;
      if (typeof selection.enableRubberband === 'function') selection.enableRubberband();
      container.classList.remove('ygt-panning');
    });

    // ---------- 组件库 ----------
    var stencilHost = document.getElementById(o.paletteId || 'stencil');
    var stencil = null;
    if (stencilHost) {
      var pg = Y.shapes.paletteGroups();
      stencil = new X6.Stencil({
        title: '鱼骨组件库',
        target: graph,
        groups: pg.groups,
        stencilGraphWidth: 210,
        stencilGraphHeight: 600,
        layout: function () {},
        collapsable: true
      });
      stencilHost.appendChild(stencil.container);
      stencil.load(pg.skeleton, 'skeleton');
      stencil.load(pg.content, 'content');
      function dropArrowLineAsEdge(n) {
        var pos = n.position();
        var size = n.getSize();
        var head = graph.getNodes().find(function (x) { return x.shape === 'fish-head'; });
        var edge = graph.getEdges().find(function (e) { return e.shape === 'bone-edge'; });
        var color = edge
          ? (edge.attr('line/stroke') || '#1a73e8')
          : (head ? (head.attr('body/fill') || '#1a73e8') : '#1a73e8');
        setTimeout(function () {
          batch(function () {
            graph.removeCells([n]);
            graph.addEdge({
              shape: 'bone-edge',
              source: { x: pos.x, y: pos.y + size.height / 2 },
              target: { x: pos.x + size.width, y: pos.y + size.height / 2 },
              attrs: {
                line: {
                  stroke: color,
                  strokeWidth: 2,
                  targetMarker: Y.shapes.blockMarkerAttrs(10, 8, 2),
                  strokeLinecap: 'butt'
                }
              }
            });
          });
        }, 0);
      }
      graph.on('node:added', function (args) {
        if (args && args.options && args.options.stencil && args.node && args.node.shape === 'arrow-line') {
          dropArrowLineAsEdge(args.node);
        }
      });
    }

    // ---------- 内联编辑 ----------
    var editor = document.createElement('textarea');
    editor.id = 'ygt-inline-editor';
    editor.setAttribute('rows', '2');
    editor.style.cssText = 'position:fixed;z-index:1000;min-width:90px;max-width:420px;' + 'box-sizing:border-box;resize:none;white-space:pre-wrap;overflow-wrap:break-word;overflow:auto;' +
      'border:2px solid #1a73e8;border-radius:4px;font-size:14px;padding:4px 6px;outline:none;' +
      'background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.18);display:none;font-family:inherit;';
    document.body.appendChild(editor);
    var editingCell = null;

    function hideEditor() {
      editingCell = null;
      editor.style.display = 'none';
    }

    function commitEdit() {
      if (!editingCell) return;
      var v = editor.value;
      var old = editingCell.attr('label/text') || '';
      if (v !== old) {
        editingCell.attr('label/text', v);
        historyPush('修改文字');
        notifyChanged();
      }
      hideEditor();
    }

    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        commitEdit();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        hideEditor();
      }
    });
    editor.addEventListener('blur', function () { setTimeout(commitEdit, 120); });

    function showEditor(cell, clientPoint) {
      if (readonly) return;
      editingCell = cell;
      var label = cell.attr('label') || {};
      var b = cell.getBBox();
      var scale = currentScale();
      var w = Math.max(90, Math.min(420, b.width * scale - 6));
      var h = Math.max(50, Math.min(260, b.height * scale + 18));
      editor.value = cell.attr('label/text') || '';
      editor.style.display = 'block';
      editor.style.width = Math.round(w) + 'px';
      editor.style.height = Math.round(h) + 'px';
      editor.style.fontSize = Math.max(11, Math.min(30, (label.fontSize || 14) * scale)) + 'px';
      editor.style.left = Math.max(8, Math.round(clientPoint.x - w / 2)) + 'px';
      editor.style.top = Math.max(8, Math.round(clientPoint.y - h / 2)) + 'px';
      editor.focus();
      editor.select();
    }

    var fitCanvas = document.createElement('canvas');
    var fitCtx = fitCanvas.getContext ? fitCanvas.getContext('2d') : null;
    function fitLabelFont(label) {
      var size = Number(label.fontSize) || 13;
      var weight = String(label.fontWeight || '400');
      if (weight === 'bold' || weight === '600') weight = '700';
      var family = label.fontFamily || (Y.shapes && Y.shapes.FONT_FAMILY) || 'Microsoft YaHei, SimHei, sans-serif';
      return weight + ' ' + size + 'px ' + family;
    }
    function fitTextWidth(text, font) {
      if (!fitCtx) return String(text).length * 12;
      fitCtx.font = font;
      return fitCtx.measureText(String(text)).width || 0;
    }
    function fitTextPrefix(text, maxWidth, font) {
      text = String(text);
      if (fitTextWidth(text, font) <= maxWidth) return text;
      var lo = 1;
      var hi = text.length;
      while (lo <= hi) {
        var mid = Math.floor((lo + hi) / 2);
        if (fitTextWidth(text.slice(0, mid), font) <= maxWidth) lo = mid + 1;
        else hi = mid - 1;
      }
      return text.slice(0, Math.max(1, hi));
    }
    function applyFitText(cell, display, truncated, silent) {
      var current = cell.attr('label/textWrap');
      if (truncated) {
        if (current && current.text === display && current.width === -8 && current.height === -6 && current.ellipsis === false) return;
        cell.attr({ label: { textWrap: { width: -8, height: -6, ellipsis: false, text: display } } }, { silent: !!silent });
        return;
      }
      if (!current) return;
      if (current.text == null && current.width === -8 && current.height === -6 && current.ellipsis !== false) return;
      cell.attr({ label: { textWrap: { width: -8, height: -6, ellipsis: true, text: null } } }, { silent: !!silent });
    }
    function fitWrapText(cell, silent) {
      if (!cell || !cell.isNode || !cell.isNode()) return;
      if (cell.shape !== 'bone-node' && cell.shape !== 'group-node') return;
      var label = cell.attr('label') || {};
      if (typeof label.text !== 'string') return;
      var size = cell.getSize();
      var boxW = Math.max(1, size.width - 8);
      var boxH = Math.max(1, size.height - 6);
      var fontSize = Number(label.fontSize) || 13;
      var lineHeight = Math.ceil(1.4 * 14);
      var maxLines = Math.floor(boxH / lineHeight);
      var ellipsis = String.fromCharCode(0x2026);
      if (maxLines <= 0) {
        applyFitText(cell, '', true, silent);
        return;
      }
      var font = fitLabelFont(label);
      var ellW = fitCtx ? fitTextWidth(ellipsis, font) : Math.max(4, fontSize);
      var lines = [];
      var hidden = false;
      var parts = String(label.text).split('\n');
      for (var i = 0; i < parts.length; i++) {
        if (lines.length >= maxLines) {
          hidden = true;
          break;
        }
        var part = parts[i];
        if (part === '') {
          lines.push('');
          continue;
        }
        var rest = part;
        while (rest !== '' && lines.length < maxLines) {
          var piece = fitTextPrefix(rest, boxW, font);
          if (piece === '') piece = rest.charAt(0);
          lines.push(piece);
          rest = rest.slice(piece.length);
          if (rest !== '' && lines.length >= maxLines) hidden = true;
        }
        if (rest !== '') hidden = true;
      }
      if (hidden && lines.length > 0) {
        var lastIdx = lines.length - 1;
        var last = lines[lastIdx];
        if (fitTextWidth(last + ellipsis, font) > boxW) {
          last = fitTextPrefix(last, Math.max(1, boxW - ellW), font);
        }
        lines[lastIdx] = last + ellipsis;
      }
      applyFitText(cell, lines.join('\n'), hidden, silent);
    }
    graph.on('node:added', function (args) { fitWrapText(args && args.node); });
    graph.on('cell:change:size', function (args) { fitWrapText(args && args.cell); });
    graph.on('cell:change:attrs', function (args) { fitWrapText(args && args.cell); });

    function edgePointAt(edge, ratio) {
      if (edge && edge.isEdge && edge.isEdge()) {
        var view = edge.findView ? edge.findView(graph) : null;
        if (view && typeof view.getPointAtRatio === 'function') {
          var vp = view.getPointAtRatio(ratio);
          if (vp && typeof vp.x === 'number') return { x: vp.x, y: vp.y };
        }
        var s = edge.getSource();
        var t = edge.getTarget();
        var sc = s && s.cell ? graph.getCellById(s.cell) : null;
        var tc = t && t.cell ? graph.getCellById(t.cell) : null;
        if (sc && tc) {
          var sb = sc.getBBox(), tb = tc.getBBox();
          return {
            x: sb.x + sb.width / 2 + (tb.x + tb.width / 2 - (sb.x + sb.width / 2)) * ratio,
            y: sb.y + sb.height / 2 + (tb.y + tb.height / 2 - (sb.y + sb.height / 2)) * ratio
          };
        }
      }
      var eb = edge.getBBox();
      return { x: eb.x + eb.width * ratio, y: eb.y + eb.height * ratio };
    }

    function ratioAtPoint(edge, point) {
      var best = 0.5, bestDist = Infinity, t;
      for (t = 0; t <= 1.0001; t += 0.02) {
        var p = edgePointAt(edge, t);
        var d = Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2);
        if (d < bestDist) { bestDist = d; best = t; }
      }
      var lo = Math.max(0, best - 0.02);
      var hi = Math.min(1, best + 0.02);
      for (var i = 0; i <= 20; i++) {
        t = lo + (hi - lo) * i / 20;
        var p2 = edgePointAt(edge, t);
        var d2 = Math.pow(p2.x - point.x, 2) + Math.pow(p2.y - point.y, 2);
        if (d2 < bestDist) { bestDist = d2; best = t; }
      }
      return best;
    }

    function syncAttachedDots() {
      graph.getNodes().forEach(function (n) {
        if (n.id === draggingDot) return;
        var d = n.getData && n.getData();
        if (n.shape === 'dot-node' && d && d.attachEdge) {
          var edge = graph.getCellById(d.attachEdge);
          if (edge && edge.isEdge && edge.isEdge()) {
            var p = edgePointAt(edge, d.ratio == null ? 0.5 : d.ratio);
            n.position(p.x - 9, p.y - 9, { silent: true });
          }
        } else if (n.shape === 'dot-node' && d && d.attachNode) {
          var host = graph.getCellById(d.attachNode);
          if (host && host.isNode && host.isNode()) {
            var hp = host.position();
            var hs = host.getSize();
            var rx = d.ratioX == null ? 0.5 : d.ratioX;
            n.position(hp.x + hs.width * rx - 9, hp.y + hs.height / 2 - 9, { silent: true });
          }
        }
      });
    }

    var draggingDot = null;
    var nodeBodyDrag = null;
    function ensureDotBridges() {
      graph.getNodes().forEach(function (n) {
        if (n.shape !== 'dot-node') return;
        var b = n.getBBox();
        var cx = b.x + b.width / 2;
        var cy = b.y + b.height / 2;
        graph.getEdges().forEach(function (e) {
          var s = e.getSource();
          var t = e.getTarget();
          var connected = (s && s.cell === n.id) || (t && t.cell === n.id);
          if (!connected) return;
          if (typeof e.setVertices === 'function') {
            e.setVertices([{ x: cx, y: cy }]);
          } else if (typeof e.appendVertex === 'function') {
            e.appendVertex({ x: cx, y: cy });
          }
        });
      });
    }

    function addDotOnEdge(edge, localPoint) {
      if (!edge || !edge.isEdge || !edge.isEdge()) return null;
      if (!localPoint || typeof localPoint.x !== 'number') return null;
      var ratio = ratioAtPoint(edge, localPoint);
      var dot = graph.addNode({
        shape: 'dot-node',
        x: localPoint.x - 9,
        y: localPoint.y - 9,
        width: 18,
        height: 18,
        zIndex: 1000,
        data: { attachEdge: edge.id, ratio: ratio },
        ports: Y.shapes.portsOf('left|right|top|bottom')
      });
      dot.toFront();
      selection.reset([dot]);
      historyPush('在线段添加连接点');
      notifyToast('已在线段上添加连接点（线段保持连续）');
      return dot;
    }

    function addDotOnNode(node, localPoint) {
      if (!node || !node.isNode || !node.isNode()) return null;
      if (!localPoint || typeof localPoint.x !== 'number') return null;
      var pos = node.position();
      var size = node.getSize();
      var ratioX = size.width > 0 ? (localPoint.x - pos.x) / size.width : 0.5;
      ratioX = Math.max(0, Math.min(1, ratioX));
      var dot = graph.addNode({
        shape: 'dot-node',
        x: localPoint.x - 9,
        y: localPoint.y - 9,
        width: 18,
        height: 18,
        zIndex: 1000,
        data: { attachNode: node.id, ratioX: ratioX },
        ports: Y.shapes.portsOf('left|right|top|bottom')
      });
      dot.toFront();
      selection.reset([dot]);
      historyPush('在鱼干添加连接点');
      notifyToast('已在鱼干上添加连接点');
      return dot;
    }

    function getAttachedDots(cellId) {
      return graph.getNodes().filter(function (n) {
        if (n.shape !== 'dot-node') return false;
        var d = n.getData && n.getData();
        return d && (d.attachEdge === cellId || d.attachNode === cellId);
      });
    }

    function setImageBackground(node, on) {
      if (!node || node.shape !== 'image-node') return;
      var d = node.getData() || {};
      d.isBackground = !!on;
      node.setData(d);
      if (on) {
        node.setZIndex(-100);
        if (typeof node.setInteracting === 'function') node.setInteracting(false);
      } else {
        node.setZIndex(2);
        if (typeof node.setInteracting === 'function') node.setInteracting(true);
      }
      historyPush(on ? '设为背景' : '取消背景');
    }

    function testMoveDot(node, dx, dy) {
      if (!node || node.shape !== 'dot-node') return null;
      var p = node.position();
      draggingDot = node.id;
      node.position(p.x + dx, p.y + dy);
      graph.trigger('node:moved', { node: node, e: {}, x: p.x + dx, y: p.y + dy });
      draggingDot = null;
      return node;
    }

    graph.on('node:dblclick', function (args) {
      if (readonly) return;
      if (args.node.shape === 'fish-spine') {
        var p;
        if (typeof args.x === 'number' && typeof args.y === 'number') {
          p = { x: args.x, y: args.y };
        } else {
          var sb = args.node.getBBox();
          p = { x: sb.x + sb.width / 2, y: sb.y + sb.height / 2 };
        }
        addDotOnNode(args.node, p);
        return;
      }
      var b = args.node.getBBox();
      showEditor(args.node, graph.localToClient({ x: b.x + b.width / 2, y: b.y + b.height / 2 }));
    });
    graph.on('edge:dblclick', function (args) {
      if (readonly) return;
      var p;
      if (typeof args.x === 'number' && typeof args.y === 'number') {
        p = { x: args.x, y: args.y };
      } else {
        var b = args.edge.getBBox();
        p = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }
      addDotOnEdge(args.edge, p);
    });
    graph.on('edge:click', function (args) {
      if (readonly) return;
      if (args.e && args.e.altKey) {
        var p = (typeof args.x === 'number' && typeof args.y === 'number') ? { x: args.x, y: args.y } : null;
        if (p) addDotOnEdge(args.edge, p);
      }
    });

    // 连线端点直接拖拽：起点吸附线段/沿线跟随；终点只吸附控件端口小圆点。
    var TERMINAL_HIT_RADIUS = 14; // 客户端像素：判定按下点是否在端点附近
    var SNAP_TOLERANCE = 18;      // 客户端像素：起点吸附线段容差
    var PORT_SNAP_TOLERANCE = 24; // 客户端像素：终点吸附端口容差
    var terminalDrag = null;

    function cloneTerminal(t) {
      if (!t || typeof t !== 'object') return t;
      try {
        return JSON.parse(JSON.stringify(t));
      } catch (e) {
        return Object.assign({}, t);
      }
    }

    function snapSourceCandidate(edge, clientPoint) {
      var best = null;
      var bestDist = SNAP_TOLERANCE * SNAP_TOLERANCE;
      graph.getEdges().forEach(function (other) {
        if (other === edge || other.shape !== 'bone-edge') return;
        for (var t = 0; t <= 1.0001; t += 0.02) {
          var local = edgePointAt(other, t);
          var cp = graph.localToClient(local);
          var dx = cp.x - clientPoint.x;
          var dy = cp.y - clientPoint.y;
          var dd = dx * dx + dy * dy;
          if (dd < bestDist) {
            bestDist = dd;
            best = { edge: other, ratio: t };
          }
        }
      });
      return best;
    }

    function snapTargetPort(edge, clientPoint) {
      var best = null;
      var bestDist = PORT_SNAP_TOLERANCE * PORT_SNAP_TOLERANCE;
      var src = edge.getSource && edge.getSource();
      var srcId = src && (src.cell || src);
      var hosts = document.querySelectorAll('.x6-node[data-cell-id]');
      for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var nid = host.getAttribute('data-cell-id');
        if (nid === srcId) continue;
        var n = graph.getCellById(nid);
        if (!n) continue;
        var shape = n.shape;
        if (shape !== 'bone-node' && shape !== 'group-node' && shape !== 'text-node' &&
            shape !== 'image-node' && shape !== 'fish-head') continue;
        host.querySelectorAll('.x6-port').forEach(function (el) {
          var b = el.getBoundingClientRect();
          var cx = b.x + b.width / 2;
          var cy = b.y + b.height / 2;
          var dd = Math.pow(cx - clientPoint.x, 2) + Math.pow(cy - clientPoint.y, 2);
          if (dd < bestDist) {
            var cls = el.getAttribute('class') || '';
            var m = cls.match(/x6-port-(left|right|top|bottom)/);
            bestDist = dd;
            best = { node: n, port: m ? 'port-' + m[1] : null };
          }
        });
      }
      return best;
    }

    graph.on('edge:mousedown', function (args) {
      if (readonly) return;
      var edge = args.edge;
      if (!edge || edge.shape !== 'bone-edge' || !args.e) return;
      // 按下点在端口上时不拦截（端口拖拽建连场景）
      if (args.e.target && args.e.target.closest && args.e.target.closest('.x6-port')) return;
      var sp = graph.localToClient(edgePointAt(edge, 0));
      var tp = graph.localToClient(edgePointAt(edge, 1));
      var ds = Math.sqrt(Math.pow(args.e.clientX - sp.x, 2) + Math.pow(args.e.clientY - sp.y, 2));
      var dt = Math.sqrt(Math.pow(args.e.clientX - tp.x, 2) + Math.pow(args.e.clientY - tp.y, 2));
      var mode = ds <= dt ? 'source' : 'target';
      if (Math.min(ds, dt) > TERMINAL_HIT_RADIUS) return;
      if (args.e.stopPropagation) args.e.stopPropagation();
      if (args.e.preventDefault) args.e.preventDefault();
      terminalDrag = {
        edge: edge,
        mode: mode,
        start: { x: args.e.clientX, y: args.e.clientY },
        moved: false,
        origin: {
          source: cloneTerminal(edge.getSource()),
          target: cloneTerminal(edge.getTarget())
        }
      };
    });

    document.addEventListener('mousemove', function (e) {
      if (!terminalDrag) return;
      var dx = e.clientX - terminalDrag.start.x;
      var dy = e.clientY - terminalDrag.start.y;
      if (!terminalDrag.moved && Math.sqrt(dx * dx + dy * dy) < 3) return;
      terminalDrag.moved = true;
      var point = { x: e.clientX, y: e.clientY };
      var local = graph.clientToLocal(point);
      if (terminalDrag.mode === 'source') {
        var snap = snapSourceCandidate(terminalDrag.edge, point);
        if (snap) {
          terminalDrag.edge.setSource({ cell: snap.edge.id, anchor: { name: 'ratio', args: { ratio: snap.ratio } } });
        } else {
          terminalDrag.edge.setSource({ x: local.x, y: local.y });
        }
        terminalDrag.edge.setTarget(terminalDrag.origin.target);
      } else {
        var target = snapTargetPort(terminalDrag.edge, point);
        if (target) {
          var tgt = { cell: target.node.id };
          if (target.port) tgt.port = target.port;
          terminalDrag.edge.setTarget(tgt);
        } else {
          terminalDrag.edge.setTarget({ x: local.x, y: local.y });
        }
        terminalDrag.edge.setSource(terminalDrag.origin.source);
      }
    });

    function endTerminalDrag() {
      if (!terminalDrag) return;
      if (terminalDrag.moved) {
        if (terminalDrag.mode === 'source') {
          terminalDrag.edge.setTarget(terminalDrag.origin.target);
        } else {
          terminalDrag.edge.setSource(terminalDrag.origin.source);
        }
        clearLegacyLine(terminalDrag.edge);
        syncHierarchyFromLines();
        historyPush(terminalDrag.mode === 'source' ? '移动连线起点' : '移动连线终点');
        notifyChanged();
        if (typeof o.onSelection === 'function') o.onSelection(selectedCells());
      }
      terminalDrag = null;
    }
    document.addEventListener('mouseup', endTerminalDrag, true);
    window.addEventListener('blur', endTerminalDrag, true);

    function findDropParent(clientPoint, excludeId) {
      var best = null;
      var bestDist = PORT_SNAP_TOLERANCE * PORT_SNAP_TOLERANCE;
      var hosts = document.querySelectorAll('.x6-node[data-cell-id]');
      for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var nid = host.getAttribute('data-cell-id');
        if (!nid || nid === excludeId) continue;
        var n = graph.getCellById(nid);
        if (!n) continue;
        if (n.shape !== 'bone-node' && n.shape !== 'group-node') continue;
        host.querySelectorAll('.x6-port').forEach(function (el) {
          var b = el.getBoundingClientRect();
          var cx = b.x + b.width / 2;
          var cy = b.y + b.height / 2;
          var dd = Math.pow(cx - clientPoint.x, 2) + Math.pow(cy - clientPoint.y, 2);
          if (dd < bestDist) {
            bestDist = dd;
            best = { node: n, client: { x: cx, y: cy } };
          }
        });
      }
      return best;
    }

    function isDescendantOf(id, ancestorId) {
      var cur = graph.getCellById(id);
      var seen = {};
      while (cur && cur.isNode && cur.isNode()) {
        if (cur.id === ancestorId) return true;
        if (seen[cur.id]) return false;
        seen[cur.id] = true;
        var d = cur.getData() || {};
        cur = d.parentId && d.parentId !== '__ROOT__' ? graph.getCellById(d.parentId) : null;
      }
      return false;
    }

    function canReparent(node, target) {
      if (!node || !target || node.id === target.id) return false;
      if (node.shape !== 'bone-node' && node.shape !== 'group-node') return false;
      if (target.shape !== 'bone-node' && target.shape !== 'group-node') return false;
      var td = target.getData() || {};
      if ((typeof td.level === 'number' ? td.level : 0) >= 5) return false;
      return !isDescendantOf(target.id, node.id);
    }

    function moveDescendantsFromData(node, dx, dy) {
      if (!dx && !dy) return;
      graph.getNodes().forEach(function (child) {
        if (child.id === node.id) return;
        var d = child.getData() || {};
        if (d.parentId !== node.id) return;
        var p = child.position();
        child.position(p.x + dx, p.y + dy);
        moveDescendantsFromData(child, dx, dy);
      });
    }

    function endNodeBodyDrag(e) {
      var drag = nodeBodyDrag;
      if (!drag || !drag.moved || !e) return;
      var n = drag.node;
      var hit = findDropParent({ x: e.clientX, y: e.clientY }, n.id);
      if (!hit || !canReparent(n, hit.node)) return;
      var incoming = (graph.getIncomingEdges(n) || []).find(function (x) { return x.shape === 'bone-edge'; });
      if (!incoming) return;
      var now = n.position();
      var dx = now.x - drag.startPos.x;
      var dy = now.y - drag.startPos.y;
      var parentEdge = (graph.getIncomingEdges(hit.node) || []).find(function (x) { return x.shape === 'bone-edge'; });
      batch(function () {
        clearLegacyLine(incoming);
        if (parentEdge) {
          incoming.setSource({ cell: parentEdge.id, anchor: { name: 'ratio', args: { ratio: 0.5 } } });
        } else {
          incoming.setSource({ cell: hit.node.id });
        }
        incoming.setTarget({ cell: n.id, port: 'port-left' });
        moveDescendantsFromData(n, dx, dy);
        syncHierarchyFromLines();
      });
      historyPush('调整上下级');
      notifyChanged();
      if (typeof o.onSelection === 'function') o.onSelection(selectedCells());
    }

    document.addEventListener('mousemove', function (e) {
      if (nodeBodyDrag) nodeBodyDrag.lastEvent = e;
    });
    document.addEventListener('mouseup', function (e) {
      if (!nodeBodyDrag) return;
      endNodeBodyDrag(e);
      nodeBodyDrag = null;
    }, true);

    // ---------- 事件透传 ----------
    function notifyChanged() {
      if (suppressChangeNotify) return;
      if (typeof o.onChanged === 'function') o.onChanged();
    }
    function notifySelection() {
      if (typeof o.onSelection === 'function') o.onSelection(selectedCells());
    }
    selection.on('selection:changed', notifySelection);
    graph.on('node:added', notifyChanged);
    graph.on('node:added', function (args) {
      var n = args.node;
      if (!Y.core.isBusiness(n)) return;
      var d = n.getData() || {};
      if (typeof d.parentId === 'string' && d.parentId !== '') return;
      var roots = graph.getNodes().filter(function (x) {
        var xd = x.getData && x.getData();
        return xd && xd.parentId === '__ROOT__' && x.id !== n.id;
      });
      d.kind = n.shape === 'fish-head' ? 'head' : (n.shape === 'group-node' ? 'group' : 'bone');
      d.parentId = '__ROOT__';
      d.order = roots.length;
      d.level = 0;
      n.setData(d, { silent: true });
    });
    function assignEdgeHierarchy(edge) {
      if (!edge) return;
      var s = edge.getSource && edge.getSource();
      var t = edge.getTarget && edge.getTarget();
      var srcId = s && (s.cell || s);
      var tgtId = t && (t.cell || t);
      var srcNode = graph.getCellById(srcId);
      var tgtNode = graph.getCellById(tgtId);
      if (!srcNode || !tgtNode || !Y.core.isBusiness(srcNode) || !Y.core.isBusiness(tgtNode)) return;
      var d = tgtNode.getData() || {};
      if (typeof d.parentId !== 'string' || d.parentId === '' || d.parentId === '__ROOT__') {
        var kids = graph.getNodes().filter(function (x) {
          var xd = x.getData && x.getData();
          return xd && xd.parentId === srcNode.id;
        });
        d.parentId = srcNode.id;
        d.order = kids.length;
        var sd = srcNode.getData() || {};
        d.level = (typeof sd.level === 'number' ? sd.level : 0) + 1;
        tgtNode.setData(d);
        historyPush('建立层级关系');
      }
    }
    graph.on('edge:connected', function (args) { clearLegacyLine(args.edge); assignEdgeHierarchy(args.edge); ensureDotBridges(); });
    graph.on('edge:added', function (args) { assignEdgeHierarchy(args.edge); ensureDotBridges(); });
    graph.on('cell:removed', notifyChanged);
    graph.on('edge:connected', notifyChanged);
    graph.on('cell:change:position', function (args) {
      if (!suppressLegacySync && args && args.cell && args.cell.isNode && args.cell.isNode()) {
        clearLegacyLinesForSubtree(args.cell);
      }
      if (!suppressLegacySync && args && args.cell && args.cell.shape === 'text-node') {
        reanchorPorts(args.cell);
      }
      notifyChanged();
    });
    graph.on('cell:change:attrs', notifyChanged);
    graph.on('node:moved', function (args) {
      var node = args && args.node;
      if (!suppressLegacySync && node) clearLegacyLinesForSubtree(node);
      historyPush('移动节点');
    });
    graph.on('node:click', function (args) {
      if (args.node.shape === 'dot-node') args.node.toFront();
    });
    graph.on('node:selected', function (args) {
      var v = args.node.findView && args.node.findView(graph);
      if (v && v.el) v.el.classList.add('ygt-selected');
    });
    graph.on('node:unselected', function (args) {
      var v = args.node.findView && args.node.findView(graph);
      if (v && v.el) v.el.classList.remove('ygt-selected');
    });
    graph.on('node:mousedown', function (args) {
      if (readonly) return;
      if ((args.node.shape === 'bone-node' || args.node.shape === 'group-node') && args.e) {
        nodeBodyDrag = {
          node: args.node,
          startClient: { x: args.e.clientX, y: args.e.clientY },
          startPos: args.node.position(),
          moved: false
        };
      }
      if (args.node.shape === 'dot-node') {
        draggingDot = args.node.id;
        args.node.toFront();
        selection.reset([args.node]);
        if (args.e) {
          if (args.e.stopPropagation) args.e.stopPropagation();
          if (args.e.preventDefault) args.e.preventDefault();
        }
      }
    });
    graph.on('node:mouseup', function () {
      draggingDot = null;
      if (nodeBodyDrag) {
        var start = nodeBodyDrag.startClient;
        var now = nodeBodyDrag.node.position();
        nodeBodyDrag.moved = nodeBodyDrag.moved ||
          Math.abs(now.x - nodeBodyDrag.startPos.x) > 1 ||
          Math.abs(now.y - nodeBodyDrag.startPos.y) > 1;
        if (nodeBodyDrag.lastEvent) endNodeBodyDrag(nodeBodyDrag.lastEvent);
        nodeBodyDrag = null;
      }
    });
    graph.on('edge:change:source', syncAttachedDots);
    graph.on('edge:change:target', syncAttachedDots);
    graph.on('edge:change:vertices', syncAttachedDots);
    graph.on('edge:change:connector', syncAttachedDots);
    graph.on('cell:change:position', function () { syncAttachedDots(); ensureDotBridges(); });
    graph.on('cell:change:size', syncAttachedDots);
    function updateArrowLine(node) {
      if (!node || node.shape !== 'arrow-line') return;
      var s = node.getSize();
      var d = node.getData() || {};
      var arrowSize = d.arrowSize;
      var lineWidth = node.attr('body/strokeWidth') || 2;
      if (typeof Y.shapes.arrowLineLinePath === 'function') {
        node.attr('hit/d', Y.shapes.arrowLineLinePath(s.width, s.height, arrowSize));
        node.attr('body/d', Y.shapes.arrowLineLinePath(s.width, s.height, arrowSize));
        node.attr('arrow/d', Y.shapes.arrowLineHeadPath(s.width, s.height, arrowSize, lineWidth));
      } else if (typeof Y.shapes.arrowLinePath === 'function') {
        node.attr('body/d', Y.shapes.arrowLinePath(s.width, s.height));
      }
    }
    function updateDotNode(node) {
      if (!node || node.shape !== 'dot-node') return;
      var s = node.getSize();
      var r = Math.max(1, Math.min(s.width, s.height) / 2);
      node.attr('body/cx', s.width / 2);
      node.attr('body/cy', s.height / 2);
      node.attr('body/r', r);
      node.attr('hit/cx', s.width / 2);
      node.attr('hit/cy', s.height / 2);
      node.attr('hit/r', r + 6);
    }

    function snapDotToNearest(node) {
      if (!node || node.shape !== 'dot-node') return;
      var d = node.getData && node.getData();
      if (d && (d.attachEdge || d.attachNode)) return;
      var c = { x: node.position().x + 9, y: node.position().y + 9 };
      var best = null, bestDist = 30 * 30, bestRatio = 0.5;
      graph.getEdges().forEach(function (e) {
        if (e.shape !== 'bone-edge') return;
        for (var t = 0; t <= 1.0001; t += 0.02) {
          var p = edgePointAt(e, t);
          var dd = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
          if (dd < bestDist) { bestDist = dd; best = e.id; bestRatio = t; }
        }
      });
      graph.getNodes().forEach(function (sp) {
        if (sp.shape !== 'fish-spine') return;
        var bp = sp.position(), bs = sp.getSize();
        var sy = bp.y + bs.height / 2;
        var px = Math.max(bp.x, Math.min(bp.x + bs.width, c.x));
        var dd = Math.pow(px - c.x, 2) + Math.pow(sy - c.y, 2);
        if (dd < bestDist) { bestDist = dd; best = sp.id; bestRatio = (px - bp.x) / (bs.width || 1); }
      });
      if (!best) return;
      var cell = graph.getCellById(best);
      var nd = node.getData() || {};
      if (cell && cell.isEdge && cell.isEdge()) {
        nd.attachEdge = best;
        nd.ratio = bestRatio;
        var pp = edgePointAt(cell, bestRatio);
        node.position(pp.x - 9, pp.y - 9, { silent: true });
      } else if (cell && cell.isNode && cell.isNode()) {
        nd.attachNode = best;
        nd.ratioX = bestRatio;
        var hp2 = cell.position();
        node.position(hp2.x + cell.getSize().width * bestRatio - 9, hp2.y + cell.getSize().height / 2 - 9, { silent: true });
      }
      node.setData(nd, { silent: true });
      historyPush('连接点吸附到线');
    }
    graph.on('cell:change:size', function (args) {
      if (args.cell) updateArrowLine(args.cell);
      if (args.cell) updateDotNode(args.cell);
    });
    graph.on('node:added', function (args) {
      updateArrowLine(args.node);
      updateDotNode(args.node);
      snapDotToNearest(args.node);
    });
    function parentAnchorPoint(edge) {
      if (!edge) return null;
      if (typeof edge.getSourcePoint === 'function') {
        var sp = edge.getSourcePoint();
        if (sp && typeof sp.x === 'number') return { x: sp.x, y: sp.y };
      }
      var s = edge.getSource && edge.getSource();
      if (!s) return null;
      if (s.cell) {
        var sc = graph.getCellById(s.cell);
        if (sc) {
          if (sc.isNode && sc.isNode()) {
            var b = sc.getBBox();
            return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
          }
          if (sc.isEdge && sc.isEdge()) {
            var ratio = (s.anchor && s.anchor.args && typeof s.anchor.args.ratio === 'number') ? s.anchor.args.ratio : 0.5;
            return edgePointAt(sc, ratio);
          }
        }
      }
      if (typeof s.x === 'number' && typeof s.y === 'number') {
        return { x: s.x, y: s.y };
      }
      return null;
    }

    function normalizeAngleValue(angle) {
      var n = Number(angle);
      if (!isFinite(n)) n = 40;
      return ((n % 360) + 360) % 360;
    }

    function nodeTerminalPoint(node, port) {
      var b = node.getBBox();
      if (port === 'port-left') return { x: b.x, y: b.y + b.height / 2 };
      if (port === 'port-right') return { x: b.x + b.width, y: b.y + b.height / 2 };
      if (port === 'port-top') return { x: b.x + b.width / 2, y: b.y };
      if (port === 'port-bottom') return { x: b.x + b.width / 2, y: b.y + b.height };
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }

    function terminalModelPoint(terminal, depth) {
      if (!terminal || depth > 8) return null;
      if (typeof terminal.x === 'number' && typeof terminal.y === 'number') {
        return { x: terminal.x, y: terminal.y };
      }
      var cellId = terminal.cell;
      var cell = cellId ? graph.getCellById(cellId) : null;
      if (!cell) return null;
      if (cell.isNode && cell.isNode()) return nodeTerminalPoint(cell, terminal.port);
      if (cell.isEdge && cell.isEdge()) {
        var ratio = terminal.anchor && terminal.anchor.args && typeof terminal.anchor.args.ratio === 'number'
          ? terminal.anchor.args.ratio
          : 0.5;
        var s = terminalModelPoint(cell.getSource(), depth + 1);
        var t = terminalModelPoint(cell.getTarget(), depth + 1);
        if (s && t) {
          return {
            x: s.x + (t.x - s.x) * ratio,
            y: s.y + (t.y - s.y) * ratio
          };
        }
      }
      return null;
    }

    var syncingLegacyLines = false;
    var suppressLegacySync = false;

    function hasLegacyLine(edge) {
      if (!edge || edge.shape !== 'bone-edge' || typeof edge.getData !== 'function') return false;
      var line = (edge.getData() || {}).legacyLine;
      return !!(Y.shapes && typeof Y.shapes.validLegacyLine === 'function' && Y.shapes.validLegacyLine(line));
    }

    function clearLegacyLine(edge) {
      if (!hasLegacyLine(edge)) return false;
      var data = edge.getData() || {};
      delete data.legacyLine;
      edge.setData(data, { silent: true });
      if (typeof edge.setConnector === 'function') edge.setConnector({ name: 'normal' });
      if (typeof edge.findView === 'function') {
        var view = edge.findView(graph);
        if (view && typeof view.update === 'function') view.update();
      }
      return true;
    }

    function clearLegacyLinesForSubtree(node) {
      if (!node || !node.isNode || !node.isNode()) return 0;
      if (node.shape !== 'bone-node' && node.shape !== 'group-node' && node.shape !== 'text-node') return 0;
      var children = {};
      graph.getNodes().forEach(function (item) {
        var data = item.getData && item.getData();
        var pid = data && data.parentId;
        if (!pid || pid === '__ROOT__') return;
        (children[pid] = children[pid] || []).push(item.id);
      });
      var ids = {};
      var queue = [node.id];
      while (queue.length) {
        var id = queue.shift();
        if (!id || ids[id]) continue;
        ids[id] = true;
        (children[id] || []).forEach(function (childId) { queue.push(childId); });
      }
      var changed = 0;
      graph.getEdges().forEach(function (edge) {
        if (!hasLegacyLine(edge)) return;
        var source = edge.getSource && edge.getSource();
        var target = edge.getTarget && edge.getTarget();
        var sourceId = source && (source.cell || source);
        var targetId = target && (target.cell || target);
        if (!ids[sourceId] && !ids[targetId]) return;
        if (clearLegacyLine(edge)) changed += 1;
      });
      return changed;
    }

    function legacyTerminalPoint(terminal, preferLegacy, depth) {
      if (!terminal || depth > 16) return null;
      if (typeof terminal.x === 'number' && typeof terminal.y === 'number') {
        return { x: terminal.x, y: terminal.y };
      }
      var cellId = terminal.cell;
      var cell = cellId ? graph.getCellById(cellId) : null;
      if (!cell) return null;
      if (cell.isNode && cell.isNode()) return nodeTerminalPoint(cell, terminal.port);
      if (cell.isEdge && cell.isEdge()) {
        if (preferLegacy) {
          var line = (cell.getData && cell.getData() || {}).legacyLine;
          if (Y.shapes && typeof Y.shapes.validLegacyLine === 'function' && Y.shapes.validLegacyLine(line)) {
            var ratio = terminal.anchor && terminal.anchor.args && typeof terminal.anchor.args.ratio === 'number'
              ? terminal.anchor.args.ratio
              : 0.5;
            return {
              x: Number(line.x1) + (Number(line.x2) - Number(line.x1)) * ratio,
              y: Number(line.y1) + (Number(line.y2) - Number(line.y1)) * ratio
            };
          }
        }
        return terminalModelPoint(terminal, depth);
      }
      return null;
    }

    function legacyEdgeLevel(edge) {
      var target = edge && edge.getTarget && edge.getTarget();
      var id = target && (target.cell || target);
      var node = id ? graph.getCellById(id) : null;
      var data = node && typeof node.getData === 'function' ? (node.getData() || {}) : {};
      return Number(data.level) || 0;
    }

    function syncLegacyLines(options) {
      var opts = options || {};
      if (syncingLegacyLines || !graph || !Y.shapes || typeof Y.shapes.validLegacyLine !== 'function') return 0;
      var allowed = opts.edgeIds ? new Set(opts.edgeIds) : null;
      var edges = graph.getEdges().filter(function (edge) {
        if (!edge || edge.shape !== 'bone-edge' || typeof edge.getData !== 'function') return false;
        if (allowed && !allowed.has(edge.id)) return false;
        return opts.preferLegacy ? hasLegacyLine(edge) : true;
      });
      edges.sort(function (a, b) { return legacyEdgeLevel(a) - legacyEdgeLevel(b); });
      syncingLegacyLines = true;
      var changed = 0;
      try {
        edges.forEach(function (edge) {
          var source = legacyTerminalPoint(edge.getSource(), !!opts.preferLegacy, 0);
          var target = legacyTerminalPoint(edge.getTarget(), !!opts.preferLegacy, 0);
          if (!source || !target) return;
          var line = {
            x1: Math.round(source.x * 1000) / 1000,
            y1: Math.round(source.y * 1000) / 1000,
            x2: Math.round(target.x * 1000) / 1000,
            y2: Math.round(target.y * 1000) / 1000
          };
          var data = edge.getData() || {};
          var oldLine = data.legacyLine || {};
          var same = Number(oldLine.x1) === line.x1 && Number(oldLine.y1) === line.y1 &&
            Number(oldLine.x2) === line.x2 && Number(oldLine.y2) === line.y2;
          if (!same || opts.forceCommit) {
            var nextData = Object.assign({}, data, { legacyLine: line });
            edge.setData(nextData, opts.silent ? { silent: true } : undefined);
            if (typeof edge.setConnector === 'function') edge.setConnector({ name: 'legacy-line' });
            if (opts.forceView && typeof edge.findView === 'function') {
              var view = edge.findView(graph);
              if (view && typeof view.update === 'function') view.update();
            }
            if (!same) changed += 1;
          }
        });
      } finally {
        syncingLegacyLines = false;
      }
      return changed;
    }

    function edgeEndpointPoint(edge, target) {
      if (!edge || !edge.isEdge || !edge.isEdge()) return null;
      var terminal = target ? (edge.getTarget && edge.getTarget()) : (edge.getSource && edge.getSource());
      var modelPoint = terminalModelPoint(terminal, 0);
      if (modelPoint) return modelPoint;
      var p = target && typeof edge.getTargetPoint === 'function'
        ? edge.getTargetPoint()
        : (typeof edge.getSourcePoint === 'function' ? edge.getSourcePoint() : null);
      if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
      return edgePointAt(edge, target ? 1 : 0);
    }

    function edgeAngleValue(edge) {
      var s = edgeEndpointPoint(edge, false);
      var t = edgeEndpointPoint(edge, true);
      if (!s || !t) return null;
      var dx = t.x - s.x;
      var dy = t.y - s.y;
      if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return null;
      return normalizeAngleValue(Math.atan2(dy, dx) * 180 / Math.PI);
    }

    function targetBusinessNode(edge) {
      if (!edge || edge.shape !== 'bone-edge') return null;
      var terminal = edge.getTarget && edge.getTarget();
      var id = terminal && (terminal.cell || terminal);
      var node = id ? graph.getCellById(id) : null;
      if (!node || !node.isNode || !node.isNode()) return null;
      if (node.shape !== 'bone-node' && node.shape !== 'group-node') return null;
      var d = node.getData() || {};
      if (d.level == null || d.order == null) return null;
      return node;
    }

    function fishHeadDirection() {
      var head = graph.getNodes().find(function (n) { return n.shape === 'fish-head'; });
      var d = head && head.getData ? (head.getData() || {}) : {};
      return d.ygtDir === 'toleft' ? 'toleft' : 'toright';
    }

    function desiredBusinessAngle(edge, baseAngle) {
      var node = targetBusinessNode(edge);
      if (!node) return null;
      var d = node.getData() || {};
      var level = Number(d.level);
      var order = Number(d.order);
      if (!isFinite(level) || !isFinite(order)) return null;
      var even = order % 2 === 0;
      var dir = fishHeadDirection();
      if (level % 2 === 1) {
        var ref;
        if (level === 1) {
          ref = dir === 'toleft' ? 180 : 0;
        } else {
          var parent = d.parentId ? graph.getCellById(d.parentId) : null;
          var parentEdge = parent
            ? (graph.getIncomingEdges(parent) || []).find(function (e) { return e.shape === 'bone-edge'; })
            : null;
          ref = parentEdge ? edgeAngleValue(parentEdge) : null;
          if (ref == null) ref = dir === 'toleft' ? 180 : 0;
        }
        var leftward = Math.cos(ref * Math.PI / 180) < 0;
        return leftward
          ? normalizeAngleValue(even ? 180 + baseAngle : 180 - baseAngle)
          : normalizeAngleValue(even ? 360 - baseAngle : baseAngle);
      }
      var forward = dir === 'toleft' ? 180 : 0;
      return normalizeAngleValue(even ? forward : forward + 180);
    }

    function keepDomainAngle(edge, source, target, baseAngle, length) {
      if (!source || !target) return baseAngle;
      var node = targetBusinessNode(edge);
      if (!node) return baseAngle;
      var d = node.getData() || {};
      var level = Number(d.level);
      var order = Number(d.order);
      if (!isFinite(level) || !isFinite(order)) return baseAngle;
      var even = order % 2 === 0;
      var dir = fishHeadDirection();
      var xSign = 0;
      var ySign = 0;
      if (level % 2 === 1) {
        ySign = even ? -1 : 1;
      } else {
        xSign = even
          ? (dir === 'toleft' ? -1 : 1)
          : (dir === 'toleft' ? 1 : -1);
      }
      var spine = graph.getNodes().find(function (n) { return n.shape === 'fish-spine'; });
      var spineY = spine ? spine.position().y + spine.getSize().height / 2 : null;
      var angle = baseAngle;
      for (var i = 0; i < 4; i += 1) {
        var rad = angle * Math.PI / 180;
        var vx = length * Math.cos(rad);
        var vy = length * Math.sin(rad);
        if (xSign && Math.abs(vx) > 0.01 && vx * xSign < 0) {
          angle = normalizeAngleValue(180 - angle);
          continue;
        }
        if (ySign && spineY != null && Math.abs(source.y + vy - spineY) > 0.01 &&
          (source.y + vy - spineY) * ySign < 0) {
          angle = normalizeAngleValue(360 - angle);
          continue;
        }
        return angle;
      }
      return angle;
    }

    function rotateBusinessTarget(edge, angle) {
      var node = targetBusinessNode(edge);
      if (!node) return false;
      var s = edgeEndpointPoint(edge, false);
      var t = edgeEndpointPoint(edge, true);
      if (!s || !t) return false;
      var dx = t.x - s.x;
      var dy = t.y - s.y;
      var len = Math.sqrt(dx * dx + dy * dy);
      if (!(len > 0.01)) return false;
      angle = keepDomainAngle(edge, s, t, angle, len);
      var rad = angle * Math.PI / 180;
      var nx = s.x + len * Math.cos(rad);
      var ny = s.y + len * Math.sin(rad);
      var moveX = nx - t.x;
      var moveY = ny - t.y;
      if (Math.abs(moveX) < 0.001 && Math.abs(moveY) < 0.001) return false;
      var pos = node.position();
      node.position(pos.x + moveX, pos.y + moveY);
      return true;
    }

    function layoutByAngle(baseAngle, options) {
      var opts = options || {};
      var angle = normalizeAngleValue(baseAngle == null ? 40 : baseAngle);
      var edges = graph.getEdges().filter(function (e) { return !!targetBusinessNode(e); });
      edges.sort(function (a, b) {
        var an = targetBusinessNode(a);
        var bn = targetBusinessNode(b);
        var ad = an ? (an.getData() || {}) : {};
        var bd = bn ? (bn.getData() || {}) : {};
        return Number(ad.level) - Number(bd.level) || Number(ad.order) - Number(bd.order);
      });
      var changed = 0;
      var run = function () {
        edges.forEach(function (edge) {
          var desired = desiredBusinessAngle(edge, angle);
          if (desired == null) return;
          if (rotateBusinessTarget(edge, desired)) changed += 1;
        });
      };
      var prevSuppress = suppressChangeNotify;
      if (opts.silent && history && typeof history.disable === 'function') history.disable();
      suppressChangeNotify = true;
      try {
        batch(run);
      } finally {
        suppressChangeNotify = prevSuppress;
        if (opts.silent && history && typeof history.enable === 'function') history.enable();
      }
      if (opts.silent && history && typeof history.clean === 'function') history.clean();
      if (changed && !opts.silent) {
        historyPush('按角度刷新鱼骨图');
        notifyChanged();
      }
      return changed;
    }

    function reanchorPorts(node) {
      if (!node || !node.isNode || !node.isNode()) return;
      if (node.shape === 'dot-node') return;
      var incoming = (graph.getIncomingEdges && graph.getIncomingEdges(node)) || [];
      if (!incoming.length) return;
      var nd = (node.getData && node.getData()) || {};
      var dir = nd.portDir || 'auto';
      incoming.forEach(function (edge) {
        var t = edge.getTarget && edge.getTarget();
        if (!t || t.cell !== node.id) return;
        var current = t.port || '';
        var isH = current === 'port-left' || current === 'port-right';
        var isV = current === 'port-top' || current === 'port-bottom';
        var port = null;
        if (dir === 'left' || dir === 'right' || dir === 'top' || dir === 'bottom') {
          port = 'port-' + dir;
        }
        else {
          var sourceTerminal = edge.getSource && edge.getSource();
          var p = node.shape === 'text-node'
            ? (terminalModelPoint(sourceTerminal, 0) || parentAnchorPoint(edge))
            : parentAnchorPoint(edge);
          if (p) {
            var b = node.getBBox();
            var cx = b.x + b.width / 2;
            var cy = b.y + b.height / 2;
            if (node.shape === 'text-node') {
              // 按拖动后的源端到文本框中心方向自动选边，避免受原端口位置影响。
              var ax = cx - p.x;
              var ay = cy - p.y;
              var arrowAxis = Math.abs(ax) >= Math.abs(ay) ? 'h' : 'v';
              port = arrowAxis === 'h'
                ? (ax >= 0 ? 'port-left' : 'port-right')
                : (ay >= 0 ? 'port-top' : 'port-bottom');
            } else {
              var dx = p.x - cx;
              var dy = p.y - cy;
              var autoAxis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
              var axis = isH ? 'h' : (isV ? 'v' : autoAxis);
              port = axis === 'h' ? (dx <= 0 ? 'port-left' : 'port-right') : (dy <= 0 ? 'port-top' : 'port-bottom');
            }
          }
        }
        if (port && t.port !== port) {
          edge.setTarget({ cell: node.id, port: port });
        }
      });
    }

    graph.on('node:moved', function (args) {
      var n = args.node;
      var d = n.getData && n.getData();
      if (n.shape === 'dot-node' && d && d.attachEdge) {
        var edge = graph.getCellById(d.attachEdge);
        if (edge && edge.isEdge && edge.isEdge()) {
          var b = n.getBBox();
          var c = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
          var p = edgePointAt(edge, d.ratio == null ? 0.5 : d.ratio);
          if (Math.hypot(p.x - c.x, p.y - c.y) > 18) {
            delete d.attachEdge;
            delete d.ratio;
            n.setData(d, { silent: true });
            historyPush('连接点脱离线段');
            notifyToast('连接点已脱离线段，可自由放置');
          } else {
            d.ratio = ratioAtPoint(edge, c);
            n.setData(d, { silent: true });
          }
        }
      }
      if (n.shape === 'dot-node' && d && d.attachNode) {
        var host = graph.getCellById(d.attachNode);
        if (host && host.isNode && host.isNode()) {
          var b2 = n.getBBox();
          var c2 = { x: b2.x + b2.width / 2, y: b2.y + b2.height / 2 };
          var hp = host.position();
          var hs = host.getSize();
          var sy = hp.y + hs.height / 2;
          var rx = (c2.x - hp.x) / (hs.width || 1);
          if (Math.abs(c2.y - sy) > 18 || rx < -0.2 || rx > 1.2) {
            delete d.attachNode;
            delete d.ratioX;
            n.setData(d, { silent: true });
            historyPush('连接点脱离鱼干');
            notifyToast('连接点已脱离鱼干，可自由放置');
          } else {
            d.ratioX = Math.max(0, Math.min(1, rx));
            n.setData(d, { silent: true });
          }
        }
      }
      reanchorPorts(n);
      ensureDotBridges();
    });

    // ---------- 空画布引导 ----------
    var emptyOverlay = null;
    if (!readonly && container.parentNode) {
      emptyOverlay = document.createElement('div');
      emptyOverlay.className = 'ygt-empty-hint';
      emptyOverlay.innerHTML =
        '<p>画布还是空的，从左侧拖入元素开始搭建</p>' +
        '<button type="button">生成空骨架</button>';
      emptyOverlay.style.display = 'none';
      container.parentNode.appendChild(emptyOverlay);
      emptyOverlay.querySelector('button').addEventListener('click', function () {
        if (typeof o.onEmptyAction === 'function') o.onEmptyAction();
      });
    }
    function updateEmptyHint() {
      if (!emptyOverlay) return;
      var empty = graph.getNodes().length === 0 && graph.getEdges().length === 0;
      emptyOverlay.style.display = empty ? 'flex' : 'none';
    }
    graph.on('cell:added', updateEmptyHint);
    graph.on('cell:removed', updateEmptyHint);

    // ---------- 预览模式 ----------
    var previewOverlay = null;
    if (!readonly && container.parentNode) {
      previewOverlay = document.createElement('div');
      previewOverlay.className = 'ygt-preview-overlay';
      previewOverlay.innerHTML =
        '<div class="ygt-preview-title">预览模式（端口与编辑框已隐藏）</div>' +
        '<button type="button">退出预览</button>';
      previewOverlay.style.display = 'none';
      container.parentNode.appendChild(previewOverlay);
      previewOverlay.querySelector('button').addEventListener('click', function () {
        setPreview(false);
      });
    }
    function setPreview(on) {
      container.classList.toggle('ygt-preview', !!on);
      if (previewOverlay) previewOverlay.style.display = on ? 'flex' : 'none';
      if (typeof o.onPreviewChange === 'function') o.onPreviewChange(!!on);
    }
    function withHiddenPorts(fn) {
      container.classList.add('ygt-hide-ports');
      try {
        fn();
      } finally {
        setTimeout(function () {
          container.classList.remove('ygt-hide-ports');
        }, 600);
      }
    }

    // ---------- 触屏基础支持（单指平移 / 双指缩放） ----------
    function initTouch() {
      var oneStart = null;
      var pinchStart = 0;
      function onCanvas(el) {
        return !el || !el.closest ||
          (!el.closest('.x6-node') && !el.closest('.x6-edge') && !el.closest('.x6-widget-stencil'));
      }
      container.addEventListener('touchstart', function (e) {
        if (!e.isTrusted) return;
        if (e.touches.length === 1 && onCanvas(e.target)) {
          oneStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          e.preventDefault();
        } else if (e.touches.length === 2) {
          oneStart = null;
          pinchStart = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY);
          e.preventDefault();
        }
      }, { passive: false });
      container.addEventListener('touchmove', function (e) {
        if (!e.isTrusted) return;
        if (oneStart && e.touches.length === 1) {
          var dx = e.touches[0].clientX - oneStart.x;
          var dy = e.touches[0].clientY - oneStart.y;
          oneStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          if (typeof graph.translateBy === 'function') graph.translateBy(dx, dy);
      else if (typeof graph.translate === 'function') graph.translate(dx, dy);
          e.preventDefault();
        } else if (e.touches.length === 2 && pinchStart > 0) {
          var dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY);
          if (dist > 0) {
            graph.zoom(dist / pinchStart);
            pinchStart = dist;
          }
          e.preventDefault();
        }
      }, { passive: false });
      container.addEventListener('touchend', function () {
        oneStart = null;
        pinchStart = 0;
      }, { passive: true });
    }
    initTouch();

    // ---------- 缩放控制 ----------
    var zoomWrap = container.parentNode;
    var zoomCtl = null;
    var zoomHost = zoomWrap && zoomWrap.querySelector && zoomWrap.querySelector('.ygt-canvas-tools');
    if (zoomWrap) {
      zoomCtl = document.createElement('div');
      zoomCtl.className = 'ygt-zoom';
      zoomCtl.innerHTML =
        '<button type="button" data-zoom="-" title="缩小">−</button>' +
        '<span class="ygt-zoom-val" aria-live="polite">100%</span>' +
        '<button type="button" data-zoom="+" title="放大">＋</button>' +
        '<button type="button" data-zoom="fit" title="适应画布">适应</button>' +
        '<button type="button" data-zoom="1" title="实际大小">1:1</button>';
      if (zoomHost && zoomHost.firstChild) {
        zoomHost.insertBefore(zoomCtl, zoomHost.firstChild);
      } else {
        (zoomHost || zoomWrap).appendChild(zoomCtl);
      }
      zoomCtl.addEventListener('click', function (e) {
        var a = e.target && e.target.getAttribute && e.target.getAttribute('data-zoom');
        if (!a) return;
        if (a === '-') setScale(currentScale() / 1.2);
        else if (a === '+') setScale(currentScale() * 1.2);
        else if (a === 'fit') { graph.zoomToFit({ padding: 30, maxScale: 1 }); updateZoom(); }
        else if (a === '1') setScale(1);
      });
    }
    function currentScale() {
      return (typeof graph.zoom === 'function' && graph.zoom()) || 1;
    }
    function setScale(s) {
      var v = Math.max(0.2, Math.min(4, s));
      if (typeof graph.zoomTo === 'function') graph.zoomTo(v);
      updateZoom();
    }
    function updateZoom() {
      if (zoomCtl) zoomCtl.querySelector('.ygt-zoom-val').textContent = Math.round(currentScale() * 100) + '%';
    }
    graph.on('scale', updateZoom);
    updateZoom();

    // ---------- 连接线工具 ----------
    var lineMode = false;
    var drawing = false;
    var tempEdge = null;
    var startLocal = null;
    function snapTerminal(p) {
      var best = null, bestD = 20 * 20;
      graph.getNodes().forEach(function (n) {
        var b = n.getBBox();
        var c = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
        var d = Math.pow(c.x - p.x, 2) + Math.pow(c.y - p.y, 2);
        if (d < bestD) { bestD = d; best = n.id; }
      });
      return best ? { cell: best } : { x: p.x, y: p.y };
    }
    function setLineMode(on) {
      lineMode = !!on;
      container.classList.toggle('ygt-line-mode', lineMode);
      if (lineMode) {
        if (typeof selection.disableRubberband === 'function') selection.disableRubberband();
      } else {
        if (typeof selection.enableRubberband === 'function') selection.enableRubberband();
      }
      if (typeof o.onLineModeChange === 'function') o.onLineModeChange(lineMode);
    }
    container.addEventListener('mousedown', function (e) {
      if (!lineMode || e.button !== 0) return;
      if (e.target && e.target.closest && (e.target.closest('.x6-node') || e.target.closest('.x6-edge'))) return;
      var p = graph.clientToLocal({ x: e.clientX, y: e.clientY });
      startLocal = p;
      drawing = true;
      tempEdge = graph.addEdge({ shape: 'bone-edge', source: { x: p.x, y: p.y }, target: { x: p.x, y: p.y } });
      e.preventDefault();
    });
    container.addEventListener('mousemove', function (e) {
      if (!drawing || !tempEdge) return;
      var p = graph.clientToLocal({ x: e.clientX, y: e.clientY });
      tempEdge.setTarget({ x: p.x, y: p.y });
    });
    container.addEventListener('mouseup', function (e) {
      if (!drawing || !tempEdge) return;
      drawing = false;
      var p = graph.clientToLocal({ x: e.clientX, y: e.clientY });
      if (Math.hypot(p.x - startLocal.x, p.y - startLocal.y) < 5) {
        graph.removeCells([tempEdge]);
        tempEdge = null;
        return;
      }
      tempEdge.setSource(snapTerminal(startLocal));
      tempEdge.setTarget(snapTerminal(p));
      try {
        tempEdge.addTools([{ name: 'source-anchor' }, { name: 'target-anchor' }]);
      } catch (err) { /* 端点工具不可用时忽略 */ }
      historyPush('绘制连接线');
      tempEdge = null;
    });

    // ---------- 右键菜单 ----------
    var ctxMenu = document.createElement('div');
    ctxMenu.className = 'ygt-ctx-menu';
    document.body.appendChild(ctxMenu);
    function hideMenu() { ctxMenu.style.display = 'none'; ctxMenu.innerHTML = ''; }
    document.addEventListener('mousedown', function (e) {
      if (!ctxMenu.contains(e.target)) hideMenu();
    });
    function showMenu(x, y, cell) {
      if (readonly) return;
      ctxMenu.innerHTML = '';
      ctxMenu.style.left = x + 'px';
      ctxMenu.style.top = y + 'px';
      ctxMenu.style.display = 'block';
      function item(label, fn) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', function () { fn(); hideMenu(); });
        ctxMenu.appendChild(b);
      }
      item('复制', function () { copySelected(); });
      item('粘贴', function () { pasteCells(); });
      item('置顶', function () { if (cell && cell.toFront) cell.toFront(); });
      item('置底', function () { if (cell && cell.toBack) cell.toBack(); });
      if (cell && cell.isEdge && cell.isEdge()) {
        var src = cell.getSource && cell.getSource();
        var tgt = cell.getTarget && cell.getTarget();
        if (src && src.cell) {
          item('解除起点吸附', function () { detachTerminal(cell, true); });
        }
        if (tgt && tgt.cell) {
          item('解除终点吸附', function () { detachTerminal(cell, false); });
        }
      } else if (cell && cell.isNode && cell.isNode()) {
        graph.getEdges().forEach(function (e) {
          if (e.shape !== 'bone-edge') return;
          var t = e.getTarget && e.getTarget();
          if (!t || (t.cell || t) !== cell.id) return;
          var s = e.getSource && e.getSource();
          var sc = s && s.cell ? graph.getCellById(s.cell) : null;
          if (sc && sc.isEdge && sc.isEdge()) {
            item('与父线段解除吸附', function () { detachTerminal(e, true); });
          }
        });
      }
      if (cell && cell.shape === 'image-node') {
        var d = cell.getData() || {};
        item(d.isBackground ? '取消背景' : '设为背景', function () {
          setImageBackground(cell, !d.isBackground);
        });
      }
      item('删除', function () {
        if (cell) graph.removeCells([cell]);
        else removeSelected();
      });
    }
    function detachTerminal(edge, isSource) {
      if (!edge || !edge.isEdge || !edge.isEdge()) return;
      var local = edgePointAt(edge, isSource ? 0 : 1);
      clearLegacyLine(edge);
      if (isSource) edge.setSource({ x: local.x, y: local.y });
      else edge.setTarget({ x: local.x, y: local.y });
      historyPush(isSource ? '解除起点吸附' : '解除终点吸附');
      notifyChanged();
      if (typeof o.onSelection === 'function') o.onSelection(selectedCells());
    }
    graph.on('node:contextmenu', function (args) {
      if (readonly) return;
      if (args.e) args.e.preventDefault();
      selection.reset([args.node]);
      showMenu(args.e.clientX, args.e.clientY, args.node);
    });
    graph.on('edge:contextmenu', function (args) {
      if (readonly) return;
      if (args.e) args.e.preventDefault();
      selection.reset([args.edge]);
      showMenu(args.e.clientX, args.e.clientY, args.edge);
    });

    function refreshNodeTextViews() {
      graph.getNodes().forEach(function (n) {
        if (!n || (n.shape !== 'bone-node' && n.shape !== 'group-node')) return;
        fitWrapText(n, true);
        var v = n.findView && n.findView(graph);
        if (v && typeof v.update === 'function') v.update();
      });
    }

    // ---------- 文档操作 ----------
    function applyCells(cells) {
      suppressLegacySync = true;
      try {
        graph.fromJSON({ cells: Y.core.ensureHierarchy(cells || []) });
        // 带 legacyLine 的边按保存的绝对坐标绘制；旧边继续使用普通直线。
        graph.getEdges().forEach(function (e) {
          if (e.shape !== 'bone-edge' || typeof e.setConnector !== 'function') return;
          e.setConnector({ name: hasLegacyLine(e) ? 'legacy-line' : 'normal' });
        });
      } finally {
        suppressLegacySync = false;
      }
      // 归一化端口方向：修复旧文档中竖向/横向端口接反的问题（手动 portDir 优先）
      graph.getNodes().forEach(function (n) {
        reanchorPorts(n);
      });
      graph.getNodes().forEach(function (n) {
        var d = n.getData && n.getData();
        if (n.shape === 'image-node' && d && d.isBackground) {
          n.setZIndex(-100);
          if (typeof n.setInteracting === 'function') n.setInteracting(false);
        }
      });
      syncHierarchyFromLines();
      syncAttachedDots();
      ensureDotBridges();
      graph.zoomToFit({ padding: 30, maxScale: 1 });
      // 首帧后只重算 edge-to-edge 依赖链上的视图：父线先于子线更新，避免同步阶段沿用旧路径
      var refreshEdges = function () {
        var byId = {};
        var edges = graph.getEdges().filter(function (e) {
          if (e.shape !== 'bone-edge') return false;
          byId[e.id] = e;
          return true;
        });
        function terminalRef(t) {
          if (!t) return null;
          var id = typeof t === 'object' ? (t.cell || null) : t;
          return id && byId[id] ? byId[id] : null;
        }
        function parentOf(e) {
          return terminalRef(e.getSource && e.getSource()) ||
            terminalRef(e.getTarget && e.getTarget());
        }
        var depthMemo = {};
        function depthOf(e) {
          if (depthMemo[e.id] != null) return depthMemo[e.id];
          depthMemo[e.id] = 0;
          var p = parentOf(e);
          depthMemo[e.id] = p ? depthOf(p) + 1 : 0;
          return depthMemo[e.id];
        }
        var affected = [];
        edges.forEach(function (e) {
          var p = parentOf(e);
          if (!p) return;
          if (affected.indexOf(e) === -1) affected.push(e);
          var cur = p;
          var seen = {};
          while (cur) {
            if (seen[cur.id]) break;
            seen[cur.id] = true;
            if (affected.indexOf(cur) === -1) affected.push(cur);
            cur = parentOf(cur);
          }
        });
        affected.sort(function (a, b) {
          return depthOf(a) - depthOf(b);
        });
        affected.forEach(function (e) {
          var v = e.findView && e.findView(graph);
          if (v && typeof v.update === 'function') v.update();
        });
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(function () {
          refreshEdges();
          refreshNodeTextViews();
          requestAnimationFrame(function () {
            refreshEdges();
            refreshNodeTextViews();
          });
        });
      } else {
        setTimeout(function () {
          refreshEdges();
          refreshNodeTextViews();
        }, 100);
      }
      selection.clean();
      updateEmptyHint();
      notifySelection();
    }

    function getCells() {
      var cells = graph.toJSON().cells;
      // 持久化时保留旧版本可识别的 connector，legacyLine 载入后再由新版切换渲染。
      cells.forEach(function (cell) {
        if (!cell || cell.shape !== 'bone-edge') return;
        var line = cell.data && cell.data.legacyLine;
        if (Y.shapes && typeof Y.shapes.validLegacyLine === 'function' && Y.shapes.validLegacyLine(line)) {
          cell.connector = { name: 'normal' };
        }
      });
      return cells;
    }

    function repairDanglingEdges() {
      var spine = graph.getNodes().find(function (n) { return n.shape === 'fish-spine'; });
      var head = graph.getNodes().find(function (n) { return n.shape === 'fish-head'; });
      var spineY = spine ? spine.position().y + spine.getSize().height / 2 : 420;
      var onSpinePoint = function (p) {
        if (!spine || !p || typeof p.x !== 'number' || typeof p.y !== 'number') return false;
        var sp = spine.position();
        var ss = spine.getSize();
        return p.x >= sp.x - 4 && p.x <= sp.x + ss.width + 4 && Math.abs(p.y - spineY) <= 10;
      };
      graph.getNodes().forEach(function (n) {
        if (n.shape !== 'bone-node' && n.shape !== 'group-node') return;
        var d = n.getData() || {};
        var pid = d.parentId;
        if (!pid || pid === '__ROOT__') return;
        var parent = graph.getCellById(pid);
        if (!parent || !parent.isNode || !parent.isNode()) return;
        if (parent.shape !== 'bone-node' && parent.shape !== 'group-node' && parent.shape !== 'fish-head') return;
        var incoming = (graph.getIncomingEdges(n) || []).find(function (e) { return e.shape === 'bone-edge'; });
        var needsRepair = false;
        if (!incoming) {
          needsRepair = true;
        } else {
          var s = incoming.getSource() || {};
          if (s.cell) {
            needsRepair = !graph.getCellById(s.cell);
          } else if (typeof s.x === 'number' && typeof s.y === 'number') {
            needsRepair = parent.shape !== 'fish-head' || !onSpinePoint(s);
          } else {
            needsRepair = true;
          }
        }
        if (!needsRepair) return;
        if (!incoming) {
          incoming = graph.addEdge({
            id: 'fix_e_' + n.id,
            shape: 'bone-edge',
            source: { x: 0, y: 0 },
            target: { cell: n.id, port: 'port-left' },
            attrs: { line: { stroke: '#1a73e8', strokeWidth: 2, targetMarker: blockMarkerAttrs(10, 8, 2) } }
          });
        }
        var nPos = n.position();
        if (parent.shape === 'fish-head') {
          incoming.setSource({ x: nPos.x, y: spineY });
          var cy = nPos.y + n.getSize().height / 2;
          incoming.setTarget({ cell: n.id, port: cy < spineY ? 'port-bottom' : 'port-top' });
          return;
        }
        var siblings = graph.getNodes().filter(function (x) {
          if (x.shape !== 'bone-node' && x.shape !== 'group-node') return false;
          var xd = x.getData() || {};
          return xd.parentId === parent.id;
        });
        var order = 0;
        siblings.forEach(function (x) {
          var xd = x.getData() || {};
          if (xd.order == null) return;
          if (x.id === n.id) {
            order = typeof d.order === 'number' ? d.order : xd.order;
          }
        });
        var ratio = siblings.length > 0 ? (order + 1) / (siblings.length + 1) : 0.5;
        var parentEdge = (graph.getIncomingEdges(parent) || []).find(function (e) { return e.shape === 'bone-edge'; });
        if (parentEdge) {
          incoming.setSource({ cell: parentEdge.id, anchor: { name: 'ratio', args: { ratio: ratio } } });
        } else {
          incoming.setSource({ cell: parent.id });
        }
        incoming.setTarget({ cell: n.id, port: 'port-left' });
      });
    }

    function syncHierarchyFromLines() {
      repairDanglingEdges();
      var cells = getCells();
      if (!Y.core || typeof Y.core.syncFromLines !== 'function') return cells;
      Y.core.syncFromLines(cells);
      cells.forEach(function (c) {
        if (!c || !c.data) return;
        var n = graph.getCellById(c.id);
        if (n && n.isNode && n.isNode()) n.setData(c.data, { silent: true });
      });
      return cells;
    }

    function setBackground(color) {
      var el = container.querySelector('.x6-graph-background');
      if (el) el.style.backgroundColor = color || '#ffffff';
    }

    function getBackground() {
      var el = container.querySelector('.x6-graph-background');
      if (el) return getComputedStyle(el).backgroundColor;
      return '#ffffff';
    }

    return {
      graph: graph,
      selection: selection,
      history: history,
      keyboard: keyboard,
      clipboard: clipboard,
      exportPlugin: exportPlugin,
      transform: transformPlugin,
      stencil: stencil,
      selectedCells: selectedCells,
      removeSelected: removeSelected,
      batch: batch,
      historyLog: historyLog,
      historyPush: historyPush,
      copySelected: copySelected,
      cutSelected: cutSelected,
      pasteCells: pasteCells,
      duplicateSelected: duplicateSelected,
      applyCells: applyCells,
      getCells: getCells,
      syncHierarchyFromLines: syncHierarchyFromLines,
      captureLegacyLines: function (edgeIds) {
        return syncLegacyLines({ edgeIds: edgeIds || null, preferLegacy: false, forceView: true });
      },
      setLegacySyncSuppressed: function (value) {
        suppressLegacySync = !!value;
      },
      layoutByAngle: layoutByAngle,
      addDotOnEdge: addDotOnEdge,
      addDotOnNode: addDotOnNode,
      reanchorPorts: reanchorPorts,
      getAttachedDots: getAttachedDots,
      setImageBackground: setImageBackground,
      testMoveDot: testMoveDot,
      getEdgePointAt: function (edgeId, ratio) {
        var edge = graph.getCellById(edgeId);
        if (!edge) return null;
        return edgePointAt(edge, ratio);
      },
      setPreview: setPreview,
      setLineMode: setLineMode,
      withHiddenPorts: withHiddenPorts,
      setBackground: setBackground,
      getBackground: getBackground,
      notifyChanged: notifyChanged
    };
  }

  Y.canvas = { create: create };
})(window.YGT);
