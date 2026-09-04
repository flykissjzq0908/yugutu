import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.config import get_settings

import psycopg


def main():
    cfg = get_settings().database
    print("target:", cfg.type, cfg.host, cfg.port, cfg.database, cfg.username)
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
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND (table_name ILIKE 'hl_ygt%' OR table_name ILIKE '%ygt%')
        ORDER BY table_name
        """
    )
    tables = [r[0] for r in cur.fetchall()]
    print("ygt tables:", tables)

    for table in tables:
        cur.execute(
            """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = current_schema() AND table_name = %s
            ORDER BY ordinal_position
            """,
            (table,),
        )
        print("\n== TABLE", table)
        for col, typ, nullable, default in cur.fetchall():
            print(f"  {col} | {typ} | null={nullable} | default={default}")
        cur.execute(f'SELECT COUNT(*) FROM "{table}"')
        print("  rows:", cur.fetchone()[0])
        cur.execute(f'SELECT * FROM "{table}" LIMIT 3')
        cols = [d[0] for d in cur.description]
        print("  sample:")
        for row in cur.fetchall():
            print("   ", dict(zip(cols, row)))

    conn.close()


if __name__ == "__main__":
    main()
