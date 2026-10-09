import datetime
import enum
import uuid

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Numeric, text, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PricingModel(enum.Enum):
    FIXED = "FIXED"
    INSPECTION_QUOTE = "INSPECTION_QUOTE"
    PROJECT_QUOTE = "PROJECT_QUOTE"


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=True)
    area_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("service_zones.id", ondelete="CASCADE"), nullable=True)

    pricing_model: Mapped[PricingModel] = mapped_column(Enum(PricingModel, native_enum=False), nullable=False)

    base_amount_paise: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    visit_fee_paise: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)

    distance_fee_per_km_paise: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    distance_fee_threshold_km: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)

    emergency_fee_paise: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)

    platform_fee_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    worker_commission_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)

    material_charges_allowed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    material_charges_max_paise: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)

    effective_from: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    effective_until: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)

    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=text("now()"))
