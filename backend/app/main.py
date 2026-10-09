from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import setup_exception_handlers
from app.core.middleware import setup_middlewares
from app.database.session import get_db
from app.redis.client import close_redis, get_redis, init_redis


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_redis()
    yield
    await close_redis()

from app.auth.routes import router as auth_router
from app.bookings.routes import admin_router as bookings_admin_router
from app.bookings.routes import router as bookings_router
from app.categories.routes import admin_router as categories_admin_router
from app.categories.routes import public_router as categories_public_router
from app.customers.routes import router as customers_router
from app.locations.routes import admin_router as locations_admin_router
from app.locations.routes import public_router as locations_public_router
from app.media.routes import router as media_router
from app.reviews.routes import router as reviews_router
from app.users.routes import router as users_router
from app.workers.routes import admin_router as workers_admin_router
from app.workers.routes import router as workers_router

app = FastAPI(title="Avatar API", version="0.1.0", lifespan=lifespan)

from prometheus_fastapi_instrumentator import Instrumentator

setup_middlewares(app)
setup_exception_handlers(app)

Instrumentator().instrument(app).expose(app)

import os

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(customers_router, prefix="/api/v1")
app.include_router(workers_router, prefix="/api/v1")
app.include_router(workers_admin_router, prefix="/api/v1")
app.include_router(categories_public_router, prefix="/api/v1")
app.include_router(categories_admin_router, prefix="/api/v1")
app.include_router(locations_public_router, prefix="/api/v1")
app.include_router(locations_admin_router, prefix="/api/v1")
app.include_router(media_router, prefix="/api/v1")
app.include_router(bookings_router, prefix="/api/v1")
app.include_router(bookings_admin_router, prefix="/api/v1")
app.include_router(reviews_router, prefix="/api/v1")

from app.pricing.routes import admin_router as pricing_admin_router
from app.pricing.routes import router as pricing_router
from app.subscriptions.routes import router as subscriptions_router

app.include_router(pricing_router, prefix="/api/v1")
app.include_router(pricing_admin_router, prefix="/api/v1")
app.include_router(subscriptions_router, prefix="/api/v1")

from app.analytics.routes import router as analytics_router

app.include_router(analytics_router, prefix="/api/v1/admin")

@app.get("/health")
async def health(
    session: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: redis.Redis = Depends(get_redis)  # noqa: B008
) -> dict[str, str]:
    db_status = "ok"
    redis_status = "ok"
    
    try:
        await session.execute(text("SELECT 1"))
    except Exception as e:  # noqa: BLE001
        import structlog
        structlog.get_logger().error("db_health_error", error=str(e))
        db_status = "error"
        
    try:
        await redis_client.ping()
    except Exception as e:  # noqa: BLE001
        import structlog
        structlog.get_logger().error("redis_health_error", error=str(e))
        redis_status = "error"
        
    return {"status": "ok", "db": db_status, "redis": redis_status}
