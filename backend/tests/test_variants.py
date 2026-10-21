import pytest

TP53 = {
    "caid": "CA000001",
    "preferred_title": "NM_000546.6(TP53):c.215C>G",
    "gene_symbol": "TP53",
}


def test_create_then_get_variant(client):
    created = client.post("/api/variants", json=TP53)
    assert created.status_code == 201
    assert created.json()["gene_symbol"] == "TP53"

    fetched = client.get(f"/api/variants/{TP53['caid']}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == created.json()["id"]


def test_get_unknown_variant_returns_404(client):
    assert client.get("/api/variants/CA999999").status_code == 404


def test_create_variant_requires_caid(client):
    response = client.post("/api/variants", json={"preferred_title": TP53["preferred_title"]})
    assert response.status_code == 422


@pytest.mark.parametrize("caid", ["12345", "ca000001", "CA"])
def test_create_variant_rejects_malformed_caid(client, caid):
    response = client.post("/api/variants", json={**TP53, "caid": caid})
    assert response.status_code == 422


def test_duplicate_variant_returns_409(client):
    assert client.post("/api/variants", json=TP53).status_code == 201
    assert client.post("/api/variants", json=TP53).status_code == 409
