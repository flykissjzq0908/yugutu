import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.models import engine
from app.services import ygt_store


def main():
    cells = [
        {
            "id": "head1", "shape": "fish-head", "x": 0, "y": 0,
            "attrs": {"label": {"text": "标题"}},
            "data": {"kind": "head", "parentId": "__ROOT__", "order": 0, "level": 0},
        },
        {
            "id": "g1", "shape": "bone-node", "x": 100, "y": 100,
            "attrs": {"label": {"text": "一级原因"}},
            "data": {"kind": "group", "parentId": "__ROOT__", "order": 0, "level": 1},
        },
        {
            "id": "e1", "shape": "bone-edge",
            "source": {"x": 100, "y": 200}, "target": {"cell": "g1", "port": "port-bottom"},
        },
        {
            "id": "s1", "shape": "bone-node", "x": 250, "y": 100,
            "attrs": {"label": {"text": "二级原因1"}},
            "data": {"kind": "bone", "parentId": "__ROOT__", "order": 0, "level": 1},
        },
        {
            "id": "e2", "shape": "bone-edge",
            "source": {"cell": "e1", "anchor": {"name": "ratio", "args": {"ratio": 0.5}}},
            "target": {"cell": "s1", "port": "port-left"},
        },
        {
            "id": "s2", "shape": "bone-node", "x": 250, "y": 180,
            "attrs": {"label": {"text": "二级原因2"}},
            "data": {"kind": "bone", "parentId": "head1", "order": 9, "level": 2},
        },
        {
            "id": "e3", "shape": "bone-edge",
            "source": {"cell": "e1", "anchor": {"name": "ratio", "args": {"ratio": 0.7}}},
            "target": {"cell": "s2", "port": "port-left"},
        },
    ]
    doc = ygt_store.create_doc("层级解析验证", cells, {"background": "#ffffff"}, "1.0")
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT xhid, lbmc, fqbh, pxbh FROM hl_ygtmx WHERE xh = :xh ORDER BY xhid"),
            {"xh": doc["id"]},
        ).fetchall()
    print("hl_ygtmx:")
    for r in rows:
        print("  ", dict(r._mapping))
    expect = {"g1": "ROOT", "s1": "g1", "s2": "g1"}
    actual = {r.xhid: r.fqbh for r in rows}
    ok = all(actual.get(k) == v for k, v in expect.items())
    print("hierarchyOk:", ok)
    ygt_store.delete_doc(doc["id"])
    if not ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
