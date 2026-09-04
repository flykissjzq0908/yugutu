import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.models import engine
from app.services import ygt_store


def main():
    doc = ygt_store.create_doc(
        "落库验证",
        [
            {
                "id": "head1", "shape": "fish-head", "x": 0, "y": 0,
                "attrs": {"label": {"text": "落库验证", "fontWeight": "700", "fill": "#dc2626"}},
                "data": {"kind": "head", "parentId": "__ROOT__", "order": 0, "level": 0, "ygtDir": "toright"},
            },
            {
                "id": "g1", "shape": "bone-node", "x": 100, "y": 100,
                "attrs": {"label": {"text": "人", "fontWeight": "700", "fill": "#dc2626"}},
                "data": {"kind": "group", "parentId": "head1", "order": 0, "level": 1},
            },
            {
                "id": "s1", "shape": "bone-node", "x": 250, "y": 100,
                "attrs": {"label": {"text": "子原因1"}},
                "data": {"kind": "bone", "parentId": "g1", "order": 0, "level": 2, "url": "https://example.com", "openType": "blank"},
            },
        ],
        {"background": "#ffffff"},
        "1.0",
    )
    with engine.connect() as conn:
        main_row = conn.execute(
            text("SELECT xh, ygmc, leaftype, version, positions IS NOT NULL AS has_pos FROM hl_ygt WHERE xh = :xh"),
            {"xh": doc["id"]},
        ).fetchone()
        mx_rows = conn.execute(
            text("SELECT xhid, lbmc, fqbh, pxbh, zyyypb, url, opentype FROM hl_ygtmx WHERE xh = :xh ORDER BY pxbh"),
            {"xh": doc["id"]},
        ).fetchall()
    print("hl_ygt:", dict(main_row._mapping))
    print("hl_ygtmx rows:", len(mx_rows))
    for r in mx_rows:
        print("  ", dict(r._mapping))
    ygt_store.delete_doc(doc["id"])
    print("deleted:", doc["id"])


if __name__ == "__main__":
    main()
