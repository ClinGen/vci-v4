def test_index_links_to_docs_and_health(client):
    response = client.get("/")

    assert response.status_code == 200
    assert 'href="/docs"' in response.text
    assert 'href="/api/health"' in response.text


def test_health_reports_database_ok(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}
