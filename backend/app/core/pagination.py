import base64
import uuid
from typing import TypeVar

from pydantic import BaseModel, Field

from app.core.exceptions import AppError

T = TypeVar("T")


class PageParams(BaseModel):
    cursor: str | None = None
    limit: int = Field(20, le=100)


def encode_cursor(last_id: uuid.UUID) -> str:
    return base64.b64encode(last_id.bytes).decode("ascii")


def decode_cursor(cursor: str) -> uuid.UUID:
    try:
        # Base64 decode, then create UUID from bytes
        decoded_bytes = base64.urlsafe_b64decode(cursor.encode("ascii"))
        return uuid.UUID(bytes=decoded_bytes)
    except Exception as e:
        raise AppError(code="INVALID_CURSOR", message="Invalid pagination cursor") from e


class PaginatedResponse[T](BaseModel):
    items: list[T]
    next_cursor: str | None
    has_more: bool

# ponytail: defer apply_cursor_pagination implementation until there's an actual table to query, prevents writing untested blind SQL abstraction.
