import uuid
from datetime import datetime

from pydantic import BaseModel

from app.users.models import UserRole


class UserResponse(BaseModel):
    id: uuid.UUID
    phone: str
    email: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
