import uuid

import redis.asyncio as redis
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories import schemas, service
from app.core.dependencies import require_admin
from app.database.session import get_db
from app.redis.client import get_redis
from app.users.models import User

# Router for public category access
public_router = APIRouter(prefix="/categories", tags=["Categories"])

# Router for admin category management
admin_router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])


@public_router.get("", response_model=list[schemas.ServiceCategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
):
    """Get all active categories."""
    return await service.get_all_categories(db, redis_client)


@public_router.get("/{category_id}", response_model=schemas.ServiceCategoryResponse)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
):
    """Get category by ID."""
    return await service.get_category(category_id, db, redis_client)


@admin_router.post("", response_model=schemas.ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: schemas.ServiceCategoryCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_admin: User = Depends(require_admin)
):
    """Create a new service category."""
    return await service.create_category(data, db, redis_client)


@admin_router.patch("/{category_id}", response_model=schemas.ServiceCategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: schemas.ServiceCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_admin: User = Depends(require_admin)
):
    """Update a service category."""
    return await service.update_category(category_id, data, db, redis_client)


@admin_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_admin: User = Depends(require_admin)
):
    """Soft delete a service category."""
    await service.delete_category(category_id, db, redis_client)
