from collections.abc import AsyncGenerator

import redis.asyncio as redis

from app.core.config import settings

_redis_client: redis.Redis | None = None

async def init_redis() -> None:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )

async def close_redis() -> None:
    global _redis_client
    if _redis_client is not None:
        await _redis_client.aclose()
        _redis_client = None

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized")
    yield _redis_client
