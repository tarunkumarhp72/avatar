import os
import uuid

from fastapi import status

from app.core.exceptions import AppError
from app.media.schemas import UploadUrlRequest

# Only allow certain types
ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"]
ALLOWED_PURPOSES = ["booking_photo", "profile_photo", "kyc_document"]

def generate_upload_url(data: UploadUrlRequest) -> tuple[str, str]:
    if data.content_type not in ALLOWED_CONTENT_TYPES:
        raise AppError(code="BAD_REQUEST", message="Unsupported content type", status_code=status.HTTP_400_BAD_REQUEST)
        
    if data.purpose not in ALLOWED_PURPOSES:
        raise AppError(code="BAD_REQUEST", message="Unsupported purpose", status_code=status.HTTP_400_BAD_REQUEST)
        
    ext = data.content_type.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"
        
    file_key = f"{data.purpose}/{uuid.uuid4()}.{ext}"
    
    # We will use our local dev server for uploading
    # In production, this would be a Supabase signed URL
    base_url = "http://localhost:8000"
    upload_url = f"{base_url}/api/v1/media/local-upload?file_key={file_key}"
    
    return upload_url, file_key


def confirm_upload(file_key: str) -> str:
    # Ensure file exists locally
    filepath = os.path.join("uploads", file_key)
    if not os.path.exists(filepath):
        raise AppError(code="BAD_REQUEST", message="File not found in storage", status_code=status.HTTP_400_BAD_REQUEST)
        
    base_url = "http://localhost:8000"
    return f"{base_url}/uploads/{file_key}"
