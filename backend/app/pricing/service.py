import datetime
import uuid

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.pricing.models import PricingRule
from app.pricing.schemas import PriceBreakdown


def calculate_price(
    rule: PricingRule,
    distance_km: float,
    is_emergency: bool = False,
    material_charges_paise: int = 0,
) -> PriceBreakdown:
    base = rule.base_amount_paise
    visit = rule.visit_fee_paise

    distance_fee = 0
    if distance_km > float(rule.distance_fee_threshold_km):
        extra_km = distance_km - float(rule.distance_fee_threshold_km)
        distance_fee = int(extra_km * rule.distance_fee_per_km_paise)

    emergency = rule.emergency_fee_paise if is_emergency else 0

    mat_charge = material_charges_paise
    if not rule.material_charges_allowed:
        mat_charge = 0
    else:
        mat_charge = min(mat_charge, rule.material_charges_max_paise)

    total = base + visit + distance_fee + emergency + mat_charge

    return PriceBreakdown(
        base_amount_paise=base,
        visit_fee_paise=visit,
        distance_fee_paise=distance_fee,
        emergency_fee_paise=emergency,
        material_charges_paise=mat_charge,
        total_amount_paise=total,
        applied_rule_id=rule.id,
        distance_km=distance_km,
    )


async def resolve_pricing_rule(
    category_id: uuid.UUID,
    lat: float,
    lng: float,
    db: AsyncSession,
    redis: aioredis.Redis,
) -> PricingRule:
    from sqlalchemy import text

    # Find which zone contains this lat/lng
    area_query = text("""
        SELECT id FROM service_zones
        WHERE is_active = true
        AND polygon IS NOT NULL
        AND ST_Contains(polygon::geometry, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geometry)
        LIMIT 1
    """)
    res = await db.execute(area_query, {"lng": lng, "lat": lat})
    area_row = res.fetchone()
    area_id: uuid.UUID | None = area_row[0] if area_row else None

    today = datetime.date.today()

    stmt = select(PricingRule).where(
        PricingRule.effective_from <= today,
        (PricingRule.effective_until.is_(None)) | (PricingRule.effective_until >= today),
    )

    result = await db.execute(stmt)
    rules = result.scalars().all()

    if not rules:
        raise AppError("NOT_FOUND", "No pricing rules configured.", 404)

    matching_rules = []
    for r in rules:
        cat_match = r.category_id is None or r.category_id == category_id
        area_match = r.area_id is None or r.area_id == area_id
        if cat_match and area_match:
            matching_rules.append(r)

    if not matching_rules:
        raise AppError("NOT_FOUND", "No matching pricing rule found.", 404)

    def rule_score(r: PricingRule) -> tuple[int, datetime.date]:
        score = 0
        if r.category_id is not None:
            score += 2
        if r.area_id is not None:
            score += 1
        return (score, r.effective_from)

    matching_rules.sort(key=rule_score, reverse=True)
    return matching_rules[0]
