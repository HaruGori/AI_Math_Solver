from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import shutil
import os
import uuid
from pathlib import Path

router = APIRouter()

# 画像を保存するディレクトリ
UPLOAD_DIR = Path("backend/static/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
def upload_image(
    request: Request,
    file: UploadFile = File(...)
):
    """
    画像をアップロードして、アクセス可能なURLを返す
    """
    if not file:
        raise HTTPException(status_code=400, detail="File must be provided.")

    # ファイル名の重複を防ぐためUUIDを使用
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename

    # ファイルを保存
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        file.file.close()

    # 絶対URLの構築
    # request.base_url には末尾のスラッシュが含まれる
    base_url = str(request.base_url)
    image_url = f"{base_url}static/images/{filename}"

    return {
        "url": image_url,
        "filename": filename
    }
