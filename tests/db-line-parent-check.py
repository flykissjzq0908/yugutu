from datetime import datetime

from app.services.ygt_store import _extract_mx


def main():
    cells = [
        {"id": "spine", "shape": "fish-spine", "x": 100, "y": 400, "width": 400, "height": 10},
        {"id": "head", "shape": "fish-head", "x": 500, "y": 360, "width": 80, "height": 80},
        {
            "id": "root_bone",
            "shape": "bone-node",
            "x": 200,
            "y": 220,
            "width": 100,
            "height": 40,
            "attrs": {"label": {"text": "根骨"}},
            "data": {"parentId": "__ROOT__", "order": 0, "level": 1}
        },
        {
            "id": "child_bone",
            "shape": "bone-node",
            "x": 350,
            "y": 180,
            "width": 100,
            "height": 40,
            "attrs": {"label": {"text": "子骨"}},
            "data": {"parentId": "STALE_WRONG", "order": 0, "level": 2}
        },
        {
            "id": "free_bone",
            "shape": "bone-node",
            "x": 500,
            "y": 600,
            "width": 100,
            "height": 40,
            "attrs": {"label": {"text": "悬空"}},
            "data": {"parentId": "STALE_WRONG", "order": 0, "level": 2}
        },
        {"id": "e_root", "shape": "bone-edge", "source": {"x": 200, "y": 405}, "target": {"cell": "root_bone", "port": "port-bottom"}},
        {"id": "e_child", "shape": "bone-edge", "source": {"cell": "root_bone"}, "target": {"cell": "child_bone", "port": "port-left"}}
    ]
    rows = _extract_mx("doc-line-check", cells, datetime.now())
    by_id = {r["xhid"]: r for r in rows}
    assert by_id["root_bone"]["fqbh"] == "ROOT", by_id["root_bone"]
    assert by_id["child_bone"]["fqbh"] == "root_bone", by_id["child_bone"]
    assert by_id["free_bone"]["fqbh"] == "ROOT", by_id["free_bone"]
    print("line-parent-ok")


if __name__ == "__main__":
    main()
