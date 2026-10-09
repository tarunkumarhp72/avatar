import uuid

import pytest
from httpx import AsyncClient

from app.core.exceptions import AppError
from app.core.pagination import decode_cursor, encode_cursor


def test_cursor_encode_decode() -> None:
    original_id = uuid.uuid4()
    cursor = encode_cursor(original_id)
    decoded_id = decode_cursor(cursor)
    assert original_id == decoded_id

def test_invalid_cursor_decode() -> None:
    with pytest.raises(AppError) as exc:
        decode_cursor("invalid-base-64!")
    assert exc.value.code == "INVALID_CURSOR"

async def test_middleware_request_id_injected(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert "X-Request-ID" in response.headers

async def test_middleware_request_id_echoed(client: AsyncClient) -> None:
    req_id = "test-request-123"
    response = await client.get("/health", headers={"X-Request-ID": req_id})
    assert response.headers["X-Request-ID"] == req_id

async def test_security_headers(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-XSS-Protection"] == "0"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
