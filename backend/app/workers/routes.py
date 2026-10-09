import typing
import uuid

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.core.exceptions import AppError
from app.database.session import get_db
from app.redis.client import get_redis
from app.users.models import User, UserRole
from app.workers import service
from app.workers.models import KYCStatus, WorkerLifecycleStatus, WorkerProfile
from app.workers.schemas import (
    AdminWorkerDetailResponse,
    AdminWorkerListResponse,
    KYCDocumentCreate,
    KYCDocumentResponse,
    KYCReviewRequest,
    WorkerAvailabilityRequest,
    WorkerCategoryRequest,
    WorkerLocationRequest,
    WorkerProfileCreate,
    WorkerProfileResponse,
    WorkerProfileUpdate,
    WorkerServiceAreaRequest,
)

router = APIRouter(prefix="/workers", tags=["Workers"])


def require_worker_role(user_data: tuple[User, str] = Depends(get_current_user)) -> User:
    current_user = user_data[0]
    if current_user.role != UserRole.WORKER:
        raise AppError(code="FORBIDDEN", message="Worker access only", status_code=status.HTTP_403_FORBIDDEN)
    return current_user


@router.post("/me/profile", response_model=WorkerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    data: WorkerProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
):
    """Create a worker profile for the current user."""
    return await service.create_worker_profile(current_user.id, data, db)


@router.get("/me/profile", response_model=WorkerProfileResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
):
    """Get the current user's worker profile."""
    profile = await service.get_worker_profile_by_user_id(current_user.id, db)
    if not profile:
        raise AppError(code="NOT_FOUND", message="Worker profile not found", status_code=status.HTTP_404_NOT_FOUND)
    return profile


@router.patch("/me/profile", response_model=WorkerProfileResponse)
async def update_my_profile(
    data: WorkerProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
):
    """Update the current user's worker profile."""
    return await service.update_worker_profile(current_user.id, data, db)


@router.post("/me/kyc/upload-url")
async def get_kyc_upload_url(
    doc_type: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
):
    """Generate signed upload URL for a doc type (stub)."""
    return {"upload_url": f"https://stub-upload.example.com/{uuid.uuid4()}", "file_key": str(uuid.uuid4())}


@router.post("/me/kyc/confirm", response_model=KYCDocumentResponse, status_code=status.HTTP_201_CREATED)
async def submit_kyc(
    data: KYCDocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
):
    """Submit a KYC document for the current worker."""
    return await service.submit_kyc_document(current_user.id, data, db)


@router.get("/me/kyc", response_model=list[KYCDocumentResponse])
async def list_kyc_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
):
    """List KYC documents for the current worker."""
    return await service.get_kyc_documents(current_user.id, db)


@router.put("/me/categories", response_model=WorkerProfileResponse)
async def update_my_categories(
    categories: list[WorkerCategoryRequest],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
) -> WorkerProfile:
    """Update the current worker's service categories."""
    return await service.update_worker_categories(current_user.id, categories, db)


@router.put("/me/service-areas", response_model=WorkerProfileResponse)
async def update_my_service_areas(
    areas: list[WorkerServiceAreaRequest],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker_role),
) -> WorkerProfile:
    """Update the current worker's service areas."""
    return await service.update_worker_service_areas(current_user.id, areas, db)


@router.post("/me/availability", response_model=WorkerProfileResponse)
async def update_my_availability(
    data: WorkerAvailabilityRequest,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
    current_user: User = Depends(require_worker_role),
) -> WorkerProfile:
    """Update the current worker's availability."""
    return await service.update_worker_availability(current_user.id, data, db, redis)


@router.post("/me/location", response_model=WorkerProfileResponse)
async def update_my_location(
    data: WorkerLocationRequest,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
    current_user: User = Depends(require_worker_role),
) -> WorkerProfile:
    """Update the current worker's location."""
    return await service.update_worker_location(current_user.id, data, db, redis)


def require_customer_role(user_data: tuple[User, str] = Depends(get_current_user)) -> User:
    current_user = user_data[0]
    if current_user.role != UserRole.CUSTOMER:
        raise AppError(code="FORBIDDEN", message="Customer access only", status_code=status.HTTP_403_FORBIDDEN)
    return current_user


@router.get("/nearby")
async def get_nearby_workers(
    lat: float,
    lng: float,
    category_id: uuid.UUID,
    radius_km: float = 10.0,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
    current_user: User = Depends(require_customer_role),
) -> list[dict[str, typing.Any]]:
    """Get nearby workers for a customer."""
    return await service.get_nearby_workers(lat, lng, category_id, radius_km, db, redis)


admin_router = APIRouter(prefix="/admin/workers", tags=["Admin Workers"])

def require_admin_role(user_data: tuple[User, str] = Depends(get_current_user)) -> User:
    current_user = user_data[0]
    if current_user.role != UserRole.ADMIN:
        raise AppError(code="FORBIDDEN", message="Admin access only", status_code=status.HTTP_403_FORBIDDEN)
    return current_user


@admin_router.get("", response_model=AdminWorkerListResponse)
async def admin_list_workers(
    kyc_status: KYCStatus | None = None,
    lifecycle_status: WorkerLifecycleStatus | None = None,
    page: int = 1,
    size: int = 50,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin_role),
):
    """List and filter workers (admin only)."""
    items, total = await service.list_workers_for_admin(db, kyc_status, lifecycle_status, page, size)
    return AdminWorkerListResponse(
        items=items,
        total=total,
        page=page,
        size=size
    )


@admin_router.get("/{id}", response_model=AdminWorkerDetailResponse)
async def admin_get_worker_detail(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin_role),
):
    """Get worker detail with KYC documents (admin only)."""
    return await service.get_worker_detail_for_admin(id, db)


@admin_router.get("/{id}/kyc", response_model=list[KYCDocumentResponse])
async def admin_list_kyc_documents(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin_role),
) -> typing.Sequence[KYCDocumentResponse]:
    """List worker's KYC docs (admin only)."""
    return await service.get_kyc_documents_by_worker_id(id, db)


@admin_router.post("/{id}/kyc/{doc_id}/review", response_model=KYCDocumentResponse)
async def admin_review_kyc_document(
    id: uuid.UUID,
    doc_id: uuid.UUID,
    data: KYCReviewRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin_role),
) -> KYCDocumentResponse:
    """Approve/reject a worker's KYC document (admin only)."""
    return await service.review_kyc_document(id, doc_id, admin_user.id, data, db)


@admin_router.post("/{id}/approve", response_model=WorkerProfileResponse)
async def admin_approve_worker(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin_role),
) -> WorkerProfileResponse:
    """Set worker lifecycle status to ACTIVE (admin only)."""
    from app.workers.models import WorkerLifecycleStatus
    return await service.set_worker_lifecycle_status(id, WorkerLifecycleStatus.ACTIVE, db)


@admin_router.post("/{id}/suspend", response_model=WorkerProfileResponse)
async def admin_suspend_worker(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin_role),
) -> WorkerProfileResponse:
    """Set worker lifecycle status to SUSPENDED (admin only)."""
    from app.workers.models import WorkerLifecycleStatus
    return await service.set_worker_lifecycle_status(id, WorkerLifecycleStatus.SUSPENDED, db)
