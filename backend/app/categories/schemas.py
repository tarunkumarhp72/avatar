import uuid

from pydantic import BaseModel

from app.categories.models import PricingModel


class ServiceCategoryBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    parent_id: uuid.UUID | None = None
    pricing_model: PricingModel
    is_active: bool = True
    icon_url: str | None = None
    sort_order: int = 0

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    parent_id: uuid.UUID | None = None
    pricing_model: PricingModel | None = None
    is_active: bool | None = None
    icon_url: str | None = None
    sort_order: int | None = None

class ServiceCategoryResponse(ServiceCategoryBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}
