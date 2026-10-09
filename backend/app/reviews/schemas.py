import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreateRequest(BaseModel):
    booking_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    booking_id: uuid.UUID
    reviewer_id: uuid.UUID
    reviewee_id: uuid.UUID
    reviewer_role: str
    rating: int
    comment: str | None = None
    created_at: datetime


class WorkerRatingSummary(BaseModel):
    worker_user_id: uuid.UUID
    average_rating: float
    total_reviews: int
