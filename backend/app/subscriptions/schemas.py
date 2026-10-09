import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class SubscriptionPlanResponse(BaseModel):
    id: uuid.UUID
    name: str
    price_paise: int
    duration_days: int
    features: dict[str, Any] | None = None
    is_active: bool

class WorkerSubscriptionResponse(BaseModel):
    id: uuid.UUID
    worker_id: uuid.UUID
    plan_id: uuid.UUID
    starts_at: datetime
    ends_at: datetime
    is_active: bool
