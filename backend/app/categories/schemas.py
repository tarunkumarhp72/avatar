import uuid
from typing import Any

from pydantic import BaseModel, Field

from app.categories.models import PricingModel


class CategoryItemSchema(BaseModel):
    id: str
    name: str
    desc: str | None = ""
    time: str | None = "60 min"
    add: int = 0
    em: bool = False


class ServiceCategoryBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    noun: str | None = "professional"
    base_price: int = 499
    items: list[CategoryItemSchema] = Field(default_factory=list)
    parent_id: uuid.UUID | None = None
    pricing_model: PricingModel = PricingModel.FIXED
    is_active: bool = True
    icon_url: str | None = None
    sort_order: int = 0


class ServiceCategoryCreate(ServiceCategoryBase):
    pass


class ServiceCategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    noun: str | None = None
    base_price: int | None = None
    items: list[CategoryItemSchema] | None = None
    parent_id: uuid.UUID | None = None
    pricing_model: PricingModel | None = None
    is_active: bool | None = None
    icon_url: str | None = None
    sort_order: int | None = None


class ServiceCategoryResponse(ServiceCategoryBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}

