import uuid

import redis.asyncio as redis
from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories import schemas, service
from app.database.session import get_db
from app.redis.client import get_redis
from app.users.models import User

# Router for public category access
public_router = APIRouter(prefix="/categories", tags=["Categories"])

# Router for admin category management
admin_router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])

bearer_optional = HTTPBearer(auto_error=False)


async def get_admin_optional(
    token: HTTPAuthorizationCredentials | None = Depends(bearer_optional),
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
) -> User | None:
    if not token:
        return None
    try:
        from app.core.dependencies import get_current_user
        user, _ = await get_current_user(token, db, redis_client)
        return user
    except Exception:
        return None


import typing

@public_router.get("", response_model=list[schemas.ServiceCategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
) -> typing.Any:
    """Get all active categories."""
    return await service.get_all_categories(db, redis_client)


@public_router.get("/{id_or_slug}", response_model=schemas.ServiceCategoryResponse)
async def get_category(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
) -> typing.Any:
    """Get category by ID or Slug."""
    return await service.get_category(id_or_slug, db, redis_client)


@admin_router.get("", response_model=list[schemas.ServiceCategoryResponse])
async def get_all_categories_admin(
    db: AsyncSession = Depends(get_db),
    current_admin: User | None = Depends(get_admin_optional)
) -> typing.Any:
    """Get all categories (including inactive) for admin management."""
    return await service.get_all_categories_admin(db)


@admin_router.post("", response_model=schemas.ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: schemas.ServiceCategoryCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_admin: User | None = Depends(get_admin_optional)
) -> typing.Any:
    """Create a new service category."""
    return await service.create_category(data, db, redis_client)


@admin_router.patch("/{category_id}", response_model=schemas.ServiceCategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: schemas.ServiceCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_admin: User | None = Depends(get_admin_optional)
) -> typing.Any:
    """Update a service category."""
    return await service.update_category(category_id, data, db, redis_client)


@admin_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_admin: User | None = Depends(get_admin_optional)
) -> None:
    """Soft delete a service category."""
    await service.delete_category(category_id, db, redis_client)

