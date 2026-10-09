import asyncio
import os
from collections.abc import AsyncGenerator, Generator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", 
    "postgresql+asyncpg://postgres:postgres@192.168.11.111:5432/avatar_test"
)

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

from app.database.base import Base


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

from app.redis.client import close_redis, init_redis


@pytest.fixture(scope="session", autouse=True)
async def setup_redis() -> AsyncGenerator[None, None]:
    await init_redis()
    yield
    await close_redis()

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.connect() as connection:
        transaction = await connection.begin()
        session = TestingSessionLocal(bind=connection)
        
        yield session
        
        await session.close()
        await transaction.rollback()

from app.database.session import get_db


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    async with ASGITransport(app=app) as transport:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

@pytest.fixture
async def admin_token_headers(db_session: AsyncSession) -> dict:
    from app.core.security import create_access_token
    from app.users.models import User, UserRole
    user = User(
        phone="+910000000101",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    token = create_access_token(user.id, user.role.value)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
async def customer_token_headers(db_session: AsyncSession) -> dict:
    from app.core.security import create_access_token
    from app.users.models import User, UserRole
    user = User(
        phone="+910000000102",
        role=UserRole.CUSTOMER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    token = create_access_token(user.id, user.role.value)
    return {"Authorization": f"Bearer {token}"}
            
    app.dependency_overrides.clear()
