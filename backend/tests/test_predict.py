from schemas.customer import CustomerInput

VALID_PAYLOAD = CustomerInput.model_config["json_schema_extra"]["example"]

INVALID_LITERAL_PAYLOAD = {**VALID_PAYLOAD, "job": "invalid_job_type"}


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert "app" in body
    assert "status" in body


def test_predict_valid_input(client):
    response = client.post("/predict/", json=VALID_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert body["label"] in ("yes", "no")
    assert isinstance(body["label"], str) and body["label"]
    assert 0.0 <= body["confidence"] <= 100.0


def test_predict_invalid_input_missing_fields(client):
    response = client.post("/predict/", json={})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_predict_invalid_input_bad_literal(client):
    response = client.post("/predict/", json=INVALID_LITERAL_PAYLOAD)
    assert response.status_code == 422


def test_predict_confidence_range(client):
    for _ in range(5):
        response = client.post("/predict/", json=VALID_PAYLOAD)
        assert response.status_code == 200
        body = response.json()
        assert body["label"] in ("yes", "no")
        assert 0.0 <= body["confidence"] <= 100.0
