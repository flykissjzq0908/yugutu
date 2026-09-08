"""鱼骨图文档 CRUD API（全部需要 Bearer token，数据存 hl_ygt / hl_ygtmx）。"""
import json
import re
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.middleware.auth import CurrentUser, get_current_user
from app.services import ygt_store

router = APIRouter(prefix="/ygt/docs", tags=["ygt"])

ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
MAX_BODY_BYTES = 20 * 1024 * 1024  # 20MB


class DocMeta(BaseModel):
    lrr: Optional[str] = None
    hldw: Optional[str] = None
    hosid: Optional[str] = None
    txlb: Optional[str] = None
    lylx: Optional[str] = None
    lyid: Optional[str] = None
    bzxx: Optional[str] = None
    ygtstyle: Optional[str] = None


class DocCreate(DocMeta):
    title: str = Field(default="未命名鱼骨图", max_length=200)
    version: str = "1.0"
    canvas: Dict[str, Any] = Field(default_factory=lambda: {"background": "#ffffff"})
    cells: List[Any] = Field(default_factory=list)


class DocUpdate(DocMeta):
    title: str = Field(default="未命名鱼骨图", max_length=200)
    version: str = "1.0"
    canvas: Dict[str, Any] = Field(default_factory=lambda: {"background": "#ffffff"})
    cells: List[Any] = Field(default_factory=list)


class RenameRequest(BaseModel):
    title: str = Field(..., max_length=200)


def _validate_payload(cells: List[Any]) -> None:
    try:
        size = len(json.dumps({"cells": cells}, ensure_ascii=False).encode("utf-8"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="cells 必须是合法 JSON 数据")
    if size > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="文档过大，最大 20MB")


def _ensure_id(doc_id: str) -> str:
    if not ID_PATTERN.match(doc_id):
        raise HTTPException(status_code=422, detail="非法文档 ID")
    return doc_id


@router.get("", response_model=List[dict])
async def list_docs(
    ksid: Optional[str] = None,
    lylx: Optional[str] = None,
    lyid: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    return ygt_store.list_docs(
        ksid=(ksid or "").strip() or None,
        lylx=(lylx or "").strip() or None,
        lyid=(lyid or "").strip() or None,
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_doc(
    payload: DocCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    _validate_payload(payload.cells)
    title = (payload.title or "未命名鱼骨图").strip()[:200] or "未命名鱼骨图"
    meta = payload.model_dump(exclude={"title", "version", "canvas", "cells"})
    return ygt_store.create_doc(title, payload.cells, payload.canvas, payload.version, meta)


@router.get("/{doc_id}", response_model=dict)
async def get_doc(
    doc_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    doc_id = _ensure_id(doc_id)
    doc = ygt_store.get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


@router.put("/{doc_id}", response_model=dict)
async def save_doc(
    doc_id: str,
    payload: DocUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    doc_id = _ensure_id(doc_id)
    _validate_payload(payload.cells)
    title = (payload.title or "未命名鱼骨图").strip()[:200] or "未命名鱼骨图"
    meta = payload.model_dump(exclude={"title", "version", "canvas", "cells"})
    doc = ygt_store.save_doc(doc_id, title, payload.cells, payload.canvas, payload.version, meta)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


@router.post("/{doc_id}/rename", response_model=dict)
async def rename_doc(
    doc_id: str,
    payload: RenameRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    doc_id = _ensure_id(doc_id)
    title = (payload.title or "未命名鱼骨图").strip()[:200] or "未命名鱼骨图"
    doc = ygt_store.rename_doc(doc_id, title)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


@router.delete("/{doc_id}", response_model=dict)
async def delete_doc(
    doc_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    doc_id = _ensure_id(doc_id)
    if not ygt_store.delete_doc(doc_id):
        raise HTTPException(status_code=404, detail="文档不存在")
    return {"ok": True, "id": doc_id}
