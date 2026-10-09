import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.security import TokenPayload
from app.reviews import service
from app.reviews.models import ReviewerRole
from app.reviews.schemas import ReviewCreateRequest, ReviewResponse
from app.users.models import User, UserRole

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    body: ReviewCreateRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current: tuple[User, TokenPayload] = Depends(get_current_user),
) -> ReviewResponse:
    """Customer or Worker submits a review for a completed booking."""
    user, _ = current
    if user.role == UserRole.CUSTOMER:
        reviewer_role = ReviewerRole.CUSTOMER
    elif user.role == UserRole.WORKER:
        reviewer_role = ReviewerRole.WORKER
    else:
        from app.core.exceptions import AppError
        raise AppError("FORBIDDEN", "Only customers and workers can review", 403)

    review = await service.create_review(body, user.id, reviewer_role, db)
    return ReviewResponse.model_validate(review)


@router.get("/worker/{worker_user_id}", response_model=list[ReviewResponse])
async def list_worker_reviews(
    worker_user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[ReviewResponse]:
    """Public: list all customer reviews for a worker."""
    reviews = await service.list_reviews_for_worker(worker_user_id, db)
    return [ReviewResponse.model_validate(r) for r in reviews]
