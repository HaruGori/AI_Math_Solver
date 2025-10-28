from sqlalchemy import Column, Integer, String, Text, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base
from pydantic import BaseModel
from typing import List, Optional

# ===============================================
# SQLAlchemy Models (DB Tables)
# ===============================================

# ProblemsとTagsの多対多の関連を定義する中間テーブル
problem_tags = Table(
    'problem_tags',
    Base.metadata,
    Column('problem_id', Integer, ForeignKey('problems.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Problem(Base):
    __tablename__ = "problems"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    # content_typeは、contentがプレーンテキストか、画像へのパスかを示す ("text" or "image")
    content_type = Column(String(50), nullable=False, default="text")
    image_url = Column(String(500), nullable=True)
    solution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tags = relationship("Tag", secondary=problem_tags, back_populates="problems")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    problems = relationship("Problem", secondary=problem_tags, back_populates="tags")

# ===============================================
# Pydantic Schemas (API Validation)
# ===============================================

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagSchema(TagBase):
    id: int

    class Config:
        orm_mode = True

class ProblemBase(BaseModel):
    title: str
    content: str
    content_type: str = "text"
    image_url: Optional[str] = None

class ProblemCreate(ProblemBase):
    tag_ids: Optional[List[int]] = None

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    solution: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class ProblemSchema(ProblemBase):
    id: int
    solution: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tags: List[TagSchema] = []

    class Config:
        orm_mode = True

class ProblemList(BaseModel):
    problems: List[ProblemSchema]
    total: int

class SolutionResponse(BaseModel):
    solution: str
