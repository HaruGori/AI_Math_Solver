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
