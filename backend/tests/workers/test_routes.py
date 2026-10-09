import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User, UserRole
from app.workers.models import WorkerLifecycleStatus

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

@pytest_asyncio.fixture
async def customer_token(client: AsyncClient, db_session: AsyncSession) -> str:
    user = User(
        phone="+0987654321",
        full_name="Test Customer",
        role=UserRole.CUSTOMER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    from app.core.security import create_access_token
    token = create_access_token(user.id, user.role.value)
    return token


async def test_create_worker_profile(
    client: AsyncClient,
    worker_token: str,
    db_session: AsyncSession,
):
    response = await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={
            "current_location_lat": 12.34,
            "current_location_lng": 56.78,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == WorkerLifecycleStatus.ONBOARDING
    assert data["current_location_lat"] == 12.34

    # Try creating again, should conflict
    response2 = await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"current_location_lat": 1.0, "current_location_lng": 2.0},
    )
    assert response2.status_code == 409


async def test_get_worker_profile(
    client: AsyncClient,
    worker_token: str,
):
    await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"current_location_lat": 12.34, "current_location_lng": 56.78},
    )
    response = await client.get(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
    )
    assert response.status_code == 200
    assert response.json()["current_location_lat"] == 12.34


async def test_update_worker_profile(
    client: AsyncClient,
    worker_token: str,
):
    await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"current_location_lat": 12.34, "current_location_lng": 56.78},
    )
    response = await client.patch(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"current_location_lat": 99.99},
    )
    assert response.status_code == 200
    assert response.json()["current_location_lat"] == 99.99


async def test_submit_kyc(
    client: AsyncClient,
    worker_token: str,
):
    await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"current_location_lat": 12.34, "current_location_lng": 56.78},
    )
    response = await client.post(
        "/api/v1/workers/me/kyc/confirm",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={
            "doc_type": "ID_CARD",
            "file_url": "https://example.com/kyc.jpg",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["doc_type"] == "ID_CARD"
    assert data["status"] == "PENDING"
    
    # Check if worker status updated
    profile_resp = await client.get(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
    )
    assert profile_resp.json()["status"] == "PENDING_KYC"


async def test_list_kyc(
    client: AsyncClient,
    worker_token: str,
):
    await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"current_location_lat": 12.34, "current_location_lng": 56.78},
    )
    await client.post(
        "/api/v1/workers/me/kyc/confirm",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={"doc_type": "ID_CARD", "file_url": "https://example.com/kyc.jpg"},
    )
    response = await client.get(
        "/api/v1/workers/me/kyc",
        headers={"Authorization": f"Bearer {worker_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["doc_type"] == "ID_CARD"


async def test_worker_routes_wrong_role(
    client: AsyncClient,
    customer_token: str,
):
    response = await client.post(
        "/api/v1/workers/me/profile",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"current_location_lat": 1.0, "current_location_lng": 1.0},
    )
    assert response.status_code == 403


async def test_nearby_workers(
    client: AsyncClient,
    customer_token: str,
):
    import uuid
    category_id = uuid.uuid4()
    
    response = await client.get(
        f"/api/v1/workers/nearby?lat=12.34&lng=56.78&category_id={category_id}&radius_km=10.0",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
