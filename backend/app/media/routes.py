from pathlib import Path

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse

from app.core.dependencies import get_current_user
from app.core.exceptions import AppError
from app.media import service
from app.media.schemas import (
    UploadConfirmRequest,
    UploadConfirmResponse,
    UploadUrlRequest,
    UploadUrlResponse,
)

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/upload-url", response_model=UploadUrlResponse)
async def generate_upload_url(
    data: UploadUrlRequest,
    current_user=Depends(get_current_user),
):
    """Generate signed upload URL for a specific purpose."""
    url, file_key = service.generate_upload_url(data)
    return UploadUrlResponse(upload_url=url, file_key=file_key)


@router.post("/confirm", response_model=UploadConfirmResponse)
async def confirm_upload(
    data: UploadConfirmRequest,
    current_user=Depends(get_current_user),
):
    """Confirm the file has been uploaded and get final URL."""
    file_url = service.confirm_upload(data.file_key)
    return UploadConfirmResponse(file_url=file_url)


# Local-only endpoint to emulate Supabase signed URL PUT uploads
@router.put("/local-upload", include_in_schema=False)
async def local_upload(request: Request, file_key: str):
    if not file_key or ".." in file_key:
        raise AppError(code="BAD_REQUEST", message="Invalid file key", status_code=status.HTTP_400_BAD_REQUEST)
        
    filepath = Path("uploads") / file_key
    # Ensure directory exists
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    # Write the body to file
    with open(filepath, "wb") as f:
        async for chunk in request.stream():
            f.write(chunk)
            
    return JSONResponse({"status": "ok"})
