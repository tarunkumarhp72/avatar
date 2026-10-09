
import pytest
import redis.asyncio as redis
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, create_refresh_token, hash_token
from app.redis.keys import refresh_token_key
from app.users.models import User, UserRole


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(phone="+919999999999", role=UserRole.CUSTOMER)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

from app.redis import client as redis_module


@pytest.fixture
async def redis_client() -> redis.Redis:
    assert redis_module._redis_client is not None
    yield redis_module._redis_client

@pytest.fixture
async def token_pair(test_user: User, redis_client: redis.Redis) -> dict:
    access = create_access_token(test_user.id, test_user.role.value)
    refresh = create_refresh_token()
    
    await redis_client.setex(
        refresh_token_key(hash_token(refresh)), 
        3600, 
        str(test_user.id)
    )
    return {"access_token": access, "refresh_token": refresh}

@pytest.mark.asyncio
async def test_users_me_success(client: AsyncClient, token_pair: dict):
    resp = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token_pair['access_token']}"}
    )
    assert resp.status_code == 200
    assert resp.json()["phone"] == "+919999999999"

@pytest.mark.asyncio
async def test_users_me_no_token(client: AsyncClient):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_refresh_success(client: AsyncClient, token_pair: dict, redis_client: redis.Redis):
    resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_pair["refresh_token"]}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["refresh_token"] != token_pair["refresh_token"]
    
    # Verify old token is gone
    old_h = hash_token(token_pair["refresh_token"])
    assert not await redis_client.exists(refresh_token_key(old_h))

@pytest.mark.asyncio
async def test_logout_success(client: AsyncClient, token_pair: dict, redis_client: redis.Redis):
    resp = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": token_pair["refresh_token"]},
        headers={"Authorization": f"Bearer {token_pair['access_token']}"}
    )
    assert resp.status_code == 200
    
    # Token blocklisted
    resp2 = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token_pair['access_token']}"}
    )
    assert resp2.status_code == 401
    
    # Refresh token gone
    old_h = hash_token(token_pair["refresh_token"])
    assert not await redis_client.exists(refresh_token_key(old_h))
