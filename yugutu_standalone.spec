# -*- mode: python ; coding: utf-8 -*-
# 独立版：前端 vue/dist 一并打入 exe，运行后 exe 自己提供页面 + API。
import os
from pathlib import Path

root = Path.cwd()
vue_dist = root / "vue" / "dist"

datas = []
if vue_dist.exists():
    datas.append((str(vue_dist), "vue/dist"))

a = Analysis(
    ["app/main.py"],
    pathex=[str(root)],
    binaries=[],
    datas=datas,
    hiddenimports=[
        "psycopg",
        "psycopg_binary",
        "oracledb",
        "sqlalchemy.dialects.postgresql.psycopg",
        "sqlalchemy.dialects.oracle.oracledb",
        "sqlalchemy.dialects.sqlite",
        "uvicorn.logging",
        "uvicorn.loops.auto",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan.on",
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="yugutu_standalone",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
)
