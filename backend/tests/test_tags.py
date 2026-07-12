def test_list_tags_empty(client):
    response = client.get("/api/tags")
    assert response.status_code == 200
    assert response.json() == []


def test_create_tag(client):
    response = client.post("/api/tags", json={"name": "微分積分"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "微分積分"
    assert "id" in data


def test_create_duplicate_tag(client):
    client.post("/api/tags", json={"name": "微分積分"})
    response = client.post("/api/tags", json={"name": "微分積分"})
    assert response.status_code == 400
    assert "already exists" in response.json()["message"]


def test_list_tags_after_creation(client):
    client.post("/api/tags", json={"name": "微分積分"})
    client.post("/api/tags", json={"name": "確率"})
    response = client.get("/api/tags")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = [t["name"] for t in data]
    assert "微分積分" in names
    assert "確率" in names


def test_delete_tag(client):
    resp = client.post("/api/tags", json={"name": "削除テスト"})
    assert resp.status_code == 201
    tag_id = resp.json()["id"]

    delete_resp = client.delete(f"/api/tags/{tag_id}")
    assert delete_resp.status_code == 204

    list_resp = client.get("/api/tags")
    names = [t["name"] for t in list_resp.json()]
    assert "削除テスト" not in names


def test_update_tag(client):
    resp = client.post("/api/tags", json={"name": "更新前"})
    tag_id = resp.json()["id"]

    resp = client.put(f"/api/tags/{tag_id}", json={"name": "更新後"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "更新後"

    list_resp = client.get("/api/tags")
    names = [t["name"] for t in list_resp.json()]
    assert "更新前" not in names
    assert "更新後" in names


def test_update_nonexistent_tag(client):
    resp = client.put("/api/tags/9999", json={"name": "nonexistent"})
    assert resp.status_code == 404


def test_update_tag_duplicate(client):
    client.post("/api/tags", json={"name": "代数"})
    tag2 = client.post("/api/tags", json={"name": "幾何"}).json()

    resp = client.put(f"/api/tags/{tag2['id']}", json={"name": "代数"})
    assert resp.status_code == 400
    assert "already exists" in resp.json()["message"].lower()


def test_delete_nonexistent_tag(client):
    resp = client.delete("/api/tags/9999")
    assert resp.status_code == 404
    assert resp.json()["error"] == "HTTP_ERROR"
    assert "not found" in resp.json()["message"].lower()
