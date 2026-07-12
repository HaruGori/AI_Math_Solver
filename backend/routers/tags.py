from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.models import Tag
from backend.schemas import TagCreate, TagSchema, TagUpdate
from backend.database import get_db

router = APIRouter()


@router.get("/tags", response_model=List[TagSchema])
def get_tags(db: Session = Depends(get_db)):
    """タグ一覧を取得"""
    return db.query(Tag).all()


@router.post("/tags", response_model=TagSchema, status_code=201)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """新しいタグを作成"""
    db_tag = db.query(Tag).filter(Tag.name == tag.name).first()
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")

    new_tag = Tag(name=tag.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag


@router.put("/tags/{tag_id}", response_model=TagSchema)
def update_tag(tag_id: int, tag: TagUpdate, db: Session = Depends(get_db)):
    """タグ名を更新"""
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    existing = db.query(Tag).filter(Tag.name == tag.name, Tag.id != tag_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")

    db_tag.name = tag.name
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.delete("/tags/{tag_id}", status_code=204)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """タグを削除"""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    db.delete(tag)
    db.commit()
