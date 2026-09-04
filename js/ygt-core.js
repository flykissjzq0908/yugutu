/* 鱼骨图编辑器：数据模型 / 文档存储 / JSON 导入导出 */
window.YGT = window.YGT || {};
(function (Y) {
  'use strict';

  var LIST_KEY = 'ygt.documents';
  var DOC_PREFIX = 'ygt.doc.';

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' +
      Math.random().toString(36).slice(2, 8);
  }

  function createDoc(title) {
    var now = new Date().toISOString();
    return {
      version: '1.0',
      id: uid('doc'),
      title: title || '未命名鱼骨图',
      createdAt: now,
      updatedAt: now,
      canvas: { background: '#ffffff' },
      cells: []
    };
  }

  function readList() {
    try {
      var v = JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function writeList(list) {
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  }

  function save(doc) {
    if (!doc || !doc.id) return false;
    try {
      doc.updatedAt = new Date().toISOString();
      localStorage.setItem(DOC_PREFIX + doc.id, JSON.stringify(doc));
      var list = readList().filter(function (x) { return x.id !== doc.id; });
      list.unshift({ id: doc.id, title: doc.title, updatedAt: doc.updatedAt });
      writeList(list);
      return true;
    } catch (e) {
      return false;
    }
  }

  function load(id) {
    try {
      var raw = localStorage.getItem(DOC_PREFIX + id);
      if (!raw) return null;
      var doc = JSON.parse(raw);
      if (!doc || !doc.cells || !Array.isArray(doc.cells)) return null;
      if (!doc.canvas || typeof doc.canvas !== 'object') doc.canvas = { background: '#ffffff' };
      return doc;
    } catch (e) {
      return null;
    }
  }

  function remove(id) {
    localStorage.removeItem(DOC_PREFIX + id);
    writeList(readList().filter(function (x) { return x.id !== id; }));
  }

  function rename(id, title) {
    var doc = load(id);
    if (doc) {
      doc.title = title || doc.title;
      save(doc);
    }
  }

  function list() {
    return readList();
  }

  function toJSON(doc) {
    return JSON.stringify(doc, null, 2);
  }

  function parseJSON(text) {
    var obj;
    try {
      obj = JSON.parse(text);
    } catch (e) {
      return { ok: false, msg: 'JSON 解析失败' };
    }
    if (!obj || typeof obj !== 'object') return { ok: false, msg: '数据格式错误' };
    if (!obj.cells || !Array.isArray(obj.cells)) return { ok: false, msg: '缺少 cells 数组' };
    var doc = createDoc(obj.title || '导入的鱼骨图');
    doc.version = obj.version || '1.0';
    doc.canvas = (obj.canvas && typeof obj.canvas === 'object') ? obj.canvas : { background: '#ffffff' };
    doc.cells = obj.cells;
    return { ok: true, doc: doc };
  }

  function templateCells(kind, opts) {
    if (!Y.shapes || typeof Y.shapes.buildTemplate !== 'function') return [];
    return Y.shapes.buildTemplate(kind || 'classic', opts || {});
  }

  var BUSINESS_SHAPES = { 'fish-head': true, 'bone-node': true, 'group-node': true };

  function isBusiness(cell) {
    return !!cell && !!cell.id && !!BUSINESS_SHAPES[cell.shape];
  }

  function labelOf(cell) {
    if (!cell) return '';
    var attrs = cell.attrs || {};
    if (attrs.label && attrs.label.text) return String(attrs.label.text);
    return cell.id || '';
  }

  function ensureHierarchy(cells) {
    var list = Array.isArray(cells) ? cells : [];
    var byId = {};
    list.forEach(function (c) { if (c && c.id) byId[c.id] = c; });
    var biz = list.filter(isBusiness);
    biz.forEach(function (c) {
      var d = c.data || {};
      if (typeof d.parentId !== 'string' || d.parentId === '') {
        c.data = Object.assign({}, d, { parentId: '__ROOT__', order: 0, level: 0 });
      }
    });
    list.forEach(function (e) {
      if (!e || !e.source || !e.target) return;
      var src = (e.source && e.source.cell) || e.source;
      var tgt = (e.target && e.target.cell) || e.target;
      var srcNode = byId[src];
      var tgtNode = byId[tgt];
      if (!isBusiness(srcNode) || !isBusiness(tgtNode)) return;
      var d = tgtNode.data || {};
      if (d.parentId === '__ROOT__' || typeof d.parentId !== 'string' || d.parentId === '') {
        d.parentId = src;
        d.level = ((srcNode.data && typeof srcNode.data.level === 'number') ? srcNode.data.level : 0) + 1;
        tgtNode.data = d;
      }
    });
    var orders = {};
    biz.forEach(function (c) {
      var pid = c.data.parentId || '__ROOT__';
      (orders[pid] = orders[pid] || []).push(c);
    });
    Object.keys(orders).forEach(function (pid) {
      orders[pid].sort(function (a, b) {
        return ((a.data && a.data.order) || 0) - ((b.data && b.data.order) || 0);
      });
      orders[pid].forEach(function (c, i) { c.data.order = i; });
    });
    return list;
  }

  function validateHierarchy(cells) {
    var list = Array.isArray(cells) ? cells : [];
    var byId = {};
    list.forEach(function (c) { if (c && c.id) byId[c.id] = c; });
    var errors = [];
    var biz = list.filter(isBusiness);
    if (!biz.length) return { ok: true, errors: [], levels: {} };
    var parentMap = {};
    biz.forEach(function (c) {
      var d = c.data || {};
      var pid = d.parentId;
      if (typeof pid !== 'string' || pid === '') {
        errors.push('节点「' + labelOf(c) + '」缺少父级');
        return;
      }
      parentMap[c.id] = pid;
    });
    var rootCount = biz.filter(function (c) { return parentMap[c.id] === '__ROOT__'; }).length;
    if (!rootCount) errors.push('缺少根节点（父级为 __ROOT__）');
    var levels = {};
    biz.forEach(function (c) {
      var id = c.id;
      var pid = parentMap[id];
      if (pid !== '__ROOT__' && !isBusiness(byId[pid])) {
        errors.push('节点「' + labelOf(c) + '」的父级不存在');
        return;
      }
      var cur = id, depth = 0, visited = {};
      while (cur && cur !== '__ROOT__') {
        if (visited[cur]) { errors.push('节点「' + labelOf(c) + '」所在层级存在循环'); return; }
        visited[cur] = true;
        depth++;
        var next = parentMap[cur];
        if (!next) break;
        cur = next;
      }
      levels[id] = depth;
      if (depth > 5) errors.push('节点「' + labelOf(c) + '」层级超过 5');
    });
    var orders = {};
    biz.forEach(function (c) {
      var pid = parentMap[c.id];
      if (pid == null) return;
      (orders[pid] = orders[pid] || []).push({
        id: c.id,
        order: (c.data && typeof c.data.order === 'number') ? c.data.order : 0
      });
    });
    Object.keys(orders).forEach(function (pid) {
      var sorted = orders[pid].slice().sort(function (a, b) { return a.order - b.order; });
      sorted.forEach(function (item, i) {
        if (item.order !== i) errors.push('父级下子节点排序不连续');
      });
    });
    return { ok: errors.length === 0, errors: errors, levels: levels };
  }

  function syncFromLines(cells) {
    var list = Array.isArray(cells) ? cells : [];
    var byId = {};
    list.forEach(function (c) { if (c && c.id) byId[c.id] = c; });
    var head = null;
    var spine = null;
    Object.keys(byId).forEach(function (id) {
      var c = byId[id];
      if (c.shape === 'fish-head') head = c;
      if (c.shape === 'fish-spine') spine = c;
    });

    function terminalId(t) {
      if (!t) return null;
      if (typeof t === 'object') return t.cell ? String(t.cell) : null;
      return String(t);
    }

    function isBiz(c) {
      return !!c && (c.shape === 'bone-node' || c.shape === 'group-node');
    }

    function nx(c) {
      return typeof c.x === 'number' ? c.x : ((c.position && typeof c.position.x === 'number') ? c.position.x : 0);
    }

    function ny(c) {
      return typeof c.y === 'number' ? c.y : ((c.position && typeof c.position.y === 'number') ? c.position.y : 0);
    }

    function nw(c) {
      return typeof c.width === 'number' ? c.width : ((c.size && typeof c.size.width === 'number') ? c.size.width : 0);
    }

    function nh(c) {
      return typeof c.height === 'number' ? c.height : ((c.size && typeof c.size.height === 'number') ? c.size.height : 0);
    }

    function onSpine(p) {
      if (!spine || !p || typeof p.x !== 'number' || typeof p.y !== 'number') return false;
      var sx = nx(spine);
      var sw = nw(spine);
      var sy = ny(spine) + nh(spine) / 2;
      return p.x >= sx - 4 && p.x <= sx + sw + 4 &&
        Math.abs(p.y - sy) <= 10;
    }

    function parentOf(nodeId) {
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        if (!e || e.shape !== 'bone-edge') continue;
        if (terminalId(e.target) !== nodeId) continue;
        var sid = terminalId(e.source);
        if (sid) {
          var sc = byId[sid];
          if (!sc) continue;
          if (isBiz(sc) || sc.shape === 'fish-head') return sid;
          if (sc.shape === 'bone-edge') {
            var pid = terminalId(sc.target);
            var pc = pid ? byId[pid] : null;
            if (pc && (isBiz(pc) || pc.shape === 'fish-head')) return pid;
          }
          continue;
        }
        if (e.source && typeof e.source.x === 'number' && onSpine(e.source) && head) {
          return head.id;
        }
      }
      return '__ROOT__';
    }

    function levelOf(id) {
      var n = byId[id];
      if (!n) return 0;
      if (n.shape === 'fish-head') return 0;
      var d = n.data || {};
      if (d.parentId === '__ROOT__') return 1;
      var p = byId[d.parentId];
      if (!p) return 1;
      return Math.min(5, levelOf(p.id) + 1);
    }

    var nodes = Object.keys(byId).map(function (id) { return byId[id]; }).filter(isBiz);
    nodes.forEach(function (n) {
      var d = n.data || {};
      d.parentId = parentOf(n.id);
      n.data = d;
    });
    if (head) {
      var hd = head.data || {};
      hd.parentId = '__ROOT__';
      hd.order = 0;
      hd.level = 0;
      head.data = hd;
    }

    var groups = {};
    nodes.forEach(function (n) {
      var pid = (n.data && n.data.parentId) || '__ROOT__';
      (groups[pid] = groups[pid] || []).push(n);
    });
    Object.keys(groups).forEach(function (pid) {
      groups[pid].sort(function (a, b) {
        var ao = (a.data && typeof a.data.order === 'number') ? a.data.order : 99999;
        var bo = (b.data && typeof b.data.order === 'number') ? b.data.order : 99999;
        return ao - bo || (nx(a) - nx(b)) || String(a.id).localeCompare(String(b.id));
      });
      groups[pid].forEach(function (n, i) {
        n.data.order = i;
      });
    });
    nodes.forEach(function (n) {
      n.data.level = levelOf(n.id);
    });
    return list;
  }

  Y.core = {
    uid: uid,
    createDoc: createDoc,
    save: save,
    load: load,
    remove: remove,
    rename: rename,
    list: list,
    toJSON: toJSON,
    parseJSON: parseJSON,
    templateCells: templateCells,
    isBusiness: isBusiness,
    ensureHierarchy: ensureHierarchy,
    validateHierarchy: validateHierarchy,
    syncFromLines: syncFromLines
  };
})(window.YGT);
