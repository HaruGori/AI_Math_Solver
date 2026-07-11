from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.models import Problem, Tag
from backend.schemas import ProblemCreate, ProblemUpdate, ProblemSchema, ProblemList
from backend.database import get_db
from backend.services import ai_service

router = APIRouter()


@router.post("/", response_model=ProblemSchema, status_code=201)
def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db),
):
    """新しい問題を作成"""
    db_problem = Problem(
        title=problem.title,
        content=problem.content,
        content_type=problem.content_type,
        image_url=problem.image_url,
    )

    if problem.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(problem.tag_ids)).all()
        db_problem.tags = tags

    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.get("/", response_model=ProblemList)
def get_problems(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """問題一覧を取得"""
    query = db.query(Problem)

    if tag:
        query = query.join(Problem.tags).filter(Tag.name == tag)

    if search:
        query = query.filter(Problem.title.contains(search))

    total = query.count()
    problems = query.order_by(Problem.created_at.desc()).offset(skip).limit(limit).all()

    return {"problems": problems, "total": total}


@router.get("/{problem_id}", response_model=ProblemSchema)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):
    """問題詳細を取得"""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.put("/{problem_id}", response_model=ProblemSchema)
def update_problem(
    problem_id: int,
    problem_update: ProblemUpdate,
    db: Session = Depends(get_db),
):
    """問題を更新"""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    update_data = problem_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "tag_ids":
            tags = db.query(Tag).filter(Tag.id.in_(value)).all()
            db_problem.tags = tags
        else:
            setattr(db_problem, key, value)

    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/{problem_id}", status_code=204)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):
    """問題を削除"""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    db.delete(db_problem)
    db.commit()
    return None


@router.post("/{problem_id}/solution", response_model=ProblemSchema)
def generate_solution(
    problem_id: int,
    db: Session = Depends(get_db),
):
    """AIによる解説を生成して問題に紐付ける"""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    answer = ai_service.generate_answer(db_problem.content)

    db_problem.answer = answer
    db.commit()
    db.refresh(db_problem)

    return db_problem
