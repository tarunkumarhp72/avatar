import asyncio
import uuid

import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.redis.client import _redis_client

logger = structlog.get_logger()

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if _redis_client is None:
            return await call_next(request)
            
        ip = request.client.host if request.client else "127.0.0.1"
        
        strict_endpoints = ["/api/v1/auth/otp/send", "/api/v1/auth/otp/verify"]
        is_strict = any(request.url.path.startswith(p) for p in strict_endpoints)
        
        limit = 10 if is_strict else 100
        key = f"rate_limit:{ip}:{request.url.path}"
        
        current = await _redis_client.get(key)
        if current and int(current) >= limit:
            return JSONResponse(
                status_code=429,
                content={"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}},
                headers={"Retry-After": "60"}
            )
            
        async with _redis_client.pipeline(transaction=True) as pipe:
            pipe.incr(key)
            pipe.expire(key, 60, nx=True)
            await pipe.execute()
            
        return await call_next(request)

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method not in ["POST", "PUT", "PATCH", "DELETE"]:
            return await call_next(request)
            
        response = await call_next(request)
        
        ip = request.client.host if request.client else "127.0.0.1"
        if "." in ip:
            parts = ip.split(".")
            parts[-1] = "0"
            ip = ".".join(parts)
            
        user_agent = request.headers.get("user-agent", "")
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        
        # Async background write to DB
        from sqlalchemy import text

        from app.database.session import engine
        
        async def write_audit():
            try:
                # Basic token decoding to get user_id if present (without DB hit)
                user_id = None
                auth_header = request.headers.get("authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    from app.core.security import decode_access_token
                    try:
                        payload = decode_access_token(token)
                        user_id = payload.sub
                    except Exception:
                        pass

                async with engine.begin() as conn:
                    await conn.execute(
                        text("""
                            INSERT INTO audit_logs 
                            (user_id, request_id, ip_address, user_agent, method, endpoint, response_status)
                            VALUES (:user_id, :request_id, :ip_address, :user_agent, :method, :endpoint, :status)
                        """),
                        {
                            "user_id": user_id,
                            "request_id": request_id,
                            "ip_address": ip,
                            "user_agent": user_agent,
                            "method": request.method,
                            "endpoint": request.url.path,
                            "status": response.status_code
                        }
                    )
            except Exception as e:
                logger.error("audit_log_failed", error=str(e))
                
        # Fire and forget
        asyncio.create_task(write_audit())
        
        return response

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

def setup_middlewares(app):
    from fastapi.middleware.cors import CORSMiddleware

    from app.core.config import settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(AuditLogMiddleware)
