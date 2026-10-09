import hmac

import redis.asyncio as redis
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.otp import generate_otp, send_otp
from app.auth.schemas import TokenPair
from app.core.config import settings
from app.core.exceptions import AppError
from app.core.security import create_access_token, create_refresh_token, hash_token
from app.redis.keys import otp_attempts_key, otp_key, refresh_token_key
from app.users.models import User, UserRole

logger = structlog.get_logger()

def _hash_otp(otp: str) -> str:
    h = hmac.new(settings.jwt_secret_key.encode(), otp.encode(), "sha256")
    return h.hexdigest()

async def send_auth_otp(phone: str, redis_client: redis.Redis) -> None:
    attempts_key = otp_attempts_key(phone)
    
    # Rate limit check
    attempts = await redis_client.get(attempts_key)
    if attempts and int(attempts) >= settings.otp_rate_limit_per_hour:
        raise AppError(code="RATE_LIMIT_EXCEEDED", message="Too many OTP requests", status_code=429)
        
    # Increment with 1h TTL if new
    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.incr(attempts_key)
        pipe.expire(attempts_key, 3600, nx=True)
        await pipe.execute()
        
    otp = generate_otp(6)
    hashed_otp = _hash_otp(otp)
    
    # Store OTP in redis
    await redis_client.setex(otp_key(phone), 600, hashed_otp)
    
    # Send SMS
    await send_otp(phone, otp)

async def verify_auth_otp(phone: str, code: str, db: AsyncSession, redis_client: redis.Redis) -> TokenPair:
    attempts_key = otp_attempts_key(phone + ":verify")
    attempts = await redis_client.get(attempts_key)
    if attempts and int(attempts) >= settings.otp_max_attempts:
        raise AppError(code="TOO_MANY_ATTEMPTS", message="Too many invalid attempts", status_code=429)
        
    stored_hash = await redis_client.get(otp_key(phone))
    if not stored_hash:
        raise AppError(code="INVALID_OTP", message="OTP expired or invalid", status_code=401)
        
    if _hash_otp(code) != stored_hash:
        async with redis_client.pipeline(transaction=True) as pipe:
            pipe.incr(attempts_key)
            pipe.expire(attempts_key, 3600, nx=True)
            await pipe.execute()
        raise AppError(code="INVALID_OTP", message="OTP invalid", status_code=401)
        
    # Success, clear OTP and attempts
    await redis_client.delete(otp_key(phone), attempts_key)
    
    # Get or create user
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()
    
    if not user:
        user = User(phone=phone, role=UserRole.CUSTOMER)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.is_active:
        raise AppError(code="USER_SUSPENDED", message="User account is suspended", status_code=403)
        
    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token()
    
    await redis_client.setex(
        refresh_token_key(hash_token(refresh_token)), 
        settings.refresh_token_ttl_days * 86400, 
        str(user.id)
    )
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role
    )

async def refresh_tokens(refresh_token: str, db: AsyncSession, redis_client: redis.Redis) -> TokenPair:
    token_h = hash_token(refresh_token)
    key = refresh_token_key(token_h)
    
    user_id_str = await redis_client.get(key)
    if not user_id_str:
        raise AppError(code="INVALID_TOKEN", message="Invalid or expired refresh token", status_code=401)
        
    # Delete old refresh token (rotation)
    await redis_client.delete(key)
    
    # Get user
    import uuid
    try:
        user_id = uuid.UUID(user_id_str.decode("utf-8") if isinstance(user_id_str, bytes) else user_id_str)
    except ValueError:
        raise AppError(code="INVALID_TOKEN", message="Invalid user id in token", status_code=401)
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user or not user.is_active:
        raise AppError(code="USER_SUSPENDED", message="User account suspended or not found", status_code=403)
        
    access_token = create_access_token(user.id, user.role.value)
    new_refresh_token = create_refresh_token()
    
    await redis_client.setex(
        refresh_token_key(hash_token(new_refresh_token)), 
        settings.refresh_token_ttl_days * 86400, 
        str(user.id)
    )
    
    return TokenPair(
        access_token=access_token,
        refresh_token=new_refresh_token,
        role=user.role
    )

async def logout(access_token_jti: str, access_token_exp: int, refresh_token: str, redis_client: redis.Redis) -> None:
    # Add access token JTI to blocklist
    import time
    now = int(time.time())
    ttl = max(0, access_token_exp - now)
    
    if ttl > 0:
        await redis_client.setex(
            f"auth:blocklist:{access_token_jti}", 
            ttl, 
            "revoked"
        )
        
    # Delete refresh token hash from Redis
    token_h = hash_token(refresh_token)
    await redis_client.delete(refresh_token_key(token_h))
