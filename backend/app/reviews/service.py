import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.bookings.models import Booking, BookingStatus
from app.core.exceptions import AppError
from app.reviews.models import Review, ReviewerRole
from app.reviews.schemas import ReviewCreateRequest


async def create_review(
    request: ReviewCreateRequest,
    reviewer_user_id: uuid.UUID,
    reviewer_role: ReviewerRole,
    db: AsyncSession,
) -> Review:
    # Fetch the booking
    result = await db.execute(select(Booking).where(Booking.id == request.booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise AppError("NOT_FOUND", "Booking not found", 404)

    # Only COMPLETED or PAID bookings can be reviewed
    if booking.status not in (BookingStatus.COMPLETED, BookingStatus.PAID):
        raise AppError("INVALID_STATE", "Can only review completed or paid bookings", 409)

    # Determine who is being reviewed
    if reviewer_role == ReviewerRole.CUSTOMER:
        from app.customers.models import CustomerProfile
        from app.workers.models import WorkerProfile
        
        cp_result = await db.execute(
            select(CustomerProfile).where(CustomerProfile.user_id == reviewer_user_id)
        )
        cp = cp_result.scalar_one_or_none()
        
        # Customer reviews the worker — must own the booking
        if not cp or booking.customer_id != cp.id:
            raise AppError("FORBIDDEN", "You do not own this booking", 403)
            
        if not booking.worker_id:
            raise AppError("NOT_FOUND", "No worker assigned to this booking", 404)
            
        # Find the worker's user_id
        wp_result = await db.execute(
            select(WorkerProfile).where(WorkerProfile.id == booking.worker_id)
        )
        wp = wp_result.scalar_one_or_none()
        if not wp:
            raise AppError("NOT_FOUND", "Worker not found", 404)
        reviewee_user_id = wp.user_id
    else:
        # Worker reviews the customer — must be the assigned worker
        from app.workers.models import WorkerProfile
        wp_result = await db.execute(
            select(WorkerProfile).where(WorkerProfile.user_id == reviewer_user_id)
        )
        wp = wp_result.scalar_one_or_none()
        if not wp or booking.worker_id != wp.id:
            raise AppError("FORBIDDEN", "You are not the worker for this booking", 403)
        # Find the customer's user_id
        from app.customers.models import CustomerProfile
        cp_result = await db.execute(
            select(CustomerProfile).where(CustomerProfile.id == booking.customer_id)
        )
        cp = cp_result.scalar_one_or_none()
        if not cp:
            raise AppError("NOT_FOUND", "Customer not found", 404)
        reviewee_user_id = cp.user_id

    # Check for duplicate review
    existing = await db.execute(
        select(Review).where(
            Review.booking_id == request.booking_id,
            Review.reviewer_role == reviewer_role,
        )
    )
    if existing.scalar_one_or_none():
        raise AppError("DUPLICATE", "You have already reviewed this booking", 409)

    review = Review(
        booking_id=request.booking_id,
        reviewer_id=reviewer_user_id,
        reviewee_id=reviewee_user_id,
        reviewer_role=reviewer_role,
        rating=request.rating,
        comment=request.comment,
    )
    db.add(review)

    # Update worker rating aggregate if customer is reviewing worker
    if reviewer_role == ReviewerRole.CUSTOMER and booking.worker_id is not None:
        await _update_worker_rating(booking.worker_id, db)

    await db.commit()
    await db.refresh(review)
    return review


async def _update_worker_rating(worker_profile_id: uuid.UUID, db: AsyncSession) -> None:
    from app.workers.models import WorkerProfile

    result = await db.execute(
        select(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("count"),
        ).where(
            Review.reviewer_role == ReviewerRole.CUSTOMER,
            Review.reviewee_id.in_(
                select(WorkerProfile.user_id).where(WorkerProfile.id == worker_profile_id)
            ),
        )
    )
    row = result.one()
    avg_val = row[0]
    count_val = row[1]
    
    avg = float(avg_val or 0.0)
    count = int(count_val or 0)

    wp_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.id == worker_profile_id)
    )
    wp = wp_result.scalar_one_or_none()
    if wp:
        wp.rating = avg
        wp.total_reviews = count


async def list_reviews_for_worker(worker_user_id: uuid.UUID, db: AsyncSession) -> list[Review]:
    result = await db.execute(
        select(Review)
        .where(
            Review.reviewee_id == worker_user_id,
            Review.reviewer_role == ReviewerRole.CUSTOMER,
        )
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().all())
