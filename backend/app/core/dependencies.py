import uuid
from typing import Annotated

import redis.asyncio as redis
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.core.security import TokenPayload, decode_access_token
from app.database.session import get_db
from app.redis.client import get_redis
from app.users.models import User, UserRole

bearer_scheme = HTTPBearer()

async def get_current_user(
    token: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
) -> tuple[User, TokenPayload]:
    try:
        payload = decode_access_token(token.credentials)
    except AppError as e:
        raise e
        
    # Check blocklist
    is_revoked = await redis_client.exists(f"auth:blocklist:{payload.jti}")
    if is_revoked:
        raise AppError(code="TOKEN_REVOKED", message="Token has been revoked", status_code=401)
        
    try:
        user_id = uuid.UUID(payload.sub)
    except ValueError:
        raise AppError(code="INVALID_TOKEN", message="Invalid user id in token", status_code=401)
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise AppError(code="USER_NOT_FOUND", message="User not found", status_code=401)
    if not user.is_active:
        raise AppError(code="USER_SUSPENDED", message="User account suspended", status_code=403)
        
    return user, payload


def require_customer(current: tuple[User, TokenPayload] = Depends(get_current_user)) -> User:
    user, _ = current
    if user.role != UserRole.CUSTOMER:
        raise AppError(code="FORBIDDEN", message="Requires customer role", status_code=403)
    return user


def require_worker(current: tuple[User, TokenPayload] = Depends(get_current_user)) -> User:
    user, _ = current
    if user.role != UserRole.WORKER:
        raise AppError(code="FORBIDDEN", message="Requires worker role", status_code=403)
    return user


def require_admin(current: tuple[User, TokenPayload] = Depends(get_current_user)) -> User:
    user, _ = current
    if user.role != UserRole.ADMIN:
        raise AppError(code="FORBIDDEN", message="Requires admin role", status_code=403)
    return user


async def get_customer_profile(
    db: AsyncSession = Depends(get_db),
    current: tuple[User, TokenPayload] = Depends(get_current_user),
) -> "CustomerProfile":
    from sqlalchemy import select
    from app.customers.models import CustomerProfile

    user, _ = current
    if user.role != UserRole.CUSTOMER:
        raise AppError(code="FORBIDDEN", message="Requires customer role", status_code=403)

    result = await db.execute(select(CustomerProfile).where(CustomerProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise AppError(code="PROFILE_NOT_FOUND", message="Customer profile not found", status_code=404)
    return profile


async def get_worker_profile(
    db: AsyncSession = Depends(get_db),
    current: tuple[User, TokenPayload] = Depends(get_current_user),
) -> "WorkerProfile":
    from sqlalchemy import select
    from app.workers.models import WorkerProfile

    user, _ = current
    if user.role != UserRole.WORKER:
        raise AppError(code="FORBIDDEN", message="Requires worker role", status_code=403)

    result = await db.execute(select(WorkerProfile).where(WorkerProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise AppError(code="PROFILE_NOT_FOUND", message="Worker profile not found", status_code=404)
    return profile
