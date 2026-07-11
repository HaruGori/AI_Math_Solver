import os
from pathlib import Path

# テスト用のデータベース（SQLite）の絶対パスを指定して環境変数に設定
db_path = Path(__file__).parent.parent / "test_api.db"
os.environ["DATABASE_URL"] = f"sqlite:///{db_path.absolute()}"

import pytest
import io
import shutil
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import Base, engine
from backend import models

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # 接続プールをクリーンにしてテーブルを作成
    engine.dispose()
    Base.metadata.create_all(bind=engine)
    yield
    # テスト後にプールをクリアしてDBファイルを削除できるようにする
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if db_path.exists():
        try:
            db_path.unlink()
        except OSError:
            pass

@pytest.fixture(autouse=True)
def cleanup_uploads():
    yield
    # アップロード用静的ディレクトリ内のファイルをテスト後に削除
    upload_dir = Path("backend/static/images")
    if upload_dir.exists():
        for f in upload_dir.glob("*"):
            if f.is_file() and f.name != ".gitkeep":
                try:
                    f.unlink()
                except OSError:
                    pass

def test_upload_image_success():
    # 正常な画像アップロード
    file_content = b"fake image content"
    files = {"file": ("test.png", io.BytesIO(file_content), "image/png")}
    
    response = client.post("/api/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "filename" in data
    assert data["url"].endswith(data["filename"])
    
    # 画像アップロード時点ではDBに問題が登録されていないことの確認 (二重登録の防止)
    problems_response = client.get("/api/problems/")
    assert problems_response.status_code == 200
    assert problems_response.json()["total"] == 0

def test_upload_image_invalid_extension():
    # 許可されていない拡張子のテスト
    file_content = b"plain text content"
    files = {"file": ("test.txt", io.BytesIO(file_content), "image/png")}
    
    response = client.post("/api/upload", files=files)
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["message"]

def test_upload_image_invalid_mime_type():
    # 許可されていないMIMEタイプのテスト
    file_content = b"fake image content"
    files = {"file": ("test.png", io.BytesIO(file_content), "text/plain")}
    
    response = client.post("/api/upload", files=files)
    assert response.status_code == 400
    assert "Only image files are allowed" in response.json()["message"]

def test_upload_image_exceeds_size():
    # 10MBを超えるファイルのアップロードテスト (10.1MB)
    large_content = b"a" * (10 * 1024 * 1024 + 1024 * 100)
    files = {"file": ("large.png", io.BytesIO(large_content), "image/png")}
    
    response = client.post("/api/upload", files=files)
    assert response.status_code == 413
    assert "File size exceeds the 10MB limit" in response.json()["message"]

def test_create_problem_with_uploaded_image():
    # 1. まず画像をアップロードしてURLを取得
    file_content = b"fake image content"
    files = {"file": ("test.png", io.BytesIO(file_content), "image/png")}
    upload_res = client.post("/api/upload", files=files)
    assert upload_res.status_code == 200
    image_url = upload_res.json()["url"]
    
    # 2. 取得した画像URLを使って問題を作成
    problem_data = {
        "title": "二乗の計算テスト",
        "content": "画像から問題を解析",
        "content_type": "image",
        "image_url": image_url
    }
    create_res = client.post("/api/problems/", json=problem_data)
    assert create_res.status_code == 201
    created_problem = create_res.json()
    assert created_problem["title"] == "二乗の計算テスト"
    assert created_problem["image_url"] == image_url
    
    # 3. 問題一覧をGETして二重登録されていないことを確認 (1件のみ)
    list_res = client.get("/api/problems/")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] == 1
    assert list_data["problems"][0]["id"] == created_problem["id"]
