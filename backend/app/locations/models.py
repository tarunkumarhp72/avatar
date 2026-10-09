import uuid

from geoalchemy2 import Geography
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKey


class ServiceZone(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "service_zones"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    polygon: Mapped[Geography | None] = mapped_column(
        Geography(geometry_type="POLYGON", srid=4326), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

class WorkerServiceArea(Base, TimestampMixin):
    __tablename__ = "worker_service_areas"

    worker_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("worker_profiles.id", ondelete="CASCADE"), 
        primary_key=True
    )
    zone_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("service_zones.id", ondelete="CASCADE"), 
        primary_key=True
    )
