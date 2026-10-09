import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BookingCreateRequest(BaseModel):
    category_id: uuid.UUID
    address_lat: float
    address_lng: float
    address_text: str
    description: str
    is_emergency: bool = False


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_id: uuid.UUID
    worker_id: Optional[uuid.UUID] = None
    category_id: uuid.UUID
    address_lat: float
    address_lng: float
    address_text: str
    description: str
    is_emergency: bool
    status: str
    estimated_amount_paise: Optional[int] = None
    final_amount_paise: Optional[int] = None
    material_charges_paise: int
    platform_fee_paise: Optional[int] = None
    worker_payout_paise: Optional[int] = None
    distance_km: float
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class BookingListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    status: str
    address_text: str
    is_emergency: bool
    estimated_amount_paise: Optional[int] = None
    created_at: datetime


class CancelBookingRequest(BaseModel):
    reason: str


class MaterialChargesRequest(BaseModel):
    material_charges_paise: int
