import uuid

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bookings import service
from app.bookings.schemas import (
    BookingCreateRequest,
    BookingListResponse,
    BookingResponse,
    CancelBookingRequest,
    MaterialChargesRequest,
)
from app.core.dependencies import get_customer_profile, get_db, get_redis, get_worker_profile
from app.customers.models import CustomerProfile
from app.workers.models import WorkerProfile

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# ------------------------------------------------------------------ #
# Customer endpoints
# ------------------------------------------------------------------ #

@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    body: BookingCreateRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: aioredis.Redis = Depends(get_redis),  # noqa: B008
    customer: CustomerProfile = Depends(get_customer_profile),  # noqa: B008
) -> BookingResponse:
    """Customer creates a new booking."""
    booking = await service.create_booking(body, customer, db, redis_client)
    return BookingResponse.model_validate(booking)


@router.get("/my", response_model=list[BookingListResponse])
async def list_my_bookings(
    db: AsyncSession = Depends(get_db),  # noqa: B008
    customer: CustomerProfile = Depends(get_customer_profile),  # noqa: B008
) -> list[BookingListResponse]:
    """List customer's own bookings."""
    bookings = await service.list_customer_bookings(customer, db)
    return [BookingListResponse.model_validate(b) for b in bookings]


@router.get("/my/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    customer: CustomerProfile = Depends(get_customer_profile),  # noqa: B008
) -> BookingResponse:
    """Get booking details (customer must own it)."""
    from app.core.exceptions import AppError
    booking = await service.get_booking_or_404(booking_id, db)
    if booking.customer_id != customer.id:
        raise AppError("FORBIDDEN", "You do not own this booking", 403)
    return BookingResponse.model_validate(booking)


@router.post("/my/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_my_booking(
    booking_id: uuid.UUID,
    body: CancelBookingRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    customer: CustomerProfile = Depends(get_customer_profile),  # noqa: B008
) -> BookingResponse:
    """Customer cancels their booking."""
    booking = await service.cancel_booking_by_customer(booking_id, customer, body.reason, db)
    return BookingResponse.model_validate(booking)


# ------------------------------------------------------------------ #
# Worker endpoints
# ------------------------------------------------------------------ #

@router.get("/available/pending", response_model=list[BookingListResponse])
async def list_available_bookings(
    db: AsyncSession = Depends(get_db),  # noqa: B008
    worker: WorkerProfile = Depends(get_worker_profile),  # noqa: B008
) -> list[BookingListResponse]:
    """Worker sees all PENDING bookings to accept."""
    bookings = await service.list_pending_bookings(db)
    return [BookingListResponse.model_validate(b) for b in bookings]


@router.get("/worker/my", response_model=list[BookingListResponse])
async def list_worker_bookings(
    db: AsyncSession = Depends(get_db),  # noqa: B008
    worker: WorkerProfile = Depends(get_worker_profile),  # noqa: B008
) -> list[BookingListResponse]:
    """Worker sees their assigned bookings."""
    bookings = await service.list_worker_bookings(worker, db)
    return [BookingListResponse.model_validate(b) for b in bookings]


@router.post("/{booking_id}/accept", response_model=BookingResponse)
async def accept_booking(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: aioredis.Redis = Depends(get_redis),  # noqa: B008
    worker: WorkerProfile = Depends(get_worker_profile),  # noqa: B008
) -> BookingResponse:
    """Worker accepts a PENDING booking."""
    booking = await service.accept_booking(booking_id, worker, db, redis_client)
    return BookingResponse.model_validate(booking)


@router.post("/{booking_id}/en-route", response_model=BookingResponse)
async def mark_en_route(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    worker: WorkerProfile = Depends(get_worker_profile),  # noqa: B008
) -> BookingResponse:
    """Worker marks themselves as on the way."""
    booking = await service.start_en_route(booking_id, worker, db)
    return BookingResponse.model_validate(booking)


@router.post("/{booking_id}/start", response_model=BookingResponse)
async def start_job(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    worker: WorkerProfile = Depends(get_worker_profile),  # noqa: B008
) -> BookingResponse:
    """Worker starts the job (check-in)."""
    booking = await service.start_job(booking_id, worker, db)
    return BookingResponse.model_validate(booking)


@router.post("/{booking_id}/complete", response_model=BookingResponse)
async def complete_job(
    booking_id: uuid.UUID,
    body: MaterialChargesRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: aioredis.Redis = Depends(get_redis),  # noqa: B008
    worker: WorkerProfile = Depends(get_worker_profile),  # noqa: B008
) -> BookingResponse:
    """Worker marks job complete and declares material charges."""
    booking = await service.complete_job(booking_id, worker, body.material_charges_paise, db, redis_client)
    return BookingResponse.model_validate(booking)


# ------------------------------------------------------------------ #
# Admin endpoints
# ------------------------------------------------------------------ #

from datetime import datetime

from app.bookings.models import BookingStatus
from app.bookings.schemas import AdminBookingListResponse
from app.core.dependencies import require_admin

admin_router = APIRouter(prefix="/admin/bookings", tags=["Admin Bookings"], dependencies=[Depends(require_admin)])

@admin_router.get("", response_model=AdminBookingListResponse)
async def admin_list_bookings(
    status: BookingStatus | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    category_id: uuid.UUID | None = None,
    page: int = 1,
    size: int = 50,
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    """Admin list and filter bookings."""
    items, total = await service.list_bookings_for_admin(
        db, status, date_from, date_to, category_id, page, size
    )
    return AdminBookingListResponse(
        items=[BookingListResponse.model_validate(b) for b in items],
        total=total,
        page=page,
        size=size
    )

@admin_router.get("/{booking_id}", response_model=BookingResponse)
async def admin_get_booking(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    """Admin get booking details."""
    booking = await service.get_booking_or_404(booking_id, db)
    return BookingResponse.model_validate(booking)


@admin_router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def admin_cancel_booking(
    booking_id: uuid.UUID,
    body: CancelBookingRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    """Admin cancels booking."""
    booking = await service.cancel_booking_by_admin(booking_id, body.reason, db)
    return BookingResponse.model_validate(booking)

