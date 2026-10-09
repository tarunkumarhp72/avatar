from httpx import AsyncClient


async def test_health(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": "ok", "redis": "ok"}

# ponytail: skip testing the error case manually mocking the engine here since it's just a healthcheck and pytest runs with a real DB.
