import uuid

from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.locations.models import ServiceZone
from app.locations.schemas import ServiceZoneCreate, ServiceZoneResponse, ServiceZoneUpdate


def _to_response(zone: ServiceZone) -> ServiceZoneResponse:
    polygon_wkt = None
    if isinstance(zone.polygon, WKBElement):
        polygon_wkt = to_shape(zone.polygon).wkt
    elif isinstance(zone.polygon, str):
        # Already WKT
        polygon_wkt = zone.polygon

    return ServiceZoneResponse(
        id=zone.id,
        name=zone.name,
        city=zone.city,
        state=zone.state,
        polygon_wkt=polygon_wkt,
        is_active=zone.is_active,
        created_at=zone.created_at,
        updated_at=zone.updated_at,
    )


async def get_all_zones(db: AsyncSession, include_inactive: bool = False) -> list[ServiceZoneResponse]:
    stmt = select(ServiceZone)
    if not include_inactive:
        stmt = stmt.where(ServiceZone.is_active == True)
    
    result = await db.execute(stmt)
    zones = result.scalars().all()
    
    return [_to_response(z) for z in zones]


async def get_zone(db: AsyncSession, zone_id: uuid.UUID) -> ServiceZoneResponse:
    zone = await db.get(ServiceZone, zone_id)
    if not zone:
        raise AppError(code="NOT_FOUND", message="Service zone not found", status_code=404)
    return _to_response(zone)


async def create_zone(db: AsyncSession, data: ServiceZoneCreate) -> ServiceZoneResponse:
    try:
        zone = ServiceZone(
            name=data.name,
            city=data.city,
            state=data.state,
            polygon=data.polygon_wkt,
            is_active=data.is_active,
        )
        db.add(zone)
        await db.commit()
        await db.refresh(zone)
        return _to_response(zone)
    except Exception as e:
        await db.rollback()
        raise AppError(code="SERVER_ERROR", message=f"Failed to create zone: {e!s}", status_code=500)


async def update_zone(db: AsyncSession, zone_id: uuid.UUID, data: ServiceZoneUpdate) -> ServiceZoneResponse:
    zone = await db.get(ServiceZone, zone_id)
    if not zone:
        raise AppError(code="NOT_FOUND", message="Service zone not found", status_code=404)

    update_data = data.model_dump(exclude_unset=True)
    if "polygon_wkt" in update_data:
        zone.polygon = update_data.pop("polygon_wkt")

    for field, value in update_data.items():
        setattr(zone, field, value)

    try:
        await db.commit()
        await db.refresh(zone)
        return _to_response(zone)
    except Exception as e:
        await db.rollback()
        raise AppError(code="SERVER_ERROR", message=f"Failed to update zone: {e!s}", status_code=500)


async def delete_zone(db: AsyncSession, zone_id: uuid.UUID) -> None:
    zone = await db.get(ServiceZone, zone_id)
    if not zone:
        raise AppError(code="NOT_FOUND", message="Service zone not found", status_code=404)
    
    zone.is_active = False
    await db.commit()
