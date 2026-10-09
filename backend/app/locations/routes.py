import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database.session import get_db
from app.locations import service
from app.locations.schemas import ServiceZoneCreate, ServiceZoneResponse, ServiceZoneUpdate
from app.users.models import User

admin_router = APIRouter(prefix="/admin/zones", tags=["Admin Service Zones"])
public_router = APIRouter(prefix="/zones", tags=["Service Zones"])


@public_router.get("", response_model=list[ServiceZoneResponse])
async def get_zones(
    db: AsyncSession = Depends(get_db),
):
    """List all active service zones."""
    return await service.get_all_zones(db, include_inactive=False)


@admin_router.get("", response_model=list[ServiceZoneResponse])
async def admin_get_zones(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all service zones including inactive (Admin only)."""
    return await service.get_all_zones(db, include_inactive=True)


@admin_router.post("", response_model=ServiceZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(
    data: ServiceZoneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new service zone."""
    return await service.create_zone(db, data)


@admin_router.patch("/{zone_id}", response_model=ServiceZoneResponse)
async def update_zone(
    zone_id: uuid.UUID,
    data: ServiceZoneUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a service zone."""
    return await service.update_zone(db, zone_id, data)


@admin_router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_zone(
    zone_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Soft delete a service zone."""
    await service.delete_zone(db, zone_id)
