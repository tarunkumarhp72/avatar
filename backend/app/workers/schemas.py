import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.workers.models import KYCDocType, KYCStatus, WorkerLifecycleStatus


class WorkerProfileBase(BaseModel):
    current_location_lat: float | None = Field(None, description="Current latitude of the worker")
    current_location_lng: float | None = Field(None, description="Current longitude of the worker")
    bio: str | None = Field(None, description="Worker biography")
    profile_photo_url: str | None = Field(None, description="Profile photo URL")


class WorkerProfileCreate(WorkerProfileBase):
    pass


class WorkerProfileUpdate(WorkerProfileBase):
    pass


class WorkerCategoryRequest(BaseModel):
    category_id: uuid.UUID
    years_experience: int | None = None


class WorkerServiceAreaRequest(BaseModel):
    zone_id: uuid.UUID


class WorkerAvailabilityRequest(BaseModel):
    is_available: bool


class WorkerLocationRequest(BaseModel):
    lat: float
    lng: float


class WorkerProfileResponse(WorkerProfileBase):
    id: uuid.UUID
    current_location_lat: float | None
    current_location_lng: float | None
    is_available: bool
    user_id: uuid.UUID
    status: WorkerLifecycleStatus
    experience_years: int
    rating: float
    total_reviews: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class KYCDocumentBase(BaseModel):
    doc_type: KYCDocType
    file_url: str


class KYCDocumentCreate(KYCDocumentBase):
    pass


class KYCReviewRequest(BaseModel):
    status: KYCStatus
    rejection_reason: str | None = None


class KYCDocumentResponse(KYCDocumentBase):
    id: uuid.UUID
    worker_id: uuid.UUID
    status: KYCStatus
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdminWorkerListResponse(BaseModel):
    items: list[WorkerProfileResponse]
    total: int
    page: int
    size: int


class AdminWorkerDetailResponse(WorkerProfileResponse):
    kyc_documents: list[KYCDocumentResponse] = Field(default_factory=list)
