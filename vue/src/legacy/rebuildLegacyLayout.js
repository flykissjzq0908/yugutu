function isBusiness(node) {
  return !!node && (node.shape === 'bone-node' || node.shape === 'group-node');
}

function orderOf(node) {
  const d = node.getData ? (node.getData() || {}) : {};
  return Number(d.order) || 0;
}

function levelOf(node) {
  const d = node.getData ? (node.getData() || {}) : {};
  return Number(d.level) || 0;
}

function incomingEdgeOf(graph, node) {
  if (!node) return null;
  return (graph.getIncomingEdges(node) || []).find((edge) => edge.shape === 'bone-edge') || null;
}

function overlaps(a, b, padding) {
  return a.x < b.x + b.width + padding && a.x + a.width + padding > b.x &&
    a.y < b.y + b.height + padding && a.y + a.height + padding > b.y;
}

function validateBoxes(nodes, positions) {
  const boxes = nodes.map((node) => {
    const pos = positions[node.id];
    const size = node.getSize();
    return { x: pos.x, y: pos.y, width: size.width, height: size.height };
  });
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      if (overlaps(boxes[i], boxes[j], 0)) return false;
    }
  }
  return true;
}

export function rebuildLegacyLayout(canvas) {
  if (!canvas || !canvas.graph || !canvas.batch) {
    return { ok: false, message: '当前画布不支持层级重建' };
  }
  const graph = canvas.graph;
  const nodes = graph.getNodes().filter(isBusiness);
  if (!nodes.length) return { ok: false, message: '没有可重建的业务节点' };

  const head = graph.getNodes().find((node) => node.shape === 'fish-head');
  const spine = graph.getNodes().find((node) => node.shape === 'fish-spine');
  if (!head || !spine) return { ok: false, message: '缺少鱼头或鱼干' };

  const headData = head.getData() || {};
  const forward = headData.ygtDir === 'toleft' ? -1 : 1;
  const spinePos = spine.position();
  const spineSize = spine.getSize();
  const spineY = spinePos.y + spineSize.height / 2;
  const spineX = spinePos.x;

  const children = {};
  nodes.forEach((node) => {
    const d = node.getData() || {};
    const pid = d.parentId || '__ROOT__';
    (children[pid] = children[pid] || []).push(node);
  });
  Object.keys(children).forEach((pid) => {
    children[pid].sort((a, b) => orderOf(a) - orderOf(b));
  });

  const roots = nodes.filter((node) => {
    const d = node.getData() || {};
    return levelOf(node) === 1 || d.parentId === '__ROOT__' || d.parentId === head.id;
  }).sort((a, b) => orderOf(a) - orderOf(b));
  if (!roots.length) return { ok: false, message: '没有一级鱼刺节点' };

  const positions = {};
  const records = {};

  function setRecord(node, source, targetPort) {
    records[node.id] = { source, targetPort };
  }

  function layoutChildren(parent) {
    const kids = children[parent.id] || [];
    if (!kids.length) return;
    const parentPos = positions[parent.id];
    const parentLevel = levelOf(parent);
    const childLevel = parentLevel + 1;
    const parentEdge = incomingEdgeOf(graph, parent);

    kids.forEach((child) => {
      const order = orderOf(child);
      let x;
      let y;
      let targetPort;
      if (childLevel % 2 === 0) {
        const parity = order % 2 === 0;
        const sideKids = kids.filter((node) => (orderOf(node) % 2 === 0) === parity);
        const sideIndex = Math.max(0, sideKids.indexOf(child));
        const sideSign = parity ? forward : -forward;
        const yDirection = parentPos.y < spineY ? -1 : 1;
        x = parentPos.x + sideSign * 150;
        y = parentPos.y + yDirection * (sideIndex - (sideKids.length - 1) / 2) * 64;
        targetPort = sideSign > 0 ? 'port-left' : 'port-right';
      } else {
        const up = order % 2 === 0;
        const sameSide = kids.filter((node) => (orderOf(node) % 2 === 0) === up);
        const sideIndex = Math.max(0, sameSide.indexOf(child));
        x = parentPos.x + forward * (150 + sideIndex * 150);
        y = parentPos.y + (up ? -64 : 64);
        targetPort = forward > 0 ? 'port-left' : 'port-right';
      }
      positions[child.id] = { x, y };
      const ratio = kids.length > 0 ? (order + 1) / (kids.length + 1) : 0.5;
      setRecord(
        child,
        parentEdge ? { cell: parentEdge.id, anchor: { name: 'ratio', args: { ratio } } } : { x: parentPos.x, y: parentPos.y },
        targetPort
      );
      layoutChildren(child);
    });
  }

  roots.forEach((node, index) => {
    const x = spineX + 80 + index * 150;
    const top = index % 2 === 0;
    const y = top ? spineY - 180 : spineY + 136;
    positions[node.id] = { x, y };
    setRecord(node, { x, y: spineY }, top ? 'port-bottom' : 'port-top');
    layoutChildren(node);
  });

  function movePositionSubtree(nodeId, dx, dy, seen) {
    if (!nodeId || (seen && seen[nodeId]) || !positions[nodeId]) return;
    if (seen) seen[nodeId] = true;
    positions[nodeId].x += dx;
    positions[nodeId].y += dy;
    (children[nodeId] || []).forEach((child) => movePositionSubtree(child.id, dx, dy, seen || {}));
  }

  function resolvePositionOverlaps() {
    for (let pass = 0; pass < 8; pass += 1) {
      const boxes = nodes.map((node) => {
        const pos = positions[node.id];
        const size = node.getSize();
        return { node, pos, x: pos.x, y: pos.y, width: size.width, height: size.height };
      });
      const pairs = [];
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          if (overlaps(boxes[i], boxes[j], 0)) pairs.push([boxes[i], boxes[j]]);
        }
      }
      if (!pairs.length) return true;
      let moved = false;
      pairs.forEach((pair) => {
        if (!overlaps(pair[0], pair[1], 0)) return;
        let a = pair[0];
        let b = pair[1];
        if (levelOf(a.node) < levelOf(b.node) || (levelOf(a.node) === levelOf(b.node) && String(a.node.id) < String(b.node.id))) {
          a = pair[1];
          b = pair[0];
        }
        const level = levelOf(a.node);
        const order = orderOf(a.node);
        if (level % 2 === 1) {
          const sign = order % 2 === 0 ? -1 : 1;
          const dy = sign < 0 ? b.y - a.height - 24 - a.y : b.y + b.height + 24 - a.y;
          movePositionSubtree(a.node.id, 0, dy || sign * 24, {});
        } else {
          const sign = (order % 2 === 0) ? forward : -forward;
          const dx = sign < 0 ? b.x - a.width - 24 - a.x : b.x + b.width + 24 - a.x;
          movePositionSubtree(a.node.id, dx || sign * 24, 0, {});
        }
        moved = true;
      });
      if (!moved) break;
    }
    return validateBoxes(nodes, positions);
  }

  if (!resolvePositionOverlaps()) {
    return { ok: false, message: '重建布局出现节点重叠，已取消操作' };
  }

  const edgeUpdates = [];
  nodes.forEach((node) => {
    const record = records[node.id];
    if (!record) return;
    const edge = incomingEdgeOf(graph, node);
    if (!edge) return;
    edgeUpdates.push({ edge, source: record.source, targetPort: record.targetPort || 'port-left', nodeId: node.id });
  });

  canvas.batch(() => {
    nodes.forEach((node) => {
      const pos = positions[node.id];
      if (pos) node.position(pos.x, pos.y);
    });
    edgeUpdates.forEach((item) => {
      item.edge.setSource(item.source);
      item.edge.setTarget({ cell: item.nodeId, port: item.targetPort });
    });
  });
  if (canvas.historyPush) canvas.historyPush('按层级重建布局');
  if (canvas.notifyChanged) canvas.notifyChanged();
  return { ok: true, count: nodes.length };
}
