import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.bookings.models import Booking, BookingStatus
from app.categories.models import ServiceCategory
from app.core.security import create_access_token
from app.customers.models import CustomerProfile
from app.users.models import User, UserRole
from app.workers.models import WorkerLifecycleStatus, WorkerProfile


@pytest.fixture
async def category(db_session: AsyncSession) -> ServiceCategory:
    cat = ServiceCategory(
        name="Plumbing",
        slug="plumbing",
        pricing_model="FIXED",
        is_active=True,
    )
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return cat


@pytest.fixture
async def customer_user(db_session: AsyncSession) -> tuple[User, CustomerProfile]:
    user = User(phone=f"+91777{uuid.uuid4().int % 10000000:07d}", role=UserRole.CUSTOMER, is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    profile = CustomerProfile(user_id=user.id)
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)
    return user, profile


@pytest.fixture
async def worker_user(db_session: AsyncSession) -> tuple[User, WorkerProfile]:
    user = User(phone=f"+91888{uuid.uuid4().int % 10000000:07d}", role=UserRole.WORKER, is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    profile = WorkerProfile(
        user_id=user.id,
        status=WorkerLifecycleStatus.ACTIVE,
        is_available=True,
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)
    return user, profile


@pytest.fixture
async def customer_headers(customer_user: tuple[User, CustomerProfile]) -> dict:
    user, _ = customer_user
    token = create_access_token(user.id, user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def worker_headers(worker_user: tuple[User, WorkerProfile]) -> dict:
    user, _ = worker_user
    token = create_access_token(user.id, user.role.value)
    return {"Authorization": f"Bearer {token}"}


# ------------------------------------------------------------------ #
# Tests
# ------------------------------------------------------------------ #

@pytest.mark.asyncio
async def test_create_booking(
    client: AsyncClient,
    customer_headers: dict,
    category: ServiceCategory,
) -> None:
    resp = await client.post(
        "/api/v1/bookings",
        json={
            "category_id": str(category.id),
            "address_lat": 28.61,
            "address_lng": 77.20,
            "address_text": "Test address, New Delhi",
            "description": "My tap is leaking",
            "is_emergency": False,
        },
        headers=customer_headers,
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["status"] == "PENDING"
    assert data["category_id"] == str(category.id)


@pytest.mark.asyncio
async def test_unauthenticated_cannot_create_booking(
    client: AsyncClient,
    category: ServiceCategory,
) -> None:
    resp = await client.post(
        "/api/v1/bookings",
        json={
            "category_id": str(category.id),
            "address_lat": 28.61,
            "address_lng": 77.20,
            "address_text": "Test address",
            "description": "Plumbing needed",
        },
    )
    # FastAPI HTTPBearer returns 403 when no credentials supplied
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_worker_cannot_create_booking(
    client: AsyncClient,
    worker_headers: dict,
    category: ServiceCategory,
) -> None:
    resp = await client.post(
        "/api/v1/bookings",
        json={
            "category_id": str(category.id),
            "address_lat": 28.61,
            "address_lng": 77.20,
            "address_text": "Test address",
            "description": "Plumbing needed",
        },
        headers=worker_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_worker_can_accept_booking(
    client: AsyncClient,
    customer_headers: dict,
    worker_headers: dict,
    category: ServiceCategory,
) -> None:
    # Customer creates booking
    create_resp = await client.post(
        "/api/v1/bookings",
        json={
            "category_id": str(category.id),
            "address_lat": 28.61,
            "address_lng": 77.20,
            "address_text": "Test address, New Delhi",
            "description": "Tap is leaking",
        },
        headers=customer_headers,
    )
    assert create_resp.status_code == 201
    booking_id = create_resp.json()["id"]

    # Worker accepts
    accept_resp = await client.post(
        f"/api/v1/bookings/{booking_id}/accept",
        headers=worker_headers,
    )
    assert accept_resp.status_code == 200, accept_resp.text
    assert accept_resp.json()["status"] == "ACCEPTED"


@pytest.mark.asyncio
async def test_full_booking_lifecycle(
    client: AsyncClient,
    customer_headers: dict,
    worker_headers: dict,
    category: ServiceCategory,
) -> None:
    # Create
    resp = await client.post(
        "/api/v1/bookings",
        json={
            "category_id": str(category.id),
            "address_lat": 28.61,
            "address_lng": 77.20,
            "address_text": "Test address",
            "description": "Fix ceiling",
        },
        headers=customer_headers,
    )
    assert resp.status_code == 201
    booking_id = resp.json()["id"]

    # Accept
    r = await client.post(f"/api/v1/bookings/{booking_id}/accept", headers=worker_headers)
    assert r.json()["status"] == "ACCEPTED"

    # En route
    r = await client.post(f"/api/v1/bookings/{booking_id}/en-route", headers=worker_headers)
    assert r.json()["status"] == "EN_ROUTE"

    # Start
    r = await client.post(f"/api/v1/bookings/{booking_id}/start", headers=worker_headers)
    assert r.json()["status"] == "IN_PROGRESS"

    # Complete
    r = await client.post(
        f"/api/v1/bookings/{booking_id}/complete",
        json={"material_charges_paise": 5000},
        headers=worker_headers,
    )
    assert r.json()["status"] == "COMPLETED"
    assert r.json()["material_charges_paise"] == 5000


@pytest.mark.asyncio
async def test_invalid_transition_rejected(
    client: AsyncClient,
    customer_headers: dict,
    worker_headers: dict,
    category: ServiceCategory,
) -> None:
    resp = await client.post(
        "/api/v1/bookings",
        json={
            "category_id": str(category.id),
            "address_lat": 28.61,
            "address_lng": 77.20,
            "address_text": "Test address",
            "description": "Fix wiring",
        },
        headers=customer_headers,
    )
    booking_id = resp.json()["id"]

    # Worker accepts first
    r = await client.post(f"/api/v1/bookings/{booking_id}/accept", headers=worker_headers)
    assert r.json()["status"] == "ACCEPTED"

    # Try to complete without starting — PENDING -> COMPLETED is not allowed
    # Transition: ACCEPTED -> COMPLETED is invalid (must go via EN_ROUTE -> IN_PROGRESS)
    r = await client.post(
        f"/api/v1/bookings/{booking_id}/complete",
        json={"material_charges_paise": 0},
        headers=worker_headers,
    )
    assert r.status_code == 409
