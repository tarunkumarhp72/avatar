from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.core.security import TokenPayload
from app.users.models import User
from app.users.schemas import UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def get_me(
    current: tuple[User, TokenPayload] = Depends(get_current_user)
) -> UserResponse:
    user, _ = current
    return UserResponse.model_validate(user)
