import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User, UserRole

pytestmark = pytest.mark.asyncio

@pytest_asyncio.fixture
async def worker_token(client: AsyncClient, db_session: AsyncSession) -> str:
    user = User(
        phone="+1234567890",
        full_name="Test Worker",
        role=UserRole.WORKER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    from app.core.security import create_access_token
    token = create_access_token(user.id, user.role.value)
    return token

async def test_generate_upload_url(client: AsyncClient, worker_token: str):
    response = await client.post(
        "/api/v1/media/upload-url",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={
            "content_type": "image/jpeg",
            "purpose": "booking_photo"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "upload_url" in data
    assert "file_key" in data
    assert "booking_photo" in data["file_key"]
    assert data["file_key"].endswith(".jpg")

async def test_generate_upload_url_invalid(client: AsyncClient, worker_token: str):
    response = await client.post(
        "/api/v1/media/upload-url",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={
            "content_type": "application/pdf",  # Not allowed
            "purpose": "booking_photo"
        }
    )
    assert response.status_code == 400

async def test_upload_and_confirm(client: AsyncClient, worker_token: str):
    # 1. Generate URL
    url_resp = await client.post(
        "/api/v1/media/upload-url",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"content_type": "image/jpeg", "purpose": "booking_photo"}
    )
    data = url_resp.json()
    file_key = data["file_key"]
    upload_url = data["upload_url"]
    
    # Extract path from URL to use with the TestClient
    upload_path = upload_url.replace("http://localhost:8000", "")
    
    # 2. Upload file
    upload_resp = await client.put(
        upload_path,
        content=b"dummy image content"
    )
    assert upload_resp.status_code == 200
    
    # 3. Confirm
    confirm_resp = await client.post(
        "/api/v1/media/confirm",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"file_key": file_key}
    )
    assert confirm_resp.status_code == 200
    confirm_data = confirm_resp.json()
    assert confirm_data["file_url"].endswith(file_key)
