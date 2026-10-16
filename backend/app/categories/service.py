import json
import uuid
from collections.abc import Sequence

import redis.asyncio as redis
from fastapi import status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories.models import ServiceCategory
from app.categories.schemas import ServiceCategoryCreate, ServiceCategoryUpdate
from app.core.exceptions import AppError

CACHE_TTL = 3600
CACHE_KEY = "cache:categories"


async def get_all_categories(db: AsyncSession, redis_client: redis.Redis) -> Sequence[ServiceCategory]:
    cached = await redis_client.get(CACHE_KEY)
    if cached:
        data = json.loads(cached)
        return [ServiceCategory(**item) for item in data]

    stmt = select(ServiceCategory).where(ServiceCategory.is_active == True).order_by(ServiceCategory.sort_order)
    result = await db.execute(stmt)
    categories = result.scalars().all()

    # Cache the results
    cache_data = [
        {
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "noun": c.noun,
            "base_price": c.base_price,
            "items": c.items or [],
            "parent_id": str(c.parent_id) if c.parent_id else None,
            "pricing_model": c.pricing_model,
            "is_active": c.is_active,
            "icon_url": c.icon_url,
            "sort_order": c.sort_order,
        }
        for c in categories
    ]
    await redis_client.setex(CACHE_KEY, CACHE_TTL, json.dumps(cache_data))
    return categories


async def get_all_categories_admin(db: AsyncSession) -> Sequence[ServiceCategory]:
    stmt = select(ServiceCategory).order_by(ServiceCategory.sort_order, ServiceCategory.name)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_category(id_or_slug: str | uuid.UUID, db: AsyncSession, redis_client: redis.Redis) -> ServiceCategory:
    cache_key = f"cache:category:{id_or_slug}"
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return ServiceCategory(**data)

    parsed_uuid = None
    if isinstance(id_or_slug, uuid.UUID):
        parsed_uuid = id_or_slug
    else:
        try:
            parsed_uuid = uuid.UUID(str(id_or_slug))
        except ValueError:
            parsed_uuid = None

    if parsed_uuid:
        stmt = select(ServiceCategory).where(ServiceCategory.id == parsed_uuid, ServiceCategory.is_active == True)
    else:
        stmt = select(ServiceCategory).where(ServiceCategory.slug == id_or_slug, ServiceCategory.is_active == True)

    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    if not category:
        raise AppError(code="NOT_FOUND", message="Category not found", status_code=status.HTTP_404_NOT_FOUND)

    cache_data = {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "noun": category.noun,
        "base_price": category.base_price,
        "items": category.items or [],
        "parent_id": str(category.parent_id) if category.parent_id else None,
        "pricing_model": category.pricing_model,
        "is_active": category.is_active,
        "icon_url": category.icon_url,
        "sort_order": category.sort_order,
    }
    await redis_client.setex(cache_key, 300, json.dumps(cache_data))
    return category


async def create_category(data: ServiceCategoryCreate, db: AsyncSession, redis_client: redis.Redis) -> ServiceCategory:
    dump = data.model_dump()
    if "items" in dump and dump["items"]:
        dump["items"] = [item if isinstance(item, dict) else item.model_dump() for item in dump["items"]]
    category = ServiceCategory(**dump)
    db.add(category)
    try:
        await db.commit()
        await db.refresh(category)
    except Exception:
        await db.rollback()
        raise AppError(code="CONFLICT", message="Category with this slug may already exist", status_code=status.HTTP_409_CONFLICT)
    
    # Invalidate cache
    await redis_client.delete(CACHE_KEY)
    return category


async def update_category(category_id: uuid.UUID, data: ServiceCategoryUpdate, db: AsyncSession, redis_client: redis.Redis) -> ServiceCategory:
    stmt = select(ServiceCategory).where(ServiceCategory.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    if not category:
        raise AppError(code="NOT_FOUND", message="Category not found", status_code=status.HTTP_404_NOT_FOUND)

    update_data = data.model_dump(exclude_unset=True)
    if "items" in update_data and update_data["items"] is not None:
        update_data["items"] = [item if isinstance(item, dict) else item.model_dump() for item in update_data["items"]]

    for k, v in update_data.items():
        setattr(category, k, v)

    try:
        await db.commit()
        await db.refresh(category)
    except Exception:
        await db.rollback()
        raise AppError(code="CONFLICT", message="Category with this slug may already exist", status_code=status.HTTP_409_CONFLICT)

    # Invalidate caches
    await redis_client.delete(CACHE_KEY)
    await redis_client.delete(f"cache:category:{category_id}")
    await redis_client.delete(f"cache:category:{category.slug}")
    return category


async def delete_category(category_id: uuid.UUID, db: AsyncSession, redis_client: redis.Redis) -> None:
    stmt = select(ServiceCategory).where(ServiceCategory.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    if not category:
        raise AppError(code="NOT_FOUND", message="Category not found", status_code=status.HTTP_404_NOT_FOUND)

    category.is_active = False
    await db.commit()

    # Invalidate caches
    await redis_client.delete(CACHE_KEY)
    await redis_client.delete(f"cache:category:{category_id}")
    await redis_client.delete(f"cache:category:{category.slug}")

