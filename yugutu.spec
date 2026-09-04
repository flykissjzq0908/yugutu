# -*- mode: python ; coding: utf-8 -*-

import os

datas = []

a = Analysis(
    ["app/main.py"],
    pathex=[os.getcwd()],
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
    name="yugutu",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
)
