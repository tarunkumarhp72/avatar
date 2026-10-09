import uuid

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, get_redis, require_admin
from app.pricing import service
from app.pricing.models import PricingRule
from app.pricing.schemas import PriceBreakdown, PricingRuleResponse
from app.users.models import User

router = APIRouter(prefix="/pricing", tags=["Pricing"])
admin_router = APIRouter(prefix="/admin/pricing", tags=["Admin Pricing"])


@router.get("/estimate", response_model=PriceBreakdown)
async def estimate_price(
    category_id: uuid.UUID,
    lat: float,
    lng: float,
    is_emergency: bool = False,
    distance_km: float = 0.0,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: aioredis.Redis = Depends(get_redis),  # noqa: B008
    current_user: User = Depends(get_current_user),  # noqa: B008
) -> PriceBreakdown:
    """Pre-booking price estimate (customer)."""
    best_rule = await service.resolve_pricing_rule(category_id, lat, lng, db, redis_client)
    return service.calculate_price(best_rule, distance_km=distance_km, is_emergency=is_emergency)


@admin_router.get("/rules", response_model=list[PricingRuleResponse])
async def list_pricing_rules(
    db: AsyncSession = Depends(get_db),  # noqa: B008
    admin_user: User = Depends(require_admin),  # noqa: B008
) -> list[PricingRuleResponse]:
    """List all pricing rules (Admin only)."""
    result = await db.execute(select(PricingRule).order_by(PricingRule.created_at.desc()))
    return result.scalars().all()  # type: ignore[return-value]
