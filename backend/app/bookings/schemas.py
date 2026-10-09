import uuid
from datetime import datetime

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
    worker_id: uuid.UUID | None = None
    category_id: uuid.UUID
    address_lat: float
    address_lng: float
    address_text: str
    description: str
    is_emergency: bool
    status: str
    estimated_amount_paise: int | None = None
    final_amount_paise: int | None = None
    material_charges_paise: int
    platform_fee_paise: int | None = None
    worker_payout_paise: int | None = None
    distance_km: float
    accepted_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_at: datetime | None = None
    cancellation_reason: str | None = None
    created_at: datetime
    updated_at: datetime


class BookingListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    status: str
    address_text: str
    is_emergency: bool
    estimated_amount_paise: int | None = None
    created_at: datetime


class CancelBookingRequest(BaseModel):
    reason: str


class MaterialChargesRequest(BaseModel):
    material_charges_paise: int


class AdminBookingListResponse(BaseModel):
    items: list[BookingListResponse]
    total: int
    page: int
    size: int

