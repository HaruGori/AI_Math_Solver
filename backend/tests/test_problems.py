def test_create_problem(client):
    response = client.post(
        "/api/problems/",
        json={
            "title": "二次方程式",
            "content": "x^2 + 5x + 6 = 0",
            "content_type": "text",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "二次方程式"
    assert data["content"] == "x^2 + 5x + 6 = 0"
    assert "id" in data
    assert data["tags"] == []


def test_create_problem_with_tags(client):
    tag_res = client.post("/api/tags", json={"name": "代数"})
    tag_id = tag_res.json()["id"]

    response = client.post(
        "/api/problems/",
        json={
            "title": "二次方程式",
            "content": "x^2 + 5x + 6 = 0",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["tags"]) == 1
    assert data["tags"][0]["name"] == "代数"


def test_list_problems(client):
    client.post(
        "/api/problems/",
        json={"title": "問題1", "content": "1+1", "content_type": "text"},
    )
    client.post(
        "/api/problems/",
        json={"title": "問題2", "content": "2+2", "content_type": "text"},
    )

    response = client.get("/api/problems/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["problems"]) == 2


def test_list_problems_pagination(client):
    for i in range(5):
        client.post(
            "/api/problems/",
            json={
                "title": f"問題{i}",
                "content": f"content{i}",
                "content_type": "text",
            },
        )

    response = client.get("/api/problems/?skip=1&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["problems"]) == 2


def test_list_problems_filter_by_tag(client):
    tag_res = client.post("/api/tags", json={"name": "代数"})
    tag_id = tag_res.json()["id"]
    client.post(
        "/api/problems/",
        json={
            "title": "代数の問題",
            "content": "x+2=4",
            "content_type": "text",
            "tag_ids": [tag_id],
        },
    )
    client.post(
        "/api/problems/",
        json={"title": "その他", "content": "1+1", "content_type": "text"},
    )

    response = client.get("/api/problems/?tag=代数")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["problems"][0]["title"] == "代数の問題"


def test_list_problems_search(client):
    client.post(
        "/api/problems/",
        json={
            "title": "二次方程式の解",
            "content": "x^2=4",
            "content_type": "text",
        },
    )
    client.post(
        "/api/problems/",
        json={"title": "確率", "content": "サイコロ", "content_type": "text"},
    )

    response = client.get("/api/problems/?search=二次")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert "二次" in data["problems"][0]["title"]


def test_get_problem(client):
    create_res = client.post(
        "/api/problems/",
        json={"title": "Test", "content": "x=1", "content_type": "text"},
    )
    problem_id = create_res.json()["id"]

    response = client.get(f"/api/problems/{problem_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test"
    assert data["id"] == problem_id


def test_get_problem_not_found(client):
    response = client.get("/api/problems/999")
    assert response.status_code == 404
    assert "not found" in response.json()["message"].lower()


def test_update_problem(client):
    create_res = client.post(
        "/api/problems/",
        json={"title": "Before", "content": "x=1", "content_type": "text"},
    )
    problem_id = create_res.json()["id"]

    response = client.put(
        f"/api/problems/{problem_id}",
        json={"title": "After"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "After"


def test_update_problem_not_found(client):
    response = client.put(
        "/api/problems/999",
        json={"title": "Nope"},
    )
    assert response.status_code == 404


def test_delete_problem(client):
    create_res = client.post(
        "/api/problems/",
        json={"title": "ToDelete", "content": "x=1", "content_type": "text"},
    )
    problem_id = create_res.json()["id"]

    response = client.delete(f"/api/problems/{problem_id}")
    assert response.status_code == 204

    get_res = client.get(f"/api/problems/{problem_id}")
    assert get_res.status_code == 404


def test_delete_problem_not_found(client):
    response = client.delete("/api/problems/999")
    assert response.status_code == 404


from unittest.mock import patch


def test_generate_solution(client):
    with patch(
        "backend.routers.problems.ai_service.generate_answer",
        return_value="x = 2",
    ):
        create_res = client.post(
            "/api/problems/",
            json={"title": "Solve", "content": "x+2=4", "content_type": "text"},
        )
        problem_id = create_res.json()["id"]

        response = client.post(f"/api/problems/{problem_id}/solution")
        assert response.status_code == 200
        data = response.json()
        assert data["answer"] == "x = 2"


def test_generate_solution_not_found(client):
    response = client.post("/api/problems/999/solution")
    assert response.status_code == 404
