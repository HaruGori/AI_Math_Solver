from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend import models, database

router = APIRouter()

@router.post("/", response_model=models.ProblemSchema, status_code=201)
def create_problem(
    problem: models.ProblemCreate,
    db: Session = Depends(database.get_db)
):
    """新しい問題を作成"""
    db_problem = models.Problem(
        title=problem.title,
        content=problem.content,
        content_type=problem.content_type,
        image_url=problem.image_url
    )
    
    if problem.tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(problem.tag_ids)).all()
        db_problem.tags = tags
    
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.get("/", response_model=models.ProblemList)
def get_problems(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """問題一覧を取得"""
    query = db.query(models.Problem)
    
    if tag:
        query = query.join(models.Problem.tags).filter(models.Tag.name == tag)
    
    if search:
        query = query.filter(models.Problem.title.contains(search))
    
    total = query.count()
    problems = query.order_by(models.Problem.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"problems": problems, "total": total}


@router.get("/{problem_id}", response_model=models.ProblemSchema)
def get_problem(
    problem_id: int,
    db: Session = Depends(database.get_db)
):
    """問題詳細を取得"""
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.put("/{problem_id}", response_model=models.ProblemSchema)
def update_problem(
    problem_id: int,
    problem_update: models.ProblemUpdate,
    db: Session = Depends(database.get_db)
):
    """問題を更新"""
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    update_data = problem_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "tag_ids":
            tags = db.query(models.Tag).filter(models.Tag.id.in_(value)).all()
            db_problem.tags = tags
        else:
            setattr(db_problem, key, value)
    
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/{problem_id}", status_code=204)
def delete_problem(
    problem_id: int,
    db: Session = Depends(database.get_db)
):
    """問題を削除"""
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    db.delete(db_problem)
    db.commit()
    return None
