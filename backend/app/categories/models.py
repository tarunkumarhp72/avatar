import enum
import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKey


class PricingModel(str, enum.Enum):
    FIXED = "FIXED"
    INSPECTION_QUOTE = "INSPECTION_QUOTE"
    PROJECT_QUOTE = "PROJECT_QUOTE"


class ServiceCategory(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "service_categories"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(1000))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("service_categories.id", ondelete="RESTRICT"), index=True)
    pricing_model: Mapped[PricingModel] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    icon_url: Mapped[str | None] = mapped_column(String(1000))
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    parent = relationship("ServiceCategory", remote_side="ServiceCategory.id", backref="subcategories")
