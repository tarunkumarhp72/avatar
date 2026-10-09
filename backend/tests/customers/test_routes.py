import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User, UserRole


@pytest.fixture
async def customer_token(client: AsyncClient, db_session: AsyncSession) -> str:
    user = User(
        phone="+919876543210",
        role=UserRole.CUSTOMER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    from app.core.security import create_access_token
    token = create_access_token(user.id, user.role.value)
    return token


@pytest.mark.asyncio
async def test_get_my_profile(client: AsyncClient, customer_token: str):
    response = await client.get(
        "/api/v1/customers/me",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["default_address_id"] is None


@pytest.mark.asyncio
async def test_create_and_list_address(client: AsyncClient, customer_token: str):
    payload = {
        "label": "Home",
        "address_line1": "123 Main St",
        "city": "Mumbai",
        "state": "MH",
        "pincode": "400001",
        "location_lat": 19.0760,
        "location_lng": 72.8777,
        "is_default": True
    }
    
    # Create Address
    response = await client.post(
        "/api/v1/customers/me/addresses",
        json=payload,
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 201
    address = response.json()
    assert address["label"] == "Home"
    assert address["city"] == "Mumbai"
    assert address["is_default"] is True
    
    # List Addresses
    response = await client.get(
        "/api/v1/customers/me/addresses",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    addresses = response.json()
    assert len(addresses) == 1
    assert addresses[0]["id"] == address["id"]
    
    # Check Profile updated default_address_id
    response = await client.get(
        "/api/v1/customers/me",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    profile = response.json()
    assert profile["default_address_id"] == address["id"]


@pytest.mark.asyncio
async def test_update_and_delete_address(client: AsyncClient, customer_token: str):
    payload = {
        "label": "Office",
        "address_line1": "456 Work St",
        "city": "Mumbai",
        "state": "MH",
        "pincode": "400002"
    }
    
    response = await client.post(
        "/api/v1/customers/me/addresses",
        json=payload,
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 201
    address_id = response.json()["id"]
    
    # Update
    response = await client.patch(
        f"/api/v1/customers/me/addresses/{address_id}",
        json={"label": "New Office"},
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    assert response.json()["label"] == "New Office"
    
    # Delete
    response = await client.delete(
        f"/api/v1/customers/me/addresses/{address_id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 204
    
    # Verify deletion
    response = await client.get(
        "/api/v1/customers/me/addresses",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert len(response.json()) == 0
