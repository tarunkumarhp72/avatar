import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class AddressBase(BaseModel):
    label: str = Field(..., max_length=50)
    address_line1: str = Field(..., max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    pincode: str = Field(..., max_length=20)
    location_lat: float | None = None
    location_lng: float | None = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label: str | None = Field(None, max_length=50)
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    pincode: str | None = Field(None, max_length=20)
    location_lat: float | None = None
    location_lng: float | None = None
    is_default: bool | None = None


class AddressResponse(AddressBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class CustomerProfileUpdate(BaseModel):
    default_address_id: uuid.UUID | None = None


class CustomerProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    default_address_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
