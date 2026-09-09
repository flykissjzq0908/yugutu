"""SQLAlchemy models / session helpers for the YGT backend."""
import json
from datetime import datetime
from pathlib import Path
from typing import Generator
from zoneinfo import ZoneInfo

from sqlalchemy import DateTime, String, Text, create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import get_settings


def _local_now() -> datetime:
    """业务时间统一用 Asia/Shanghai 本地时间。"""
    return datetime.now(ZoneInfo("Asia/Shanghai")).replace(tzinfo=None)


class Base(DeclarativeBase):
    """Declarative base for all YGT tables."""


class YgtDocument(Base):
    """A fishbone diagram document; the full X6 JSON is stored as text."""

    __tablename__ = "ygt_document"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(200), default="未命名鱼骨图")
    data: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_local_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_local_now, onupdate=_local_now)

    def to_meta(self) -> dict:
        """Return metadata for the document list."""
        return {
            "id": self.id,
            "title": self.title,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_doc(self) -> dict:
        """Return the full document (stored JSON + metadata)."""
        try:
            body = json.loads(self.data or "{}")
        except ValueError:
            body = {}
        return {
            "id": self.id,
            "title": self.title,
            "version": body.get("version", "1.0"),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "canvas": body.get("canvas", {"background": "#ffffff"}),
            "cells": body.get("cells", []),
        }


def _engine():
    settings = get_settings()
    db = settings.database
    if db.type == "postgresql":
        url = URL.create(
            "postgresql+psycopg",
            username=db.username,
            password=db.password,
            host=db.host,
            port=db.port,
            database=db.database,
        )
        connect_args = {"connect_timeout": db.connect_timeout}
        if db.search_path:
            connect_args["options"] = f"-csearch_path={db.search_path}"
        return create_engine(url, connect_args=connect_args, pool_pre_ping=True)
    if db.type == "oracle":
        if db.oracle_path:
            import oracledb

            oracledb.init_oracle_client(lib_dir=db.oracle_path)
        url = URL.create(
            "oracle+oracledb",
            username=db.username,
            password=db.password,
            host=db.host,
            port=db.port,
            database=db.database,
        )
        return create_engine(
            url,
            connect_args={"tcp_connect_timeout": float(db.connect_timeout)},
            pool_pre_ping=True,
        )
    db_path = Path(settings.app.db_path)
    if not db_path.is_absolute():
        db_path = Path(__file__).resolve().parent.parent / settings.app.db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )


engine = _engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create missing tables."""
    Base.metadata.create_all(bind=engine)
