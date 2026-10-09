import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base, TimestampMixin, UUIDPrimaryKey


class WorkerLifecycleStatus(str, enum.Enum):
    ONBOARDING = "ONBOARDING"
    PENDING_KYC = "PENDING_KYC"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    REJECTED = "REJECTED"


class KYCStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class KYCDocType(str, enum.Enum):
    ID_CARD = "ID_CARD"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    ADDRESS_PROOF = "ADDRESS_PROOF"


class WorkerProfile(Base, TimestampMixin, UUIDPrimaryKey):
    __tablename__ = "worker_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    status: Mapped[WorkerLifecycleStatus] = mapped_column(
        Enum(WorkerLifecycleStatus, native_enum=False, length=50),
        default=WorkerLifecycleStatus.ONBOARDING,
        nullable=False,
    )
    
    # We will use simple Float types for location as agreed previously
    current_location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_location_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WorkerCategory(Base, TimestampMixin):
    __tablename__ = "worker_categories"

    worker_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("worker_profiles.id", ondelete="CASCADE"), primary_key=True)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("service_categories.id", ondelete="CASCADE"), primary_key=True)
    years_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)


class KYCDocument(Base, TimestampMixin, UUIDPrimaryKey):
    __tablename__ = "kyc_documents"

    worker_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False)
    
    doc_type: Mapped[KYCDocType] = mapped_column(
        Enum(KYCDocType, native_enum=False, length=50),
        nullable=False,
    )
    
    status: Mapped[KYCStatus] = mapped_column(
        Enum(KYCStatus, native_enum=False, length=50),
        default=KYCStatus.PENDING,
        nullable=False,
    )
    
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
