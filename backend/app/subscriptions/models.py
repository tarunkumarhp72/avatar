import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKey


class SubscriptionPlan(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "subscription_plans"
    
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    price_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class WorkerSubscription(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "worker_subscriptions"
    
    worker_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False, index=True)
    starts_at: Mapped[datetime] = mapped_column(nullable=False)
    ends_at: Mapped[datetime] = mapped_column(nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
