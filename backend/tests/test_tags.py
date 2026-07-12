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
