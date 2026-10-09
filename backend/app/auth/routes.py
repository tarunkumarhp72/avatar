import redis.asyncio as redis
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import OTPSendRequest, OTPSendResponse, OTPVerifyRequest, TokenPair
from app.auth.service import send_auth_otp, verify_auth_otp
from app.core.dependencies import get_current_user
from app.core.security import TokenPayload
from app.database.session import get_db
from app.redis.client import get_redis
from app.users.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/otp/send", response_model=OTPSendResponse)
async def send_otp_endpoint(
    request: OTPSendRequest,
    redis_client: redis.Redis = Depends(get_redis)  # noqa: B008
) -> OTPSendResponse:
    await send_auth_otp(request.phone, redis_client)
    return OTPSendResponse(message="OTP sent")

@router.post("/otp/verify", response_model=TokenPair)
async def verify_otp_endpoint(
    request: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: redis.Redis = Depends(get_redis)  # noqa: B008
) -> TokenPair:
    return await verify_auth_otp(request.phone, request.code, db, redis_client)

from pydantic import BaseModel


class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=TokenPair)
async def refresh_endpoint(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis_client: redis.Redis = Depends(get_redis)  # noqa: B008
) -> TokenPair:
    from app.auth.service import refresh_tokens
    return await refresh_tokens(request.refresh_token, db, redis_client)

class LogoutRequest(BaseModel):
    refresh_token: str

@router.post("/logout")
async def logout_endpoint(
    request: LogoutRequest,
    current: tuple[User, TokenPayload] = Depends(get_current_user),
    redis_client: redis.Redis = Depends(get_redis)  # noqa: B008
) -> dict[str, str]:
    from app.auth.service import logout
    _, payload = current
    await logout(payload.jti, payload.exp, request.refresh_token, redis_client)
    return {"message": "Logged out successfully"}
