from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend import models, database

router = APIRouter()

@router.get("/tags", response_model=List[models.TagSchema])
def get_tags(db: Session = Depends(database.get_db)):
    """タグ一覧を取得"""
    return db.query(models.Tag).all()

@router.post("/tags", response_model=models.TagSchema, status_code=201)
def create_tag(tag: models.TagCreate, db: Session = Depends(database.get_db)):
    """新しいタグを作成"""
    db_tag = db.query(models.Tag).filter(models.Tag.name == tag.name).first()
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    new_tag = models.Tag(name=tag.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag