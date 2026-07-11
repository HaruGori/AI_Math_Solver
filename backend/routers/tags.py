from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.models import Tag
from backend.schemas import TagCreate, TagSchema
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
