import uuid
from datetime import UTC, datetime

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.bookings.models import Booking, BookingStatus
from app.bookings.schemas import BookingCreateRequest
from app.core.exceptions import AppError
from app.customers.models import CustomerProfile
from app.pricing.service import calculate_price, resolve_pricing_rule
from app.workers.models import WorkerProfile

# ------------------------------------------------------------------ #
# Status transition validity map
# ------------------------------------------------------------------ #
VALID_TRANSITIONS: dict[BookingStatus, list[BookingStatus]] = {
    BookingStatus.PENDING: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED_BY_CUSTOMER, BookingStatus.CANCELLED_BY_ADMIN],
    BookingStatus.ACCEPTED: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED_BY_WORKER, BookingStatus.CANCELLED_BY_ADMIN],
    BookingStatus.EN_ROUTE: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED_BY_WORKER],
    BookingStatus.IN_PROGRESS: [BookingStatus.COMPLETED],
    BookingStatus.COMPLETED: [BookingStatus.PAID],
    BookingStatus.PAID: [],
    BookingStatus.CANCELLED_BY_CUSTOMER: [],
    BookingStatus.CANCELLED_BY_WORKER: [],
    BookingStatus.CANCELLED_BY_ADMIN: [],
}


def _assert_transition(current: BookingStatus, target: BookingStatus) -> None:
    allowed = VALID_TRANSITIONS.get(current, [])
    if target not in allowed:
        raise AppError(
            "INVALID_STATUS_TRANSITION",
            f"Cannot transition from {current} to {target}",
            409,
        )


async def create_booking(
    request: BookingCreateRequest,
    customer_profile: CustomerProfile,
    db: AsyncSession,
    redis: aioredis.Redis,
) -> Booking:
    # Resolve pricing rule
    try:
        rule = await resolve_pricing_rule(
            request.category_id, request.address_lat, request.address_lng, db, redis
        )
        estimate = calculate_price(rule, distance_km=0.0, is_emergency=request.is_emergency)
        pricing_rule_id = rule.id
        estimated_amount_paise = estimate.total_amount_paise
    except AppError:
        # No pricing rule; still allow booking creation
        pricing_rule_id = None
        estimated_amount_paise = None

    booking = Booking(
        id=uuid.uuid4(),
        customer_id=customer_profile.id,
        category_id=request.category_id,
        address_lat=request.address_lat,
        address_lng=request.address_lng,
        address_text=request.address_text,
        description=request.description,
        is_emergency=request.is_emergency,
        pricing_rule_id=pricing_rule_id,
        estimated_amount_paise=estimated_amount_paise,
        status=BookingStatus.PENDING,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking


async def get_booking_or_404(booking_id: uuid.UUID, db: AsyncSession) -> Booking:
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise AppError("NOT_FOUND", "Booking not found", 404)
    return booking


async def accept_booking(
    booking_id: uuid.UUID,
    worker_profile: WorkerProfile,
    db: AsyncSession,
    redis: aioredis.Redis,
) -> Booking:
    """Worker accepts a PENDING booking."""
    lock_key = f"booking:lock:{booking_id}"

    # Distributed lock: prevent race condition between workers
    acquired = await redis.set(lock_key, str(worker_profile.id), nx=True, ex=30)
    if not acquired:
        raise AppError("BOOKING_LOCKED", "Another worker is already accepting this booking", 409)

    try:
        booking = await get_booking_or_404(booking_id, db)
        _assert_transition(booking.status, BookingStatus.ACCEPTED)

        # Ensure worker is active and available
        if not worker_profile.is_available:
            raise AppError("WORKER_UNAVAILABLE", "Worker is not available", 409)

        booking.worker_id = worker_profile.id
        booking.status = BookingStatus.ACCEPTED
        booking.accepted_at = datetime.now(UTC)

        await db.commit()
        await db.refresh(booking)
        return booking
    finally:
        await redis.delete(lock_key)


async def start_en_route(booking_id: uuid.UUID, worker_profile: WorkerProfile, db: AsyncSession) -> Booking:
    booking = await get_booking_or_404(booking_id, db)
    _assert_valid_worker(booking, worker_profile.id)
    _assert_transition(booking.status, BookingStatus.EN_ROUTE)
    booking.status = BookingStatus.EN_ROUTE
    booking.en_route_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(booking)
    return booking


async def start_job(booking_id: uuid.UUID, worker_profile: WorkerProfile, db: AsyncSession) -> Booking:
    booking = await get_booking_or_404(booking_id, db)
    _assert_valid_worker(booking, worker_profile.id)
    _assert_transition(booking.status, BookingStatus.IN_PROGRESS)
    booking.status = BookingStatus.IN_PROGRESS
    booking.started_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(booking)
    return booking


async def complete_job(
    booking_id: uuid.UUID,
    worker_profile: WorkerProfile,
    material_charges_paise: int,
    db: AsyncSession,
    redis: aioredis.Redis,
) -> Booking:
    booking = await get_booking_or_404(booking_id, db)
    _assert_valid_worker(booking, worker_profile.id)
    _assert_transition(booking.status, BookingStatus.COMPLETED)

    # Recalculate final amount with materials
    final_amount = (booking.estimated_amount_paise or 0) + material_charges_paise

    booking.status = BookingStatus.COMPLETED
    booking.completed_at = datetime.now(UTC)
    booking.material_charges_paise = material_charges_paise
    booking.final_amount_paise = final_amount
    await db.commit()
    await db.refresh(booking)
    return booking


async def cancel_booking_by_customer(
    booking_id: uuid.UUID,
    customer_profile: CustomerProfile,
    reason: str,
    db: AsyncSession,
) -> Booking:
    booking = await get_booking_or_404(booking_id, db)

    if booking.customer_id != customer_profile.id:
        raise AppError("FORBIDDEN", "You do not own this booking", 403)

    _assert_transition(booking.status, BookingStatus.CANCELLED_BY_CUSTOMER)
    booking.status = BookingStatus.CANCELLED_BY_CUSTOMER
    booking.cancelled_at = datetime.now(UTC)
    booking.cancellation_reason = reason
    await db.commit()
    await db.refresh(booking)
    return booking


async def list_customer_bookings(customer_profile: CustomerProfile, db: AsyncSession) -> list[Booking]:
    result = await db.execute(
        select(Booking)
        .where(Booking.customer_id == customer_profile.id)
        .order_by(Booking.created_at.desc())
    )
    return list(result.scalars().all())


async def list_worker_bookings(worker_profile: WorkerProfile, db: AsyncSession) -> list[Booking]:
    result = await db.execute(
        select(Booking)
        .where(Booking.worker_id == worker_profile.id)
        .order_by(Booking.created_at.desc())
    )
    return list(result.scalars().all())


async def list_pending_bookings(db: AsyncSession) -> list[Booking]:
    """Worker discovery: all PENDING bookings."""
    result = await db.execute(
        select(Booking)
        .where(Booking.status == BookingStatus.PENDING)
        .order_by(Booking.is_emergency.desc(), Booking.created_at.asc())
    )
    return list(result.scalars().all())


# ------------------------------------------------------------------ #
# Admin endpoints
# ------------------------------------------------------------------ #
async def list_bookings_for_admin(
    db: AsyncSession,
    status: BookingStatus | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    category_id: uuid.UUID | None = None,
    page: int = 1,
    size: int = 50,
) -> tuple[list[Booking], int]:
    from sqlalchemy import func
    
    stmt = select(Booking)
    
    if status:
        stmt = stmt.where(Booking.status == status)
    if date_from:
        stmt = stmt.where(Booking.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Booking.created_at <= date_to)
    if category_id:
        stmt = stmt.where(Booking.category_id == category_id)
        
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await db.scalar(count_stmt) or 0
    
    stmt = stmt.order_by(Booking.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    
    return items, total


async def cancel_booking_by_admin(
    booking_id: uuid.UUID,
    reason: str,
    db: AsyncSession,
) -> Booking:
    booking = await get_booking_or_404(booking_id, db)
    
    _assert_transition(booking.status, BookingStatus.CANCELLED_BY_ADMIN)
    
    booking.status = BookingStatus.CANCELLED_BY_ADMIN
    booking.cancellation_reason = reason
    booking.cancelled_at = datetime.now(UTC)
    
    await db.commit()
    await db.refresh(booking)
    return booking



# ------------------------------------------------------------------ #
# Helpers
# ------------------------------------------------------------------ #
def _assert_valid_worker(booking: Booking, worker_id: uuid.UUID) -> None:
    if booking.worker_id != worker_id:
        raise AppError("FORBIDDEN", "You are not assigned to this booking", 403)
