import hashlib

OTP_TTL = 600
REFRESH_TOKEN_TTL = 2592000
WORKER_ONLINE_TTL = 90

def _hash_phone(phone: str) -> str:
    return hashlib.sha256(phone.encode("utf-8")).hexdigest()

def otp_key(phone: str) -> str:
    return f"auth:otp:{_hash_phone(phone)}"

def otp_attempts_key(phone: str) -> str:
    return f"auth:otp_attempts:{_hash_phone(phone)}"

def refresh_token_key(token_hash: str) -> str:
    return f"auth:refresh:{token_hash}"

def token_blocklist_key(jti: str) -> str:
    return f"auth:blocklist:{jti}"

def rate_limit_key(endpoint: str, ip: str) -> str:
    return f"rate_limit:{endpoint}:{ip}"

def worker_online_key(worker_id: str) -> str:
    return f"worker:online:{worker_id}"

def worker_location_key(worker_id: str) -> str:
    return f"worker:location:{worker_id}"

def booking_lock_key(booking_id: str) -> str:
    return f"booking:lock:{booking_id}"

def booking_idempotency_key(key: str) -> str:
    return f"booking:idem:{key}"
