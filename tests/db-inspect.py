import os
import sqlite3

path = "data/yugutu.db"
print("exists:", os.path.exists(path))
if not os.path.exists(path):
    raise SystemExit(0)
print("size:", os.path.getsize(path))

con = sqlite3.connect(path)
cur = con.cursor()
cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
for name, sql in cur.fetchall():
    print("TABLE:", name)
    print(sql)
    print()
cur.execute("SELECT COUNT(*) FROM ygt_document")
print("ygt_document rows:", cur.fetchone()[0])
cur.execute("PRAGMA table_info(ygt_document)")
print("columns:")
for row in cur.fetchall():
    print("  ", row)
cur.execute("SELECT id, title, created_at, updated_at, length(data) FROM ygt_document ORDER BY updated_at DESC LIMIT 5")
print("sample rows:")
for row in cur.fetchall():
    print("  ", row)
con.close()
