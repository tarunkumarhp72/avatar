from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    request_id = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(Text, nullable=False)
    method = Column(String, nullable=False)
    endpoint = Column(Text, nullable=False)
    response_status = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
