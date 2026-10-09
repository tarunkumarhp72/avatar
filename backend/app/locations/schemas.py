import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ServiceZoneBase(BaseModel):
    name: str = Field(..., max_length=255)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    polygon_wkt: str | None = Field(None, description="WKT representation of the polygon")
    is_active: bool = True

class ServiceZoneCreate(ServiceZoneBase):
    pass

class ServiceZoneUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    polygon_wkt: str | None = Field(None, description="WKT representation of the polygon")
    is_active: bool | None = None

class ServiceZoneResponse(ServiceZoneBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
