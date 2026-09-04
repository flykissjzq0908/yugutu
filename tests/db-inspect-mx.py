import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.config import get_settings

import psycopg


def main():
    cfg = get_settings().database
    conn = psycopg.connect(
        host=cfg.host,
        port=cfg.port,
        dbname=cfg.database,
        user=cfg.username,
        password=cfg.password,
        connect_timeout=cfg.connect_timeout,
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute(
        """
        SELECT xhid, xh, lbmc, fqbh, pxbh, value, name, zyyypb, url, opentype
        FROM hl_ygtmx
        WHERE (name IS NOT NULL AND name <> '')
           OR (value IS NOT NULL AND value <> '')
           OR zyyypb IS NOT NULL AND zyyypb <> 0
        LIMIT 20
        """
    )
    print("non-empty name/value/zyyypb samples:")
    for row in cur.fetchall():
        print(row)

    cur.execute("SELECT DISTINCT fqbh FROM hl_ygtmx ORDER BY fqbh LIMIT 20")
    print("distinct fqbh:", [r[0] for r in cur.fetchall()])

    cur.execute("SELECT COUNT(*) FROM hl_ygt WHERE positions IS NOT NULL")
    print("hl_ygt with positions:", cur.fetchone()[0])
    conn.close()


if __name__ == "__main__":
    main()
