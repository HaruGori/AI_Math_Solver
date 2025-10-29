
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
from pathlib import Path
from typing import Optional

from backend import models, database
from backend.services import ai_service

router = APIRouter()

# 画像を保存するディレクトリ
UPLOAD_DIR = Path("backend/static/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
def upload_problem(
    db: Session = Depends(database.get_db),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    画像またはテキスト、あるいはその両方をアップロードして新しい問題を作成する
    """
    if not text and not file:
        raise HTTPException(status_code=400, detail="Either text or a file must be provided.")

    image_url_str = None
    filename = None
    ai_answer = None

    # ファイルが提供された場合の処理
    if file:
        # ファイル名が重複しないように処理 (例: uuidを追加)
        # ここでは簡単のため、元のファイル名をそのまま使う
        file_path = UPLOAD_DIR / file.filename
        filename = file.filename
        image_url_str = str(file_path)
        
        # ファイルを保存
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()

    # コンテンツとタイトルの決定
    content = text if text else ""
    if not content and file:
        content = f"Image-based problem: {file.filename}"

    # テキストがあればAIの回答を生成
    if text:
        ai_answer = ai_service.generate_answer(text)

    title = content[:30].strip()
    if len(content) > 30:
        title += "..."

    # データベースに新しい問題を作成
    db_problem = models.Problem(
        title=title,
        content=content,
        content_type="image" if file else "text",
        image_url=image_url_str,
        answer=ai_answer
    )
    
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    
    response_data = {
        "message": "Problem uploaded successfully",
        "problem_id": db_problem.id,
        "title": db_problem.title,
        "answer": db_problem.answer
    }
    if filename:
        response_data["filename"] = filename

    return response_data
