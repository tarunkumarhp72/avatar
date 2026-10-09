from pydantic import BaseModel, Field


class UploadUrlRequest(BaseModel):
    content_type: str = Field(..., description="MIME type of the file, e.g. image/jpeg")
    purpose: str = Field(..., description="booking_photo, profile_photo, or kyc_document")

class UploadUrlResponse(BaseModel):
    upload_url: str
    file_key: str

class UploadConfirmRequest(BaseModel):
    file_key: str

class UploadConfirmResponse(BaseModel):
    file_url: str
