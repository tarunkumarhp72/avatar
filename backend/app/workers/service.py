import typing
import uuid
from collections.abc import Sequence
from datetime import UTC, datetime

import redis.asyncio as aioredis
from fastapi import status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.locations.models import WorkerServiceArea
from app.redis.keys import WORKER_ONLINE_TTL, worker_online_key
from app.workers.models import (
    KYCDocument,
    KYCStatus,
    WorkerCategory,
    WorkerLifecycleStatus,
    WorkerProfile,
)
from app.workers.schemas import (
    KYCDocumentCreate,
    KYCReviewRequest,
    WorkerAvailabilityRequest,
    WorkerCategoryRequest,
    WorkerLocationRequest,
    WorkerProfileCreate,
    WorkerProfileUpdate,
    WorkerServiceAreaRequest,
)


async def get_worker_profile_by_user_id(user_id: uuid.UUID, db: AsyncSession) -> WorkerProfile | None:
    stmt = select(WorkerProfile).where(WorkerProfile.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_worker_profile(worker_id: uuid.UUID, db: AsyncSession) -> WorkerProfile:
    stmt = select(WorkerProfile).where(WorkerProfile.id == worker_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)
    return profile


async def create_worker_profile(user_id: uuid.UUID, data: WorkerProfileCreate, db: AsyncSession) -> WorkerProfile:
    existing = await get_worker_profile_by_user_id(user_id, db)
    if existing:
        raise AppError(code="CONFLICT", message="Worker profile already exists for this user", status_code=status.HTTP_409_CONFLICT)
    
    profile = WorkerProfile(user_id=user_id, **data.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def update_worker_profile(user_id: uuid.UUID, data: WorkerProfileUpdate, db: AsyncSession) -> WorkerProfile:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    await db.commit()
    await db.refresh(profile)
    return profile


async def submit_kyc_document(user_id: uuid.UUID, data: KYCDocumentCreate, db: AsyncSession) -> KYCDocument:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)
        
    doc = KYCDocument(worker_id=profile.id, **data.model_dump())
    db.add(doc)
    
    # Auto transition status to PENDING_KYC if it was ONBOARDING
    if profile.status == WorkerLifecycleStatus.ONBOARDING:
        profile.status = WorkerLifecycleStatus.PENDING_KYC
        
    await db.commit()
    await db.refresh(doc)
    return doc


async def get_kyc_documents(user_id: uuid.UUID, db: AsyncSession) -> Sequence[KYCDocument]:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)
        
    stmt = select(KYCDocument).where(KYCDocument.worker_id == profile.id).order_by(KYCDocument.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_worker_categories(user_id: uuid.UUID, categories: list[WorkerCategoryRequest], db: AsyncSession) -> WorkerProfile:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)

    # Delete existing categories
    delete_stmt = delete(WorkerCategory).where(WorkerCategory.worker_id == profile.id)
    await db.execute(delete_stmt)

    # Insert new categories
    for cat in categories:
        new_cat = WorkerCategory(
            worker_id=profile.id,
            category_id=cat.category_id,
            years_experience=cat.years_experience
        )
        db.add(new_cat)

    await db.commit()
    return profile


async def update_worker_service_areas(user_id: uuid.UUID, areas: list[WorkerServiceAreaRequest], db: AsyncSession) -> WorkerProfile:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)

    # Delete existing areas
    delete_stmt = delete(WorkerServiceArea).where(WorkerServiceArea.worker_id == profile.id)
    await db.execute(delete_stmt)

    # Insert new areas
    for area in areas:
        new_area = WorkerServiceArea(
            worker_id=profile.id,
            zone_id=area.zone_id
        )
        db.add(new_area)

    await db.commit()
    return profile


async def update_worker_availability(user_id: uuid.UUID, data: WorkerAvailabilityRequest, db: AsyncSession, redis: aioredis.Redis) -> WorkerProfile:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)

    profile.is_available = data.is_available
    await db.commit()
    
    if data.is_available:
        await redis.set(worker_online_key(str(profile.id)), "1", ex=WORKER_ONLINE_TTL)
    else:
        await redis.delete(worker_online_key(str(profile.id)))
        
    await db.refresh(profile)
    return profile


async def update_worker_location(user_id: uuid.UUID, data: WorkerLocationRequest, db: AsyncSession, redis: aioredis.Redis) -> WorkerProfile:
    profile = await get_worker_profile_by_user_id(user_id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)

    profile.current_location_lat = data.lat
    profile.current_location_lng = data.lng
    await db.commit()

    if profile.is_available:
        await redis.set(worker_online_key(str(profile.id)), "1", ex=WORKER_ONLINE_TTL)

    await db.refresh(profile)
    return profile


async def get_nearby_workers(
    lat: float,
    lng: float,
    category_id: uuid.UUID,
    radius_km: float,
    db: AsyncSession,
    redis: aioredis.Redis
) -> list[dict[str, typing.Any]]:
    import typing

    from sqlalchemy import func

    from app.users.models import User

    distance_expr = (
        6371.0 * func.acos(
            func.cos(func.radians(lat)) * func.cos(func.radians(WorkerProfile.current_location_lat)) *
            func.cos(func.radians(WorkerProfile.current_location_lng) - func.radians(lng)) +
            func.sin(func.radians(lat)) * func.sin(func.radians(WorkerProfile.current_location_lat))
        )
    ).label("distance_km")

    stmt = (
        select(WorkerProfile, User, distance_expr)
        .join(User, User.id == WorkerProfile.user_id)
        .join(WorkerCategory, WorkerCategory.worker_id == WorkerProfile.id)
        .where(WorkerProfile.status == WorkerLifecycleStatus.ACTIVE)
        .where(WorkerProfile.is_available == True)
        .where(WorkerCategory.category_id == category_id)
        .where(WorkerProfile.current_location_lat.is_not(None))
        .where(WorkerProfile.current_location_lng.is_not(None))
    )

    result = await db.execute(stmt)
    rows = result.all()

    workers: list[dict[str, typing.Any]] = []
    for profile, user, distance in rows:
        if distance <= radius_km:
            # Check heartbeat
            is_online = await redis.get(worker_online_key(str(profile.id)))
            if is_online:
                workers.append({
                    "id": str(profile.id),
                    "name": user.full_name,
                    "rating": profile.rating,
                    "distance_km": round(float(distance), 2),
                    "profile_photo_url": profile.profile_photo_url,
                })

    # Sort by distance
    workers.sort(key=lambda x: float(x["distance_km"]))
    
    # Return top 20
    return workers[:20]


async def get_kyc_documents_by_worker_id(worker_id: uuid.UUID, db: AsyncSession) -> Sequence[KYCDocument]:
    stmt = select(KYCDocument).where(KYCDocument.worker_id == worker_id).order_by(KYCDocument.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def review_kyc_document(
    worker_id: uuid.UUID,
    doc_id: uuid.UUID,
    admin_user_id: uuid.UUID,
    data: KYCReviewRequest,
    db: AsyncSession,
) -> KYCDocument:
    stmt = select(KYCDocument).where(KYCDocument.id == doc_id, KYCDocument.worker_id == worker_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise AppError(code="NOT_FOUND", message="KYC document not found", status_code=status.HTTP_404_NOT_FOUND)

    doc.status = data.status
    doc.reviewed_by = admin_user_id
    doc.reviewed_at = datetime.now(UTC)
    doc.rejection_reason = data.rejection_reason
    
    await db.commit()
    await db.refresh(doc)
    return doc


async def set_worker_lifecycle_status(worker_id: uuid.UUID, lifecycle_status: WorkerLifecycleStatus, db: AsyncSession) -> WorkerProfile:
    stmt = select(WorkerProfile).where(WorkerProfile.id == worker_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)

    profile.status = lifecycle_status
    await db.commit()
    await db.refresh(profile)
    return profile


async def list_workers_for_admin(
    db: AsyncSession,
    kyc_status: KYCStatus | None = None,
    lifecycle_status: WorkerLifecycleStatus | None = None,
    page: int = 1,
    size: int = 50,
) -> tuple[Sequence[WorkerProfile], int]:
    from sqlalchemy import func
    
    stmt = select(WorkerProfile)
    
    if lifecycle_status:
        stmt = stmt.where(WorkerProfile.status == lifecycle_status)
        
    if kyc_status:
        # Require a join with KYCDocument or similar logic, but for simplicity we can
        # just filter by workers who have at least one doc with this status, or 
        # assume we want to query based on the latest doc. Let's do a simple join.
        stmt = stmt.join(KYCDocument, KYCDocument.worker_id == WorkerProfile.id)
        stmt = stmt.where(KYCDocument.status == kyc_status)
        stmt = stmt.distinct()
        
    # Get total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await db.scalar(count_stmt) or 0
    
    # Get paginated items
    stmt = stmt.order_by(WorkerProfile.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    return items, total


async def get_worker_detail_for_admin(
    worker_id: uuid.UUID,
    db: AsyncSession,
) -> dict[str, typing.Any]:
    stmt = select(WorkerProfile).where(WorkerProfile.id == worker_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)
        
    kyc_docs = await get_kyc_documents_by_worker_id(worker_id, db)
    
    # Return a dict that matches the AdminWorkerDetailResponse schema
    return {
        **profile.__dict__,
        "id": profile.id,  # Ensure ID is explicitly set if using dict unpack
        "kyc_documents": kyc_docs
    }
