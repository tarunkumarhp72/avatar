from typing import Optional
import uuid
from pydantic import BaseModel
from datetime import date

class PricingRuleResponse(BaseModel):
    id: uuid.UUID
    category_id: Optional[uuid.UUID] = None
    area_id: Optional[uuid.UUID] = None
    pricing_model: str
    base_amount_paise: int
    visit_fee_paise: int
    distance_fee_per_km_paise: int
    distance_fee_threshold_km: float
    emergency_fee_paise: int
    platform_fee_percent: float
    worker_commission_percent: float
    material_charges_allowed: bool
    material_charges_max_paise: int
    effective_from: date
    effective_until: Optional[date] = None

class PriceBreakdown(BaseModel):
    base_amount_paise: int
    visit_fee_paise: int
    distance_fee_paise: int
    emergency_fee_paise: int
    material_charges_paise: int
    total_amount_paise: int

    # Optional fields for showing transparency
    applied_rule_id: uuid.UUID
    distance_km: float

class PriceEstimateRequest(BaseModel):
    category_id: uuid.UUID
    lat: float
    lng: float
    is_emergency: bool = False

    # Internal usage
    worker_id: Optional[uuid.UUID] = None
