import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base, TimestampMixin, UUIDPrimaryKey


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"           # Customer created, waiting for worker acceptance
    ACCEPTED = "ACCEPTED"         # Worker accepted
    EN_ROUTE = "EN_ROUTE"         # Worker is on the way
    IN_PROGRESS = "IN_PROGRESS"   # Work started (worker checked in)
    COMPLETED = "COMPLETED"       # Work done, pending payment
    PAID = "PAID"                 # Payment confirmed
    CANCELLED_BY_CUSTOMER = "CANCELLED_BY_CUSTOMER"
    CANCELLED_BY_WORKER = "CANCELLED_BY_WORKER"
    CANCELLED_BY_ADMIN = "CANCELLED_BY_ADMIN"


class Booking(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "bookings"

    # Parties
    customer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("customer_profiles.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    worker_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("worker_profiles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("service_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # Location (stored as plain floats — same as worker location)
    address_lat: Mapped[float] = mapped_column(Float, nullable=False)
    address_lng: Mapped[float] = mapped_column(Float, nullable=False)
    address_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Job info
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_emergency: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Pricing snapshot (from pricing engine at booking time)
    pricing_rule_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("pricing_rules.id", ondelete="SET NULL"), nullable=True
    )
    estimated_amount_paise: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    final_amount_paise: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    material_charges_paise: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    platform_fee_paise: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    worker_payout_paise: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    distance_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Status
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, native_enum=False, length=40),
        default=BookingStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Timestamps for lifecycle events
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    en_route_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Cancellation info
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
