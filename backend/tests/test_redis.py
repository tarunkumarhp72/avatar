import pytest
from httpx import AsyncClient

from app.redis.keys import (
    otp_attempts_key,
    otp_key,
    rate_limit_key,
    refresh_token_key,
    token_blocklist_key,
    worker_online_key,
)


def test_keys() -> None:
    assert "auth:otp:" in otp_key("+919876543210")
    assert "auth:otp_attempts:" in otp_attempts_key("+919876543210")
    assert "auth:refresh:abc" == refresh_token_key("abc")
    assert "auth:blocklist:xyz" == token_blocklist_key("xyz")
    assert "rate_limit:login:127.0.0.1" == rate_limit_key("login", "127.0.0.1")
    assert "worker:online:1" == worker_online_key("1")

@pytest.mark.asyncio
async def test_health_redis(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["redis"] == "ok"
