import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.locations.models import ServiceZone, WorkerServiceArea
from app.users.models import User, UserRole
from app.workers.models import WorkerProfile


@pytest.mark.asyncio
async def test_worker_service_areas_composite_pk(db_session: AsyncSession) -> None:
    # Setup user and worker
    user = User(
        phone="+1234567893",
        role=UserRole.WORKER,
    )
    db_session.add(user)
    await db_session.commit()
    
    worker = WorkerProfile(
        user_id=user.id,
        experience_years=5,
    )
    db_session.add(worker)
    await db_session.commit()

    # Create service zone
    zone = ServiceZone(
        name="Downtown",
        city="Test City",
        state="TS",
    )
    db_session.add(zone)
    await db_session.commit()

    # Create worker service area
    wsa = WorkerServiceArea(
        worker_id=worker.id,
        zone_id=zone.id,
    )
    db_session.add(wsa)
    await db_session.commit()

    # Attempt to create the same worker service area should fail
    duplicate_wsa = WorkerServiceArea(
        worker_id=worker.id,
        zone_id=zone.id,
    )
    db_session.add(duplicate_wsa)
    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()
