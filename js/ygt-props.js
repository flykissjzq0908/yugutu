/* 鱼骨图编辑器：右侧属性面板 */
window.YGT = window.YGT || {};
(function (Y) {
  'use strict';

  var FIELD_HTML =
    '<div class="prop-group">' +
    '  <label class="prop-label">画布背景</label>' +
    '  <input type="color" id="prop-bg" value="#ffffff">' +
    '</div>' +
    '<div class="prop-divider"></div>' +
    '<h3 id="prop-title">未选中元素</h3>' +
    '<div id="prop-body"></div>' +
    '<div class="btn-row">' +
    '  <button id="prop-copy" type="button" disabled>复制</button>' +
    '  <button id="prop-paste" type="button" disabled>粘贴</button>' +
    '  <button id="prop-front" type="button" disabled>置顶</button>' +
    '  <button id="prop-back" type="button" disabled>置底</button>' +
    '</div>' +
    '<button id="prop-delete" type="button" disabled>删除选中</button>';

  var NODE_HTML =
    '<div class="prop-group"><label class="prop-label">文本</label>' +
    '<input type="text" id="prop-text" placeholder="双击画布也可编辑"></div>' +
    '<div class="prop-grid">' +
    '  <div class="prop-group"><label class="prop-label">字号</label><input type="number" id="prop-font-size" min="8" max="72"></div>' +
    '  <div class="prop-group"><label class="prop-label">字色</label><input type="color" id="prop-font-color" value="#1f2937"></div>' +
    '  <div class="prop-group"><label class="prop-label">字重</label><select id="prop-font-weight"><option value="400">常规</option><option value="600">半粗</option><option value="700">加粗</option></select></div>' +
    '  <div class="prop-group"><label class="prop-label">填充</label><input type="color" id="prop-fill" value="#ffffff"></div>' +
    '  <div class="prop-group"><label class="prop-label">边框</label><input type="color" id="prop-stroke" value="#94a3b8"></div>' +
    '  <div class="prop-group"><label class="prop-label">线宽</label><input type="number" id="prop-stroke-width" min="0" max="12"></div>' +
    '</div>' +
    '<div class="prop-group"><label class="prop-label">不透明度 <span id="prop-opacity-val"></span></label>' +
    '<input type="range" id="prop-opacity" min="0" max="100" value="100"></div>' +
    '<div class="prop-divider"></div>' +
    '<div class="prop-group"><label class="prop-label">超链接</label>' +
    '<input type="text" id="prop-url" placeholder="可选，https://..."></div>' +
    '<div class="prop-group check"><label><input type="checkbox" id="prop-url-new-tab" checked> 新窗口打开</label></div>' +
    '<button id="prop-open-url" type="button" disabled>打开链接</button>';

  var SIZE_HTML =
    '<div class="prop-grid">' +
    '  <div class="prop-group"><label class="prop-label">宽</label><input type="number" id="prop-node-width" min="20" max="2000"></div>' +
    '  <div class="prop-group"><label class="prop-label">高</label><input type="number" id="prop-node-height" min="10" max="1200"></div>' +
    '</div>';

  var SPINE_DOT_HTML =
    '<button id="prop-spine-add-dot" type="button" class="ghost">在鱼干上添加连接点</button>';

  function dirHtml(axis) {
    var opts = axis === 'v'
      ? '<option value="auto">自动</option><option value="top">上</option><option value="bottom">下</option>'
      : '<option value="auto">自动</option><option value="left">左</option><option value="right">右</option>';
    return '<div class="prop-group"><label class="prop-label">连接点方向</label>' +
      '<select id="prop-port-dir">' + opts + '</select></div>';
  }

  var FISH_HTML =
    '<div class="prop-grid">' +
    '  <div class="prop-group"><label class="prop-label">鱼形预设</label>' +
    '  <select id="prop-fish-preset">' +
    '    <option value="ygt1">预设 1</option><option value="ygt2">预设 2</option>' +
    '    <option value="ygt3">预设 3</option><option value="ygt4">预设 4</option>' +
    '    <option value="ygt5">预设 5</option><option value="ygt6">预设 6</option>' +
    '    <option value="ygt7">预设 7</option>' +
    '  </select></div>' +
    '  <div class="prop-group"><label class="prop-label">朝向</label>' +
    '  <select id="prop-fish-dir"><option value="toright">向右</option><option value="toleft">向左</option></select></div>' +
    '</div>';

  var EDGE_HTML =
    '<div class="prop-group"><label class="prop-label">连线预设</label>' +
    '<select id="prop-edge-preset">' +
    '<option value="custom">自定义</option><option value="default">默认蓝</option>' +
    '<option value="bold">深色加粗</option><option value="warm">暖色</option>' +
    '<option value="dash">蓝色虚线</option>' +
    '</select></div>' +
    '<div class="prop-grid">' +
    '  <div class="prop-group"><label class="prop-label">线条颜色</label><input type="color" id="prop-line-color" value="#1a73e8"></div>' +
    '  <div class="prop-group"><label class="prop-label">线宽</label><input type="number" id="prop-line-width" min="1" max="20"></div>' +
    '  <div class="prop-group"><label class="prop-label">箭头大小</label><input type="number" id="prop-arrow" min="4" max="30"></div>' +
    '</div>' +
    '<div class="prop-group"><label class="prop-label">不透明度 <span id="prop-opacity-val"></span></label>' +
    '<input type="range" id="prop-opacity" min="0" max="100" value="100"></div>' +
    '<div class="prop-group check"><label><input type="checkbox" id="prop-dash"> 虚线线条</label></div>' +
    '<button id="prop-edge-add-dot" type="button" class="ghost">在线上添加连接点</button>';

  var IMAGE_HTML =
    '<div class="prop-group"><label class="prop-label">图片地址</label>' +
    '<input type="text" id="prop-image-url" placeholder="https://... 或选择本地图片"></div>' +
    '<div class="prop-group"><label class="prop-label">本地图片</label>' +
    '<input type="file" id="prop-image-file" accept="image/*"></div>' +
    '<div class="btn-row">' +
    '  <button id="prop-bg-on" type="button" class="ghost">设为背景</button>' +
    '  <button id="prop-bg-off" type="button" class="ghost">取消背景</button>' +
    '</div>';

  var BATCH_HTML =
    '<p class="prop-info">样式将应用到全部选中元素</p>' +
    '<div class="prop-grid">' +
    '  <div class="prop-group"><label class="prop-label">字体颜色</label><input type="color" id="prop-batch-font-color" value="#1f2937"></div>' +
    '  <div class="prop-group"><label class="prop-label">填充色</label><input type="color" id="prop-batch-fill" value="#ffffff"></div>' +
    '  <div class="prop-group"><label class="prop-label">边框色</label><input type="color" id="prop-batch-stroke" value="#94a3b8"></div>' +
    '  <div class="prop-group"><label class="prop-label">边框线宽</label><input type="number" id="prop-batch-stroke-width" min="0" max="12"></div>' +
    '  <div class="prop-group"><label class="prop-label">线条颜色</label><input type="color" id="prop-batch-line-color" value="#1a73e8"></div>' +
    '  <div class="prop-group"><label class="prop-label">线宽</label><input type="number" id="prop-batch-line-width" min="1" max="20"></div>' +
    '</div>' +
    '<div class="prop-grid">' +
    '  <div class="prop-group"><label class="prop-label">字号</label><input type="number" id="prop-batch-font-size" min="8" max="72"></div>' +
    '  <div class="prop-group"><label class="prop-label">字重</label><select id="prop-batch-font-weight"><option value="">保持</option><option value="400">常规</option><option value="600">半粗</option><option value="700">加粗</option></select></div>' +
    '  <div class="prop-group"><label class="prop-label">箭头大小</label><input type="number" id="prop-batch-arrow" min="4" max="30"></div>' +
    '  <div class="prop-group check"><label><input type="checkbox" id="prop-batch-dash"> 虚线线条</label></div>' +
    '</div>' +
    '<div class="prop-group"><label class="prop-label">不透明度 <span id="prop-batch-opacity-val"></span></label>' +
    '<input type="range" id="prop-batch-opacity" min="0" max="100" value="100"></div>' +
    '<div class="align-row">' +
    '  <button type="button" data-align="left">左对齐</button>' +
    '  <button type="button" data-align="center-h">水平居中</button>' +
    '  <button type="button" data-align="right">右对齐</button>' +
    '  <button type="button" data-align="top">顶对齐</button>' +
    '  <button type="button" data-align="center-v">垂直居中</button>' +
    '  <button type="button" data-align="bottom">底对齐</button>' +
    '  <button type="button" data-align="dist-h">横向等距</button>' +
    '  <button type="button" data-align="dist-v">纵向等距</button>' +
    '</div>';

  var INFO_HTML = '<p class="prop-info" id="prop-info"></p>';

  function mount(containerId, ctx) {
    var host = document.getElementById(containerId);
    if (!host) return null;
    host.innerHTML = FIELD_HTML;
    host.insertAdjacentHTML('beforeend', INFO_HTML);

    var nodeBox = host.querySelector('#prop-body');
    var title = host.querySelector('#prop-title');
    var deleteBtn = host.querySelector('#prop-delete');
    var info = host.querySelector('#prop-info');
    var bg = host.querySelector('#prop-bg');
    var bodyHtml = '';

    function selected() {
      return ctx.canvas.selectedCells();
    }

    function refresh() {
      var cells = selected();
      bg.value = ctx.doc.canvas.background || '#ffffff';
      host.querySelector('#prop-front').disabled = cells.length === 0;
      host.querySelector('#prop-back').disabled = cells.length === 0;
      host.querySelector('#prop-copy').disabled = cells.length === 0;
      var clip = ctx.canvas.clipboard;
      host.querySelector('#prop-paste').disabled = !clip || !clip.getCellsInClipboard ||
        clip.getCellsInClipboard().length === 0;
      if (!cells.length) {
        title.textContent = '未选中元素';
        nodeBox.innerHTML = '';
        deleteBtn.disabled = true;
        return;
      }
      title.textContent = '已选中 ' + cells.length + ' 个元素';
      deleteBtn.disabled = false;
      var first = cells[0];
      var isEdge = first.isEdge && first.isEdge();
      var isNode = first.isNode && first.isNode();
      if (cells.length === 1 && isNode) {
        showNode(first);
      } else if (cells.length === 1 && isEdge) {
        showEdge(first);
      } else if (cells.length > 1) {
        showBatch(cells);
      } else {
        nodeBox.innerHTML = '';
        info.textContent = '多选时仅支持删除操作';
      }
    }

    function val(id, fallback) {
      var el = host.querySelector('#' + id);
      return el ? el.value : fallback;
    }

    function setVal(id, v) {
      var el = host.querySelector('#' + id);
      if (el) el.value = v;
    }

    function nodeFields(cell) {
      var hasLabel = typeof cell.attr('label/text') === 'string';
      var html = hasLabel ? NODE_HTML : '';
      return html;
    }

    function incomingAxis(cell) {
      var g = ctx.canvas.graph;
      var axis = null;
      g.getEdges().forEach(function (e) {
        if (axis) return;
        var t = e.getTarget && e.getTarget();
        if (!t || t.cell !== cell.id) return;
        if (t.port === 'port-left' || t.port === 'port-right') axis = 'h';
        else if (t.port === 'port-top' || t.port === 'port-bottom') axis = 'v';
      });
      return axis;
    }

    function showNode(cell) {
      var hasLabel = typeof cell.attr('label/text') === 'string';
      var isFish = cell.shape === 'fish-head' || cell.shape === 'fish-tail';
      var isImage = cell.shape === 'image-node';
      var sizeOk = !isFish;
      var dirAxis = incomingAxis(cell);
      var showDir = !!dirAxis;
      var html = '';
      if (isFish) html += FISH_HTML;
      if (isImage) html += IMAGE_HTML;
      if (hasLabel) html += NODE_HTML;
      if (sizeOk) html += SIZE_HTML;
      if (showDir) html += dirHtml(dirAxis);
      if (cell.shape === 'fish-spine') {
        html += SPINE_DOT_HTML;
        var dots = ctx.canvas.getAttachedDots(cell.id);
        if (dots.length) {
          html += '<div class="spine-dot-list">' + dots.map(function (dot, i) {
            return '<div class="spine-dot-row"><span>连接点 ' + (i + 1) + '</span>' +
              '<button type="button" data-del-dot="' + dot.id + '">删除</button></div>';
          }).join('') + '</div>';
        }
      }
      nodeBox.innerHTML = html;
      info.textContent = html ? '' : '当前元素无文字属性';
      if (!html) return;
      var label = cell.attr('label') || {};
      var body = cell.attr('body') || {};
      if (isFish) {
        var data = cell.getData() || {};
        setVal('prop-fish-preset', data.ygtPreset || 'ygt1');
        setVal('prop-fish-dir', data.ygtDir || 'toright');
      }
      if (showDir) {
        var dd = cell.getData() || {};
        setVal('prop-port-dir', dd.portDir || 'auto');
      }
      if (isImage) {
        var href = cell.attr('image/xlinkHref') || '';
        setVal('prop-image-url', /^data:/.test(href) ? '(本地图片)' : href);
      }
      if (sizeOk) {
        var sz = cell.getSize();
        setVal('prop-node-width', sz.width);
        setVal('prop-node-height', sz.height);
      }
      if (hasLabel) {
        setVal('prop-text', label.text || '');
        setVal('prop-font-size', label.fontSize || 14);
        setVal('prop-font-color', toHex(label.fill) || '#1f2937');
        setVal('prop-font-weight', label.fontWeight || '400');
        setVal('prop-fill', toHex(body.fill) || '#ffffff');
        setVal('prop-stroke', toHex(body.stroke) || '#94a3b8');
        setVal('prop-stroke-width', body.strokeWidth || 1);
        setVal('prop-opacity', Math.round((body.opacity == null ? 1 : body.opacity) * 100));
        host.querySelector('#prop-opacity-val').textContent = val('prop-opacity') + '%';
        var nd = cell.getData() || {};
        setVal('prop-url', nd.url || '');
        host.querySelector('#prop-url-new-tab').checked = nd.openType !== 'self';
        host.querySelector('#prop-open-url').disabled = !nd.url;
      }
    }

    function showBatch(cells) {
      nodeBox.innerHTML = BATCH_HTML;
      info.textContent = '';
      var node = cells.find(function (c) { return c.isNode && c.isNode(); });
      var edge = cells.find(function (c) { return c.isEdge && c.isEdge(); });
      var lb = node ? (node.attr('label') || {}) : {};
      var nb = node ? (node.attr('body') || {}) : {};
      var le = edge ? (edge.attr('line') || {}) : {};
      setVal('prop-batch-font-color', toHex(lb.fill) || '#1f2937');
      setVal('prop-batch-font-size', lb.fontSize || 14);
      setVal('prop-batch-font-weight', lb.fontWeight || '');
      setVal('prop-batch-fill', toHex(nb.fill) || '#ffffff');
      setVal('prop-batch-stroke', toHex(nb.stroke) || '#94a3b8');
      setVal('prop-batch-stroke-width', nb.strokeWidth || 1);
      setVal('prop-batch-line-color', toHex(le.stroke) || '#1a73e8');
      setVal('prop-batch-line-width', le.strokeWidth || 2);
      setVal('prop-batch-arrow', (le.targetMarker || {}).width || 10);
      host.querySelector('#prop-batch-dash').checked = !!(le.strokeDasharray && le.strokeDasharray !== 'none');
      setVal('prop-batch-opacity', 100);
      host.querySelector('#prop-batch-opacity-val').textContent = '100%';
      var nodeCount = cells.filter(function (c) { return c.isNode && c.isNode(); }).length;
      nodeBox.querySelectorAll('[data-align]').forEach(function (btn) {
        btn.disabled = nodeCount < 2;
      });
    }

    function alignNodes(action) {
      var cells = selected().filter(function (c) { return c.isNode && c.isNode(); });
      if (cells.length < 2) return;
      ctx.canvas.batch(function () {
        var boxes = cells.map(function (n) {
          var p = n.position();
          var s = n.getSize();
          return { n: n, x: p.x, y: p.y, w: s.width, h: s.height };
        });
        var minX = Math.min.apply(null, boxes.map(function (b) { return b.x; }));
        var maxX = Math.max.apply(null, boxes.map(function (b) { return b.x + b.w; }));
        var minY = Math.min.apply(null, boxes.map(function (b) { return b.y; }));
        var maxY = Math.max.apply(null, boxes.map(function (b) { return b.y + b.h; }));
        var cx = (minX + maxX) / 2;
        var cy = (minY + maxY) / 2;
        boxes.forEach(function (b) {
          var x = b.x, y = b.y;
          if (action === 'left') x = minX;
          else if (action === 'right') x = maxX - b.w;
          else if (action === 'center-h') x = cx - b.w / 2;
          else if (action === 'top') y = minY;
          else if (action === 'bottom') y = maxY - b.h;
          else if (action === 'center-v') y = cy - b.h / 2;
          b.n.position(x, y);
        });
        if (action === 'dist-h' || action === 'dist-v') {
          boxes.sort(function (a, b2) {
            return action === 'dist-h' ? a.x - b2.x : a.y - b2.y;
          });
          var total = boxes.reduce(function (s, b) { return s + (action === 'dist-h' ? b.w : b.h); }, 0);
          var span = action === 'dist-h' ? (maxX - minX) : (maxY - minY);
          var gap = boxes.length > 1 ? (span - total) / (boxes.length - 1) : 0;
          var cursor = action === 'dist-h' ? minX : minY;
          boxes.forEach(function (b) {
            if (action === 'dist-h') b.n.position(cursor, b.y);
            else b.n.position(b.x, cursor);
            cursor += (action === 'dist-h' ? b.w : b.h) + gap;
          });
        }
      });
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('对齐/分布');
      ctx.onChanged && ctx.onChanged();
    }

    function updateFishPair(preset, dir) {
      ctx.canvas.batch(function () {
        var graph = ctx.canvas.graph;
        if (Y.shapes && typeof Y.shapes.applyPresetStyle === 'function') {
          Y.shapes.applyPresetStyle(graph, preset, dir);
          return;
        }
        var head = graph.getNodes().find(function (n) { return n.shape === 'fish-head'; });
        var tail = graph.getNodes().find(function (n) { return n.shape === 'fish-tail'; });
        if (head) {
          var hs = Y.shapes.headSpec(preset, dir, head.attr('label/text') || '');
          head.resize(hs.width, hs.height);
          head.attr({
            body: { d: hs.path, fill: hs.fill, stroke: hs.stroke },
            label: { refX: hs.labelOffX, textAnchor: dir === 'toleft' ? 'end' : 'start' }
          });
          head.setData(Object.assign({}, head.getData(), { ygtPreset: preset, ygtDir: dir }));
        }
        if (tail) {
          var ts = Y.shapes.tailSpec(preset, dir, tail.position().x, tail.position().y);
          tail.resize(ts.width, ts.height);
          tail.attr({ body: { d: ts.path, fill: ts.fill, stroke: ts.stroke } });
          tail.setData(Object.assign({}, tail.getData(), { ygtPreset: preset, ygtDir: dir }));
        }
      });
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('鱼形切换');
      ctx.onChanged && ctx.onChanged();
    }

    function showEdge(cell) {
      nodeBox.innerHTML = EDGE_HTML;
      var line = cell.attr('line') || {};
      var marker = line.targetMarker || {};
      setVal('prop-edge-preset', 'custom');
      setVal('prop-line-color', toHex(line.stroke) || '#1a73e8');
      setVal('prop-line-width', line.strokeWidth || 2);
      setVal('prop-arrow', marker.width || 10);
      setVal('prop-opacity', Math.round((line.opacity == null ? 1 : line.opacity) * 100));
      host.querySelector('#prop-opacity-val').textContent = val('prop-opacity') + '%';
      var dash = host.querySelector('#prop-dash');
      dash.checked = !!(line.strokeDasharray && line.strokeDasharray !== 'none');
    }

    function toHex(color) {
      if (!color || color === 'none' || color === 'transparent') return null;
      if (/^#/.test(color)) return color;
      var div = document.createElement('div');
      div.style.color = color;
      document.body.appendChild(div);
      var rgb = getComputedStyle(div).color;
      document.body.removeChild(div);
      var m = rgb.match(/\d+/g);
      if (!m) return null;
      return '#' + m.slice(0, 3).map(function (n) {
        return ('0' + Number(n).toString(16)).slice(-2);
      }).join('');
    }

    function patchCell(fn) {
      var cells = selected();
      if (cells.length !== 1) return;
      fn(cells[0]);
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('修改样式');
      ctx.onChanged && ctx.onChanged();
    }

    host.addEventListener('change', function (e) {
      var id = e.target.id;
      if (id === 'prop-bg') {
        ctx.doc.canvas.background = e.target.value;
        ctx.canvas.setBackground(e.target.value);
        ctx.onChanged && ctx.onChanged();
        return;
      }
      if (id === 'prop-fish-preset' || id === 'prop-fish-dir') {
        updateFishPair(host.querySelector('#prop-fish-preset').value, host.querySelector('#prop-fish-dir').value);
        refresh();
        return;
      }
      if (id === 'prop-image-url') {
        var url = e.target.value.trim();
        if (url && !/^(https?:|data:|blob:|file:)/i.test(url)) {
          if (window.YGT && YGT.toast) YGT.toast('图片地址格式可能不正确', true);
        }
        patchCell(function (cell) {
          cell.attr({ image: { xlinkHref: url } });
        });
        refresh();
        return;
      }
      if (id === 'prop-image-file') {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          patchCell(function (cell) {
            cell.attr({ image: { xlinkHref: String(reader.result) } });
          });
          setVal('prop-image-url', '(本地图片)');
          ctx.onChanged && ctx.onChanged();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        return;
      }
      if (id === 'prop-node-width' || id === 'prop-node-height') {
        patchCell(function (cell) {
          var s = cell.getSize();
          var w = id === 'prop-node-width' ? Math.max(20, Number(e.target.value) || s.width) : s.width;
          var h = id === 'prop-node-height' ? Math.max(10, Number(e.target.value) || s.height) : s.height;
          cell.resize(w, h);
        });
        refresh();
        return;
      }
      if (id === 'prop-port-dir') {
        var dir = e.target.value;
        ctx.canvas.batch(function () {
          var cells = selected();
          if (cells.length === 1) {
            var cell = cells[0];
            var d = cell.getData() || {};
            d.portDir = dir;
            cell.setData(d);
            if (ctx.canvas.reanchorPorts) ctx.canvas.reanchorPorts(cell);
          }
        });
        if (ctx.canvas.historyPush) ctx.canvas.historyPush('修改连接点方向');
        ctx.onChanged && ctx.onChanged();
        return;
      }
      if (!e.target.closest('#prop-body')) return;
      if (id.indexOf('prop-batch-') === 0) {
        applyBatch(id, id === 'prop-batch-dash' ? e.target.checked : e.target.value);
        return;
      }
      if (id === 'prop-url' || id === 'prop-url-new-tab') {
        patchCell(function (cell) {
          var d = cell.getData() || {};
          if (id === 'prop-url') d.url = e.target.value.trim();
          else d.openType = e.target.checked ? 'blank' : 'self';
          cell.setData(d);
        });
        refresh();
        return;
      }
      if (id === 'prop-edge-preset') {
        var presets = {
          default: { stroke: '#1a73e8', strokeWidth: 2, dash: false },
          bold: { stroke: '#0f172a', strokeWidth: 3, dash: false },
          warm: { stroke: '#f59e0b', strokeWidth: 2, dash: false },
          dash: { stroke: '#1a73e8', strokeWidth: 2, dash: true }
        };
        var preset = presets[e.target.value];
        if (preset) {
          patchCell(function (cell) {
            var linePatch = { stroke: preset.stroke, strokeWidth: preset.strokeWidth };
            if (preset.dash) linePatch.strokeDasharray = '6 3';
            else linePatch.strokeDasharray = 'none';
            cell.attr({ line: linePatch });
          });
          refresh();
        }
        return;
      }
      patchCell(function (cell) {
        if (cell.isNode && cell.isNode()) {
          var labelPatch = {}, bodyPatch = {};
          if (id === 'prop-text') labelPatch.text = e.target.value;
          if (id === 'prop-font-size') labelPatch.fontSize = Number(e.target.value);
          if (id === 'prop-font-color') labelPatch.fill = e.target.value;
          if (id === 'prop-font-weight') labelPatch.fontWeight = e.target.value;
          if (id === 'prop-fill') bodyPatch.fill = e.target.value;
          if (id === 'prop-stroke') bodyPatch.stroke = e.target.value;
          if (id === 'prop-stroke-width') bodyPatch.strokeWidth = Number(e.target.value);
          if (id === 'prop-opacity') bodyPatch.opacity = Number(e.target.value) / 100;
          if (Object.keys(labelPatch).length) cell.attr({ label: labelPatch });
          if (Object.keys(bodyPatch).length) cell.attr({ body: bodyPatch });
        } else if (cell.isEdge && cell.isEdge()) {
          var linePatch = {};
          if (id === 'prop-line-color') linePatch.stroke = e.target.value;
          if (id === 'prop-line-width') linePatch.strokeWidth = Number(e.target.value);
          if (id === 'prop-opacity') linePatch.opacity = Number(e.target.value) / 100;
          if (id === 'prop-arrow') {
            var a = Number(e.target.value);
            var mh = Math.max(4, Math.round(a * 0.7));
            linePatch.targetMarker = Y.shapes.blockMarkerAttrs(a, mh, Number(cell.attr('line/strokeWidth')) || 2);
          }
          if (id === 'prop-dash') {
            if (e.target.checked) linePatch.strokeDasharray = '6 3';
            else linePatch.strokeDasharray = 'none';
          }
          if (Object.keys(linePatch).length) cell.attr({ line: linePatch });
        }
      });
      refresh();
    });

    host.addEventListener('input', function (e) {
      if (e.target.id === 'prop-opacity') {
        var valEl = host.querySelector('#prop-opacity-val');
        if (valEl) valEl.textContent = e.target.value + '%';
      }
      if (e.target.id === 'prop-batch-opacity') {
        var bv = host.querySelector('#prop-batch-opacity-val');
        if (bv) bv.textContent = e.target.value + '%';
      }
    });

    host.addEventListener('click', function (e) {
      var action = e.target && e.target.getAttribute && e.target.getAttribute('data-align');
      if (action) {
        alignNodes(action);
        refresh();
        return;
      }
      if (e.target.id === 'prop-open-url') {
        var cells = selected();
        var cell = cells[0];
        var d = cell && cell.getData ? (cell.getData() || {}) : null;
        if (d && d.url) window.open(d.url, d.openType === 'self' ? '_self' : '_blank');
      }
      if (e.target.id === 'prop-edge-add-dot') {
        var cells2 = selected();
        if (cells2.length === 1 && cells2[0].isEdge && cells2[0].isEdge()) {
          var b = cells2[0].getBBox();
          ctx.canvas.addDotOnEdge(cells2[0], { x: b.x + b.width / 2, y: b.y + b.height / 2 });
          refresh();
        }
      }
      if (e.target.id === 'prop-spine-add-dot') {
        var cells3 = selected();
        if (cells3.length === 1 && cells3[0].shape === 'fish-spine') {
          var b3 = cells3[0].getBBox();
          ctx.canvas.addDotOnNode(cells3[0], { x: b3.x + b3.width / 2, y: b3.y + b3.height / 2 });
          refresh();
        }
      }
      var delDot = e.target && e.target.getAttribute && e.target.getAttribute('data-del-dot');
      if (delDot) {
        var dotCell = ctx.canvas.graph.getCellById(delDot);
        if (dotCell) {
          ctx.canvas.graph.removeCells([dotCell]);
          if (ctx.canvas.historyPush) ctx.canvas.historyPush('删除连接点');
          if (window.YGT && YGT.toast) YGT.toast('已删除连接点');
        }
        refresh();
      }
      if (e.target.id === 'prop-bg-on' || e.target.id === 'prop-bg-off') {
        var cells4 = selected();
        if (cells4.length === 1 && cells4[0].shape === 'image-node') {
          ctx.canvas.setImageBackground(cells4[0], e.target.id === 'prop-bg-on');
          refresh();
        }
      }
    });

    function applyBatch(id, value) {
      var cells = selected();
      ctx.canvas.batch(function () {
        cells.forEach(function (cell) {
          if (cell.isNode && cell.isNode()) {
            var lp = {}, bp = {};
            if (id === 'prop-batch-font-color') lp.fill = value;
            if (id === 'prop-batch-font-size') lp.fontSize = Number(value);
            if (id === 'prop-batch-font-weight') lp.fontWeight = value;
            if (id === 'prop-batch-fill') bp.fill = value;
            if (id === 'prop-batch-stroke') bp.stroke = value;
            if (id === 'prop-batch-stroke-width') bp.strokeWidth = Number(value);
            if (id === 'prop-batch-opacity') bp.opacity = Number(value) / 100;
            if (Object.keys(lp).length && typeof cell.attr('label/text') === 'string') cell.attr({ label: lp });
            if (Object.keys(bp).length) cell.attr({ body: bp });
          } else if (cell.isEdge && cell.isEdge()) {
            var lp2 = {};
            if (id === 'prop-batch-line-color') lp2.stroke = value;
            if (id === 'prop-batch-line-width') lp2.strokeWidth = Number(value);
            if (id === 'prop-batch-arrow') {
              var a = Number(value);
              var mh = Math.max(4, Math.round(a * 0.7));
              lp2.targetMarker = Y.shapes.blockMarkerAttrs(a, mh, Number(cell.attr('line/strokeWidth')) || 2);
            }
            if (id === 'prop-batch-dash') lp2.strokeDasharray = value ? '6 3' : 'none';
            if (id === 'prop-batch-opacity') lp2.opacity = Number(value) / 100;
            if (Object.keys(lp2).length) cell.attr({ line: lp2 });
          }
        });
      });
      if (ctx.canvas.historyPush) ctx.canvas.historyPush('批量样式');
      ctx.onChanged && ctx.onChanged();
    }

    deleteBtn.addEventListener('click', function () {
      ctx.canvas.removeSelected();
      refresh();
    });
    host.querySelector('#prop-copy').addEventListener('click', function () {
      ctx.canvas.copySelected();
      refresh();
    });
    host.querySelector('#prop-paste').addEventListener('click', function () {
      ctx.canvas.pasteCells();
      refresh();
    });
    host.querySelector('#prop-front').addEventListener('click', function () {
      selected().forEach(function (c) { c.toFront(); });
      ctx.onChanged && ctx.onChanged();
    });
    host.querySelector('#prop-back').addEventListener('click', function () {
      selected().forEach(function (c) { c.toBack(); });
      ctx.onChanged && ctx.onChanged();
    });

    ctx.canvas.selection.on('selection:changed', refresh);

    return { refresh: refresh };
  }

  Y.props = { mount: mount };
})(window.YGT);
