from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from backend.schemas.tag import TagSchema


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
    answer: Optional[str] = None
    tag_ids: Optional[List[int]] = None


class ProblemSchema(ProblemBase):
    id: int
    answer: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tags: List[TagSchema] = []

    class Config:
        orm_mode = True


class ProblemList(BaseModel):
    problems: List[ProblemSchema]
    total: int
