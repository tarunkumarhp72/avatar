import uuid

import pytest
import redis.asyncio as redis
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories.models import PricingModel, ServiceCategory


@pytest.fixture
async def redis_client(client: AsyncClient):
    from app.redis.client import get_redis
    redis_instance = await anext(get_redis())
    yield redis_instance



@pytest.fixture
async def sample_categories(db_session: AsyncSession):
    active_cat = ServiceCategory(
        id=uuid.uuid4(),
        name="Active Category",
        slug="active-category",
        description="Active category desc",
        pricing_model=PricingModel.FIXED,
        is_active=True,
    )
    inactive_cat = ServiceCategory(
        id=uuid.uuid4(),
        name="Inactive Category",
        slug="inactive-category",
        description="Inactive category desc",
        pricing_model=PricingModel.FIXED,
        is_active=False,
    )
    db_session.add(active_cat)
    db_session.add(inactive_cat)
    await db_session.commit()
    await db_session.refresh(active_cat)
    return active_cat


@pytest.mark.asyncio
async def test_list_categories_returns_active_only(client: AsyncClient, sample_categories, redis_client: redis.Redis):
    await redis_client.delete("cache:categories")
    
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    
    # Check that inactive is not returned
    slugs = [c["slug"] for c in data]
    assert "active-category" in slugs
    assert "inactive-category" not in slugs


@pytest.mark.asyncio
async def test_admin_creates_category(client: AsyncClient, admin_token_headers: dict):
    payload = {
        "name": "New Category",
        "slug": "new-category",
        "description": "New category desc",
        "pricing_model": "FIXED",
    }
    response = await client.post("/api/v1/admin/categories", json=payload, headers=admin_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Category"
    assert data["pricing_model"] == "FIXED"


@pytest.mark.asyncio
async def test_non_admin_creates_category_fails(client: AsyncClient, customer_token_headers: dict):
    payload = {
        "name": "New Category 2",
        "slug": "new-category-2",
        "description": "New category desc",
        "pricing_model": "fixed",
    }
    response = await client.post("/api/v1/admin/categories", json=payload, headers=customer_token_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_cache_invalidated_on_update(client: AsyncClient, admin_token_headers: dict, sample_categories, redis_client: redis.Redis):
    # Ensure cache is populated
    await client.get("/api/v1/categories")
    
    cache = await redis_client.get("cache:categories")
    assert cache is not None
    
    # Update category
    payload = {"name": "Updated Category Name"}
    response = await client.patch(f"/api/v1/admin/categories/{sample_categories.id}", json=payload, headers=admin_token_headers)
    assert response.status_code == 200
    
    # Check cache is invalidated
    cache_after = await redis_client.get("cache:categories")
    assert cache_after is None
