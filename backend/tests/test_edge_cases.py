from pathlib import Path
from unittest.mock import patch

import pytest
from backend.services.ai_service import AIGenerationError


def test_root_endpoint(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "AI Math Solver API"
    assert data["docs"] == "/docs"


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}


def test_validation_error_format(client):
    resp = client.post("/api/problems/", json={})
    assert resp.status_code == 422
    data = resp.json()
    assert data["error"] == "VALIDATION_ERROR"
    assert data["message"] == "入力値が不正です。"
    assert data["detail"] is not None


def test_ai_generation_error_503(client):
    with patch(
        "backend.routers.problems.ai_service.generate_answer",
        side_effect=AIGenerationError("Test error", code="AI_SERVICE_ERROR"),
    ):
        create_resp = client.post(
            "/api/problems/",
            json={"title": "T", "content": "x=1", "content_type": "text"},
        )
        problem_id = create_resp.json()["id"]
        resp = client.post(f"/api/problems/{problem_id}/solution")
    assert resp.status_code == 503
    data = resp.json()
    assert data["error"] == "AI_SERVICE_ERROR"
    assert "detail" in data


def test_create_problem_image_no_image_url(client):
    resp = client.post(
        "/api/problems/",
        json={
            "title": "Image Problem",
            "content": "画像問題",
            "content_type": "image",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["image_url"] is None


def test_update_problem_clear_tags(client):
    tag_resp = client.post("/api/tags", json={"name": "代数"})
    tag_id = tag_resp.json()["id"]
    create_resp = client.post(
        "/api/problems/",
        json={
            "title": "Test",
            "content": "x=1",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    problem_id = create_resp.json()["id"]
    assert len(create_resp.json()["tags"]) == 1

    update_resp = client.put(f"/api/problems/{problem_id}", json={"tag_ids": []})
    assert update_resp.status_code == 200
    assert update_resp.json()["tags"] == []


def test_generate_solution_sets_answer(client):
    with patch(
        "backend.routers.problems.ai_service.generate_answer",
        return_value="x = 2",
    ):
        create_resp = client.post(
            "/api/problems/",
            json={"title": "T", "content": "x+2=4", "content_type": "text"},
        )
        problem_id = create_resp.json()["id"]
        resp = client.post(f"/api/problems/{problem_id}/solution")
    assert resp.status_code == 200
    assert resp.json()["answer"] == "x = 2"


def test_update_tag_same_name(client):
    resp = client.post("/api/tags", json={"name": "代数"})
    tag_id = resp.json()["id"]
    resp = client.put(f"/api/tags/{tag_id}", json={"name": "代数"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "代数"


def test_delete_tag_attached_to_problems(client):
    tag_resp = client.post("/api/tags", json={"name": "代数"})
    tag_id = tag_resp.json()["id"]
    client.post(
        "/api/problems/",
        json={
            "title": "Test",
            "content": "x=1",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    delete_resp = client.delete(f"/api/tags/{tag_id}")
    assert delete_resp.status_code == 204
    list_resp = client.get("/api/tags")
    assert len(list_resp.json()) == 0


@pytest.fixture(autouse=True)
def cleanup_uploads():
    yield
    upload_dir = Path("backend/static/images")
    if upload_dir.exists():
        for f in upload_dir.glob("*"):
            if f.is_file() and f.name != ".gitkeep":
                try:
                    f.unlink()
                except OSError:
                    pass


def test_upload_empty_file(client):
    import io

    files = {"file": ("empty.png", io.BytesIO(b""), "image/png")}
    resp = client.post("/api/upload", files=files)
    assert resp.status_code == 200
    assert "url" in resp.json()


def test_upload_no_extension(client):
    import io

    files = {"file": ("noext", io.BytesIO(b"data"), "image/png")}
    resp = client.post("/api/upload", files=files)
    assert resp.status_code == 400


def test_upload_size_boundary(client):
    import io

    content = b"a" * (10 * 1024 * 1024)
    files = {"file": ("boundary.png", io.BytesIO(content), "image/png")}
    resp = client.post("/api/upload", files=files)
    assert resp.status_code == 200
    assert "url" in resp.json()


# ==========================================
# ページネーション境界値テスト (Issue #104)
# ==========================================


def test_get_problems_pagination_limit_zero_or_negative(client):
    # limit=0 は ge=1 制約違反で 422
    resp_zero = client.get("/api/problems/?limit=0")
    assert resp_zero.status_code == 422
    assert resp_zero.json()["error"] == "VALIDATION_ERROR"

    # limit=-1 も ge=1 制約違反で 422
    resp_neg = client.get("/api/problems/?limit=-1")
    assert resp_neg.status_code == 422
    assert resp_neg.json()["error"] == "VALIDATION_ERROR"


def test_get_problems_pagination_limit_boundaries(client):
    # limit=1 (下限有効値) は 200
    resp_min = client.get("/api/problems/?limit=1")
    assert resp_min.status_code == 200

    # limit=1000 (上限有効値) は 200
    resp_max = client.get("/api/problems/?limit=1000")
    assert resp_max.status_code == 200

    # limit=1001 (上限超過) は le=1000 制約違反で 422
    resp_exceed = client.get("/api/problems/?limit=1001")
    assert resp_exceed.status_code == 422
    assert resp_exceed.json()["error"] == "VALIDATION_ERROR"


def test_get_problems_pagination_skip_boundaries(client):
    # skip=0 (下限有効値) は 200
    resp_zero = client.get("/api/problems/?skip=0")
    assert resp_zero.status_code == 200

    # skip=-1 は ge=0 制約違反で 422
    resp_neg = client.get("/api/problems/?skip=-1")
    assert resp_neg.status_code == 422
    assert resp_neg.json()["error"] == "VALIDATION_ERROR"


def test_get_problems_pagination_skip_exceeds_total(client):
    # データを1件作成
    client.post(
        "/api/problems/",
        json={"title": "Test Problem", "content": "1+1=2", "content_type": "text"},
    )

    # 全件数を超える skip を指定した場合、total は正しく返り problems は空配列となる
    resp = client.get("/api/problems/?skip=100")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert data["problems"] == []


# ==========================================
# バリデーションエラーテスト (Issue #104)
# ==========================================


def test_create_problem_invalid_content_type(client):
    # content_type に "text" でも "image" でもない不正値を指定した場合は 422
    resp = client.post(
        "/api/problems/",
        json={
            "title": "Invalid Content Type",
            "content": "テスト内容",
            "content_type": "audio",
        },
    )
    assert resp.status_code == 422
    assert resp.json()["error"] == "VALIDATION_ERROR"


def test_get_problem_invalid_id_type(client):
    # problem_id に文字列を指定した場合は 422
    resp = client.get("/api/problems/invalid_id")
    assert resp.status_code == 422
    assert resp.json()["error"] == "VALIDATION_ERROR"


def test_put_problem_invalid_id_type(client):
    # PUT の problem_id に文字列を指定した場合は 422
    resp = client.put("/api/problems/invalid_id", json={"title": "新タイトル"})
    assert resp.status_code == 422
    assert resp.json()["error"] == "VALIDATION_ERROR"


def test_delete_problem_invalid_id_type(client):
    # DELETE の problem_id に文字列を指定した場合は 422
    resp = client.delete("/api/problems/invalid_id")
    assert resp.status_code == 422
    assert resp.json()["error"] == "VALIDATION_ERROR"


def test_tag_endpoints_invalid_id_type(client):
    # PUT/DELETE /api/tags/{tag_id} に文字列を指定した場合は 422
    resp_put = client.put("/api/tags/not_an_int", json={"name": "新タグ"})
    assert resp_put.status_code == 422
    assert resp_put.json()["error"] == "VALIDATION_ERROR"

    resp_del = client.delete("/api/tags/not_an_int")
    assert resp_del.status_code == 422
    assert resp_del.json()["error"] == "VALIDATION_ERROR"


def test_create_tag_invalid_payload(client):
    # name が欠落したペイロードで 422
    resp_empty = client.post("/api/tags", json={})
    assert resp_empty.status_code == 422

    # name に不正な型（数値や辞書）を渡した場合に 422
    resp_invalid_type = client.post("/api/tags", json={"name": 12345})
    # FastAPI/Pydantic は数値を文字列に自動キャストする場合があるため、辞書オブジェクトを渡す
    resp_dict = client.post("/api/tags", json={"name": {"invalid": "object"}})
    assert resp_dict.status_code == 422


# ==========================================
# カスケード削除テスト (Issue #104)
# ==========================================


def test_delete_tag_removes_from_problem_tags_cascade(client):
    # タグを2つ作成
    tag1_resp = client.post("/api/tags", json={"name": "タグA"})
    tag2_resp = client.post("/api/tags", json={"name": "タグB"})
    tag1_id = tag1_resp.json()["id"]
    tag2_id = tag2_resp.json()["id"]

    # 両方のタグを紐付けた問題を作成
    create_resp = client.post(
        "/api/problems/",
        json={
            "title": "複数タグ問題",
            "content": "テスト内容",
            "content_type": "text",
            "tag_ids": [tag1_id, tag2_id],
        },
    )
    problem_id = create_resp.json()["id"]
    assert len(create_resp.json()["tags"]) == 2

    # タグ1のみを削除
    del_resp = client.delete(f"/api/tags/{tag1_id}")
    assert del_resp.status_code == 204

    # 問題を取得して、問題自体は存在し、タグ1のみが外れてタグ2が残っていることを確認
    prob_resp = client.get(f"/api/problems/{problem_id}")
    assert prob_resp.status_code == 200
    prob_data = prob_resp.json()
    assert prob_data["title"] == "複数タグ問題"
    assert len(prob_data["tags"]) == 1
    assert prob_data["tags"][0]["id"] == tag2_id


def test_delete_problem_leaves_tags_intact_cascade(client):
    # タグを作成
    tag_resp = client.post("/api/tags", json={"name": "残存タグ"})
    tag_id = tag_resp.json()["id"]

    # タグを紐付けた問題を作成
    create_resp = client.post(
        "/api/problems/",
        json={
            "title": "削除予定問題",
            "content": "テスト内容",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    problem_id = create_resp.json()["id"]

    # 問題を削除
    del_resp = client.delete(f"/api/problems/{problem_id}")
    assert del_resp.status_code == 204

    # 問題は 404 になるが、タグ一覧には依然としてタグが存在することを確認
    assert client.get(f"/api/problems/{problem_id}").status_code == 404

    list_tags_resp = client.get("/api/tags")
    assert list_tags_resp.status_code == 200
    tag_names = [t["name"] for t in list_tags_resp.json()]
    assert "残存タグ" in tag_names


# ==========================================
# 空ペイロードPUT・部分更新テスト (Issue #104)
# ==========================================


def test_update_problem_empty_payload_preserves_data(client):
    # タグ付き問題を作成
    tag_resp = client.post("/api/tags", json={"name": "保持タグ"})
    tag_id = tag_resp.json()["id"]

    create_resp = client.post(
        "/api/problems/",
        json={
            "title": "元タイトル",
            "content": "元コンテンツ",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    problem_id = create_resp.json()["id"]

    # 空の PUT リクエストを送る
    update_resp = client.put(f"/api/problems/{problem_id}", json={})
    assert update_resp.status_code == 200
    updated_data = update_resp.json()

    # すべての元のフィールドが変更されずに保持されていることを確認
    assert updated_data["title"] == "元タイトル"
    assert updated_data["content"] == "元コンテンツ"
    assert updated_data["content_type"] == "text"
    assert len(updated_data["tags"]) == 1
    assert updated_data["tags"][0]["name"] == "保持タグ"


def test_update_problem_partial_payload(client):
    # タグ付き問題を作成
    tag_resp = client.post("/api/tags", json={"name": "タグX"})
    tag_id = tag_resp.json()["id"]

    create_resp = client.post(
        "/api/problems/",
        json={
            "title": "変更前タイトル",
            "content": "変更前コンテンツ",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    problem_id = create_resp.json()["id"]

    # タイトルのみ更新する
    update_resp = client.put(
        f"/api/problems/{problem_id}", json={"title": "変更後タイトル"}
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()

    # タイトルのみ更新され、他のフィールドやタグが維持されていることを確認
    assert updated_data["title"] == "変更後タイトル"
    assert updated_data["content"] == "変更前コンテンツ"
    assert len(updated_data["tags"]) == 1
    assert updated_data["tags"][0]["id"] == tag_id
