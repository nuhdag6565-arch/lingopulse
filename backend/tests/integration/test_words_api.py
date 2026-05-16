import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_health_check(http_client):
    r = await http_client.get("/api/v1/health/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_create_word(http_client):
    mock_example = AsyncMock(return_value=type("E", (), {"sentence": "Test.", "translation": "Test."})())
    with patch("app.services.word_service.generate_example", mock_example):
        r = await http_client.post("/api/v1/words/", json={"word": "serendipity", "meaning": "şans eseri güzel keşif"})
    assert r.status_code == 201
    data = r.json()
    assert data["word"] == "serendipity"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_words_empty(http_client):
    r = await http_client.get("/api/v1/words/")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 0
    assert body["items"] == []


@pytest.mark.asyncio
async def test_get_word_not_found(http_client):
    r = await http_client.get("/api/v1/words/000000000000000000000000")
    assert r.status_code == 404
