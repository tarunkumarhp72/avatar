import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_create_zone(client: AsyncClient, admin_token_headers: dict):
    payload = {
        "name": "Central Park",
        "city": "New York",
        "state": "NY",
        "polygon_wkt": "POLYGON((-73.9818 40.7680, -73.9579 40.8003, -73.9495 40.7968, -73.9730 40.7645, -73.9818 40.7680))",
        "is_active": True
    }
    
    response = await client.post("/api/v1/admin/zones", json=payload, headers=admin_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Central Park"
    assert data["city"] == "New York"
    assert data["polygon_wkt"] is not None

@pytest.mark.asyncio
async def test_non_admin_cannot_create_zone(client: AsyncClient, customer_token_headers: dict):
    payload = {
        "name": "Central Park",
        "city": "New York",
        "state": "NY",
        "polygon_wkt": "POLYGON((-73.9818 40.7680, -73.9579 40.8003, -73.9495 40.7968, -73.9730 40.7645, -73.9818 40.7680))",
        "is_active": True
    }
    
    response = await client.post("/api/v1/admin/zones", json=payload, headers=customer_token_headers)
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_get_zones(client: AsyncClient, admin_token_headers: dict):
    # Create zone
    payload = {
        "name": "List Zone",
        "city": "Test City",
        "state": "TS",
    }
    await client.post("/api/v1/admin/zones", json=payload, headers=admin_token_headers)

    # Get zones
    response = await client.get("/api/v1/zones")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] in ["Central Park", "List Zone"]
