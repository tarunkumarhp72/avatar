from typing import Annotated

from pydantic import BaseModel, Field
from pydantic.types import StringConstraints

from app.users.models import UserRole

PhoneStr = Annotated[str, StringConstraints(pattern=r"^\+[1-9]\d{1,14}$")]

class OTPSendRequest(BaseModel):
    phone: PhoneStr

class OTPSendResponse(BaseModel):
    message: str

class OTPVerifyRequest(BaseModel):
    phone: PhoneStr
    code: str = Field(min_length=4, max_length=6)

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: UserRole
