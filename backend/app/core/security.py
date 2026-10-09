import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from pydantic import BaseModel

from app.core.config import settings
from app.core.exceptions import AppError


class TokenPayload(BaseModel):
    sub: str
    role: str
    jti: str
    exp: int


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_ttl_minutes)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": str(user_id),
        "role": role,
        "jti": str(uuid.uuid4())
    }
    
    encoded_jwt: str = jwt.encode(
        to_encode, 
        settings.jwt_secret_key, 
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def create_refresh_token() -> str:
    return secrets.token_hex(32)


def decode_access_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        return TokenPayload(**payload)
    except ExpiredSignatureError:
        raise AppError(code="TOKEN_EXPIRED", message="Token has expired", status_code=401)
    except JWTError:
        raise AppError(code="TOKEN_INVALID", message="Could not validate credentials", status_code=401)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
