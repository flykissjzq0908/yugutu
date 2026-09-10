"""鱼骨图数据存储：写 hl_ygt / hl_ygtmx，兼容 PostgreSQL 与 SQLite。"""
import json
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from zoneinfo import ZoneInfo

from sqlalchemy import text

from app.models import engine

BUSINESS_SHAPES = {"bone-node", "group-node"}
RED_HEX = {"#dc2626", "#ef4444", "#e11d48", "#b91c1c", "#ff5733", "#f5222d", "#f87171"}


def _now() -> datetime:
    # 业务时间统一用 Asia/Shanghai 本地时间，避免 cjrq 比实际晚 8 小时
    return datetime.now(ZoneInfo("Asia/Shanghai")).replace(tzinfo=None)


def ensure_tables() -> None:
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS hl_ygt (
                xh VARCHAR(64) PRIMARY KEY,
                ygmc VARCHAR(200),
                hldw VARCHAR(200),
                lrr VARCHAR(100),
                zfpb SMALLINT DEFAULT 0,
                cjrq TIMESTAMP,
                hosid VARCHAR(64),
                txlb VARCHAR(64),
                lylx VARCHAR(64),
                lyid VARCHAR(64),
                flashpb SMALLINT DEFAULT 0,
                bzxx VARCHAR(500),
                ygtstyle TEXT,
                positions TEXT,
                leaftype VARCHAR(20) DEFAULT 'toright',
                version INTEGER DEFAULT 1
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS hl_ygtmx (
                xhid VARCHAR(64),
                xh VARCHAR(64),
                lbmc VARCHAR(500),
                fqbh VARCHAR(64),
                pxbh VARCHAR(64),
                cjrq TIMESTAMP,
                value VARCHAR(1000),
                name VARCHAR(1000),
                zyyypb SMALLINT,
                url VARCHAR(1000),
                opentype VARCHAR(20)
            )
        """))


def _is_red(color: Any) -> bool:
    if not color or not isinstance(color, str):
        return False
    c = color.strip().lower()
    if c in RED_HEX:
        return True
    m = re.fullmatch(r"#([0-9a-f]{6})", c)
    if not m:
        return False
    r = int(m.group(1)[0:2], 16)
    g = int(m.group(1)[2:4], 16)
    b = int(m.group(1)[4:6], 16)
    return r > 150 and g < 110 and b < 110


def _leaftype(cells: List[Dict[str, Any]]) -> str:
    for cell in cells or []:
        if cell.get("shape") == "fish-head":
            data = cell.get("data") or {}
            return data.get("ygtDir") or "toright"
    return "toright"


def _terminal_cell(terminal: Any) -> Optional[str]:
    """从 X6 source/target 终端取出 cell id（支持 {cell:id} 或直接字符串）。"""
    if isinstance(terminal, dict):
        cell = terminal.get("cell")
        return str(cell) if cell else None
    return str(terminal) if terminal else None


def _resolve_parent(node_id: str, by_id: Dict[str, Dict[str, Any]], edges: List[Dict[str, Any]]) -> str:
    """按线段层次解析节点父级：线优先，悬空/连空白点视为 ROOT。
    1) source 是业务节点 -> 该节点；
    2) source 是另一条线 -> 该线 target 对应业务节点；
    3) 无有效连线或连空白点 -> ROOT。"""
    if not by_id.get(node_id):
        return "__ROOT__"
    for edge in edges:
        tgt = _terminal_cell(edge.get("target"))
        if tgt != node_id:
            continue
        src = _terminal_cell(edge.get("source"))
        if not src or src not in by_id:
            continue
        src_cell = by_id[src]
        if src_cell.get("shape") in BUSINESS_SHAPES:
            return src
        if src_cell.get("shape") == "bone-edge":
            parent = _terminal_cell(src_cell.get("target"))
            if parent and parent in by_id and by_id[parent].get("shape") in BUSINESS_SHAPES:
                return parent
    return "__ROOT__"


def _order_key(cell: Dict[str, Any]) -> int:
    order = (cell.get("data") or {}).get("order")
    return order if isinstance(order, int) else 99999


def _extract_mx(doc_id: str, cells: List[Dict[str, Any]], now: datetime) -> List[Dict[str, Any]]:
    nodes = [c for c in cells or [] if isinstance(c, dict) and c.get("shape") in BUSINESS_SHAPES]
    edges = [c for c in cells or [] if isinstance(c, dict) and c.get("shape") == "bone-edge"]
    by_id = {str(c.get("id")): c for c in cells or [] if isinstance(c, dict) and c.get("id")}

    parent_map: Dict[str, str] = {}
    for node in nodes:
        parent_map[str(node.get("id"))] = _resolve_parent(str(node.get("id")), by_id, edges)

    children: Dict[str, List[Dict[str, Any]]] = {}
    for node in nodes:
        children.setdefault(parent_map[str(node.get("id"))], []).append(node)
    orders: Dict[str, int] = {}
    for pid, group in children.items():
        group.sort(key=lambda c: (_order_key(c), c.get("x") or 0, str(c.get("id"))))
        for i, node in enumerate(group):
            orders[str(node.get("id"))] = i

    rows: List[Dict[str, Any]] = []
    for cell in nodes:
        nid = str(cell.get("id"))
        attrs = cell.get("attrs") or {}
        label = attrs.get("label") or {}
        body = attrs.get("body") or {}
        data = cell.get("data") or {}
        parent = parent_map[nid]
        important = bool(
            str(label.get("fontWeight") or "") in ("700", "bold")
            or _is_red(label.get("fill"))
            or _is_red(body.get("fill"))
        )
        rows.append({
            "xhid": nid,
            "xh": doc_id,
            "lbmc": str(label.get("text") or ""),
            "fqbh": "ROOT" if parent == "__ROOT__" else parent,
            "pxbh": str(orders[nid]),
            "cjrq": now,
            "value": "",
            "name": "",
            "zyyypb": 1 if important else 0,
            "url": data.get("url"),
            "opentype": data.get("openType"),
        })
    return rows


def _insert_mx(conn, rows: List[Dict[str, Any]]) -> None:
    for row in rows:
        conn.execute(
            text("""
                INSERT INTO hl_ygtmx
                    (xhid, xh, lbmc, fqbh, pxbh, cjrq, value, name, zyyypb, url, opentype)
                VALUES
                    (:xhid, :xh, :lbmc, :fqbh, :pxbh, :cjrq, :value, :name, :zyyypb, :url, :opentype)
            """),
            row,
        )


def _doc_payload(
    doc_id: str,
    title: str,
    version: str,
    canvas: Dict[str, Any],
    cells: List[Dict[str, Any]],
    created_at: datetime,
    updated_at: datetime,
) -> str:
    return json.dumps(
        {
            "version": version,
            "id": doc_id,
            "title": title,
            "createdAt": created_at.isoformat(),
            "updatedAt": updated_at.isoformat(),
            "canvas": canvas,
            "cells": cells,
        },
        ensure_ascii=False,
    )


def list_docs(
    ksid: Optional[str] = None,
    lylx: Optional[str] = None,
    lyid: Optional[str] = None,
) -> List[Dict[str, Any]]:
    conditions = ["(zfpb IS NULL OR zfpb = 0)"]
    params: Dict[str, Any] = {}
    if ksid:
        conditions.append("hldw = :ksid")
        params["ksid"] = ksid
    if lylx:
        conditions.append("lylx = :lylx")
        params["lylx"] = lylx
    if lyid:
        conditions.append("lyid = :lyid")
        params["lyid"] = lyid
    sql = """
        SELECT xh, ygmc, cjrq
        FROM hl_ygt
        WHERE %s
        ORDER BY cjrq DESC
    """ % " AND ".join(conditions)
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).fetchall()
    return [
        {
            "id": r.xh,
            "title": r.ygmc or "未命名鱼骨图",
            "createdAt": r.cjrq.isoformat() if r.cjrq else None,
            "updatedAt": r.cjrq.isoformat() if r.cjrq else None,
        }
        for r in rows
    ]


def create_doc(
    title: str,
    cells: List[Dict[str, Any]],
    canvas: Dict[str, Any],
    version: str,
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    doc_id = "doc_" + uuid.uuid4().hex[:20]
    now = _now()
    meta = meta or {}
    positions = _doc_payload(doc_id, title, version, canvas, cells, now, now)
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO hl_ygt
                    (xh, ygmc, hldw, lrr, zfpb, cjrq, hosid, txlb, lylx, lyid,
                     flashpb, bzxx, ygtstyle, positions, leaftype, version)
                VALUES
                    (:xh, :ygmc, :hldw, :lrr, 0, :cjrq, :hosid, :txlb, :lylx, :lyid,
                     0, :bzxx, :ygtstyle, :positions, :leaftype, 1)
            """),
            {
                "xh": doc_id,
                "ygmc": title,
                "hldw": meta.get("hldw"),
                "lrr": meta.get("lrr"),
                "cjrq": now,
                "hosid": meta.get("hosid"),
                "txlb": meta.get("txlb") or "YGT",
                "lylx": meta.get("lylx"),
                "lyid": meta.get("lyid"),
                "bzxx": meta.get("bzxx"),
                "ygtstyle": meta.get("ygtstyle"),
                "positions": positions,
                "leaftype": _leaftype(cells),
            },
        )
        _insert_mx(conn, _extract_mx(doc_id, cells, now))
    return get_doc(doc_id) or {}


def _legacy_mx(doc_id: str) -> List[Dict[str, Any]]:
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT xhid, lbmc, fqbh, pxbh, url, opentype, zyyypb
                FROM hl_ygtmx
                WHERE xh = :xh
                ORDER BY pxbh
            """),
            {"xh": doc_id},
        ).fetchall()
    return [
        {
            "id": r.xhid,
            "label": r.lbmc or "",
            "parentId": "__ROOT__" if (r.fqbh or "ROOT") == "ROOT" else r.fqbh,
            "order": int(r.pxbh or 0) if str(r.pxbh or "").isdigit() else 0,
            "url": r.url,
            "openType": r.opentype,
            "important": bool(r.zyyypb),
        }
        for r in rows
    ]


def get_doc(doc_id: str) -> Optional[Dict[str, Any]]:
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT xh, ygmc, cjrq, ygtstyle, positions, leaftype, version
                FROM hl_ygt
                WHERE xh = :xh
            """),
            {"xh": doc_id},
        ).fetchone()
    if not row:
        return None
    base = {
        "id": row.xh,
        "title": row.ygmc or "未命名鱼骨图",
        "version": str(row.version or 1),
        "createdAt": row.cjrq.isoformat() if row.cjrq else None,
        "updatedAt": row.cjrq.isoformat() if row.cjrq else None,
        "leaftype": row.leaftype or "toright",
        "ygtstyle": row.ygtstyle,
    }
    if row.positions:
        try:
            body = json.loads(row.positions)
        except ValueError:
            body = {}
        return {
            **base,
            "canvas": body.get("canvas") or {"background": "#ffffff"},
            "cells": body.get("cells") or [],
        }
    return {
        **base,
        "canvas": {"background": "#ffffff"},
        "cells": [],
        "legacyMx": _legacy_mx(doc_id),
    }


def save_doc(
    doc_id: str,
    title: str,
    cells: List[Dict[str, Any]],
    canvas: Dict[str, Any],
    version: str,
    meta: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    meta = meta or {}
    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT xh FROM hl_ygt WHERE xh = :xh"),
            {"xh": doc_id},
        ).fetchone()
        if not row:
            return None
        now = _now()
        positions = _doc_payload(doc_id, title, version, canvas, cells, now, now)
        conn.execute(
            text("""
                UPDATE hl_ygt
                SET ygmc = :ygmc, cjrq = :cjrq, positions = :positions,
                    leaftype = :leaftype, version = COALESCE(version, 0) + 1,
                    hldw = COALESCE(:hldw, hldw), lrr = COALESCE(:lrr, lrr),
                    hosid = COALESCE(:hosid, hosid), txlb = COALESCE(:txlb, txlb),
                    lylx = COALESCE(:lylx, lylx), lyid = COALESCE(:lyid, lyid),
                    bzxx = COALESCE(:bzxx, bzxx), ygtstyle = COALESCE(:ygtstyle, ygtstyle)
                WHERE xh = :xh
            """),
            {
                "xh": doc_id,
                "ygmc": title,
                "cjrq": now,
                "positions": positions,
                "leaftype": _leaftype(cells),
                "hldw": meta.get("hldw"),
                "lrr": meta.get("lrr"),
                "hosid": meta.get("hosid"),
                "txlb": meta.get("txlb"),
                "lylx": meta.get("lylx"),
                "lyid": meta.get("lyid"),
                "bzxx": meta.get("bzxx"),
                "ygtstyle": meta.get("ygtstyle"),
            },
        )
        conn.execute(text("DELETE FROM hl_ygtmx WHERE xh = :xh"), {"xh": doc_id})
        _insert_mx(conn, _extract_mx(doc_id, cells, now))
    return get_doc(doc_id)


def rename_doc(doc_id: str, title: str) -> Optional[Dict[str, Any]]:
    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT positions FROM hl_ygt WHERE xh = :xh"),
            {"xh": doc_id},
        ).fetchone()
        if not row:
            return None
        conn.execute(
            text("UPDATE hl_ygt SET ygmc = :ygmc WHERE xh = :xh"),
            {"xh": doc_id, "ygmc": title},
        )
        if row.positions:
            try:
                body = json.loads(row.positions)
                body["title"] = title
                conn.execute(
                    text("UPDATE hl_ygt SET positions = :positions WHERE xh = :xh"),
                    {"xh": doc_id, "positions": json.dumps(body, ensure_ascii=False)},
                )
            except ValueError:
                pass
    return get_doc(doc_id)


def delete_doc(doc_id: str) -> bool:
    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT xh FROM hl_ygt WHERE xh = :xh"),
            {"xh": doc_id},
        ).fetchone()
        if not row:
            return False
        conn.execute(text("DELETE FROM hl_ygtmx WHERE xh = :xh"), {"xh": doc_id})
        conn.execute(text("DELETE FROM hl_ygt WHERE xh = :xh"), {"xh": doc_id})
    return True
