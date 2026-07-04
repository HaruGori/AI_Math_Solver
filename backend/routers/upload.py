from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import shutil
import os
import uuid
from pathlib import Path

router = APIRouter()

# 画像を保存するディレクトリ
UPLOAD_DIR = Path("backend/static/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# 許可する拡張子とMIMEタイプ
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

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

    # 1. 拡張子のバリデーション
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. MIMEタイプのバリデーション
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    # ファイル名の重複を防ぐためUUIDを使用
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename

    # 3. ファイルサイズを制限しながら保存
    try:
        size = 0
        with file_path.open("wb") as buffer:
            # 8KBずつ読み込み
            for chunk in iter(lambda: file.file.read(8192), b""):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    buffer.close()
                    if file_path.exists():
                        file_path.unlink()
                    raise HTTPException(
                        status_code=413,
                        detail="File size exceeds the 10MB limit."
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        # その他のエラーが発生した場合は保存中のファイルをクリーンアップ
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    finally:
        file.file.close()

    # 絶対URLの構築
    base_url = str(request.base_url)
    image_url = f"{base_url}static/images/{filename}"

    return {
        "url": image_url,
        "filename": filename
    }

