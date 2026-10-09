import pytest
from httpx import AsyncClient

from app.redis.client import get_redis


@pytest.mark.asyncio
async def test_send_otp_success(client: AsyncClient):
    resp = await client.post("/api/v1/auth/otp/send", json={"phone": "+919876543210"})
    assert resp.status_code == 200
    assert resp.json() == {"message": "OTP sent"}

@pytest.mark.asyncio
async def test_send_otp_invalid_phone(client: AsyncClient):
    resp = await client.post("/api/v1/auth/otp/send", json={"phone": "123"})
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_send_otp_rate_limit(client: AsyncClient):
    redis = await anext(get_redis())
    await redis.flushdb()
    # Send 5 times successfully
    for _ in range(5):
        resp = await client.post("/api/v1/auth/otp/send", json={"phone": "+918888888888"})
        assert resp.status_code == 200
        
    # 6th time should fail
    resp = await client.post("/api/v1/auth/otp/send", json={"phone": "+918888888888"})
    assert resp.status_code == 429
    assert resp.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"

@pytest.mark.asyncio
async def test_verify_otp_invalid(client: AsyncClient):
    resp = await client.post("/api/v1/auth/otp/verify", json={"phone": "+919876543210", "code": "000000"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_OTP"
