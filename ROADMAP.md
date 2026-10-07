# Avatar — Precision Implementation Roadmap

> **One task per run. Stop after each. Fix all failures before proceeding.**
> This document is the canonical source for implementation agents.
> Read `AGENTS.md` before starting any task.

---

## A. Final Project Structure

```
avatar/
├── AGENTS.md                        ← project rules (authoritative)
├── ROADMAP.md                       ← this document
├── backend/
│   ├── pyproject.toml
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── scripts/
│   │   ├── seed_categories.py
│   │   └── seed_pricing.py
│   ├── tests/
│   │   ├── conftest.py              ← shared fixtures, test DB, async client
│   │   ├── factories.py             ← test data factories
│   │   ├── test_health.py
│   │   ├── auth/
│   │   ├── users/
│   │   ├── customers/
│   │   ├── workers/
│   │   ├── categories/
│   │   ├── bookings/
│   │   ├── quotes/
│   │   ├── pricing/
│   │   ├── payments/
│   │   ├── reviews/
│   │   ├── notifications/
│   │   ├── media/
│   │   ├── admin/
│   │   ├── security/               ← cross-cutting security tests
│   │   └── e2e/
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── security.py
│       │   ├── dependencies.py
│       │   ├── middleware.py
│       │   ├── exceptions.py
│       │   └── pagination.py
│       ├── database/
│       │   ├── base.py
│       │   └── session.py
│       ├── redis/
│       │   ├── client.py
│       │   └── keys.py
│       ├── celery/
│       │   ├── app.py
│       │   └── beat.py
│       ├── auth/
│       │   ├── models.py            ← (nothing — auth state lives in Redis)
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── users/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── customers/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── workers/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── categories/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── locations/
│       │   ├── models.py            ← areas/zones, addresses
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── pricing/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py           ← pure calculation engine
│       │   └── routes.py
│       ├── bookings/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   ├── routes.py
│       │   └── tasks.py
│       ├── quotes/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── payments/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   ├── routes.py
│       │   ├── tasks.py
│       │   └── providers/
│       │       ├── base.py
│       │       └── razorpay.py
│       ├── media/
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── reviews/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── notifications/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   ├── routes.py
│       │   ├── tasks.py
│       │   └── channels/
│       │       ├── push.py
│       │       ├── sms.py
│       │       └── email.py
│       ├── subscriptions/
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       ├── admin/
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── routes.py
│       └── analytics/
│           ├── schemas.py
│           ├── service.py
│           └── routes.py
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── public/
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── verify/page.tsx
        │   ├── (customer)/
        │   │   ├── layout.tsx
        │   │   ├── page.tsx
        │   │   ├── book/[category]/page.tsx
        │   │   ├── bookings/page.tsx
        │   │   ├── bookings/[id]/page.tsx
        │   │   ├── bookings/[id]/pay/page.tsx
        │   │   ├── bookings/[id]/review/page.tsx
        │   │   └── profile/page.tsx
        │   ├── (worker)/
        │   │   ├── layout.tsx
        │   │   ├── dashboard/page.tsx
        │   │   ├── jobs/page.tsx
        │   │   ├── jobs/[id]/page.tsx
        │   │   ├── earnings/page.tsx
        │   │   ├── profile/page.tsx
        │   │   └── kyc/page.tsx
        │   └── (admin)/
        │       ├── layout.tsx
        │       ├── page.tsx
        │       ├── workers/page.tsx
        │       ├── workers/[id]/page.tsx
        │       ├── bookings/page.tsx
        │       ├── categories/page.tsx
        │       └── pricing/page.tsx
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Card.tsx
        │   │   ├── StatusChip.tsx
        │   │   ├── Spinner.tsx
        │   │   ├── Modal.tsx
        │   │   └── EmptyState.tsx
        │   ├── booking/
        │   ├── worker/
        │   └── admin/
        ├── lib/
        │   ├── api/
        │   │   ├── client.ts        ← base fetch wrapper
        │   │   ├── auth.ts
        │   │   ├── bookings.ts
        │   │   ├── workers.ts
        │   │   ├── categories.ts
        │   │   ├── pricing.ts
        │   │   ├── payments.ts
        │   │   └── reviews.ts
        │   ├── hooks/
        │   │   ├── useAuth.ts
        │   │   ├── useBooking.ts
        │   │   └── useWorker.ts
        │   └── utils.ts
        ├── styles/
        │   ├── globals.css
        │   └── tokens.css
        └── types/
            ├── api.ts
            ├── booking.ts
            ├── worker.ts
            └── user.ts
```

---

## B. Final Database / Domain Structure

### Domain → Table Ownership

| Domain | Tables Owned |
|--------|-------------|
| users | `users` |
| customers | `customer_profiles`, `addresses` |
| workers | `worker_profiles`, `worker_categories`, `kyc_documents` |
| locations | `service_zones`, `worker_service_areas` |
| categories | `service_categories` |
| pricing | `pricing_rules` |
| bookings | `bookings`, `booking_media` |
| quotes | `quotes` |
| payments | `payments`, `worker_earnings` |
| reviews | `reviews` |
| notifications | `notifications`, `device_tokens` |
| subscriptions | `subscription_plans`, `worker_subscriptions` |
| analytics | `daily_stats` (materialized/aggregated) |

### Key Schema Decisions

- UUID PKs on all business tables (`gen_random_uuid()`)
- `created_at`, `updated_at` on every table
- All monetary columns: `BIGINT` (paise — smallest INR unit)
- Location columns: `geography(Point,4326)` via PostGIS
- Status columns: PostgreSQL `ENUM` type (explicit, DB-enforced)
- Soft delete only on: `service_categories` (is_active flag), not on bookings/payments (hard audit trail)
- All FK constraints have explicit `ON DELETE` action

---

## C. Final API Structure

```
/api/v1/
  /auth/
    POST  /otp/send
    POST  /otp/verify
    POST  /refresh
    POST  /logout

  /users/
    GET   /me
    PATCH /me
    POST  /me/device-tokens

  /customers/
    GET   /me
    PATCH /me
    GET   /me/addresses
    POST  /me/addresses
    PATCH /me/addresses/{id}
    DELETE /me/addresses/{id}
    POST  /me/addresses/{id}/set-default

  /workers/
    GET   /me
    PATCH /me
    PUT   /me/categories
    PUT   /me/service-areas
    POST  /me/availability
    POST  /me/location
    GET   /me/job-requests
    GET   /me/earnings
    GET   /me/earnings/history
    POST  /me/kyc/upload-url
    POST  /me/kyc/confirm
    GET   /nearby   (customer-facing, authenticated)

  /categories/
    GET   /
    GET   /{id}

  /pricing/
    GET   /estimate

  /bookings/
    POST  /
    GET   /                       (customer's own bookings)
    GET   /{id}
    POST  /{id}/cancel            (customer)
    POST  /{id}/accept            (worker)
    POST  /{id}/reject            (worker)
    POST  /{id}/en-route          (worker)
    POST  /{id}/arrived           (worker)
    POST  /{id}/start             (worker)
    POST  /{id}/complete          (worker)
    POST  /{id}/quotes            (worker submits)
    GET   /{id}/quotes/current    (customer views)

  /quotes/
    POST  /{id}/accept            (customer)
    POST  /{id}/reject            (customer)

  /payments/
    POST  /initiate
    POST  /webhook                (Razorpay — no auth, signature verified)

  /media/
    POST  /upload-url
    POST  /confirm

  /reviews/
    POST  /bookings/{id}/review   (customer)
    GET   /workers/{id}/reviews   (public)

  /notifications/
    GET   /
    POST  /{id}/read
    POST  /read-all

  /subscriptions/
    GET   /plans
    POST  /workers/subscribe
    GET   /workers/me

  /admin/
    GET   /workers
    GET   /workers/{id}
    POST  /workers/{id}/kyc/{doc_id}/review
    POST  /workers/{id}/approve
    POST  /workers/{id}/suspend
    GET   /bookings
    GET   /bookings/{id}
    POST  /bookings/{id}/cancel
    GET   /categories
    POST  /categories
    PATCH /categories/{id}
    GET   /pricing/rules
    POST  /pricing/rules
    PATCH /pricing/rules/{id}
    DELETE /pricing/rules/{id}

  /analytics/
    GET   /summary                (admin only)
    GET   /revenue                (admin only)
    GET   /workers/stats          (admin only)
```

---

## D–E. Complete Implementation Phases + Tasks (Dependency Order)

---

### PHASE 0 — Architecture & Documentation

---

#### Task 0.1 — AGENTS.md + ROADMAP.md
**Purpose:** Establish the single source of truth for all implementation rules before any code is written.

**Why needed:** Every future agent must know naming conventions, security rules, prohibited patterns, and the one-task-at-a-time rule before touching the codebase.

**Files to create:**
- `AGENTS.md` (already exists — verify completeness)
- `ROADMAP.md` (this document, stored in project root)

**DB changes:** None.
**API changes:** None.
**Frontend changes:** None.

**Security requirements:** N/A.
**Tests required:** None.
**Performance requirements:** N/A.
**Migration requirements:** None.
**Dependencies:** None.

**Definition of done:**
- AGENTS.md covers: execution rules, tech stack, domain boundaries, naming, DB rules, security rules, Redis rules, Celery rules, async rules, testing rules, migration rules, git rules, prohibited practices, design system rules, observability rules.
- ROADMAP.md committed to repo root.

**Manual verification:** Read both files end to end. Confirm no missing sections.
**Security verification:** N/A.
**Rollback:** Delete the files. No state changed.

---

### PHASE 1 — Repository & Development Foundation

---

#### Task 1.1 — Backend repository skeleton
**Purpose:** Create the full backend folder structure so all future tasks have a home.

**Why needed:** Prevents tasks from creating inconsistent folder layouts later.

**Files to create:**
- `backend/pyproject.toml` — all Python dependencies declared (not yet installed in prod)
- `backend/.env.example` — every required env var documented with description
- `backend/.gitignore`
- `backend/app/__init__.py` and all domain `__init__.py` files (empty)
- `backend/app/main.py` — stub: `app = FastAPI()` only
- `docker-compose.yml` — services: `postgres` (with postgis), `redis`, `backend`, `celery_worker`
- `backend/Dockerfile`

**Dependencies listed in pyproject.toml:**
```
fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic,
pydantic[email], pydantic-settings, redis[asyncio], celery,
structlog, python-jose[cryptography], passlib[bcrypt],
python-multipart, python-magic, httpx, pytest, pytest-asyncio,
ruff, mypy, prometheus-fastapi-instrumentator, geoalchemy2
```

**DB changes:** None.
**API changes:** None.
**Frontend changes:** None.

**Security requirements:** `.env` not committed. `.env.example` has no real values.
**Tests required:** `ruff check .` passes on skeleton. `mypy app/` passes on stubs.
**Performance requirements:** N/A.
**Migration requirements:** None.
**Dependencies:** Task 0.1.

**Definition of done:**
- `docker-compose up` starts postgres and redis without error.
- All `__init__.py` files exist.
- `ruff check .` and `mypy app/` pass.

**Manual verification:** `docker-compose up -d postgres redis` → both healthy.
**Security verification:** Confirm `.env` not in `.gitignore` exceptions.
**Rollback:** Delete `backend/` and `docker-compose.yml`.

---

#### Task 1.2 — Frontend repository skeleton
**Purpose:** Initialize Next.js project with correct folder structure.

**Why needed:** Frontend can be developed in parallel with backend Phase 4+ once design system is ready.

**Files to create:**
- `frontend/` — Next.js 14+ App Router project initialized
- `frontend/src/styles/tokens.css` — CSS custom properties for all design tokens (colors, spacing, type)
- `frontend/src/styles/globals.css` — CSS reset + base typography
- `frontend/src/lib/api/client.ts` — base `apiFetch` wrapper (adds `Authorization`, `X-Request-ID`, handles error shape)
- `frontend/src/types/api.ts` — shared API types (`ApiError`, `PaginatedResponse<T>`)
- `tsconfig.json`, `next.config.ts`, `package.json`

**Design tokens (tokens.css):**
```css
--color-primary: #1a2e5e;
--color-accent: #e8a020;
--color-success: #16a34a;
--color-destructive: #dc2626;
--color-bg: #ffffff;
--color-bg-muted: #f8f9fa;
--color-text: #1a1a1a;
--color-text-muted: #6c757d;
--font-sans: 'Inter', sans-serif;
--radius-card: 8px;
--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
```

**DB changes:** None.
**API changes:** None.
**Frontend changes:** As above.

**Security requirements:** `next.config.ts` must set security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy). No secrets in any frontend file.
**Tests required:** `next build` completes without error. TypeScript strict mode passes.
**Performance requirements:** N/A.
**Migration requirements:** None.
**Dependencies:** Task 0.1.

**Definition of done:** `npm run dev` starts. `next build` completes. TypeScript strict mode on.
**Manual verification:** Open localhost:3000, see blank page (no error).
**Security verification:** Check `next.config.ts` headers config is present.
**Rollback:** Delete `frontend/`.

---

#### Task 1.3 — Testing infrastructure
**Purpose:** Establish test database, async test client, shared fixtures.

**Why needed:** Every subsequent task requires tests. Infrastructure must be ready before the first domain.

**Files to create:**
- `backend/tests/conftest.py`:
  - Event loop fixture
  - Test database engine (separate DB: `avatar_test`)
  - `AsyncSession` fixture with transaction rollback per test
  - `AsyncClient` fixture (httpx)
  - `create_tables` / `drop_tables` session-scoped fixture
- `backend/tests/test_health.py` — smoke test: GET `/health` → 200
- `backend/pytest.ini` or `pyproject.toml [tool.pytest]` section

**DB changes:** Creates `avatar_test` database (test run only, destroyed after).
**API changes:** None yet.
**Frontend changes:** None.

**Security requirements:** Test DB uses separate credentials. Never point tests at production DB.
**Tests required:**
- `pytest tests/test_health.py -v` → passes (app stub responds to /health)
- Test isolation verified: data from one test not visible in another

**Performance requirements:** Test suite for a single domain runs in under 30 seconds.
**Migration requirements:** None (tables created from SQLAlchemy models directly in test setup).
**Dependencies:** Tasks 1.1.

**Definition of done:** `pytest tests/ -v` runs and at least the health smoke test passes.
**Manual verification:** Run tests twice in a row — same results, no state leakage.
**Security verification:** Confirm test config reads from separate env vars, not `.env`.
**Rollback:** Delete `tests/conftest.py` changes.

---

### PHASE 2 — Database Foundation

---

#### Task 2.1 — Database connection + base model
**Purpose:** Async SQLAlchemy engine, session factory, declarative base with timestamp mixin.

**Why needed:** Every domain's models depend on this. Nothing in the database layer can start without it.

**Files to create:**
- `backend/app/database/base.py`:
  - `Base` — SQLAlchemy `DeclarativeBase`
  - `TimestampMixin` — `created_at`, `updated_at` with server defaults
  - `UUIDPrimaryKey` mixin — `id: Mapped[uuid.UUID]` with `gen_random_uuid()` default
- `backend/app/database/session.py`:
  - Async engine with `pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`
  - `AsyncSessionLocal` factory
  - `get_db` FastAPI dependency (yields `AsyncSession`)

**DB changes:** No tables. Engine connects to configured DB URL.
**API changes:** `GET /health` extended to verify DB connectivity.
**Frontend changes:** None.

**Security requirements:** DB URL read from env only (`Settings.database_url`). URL logged only as `postgresql+asyncpg://***` (credentials masked).
**Tests required:**
- DB connection succeeds
- Session dependency injects correctly
- Health endpoint shows `"db": "ok"` when DB reachable
- Health endpoint shows `"db": "error"` (not 500) when DB unreachable

**Performance requirements:** Connection pool settings applied. Confirm with `pool_pre_ping=True` working.
**Migration requirements:** None (no tables yet).
**Dependencies:** Tasks 1.1, 1.3.

**Definition of done:** Health endpoint returns `{"status":"ok","db":"ok"}` with real DB running.
**Manual verification:** Stop postgres, hit health → `{"db":"error"}` not a 500.
**Security verification:** DB URL not exposed in any log line.
**Rollback:** Remove `database/` files, revert health endpoint.

---

#### Task 2.2 — Alembic setup
**Purpose:** Migration framework configured and working against the real PostgreSQL database.

**Why needed:** All schema changes must go through Alembic. This must exist before the first model migration.

**Files to create:**
- `backend/alembic/env.py` — configured for async SQLAlchemy, imports `Base` from `database.base`
- `backend/alembic/alembic.ini` — points to DB URL via env var
- `backend/alembic/versions/0001_initial_baseline.py` — empty migration (proves the chain starts)

**DB changes:** Creates `alembic_version` table. Applies `0001_initial_baseline`.
**API changes:** None.
**Frontend changes:** None.

**Security requirements:** `alembic.ini` must not contain a hardcoded DB URL. Read from environment.
**Tests required:**
- `alembic upgrade head` exits 0
- `alembic downgrade -1` exits 0
- `alembic check` exits 0 (no pending migrations)

**Performance requirements:** N/A.
**Migration requirements:** This IS the migration infrastructure task.
**Dependencies:** Task 2.1.

**Definition of done:** All three alembic commands pass. `alembic_version` table visible in DB.
**Manual verification:** `alembic current` shows `0001`.
**Security verification:** DB URL not hardcoded in `alembic.ini`.
**Rollback:** `alembic downgrade base`. Delete `versions/0001_*`.

---

### PHASE 3 — FastAPI Foundation

---

#### Task 3.1 — Application configuration
**Purpose:** Pydantic Settings class that reads all configuration from environment.

**Why needed:** Every subsequent task needs config (DB URL, Redis URL, JWT secret, etc.). Central config prevents env var scatter.

**Files to create:**
- `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    # App
    app_name: str = "Avatar"
    app_version: str = "0.1.0"
    debug: bool = False
    # Database
    database_url: str
    # Redis
    redis_url: str
    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 30
    # CORS
    allowed_origins: list[str]
    # Storage
    supabase_url: str
    supabase_service_key: str  # NEVER exposed to frontend
    storage_bucket_media: str
    storage_bucket_kyc: str
    # Payments
    razorpay_key_id: str
    razorpay_key_secret: str
    # Notifications
    sms_provider_key: str = ""
    fcm_server_key: str = ""
    # Rate limiting
    otp_rate_limit_per_hour: int = 5
    otp_max_attempts: int = 5
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
```

**DB changes:** None.
**API changes:** None.
**Frontend changes:** None.

**Security requirements:**
- `jwt_secret_key` must be at least 32 chars — validated in Settings validator
- `supabase_service_key` must never be readable from any public endpoint
- No settings printed to logs on startup

**Tests required:**
- Settings loads from `.env.example` with test values substituted
- Missing required field raises `ValidationError` at startup (not a 500 mid-request)

**Performance requirements:** N/A.
**Migration requirements:** None.
**Dependencies:** Task 1.1.

**Definition of done:** `from app.core.config import settings` works in all module contexts.
**Manual verification:** Remove `DATABASE_URL` from `.env` → app refuses to start with clear error.
**Security verification:** `settings.jwt_secret_key` is never logged.
**Rollback:** Delete `core/config.py`, revert imports.

---

#### Task 3.2 — Core middleware stack
**Purpose:** Request ID injection, structured logging, CORS, security headers — on every request.

**Why needed:** Security headers and request ID correlation must be present from the first real endpoint.

**Files to create:**
- `backend/app/core/middleware.py`:
  - `RequestIDMiddleware` — injects `X-Request-ID` (accepts client-provided or generates UUID)
  - `StructuredLoggingMiddleware` — logs each request with `request_id`, `method`, `path`, `status_code`, `duration_ms`
  - CORS middleware config (from `settings.allowed_origins`)
  - Security headers middleware: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`, `Referrer-Policy: strict-origin-when-cross-origin`
- `backend/app/core/exceptions.py`:
  - `AppError(Exception)` base with `code: str`, `message: str`, `status_code: int`
  - Global handler: `AppError` → `{"error": {"code": ..., "message": ...}}`
  - Global handler: `RequestValidationError` → `{"error": {"code": "VALIDATION_ERROR", ...}}`
  - Global handler: Unhandled `Exception` → 500 (log full traceback, return generic message)

**DB changes:** None.
**API changes:** Every response now has `X-Request-ID` and security headers.
**Frontend changes:** None.

**Security requirements:**
- CORS wildcard (`*`) must never appear in production config
- Security headers verified on every response
- Unhandled exception handler must not leak stack traces to client

**Tests required:**
- `X-Request-ID` present on all responses
- Same `X-Request-ID` echoed back if client provides one
- `X-Content-Type-Options: nosniff` on all responses
- `RequestValidationError` returns `{"error": {"code": "VALIDATION_ERROR", ...}}`
- Unhandled exception returns `{"error": {"code": "INTERNAL_ERROR", ...}}`, not stack trace

**Performance requirements:** Middleware adds < 1ms overhead.
**Migration requirements:** None.
**Dependencies:** Tasks 3.1.

**Definition of done:** All tests pass. Curl shows security headers on every response.
**Manual verification:** `curl -i http://localhost:8000/health` — check all security headers present.
**Security verification:** POST with malformed JSON → check error response leaks nothing internal.
**Rollback:** Remove middleware from `main.py`, delete `middleware.py`.

---

#### Task 3.3 — Pagination utility
**Purpose:** Single shared cursor-based pagination implementation.

**Why needed:** Every list endpoint uses it. Must be standardized before first domain.

**Files to create:**
- `backend/app/core/pagination.py`:
  - `PageParams` — Pydantic model: `cursor: str | None = None`, `limit: int = 20` (max 100)
  - `encode_cursor(last_id: uuid) → str` — base64
  - `decode_cursor(cursor: str) → uuid`
  - `PaginatedResponse[T]` — generic Pydantic model: `items: list[T]`, `next_cursor: str | None`, `has_more: bool`
  - Query helper: `apply_cursor_pagination(query, cursor, limit)` — applies WHERE id > cursor, LIMIT

**DB changes:** None.
**API changes:** None (utility only, used by domain routes).
**Frontend changes:** None.

**Security requirements:** Cursor is opaque (base64 UUID). Invalid cursor → 400, not 500.
**Tests required:**
- Encode/decode round-trip
- Invalid base64 cursor → 400
- `limit` > 100 → clamped to 100

**Performance requirements:** Cursor-based pagination avoids OFFSET on large tables.
**Migration requirements:** None.
**Dependencies:** Task 3.1.

**Definition of done:** Utility functions pass all tests. No domain-specific code inside.
**Manual verification:** Unit test encode/decode cycle.
**Security verification:** Non-UUID cursor → 400 error.
**Rollback:** Delete `pagination.py`.

---

### PHASE 4 — Authentication & Authorization

---

#### Task 4.1 — JWT security utilities
**Purpose:** Token generation and validation functions. No routes yet.

**Why needed:** Auth routes, refresh, and `get_current_user` dependency all need these. Isolated here to avoid circular imports.

**Files to create:**
- `backend/app/core/security.py`:
  - `create_access_token(user_id, role) → str` — signs JWT with `exp`, `sub`, `role`, `jti`
  - `create_refresh_token() → str` — cryptographically random 32 bytes, hex-encoded
  - `decode_access_token(token) → TokenPayload` — verifies signature, expiry; raises `AppError` on failure
  - `hash_token(token) → str` — SHA-256 hash (for Redis storage of refresh tokens)

**DB changes:** None.
**API changes:** None.
**Frontend changes:** None.

**Security requirements:**
- `jwt_secret_key` minimum 32 chars enforced
- `jti` (JWT ID) claim included in every access token — required for blocklist
- Expired tokens raise `AppError(401)`, not Python `jwt.ExpiredSignatureError` (converted inside)
- Refresh token is random bytes, not JWT — cannot be decoded to reveal user info

**Tests required:**
- `create_access_token` + `decode_access_token` round-trip
- Expired token raises `AppError` with 401 status
- Tampered token raises `AppError` with 401 status
- `hash_token` is deterministic and doesn't return plaintext

**Performance requirements:** Token decode < 5ms.
**Migration requirements:** None.
**Dependencies:** Task 3.1.

**Definition of done:** All unit tests pass. No import from domain modules.
**Manual verification:** Create token, modify one byte in middle, verify decode fails.
**Security verification:** Confirm `jti` present in decoded token payload.
**Rollback:** Delete `security.py`.

---

#### Task 4.2 — Redis infrastructure
**Purpose:** Async Redis client, centralized key definitions, TTL constants.

**Why needed:** OTP storage, refresh token store, rate limiting, and worker heartbeat all use Redis. Client must be shared, not created per-request.

**Files to create:**
- `backend/app/redis/client.py`:
  - `get_redis()` — returns the shared `redis.asyncio.Redis` instance (connection pool)
  - Startup/shutdown lifespan integration
- `backend/app/redis/keys.py`:
  - `otp_key(phone) → str` → `"auth:otp:{sha256(phone)}"`
  - `otp_attempts_key(phone) → str` → `"auth:otp_attempts:{sha256(phone)}"`
  - `refresh_token_key(token_hash) → str` → `"auth:refresh:{token_hash}"`
  - `token_blocklist_key(jti) → str` → `"auth:blocklist:{jti}"`
  - `rate_limit_key(endpoint, ip) → str` → `"rate_limit:{endpoint}:{ip}"`
  - `worker_online_key(worker_id) → str` → `"worker:online:{worker_id}"`
  - `worker_location_key(worker_id) → str` → `"worker:location:{worker_id}"`
  - `booking_lock_key(booking_id) → str` → `"booking:lock:{booking_id}"`
  - `booking_idempotency_key(key) → str` → `"booking:idem:{key}"`
  - TTL constants: `OTP_TTL = 600`, `REFRESH_TOKEN_TTL = 2592000`, `WORKER_ONLINE_TTL = 90`, etc.

**API changes:** `/health` returns `"redis": "ok"` or `"redis": "error"`.
**Frontend changes:** None.

**Security requirements:**
- Phone number stored hashed in Redis key (not plaintext) — prevents enumeration from Redis KEYS scan
- Redis URL uses password-auth in production
- Never store OTP plaintext — store HMAC/hash

**Tests required:**
- Redis client connects and ping succeeds
- Health shows `"redis": "ok"`
- All key functions return expected string patterns
- TTL constants are defined (not scattered)

**Performance requirements:** Connection pool configured. Not creating new connection per request.
**Migration requirements:** None.
**Dependencies:** Tasks 3.1, 3.2.

**Definition of done:** All tests pass. All future Redis usage must import keys from `redis/keys.py`.
**Manual verification:** `docker exec -it redis redis-cli ping` → PONG.
**Security verification:** Confirm no key function embeds phone/email plaintext in key string.
**Rollback:** Remove Redis lifespan, delete `redis/` files.

---

#### Task 4.3 — User model + migration
**Purpose:** `users` table created in database.

**Why needed:** Auth, customer, and worker all FK to `users`. This is the root entity.

**Files to create:**
- `backend/app/users/models.py`:
```python
class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    WORKER = "worker"
    ADMIN = "admin"

class User(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "users"
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SQLAlchemyEnum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
```
- `backend/alembic/versions/0002_users_table.py`

**DB changes:**
- Table: `users`
- Indexes: `idx_users_phone` (unique), `idx_users_email` (unique, partial on non-null), `idx_users_role`
- Enum type: `userrole`

**API changes:** None.
**Frontend changes:** None.

**Security requirements:**
- `phone` stored as-is (E.164 format validated at API layer)
- No password column — OTP-only auth
- `is_active=False` prevents login (checked at auth layer)

**Tests required:**
- Migration up/down
- `phone` uniqueness enforced at DB level
- `email` uniqueness enforced at DB level (nullable unique)
- `role` constraint enforced (invalid string rejected)

**Performance requirements:** Indexes on `phone`, `email`, `role`.
**Migration requirements:** `alembic upgrade head`, `alembic downgrade -1` both pass.
**Dependencies:** Tasks 2.2.

**Definition of done:** Migration applies cleanly. `\d users` shows correct columns, types, constraints.
**Manual verification:** Insert two users with same phone → unique constraint error.
**Security verification:** Confirm no `password` column exists.
**Rollback:** `alembic downgrade -1`.

---

#### Task 4.4 — OTP send endpoint
**Purpose:** Customer/worker requests an OTP to their phone number.

**Why needed:** Entry point for all authentication. Rate limiting and brute force protection are critical.

**Files to create:**
- `backend/app/auth/schemas.py` — `OTPSendRequest`, `OTPSendResponse`
- `backend/app/auth/service.py` — `send_otp(phone, redis)`:
  - Check rate limit (max 5 per hour via `otp_attempts_key`)
  - Generate 6-digit OTP
  - Store HMAC(OTP, secret) in Redis with TTL 10min
  - Increment hourly send counter
  - Call SMS provider (stubbed — log to console in dev)
  - Always return same response whether phone is new or existing
- `backend/app/auth/routes.py` — `POST /api/v1/auth/otp/send`

**DB changes:** None (Redis only).
**API changes:**
- `POST /api/v1/auth/otp/send`
  - Body: `{"phone": "+919876543210"}`
  - Response: `{"message": "OTP sent"}` (always — no enumeration)
  - Rate limited: 429 after 5 sends/hour/phone

**Frontend changes:** None.

**Security requirements:**
- Phone normalized to E.164 before use
- OTP stored as `HMAC(otp, secret)` — not plaintext
- Response identical whether phone is registered or not
- Rate limit by phone (not just IP — accounts for carrier NAT)
- OTP is 6 digits from `secrets.randbelow(900000) + 100000`

**Tests required:**
- Valid phone → 200 `{"message": "OTP sent"}`
- Invalid phone format → 422
- 6th send in 1 hour → 429
- Response body identical for registered vs unregistered phone
- OTP not logged anywhere in test logs

**Performance requirements:** Redis operations complete < 10ms.
**Migration requirements:** None.
**Dependencies:** Tasks 4.2, 4.3.

**Definition of done:** All tests pass. Rate limiting verified by running test 6 times.
**Manual verification:** Send OTP 5 times to same number → 6th returns 429.
**Security verification:**
- Check Redis: OTP stored as hash, not `"123456"`
- Response body for unknown vs known phone — byte-for-byte identical
**Rollback:** Remove route from main.py, delete `auth/` files.

---

#### Task 4.5 — OTP verify + token issue
**Purpose:** Verify OTP, create user if new, return JWT access + refresh tokens.

**Why needed:** Completes the login flow. First-time users are auto-registered.

**Files to modify/create:**
- `backend/app/auth/service.py` — add `verify_otp(phone, code, db, redis) → TokenPair`:
  - Check brute force counter (max 5 wrong attempts → 429)
  - Retrieve stored HMAC from Redis
  - Verify HMAC(submitted_code, secret) == stored value
  - Delete OTP from Redis on success
  - Get-or-create `User` record
  - Issue access token + refresh token
  - Store refresh token hash in Redis (TTL 30 days)
- `backend/app/auth/routes.py` — add `POST /api/v1/auth/otp/verify`
- `backend/app/auth/schemas.py` — add `OTPVerifyRequest`, `TokenPair`

**DB changes:** New `User` row created on first login (upsert by phone).
**API changes:**
- `POST /api/v1/auth/otp/verify`
  - Body: `{"phone": "+919876543210", "code": "123456"}`
  - Response: `{"access_token": "...", "refresh_token": "...", "token_type": "bearer", "role": "customer"}`
  - Wrong OTP: 401
  - Locked out: 429

**Security requirements:**
- Brute force: 5 wrong attempts → 429, counter in Redis with 1h TTL
- OTP deleted from Redis immediately on successful verify (one-time use)
- `User.is_active=False` → 403 (suspended account)
- Refresh token stored hashed in Redis, not plaintext

**Tests required:**
- Valid OTP → 200 with tokens
- Wrong OTP → 401
- 5th wrong attempt → 401, 6th → 429
- Expired OTP → 401
- Same OTP used twice → 401 (deleted after first use)
- Inactive user → 403
- New phone creates user with `role=CUSTOMER`

**Performance requirements:** Full verify path < 100ms.
**Migration requirements:** None.
**Dependencies:** Task 4.4.

**Definition of done:** Full login flow works end-to-end in tests.
**Manual verification:** Complete OTP flow in Postman/curl. Decode JWT — verify `sub`, `role`, `jti` present.
**Security verification:**
- Reuse same OTP after successful verify → 401
- 6 wrong OTPs → 429
- Inspect Redis: no plaintext OTP or refresh token
**Rollback:** Remove verify endpoint, revert service.py.

---

#### Task 4.6 — Token refresh + logout
**Purpose:** Rotate refresh tokens. Logout revokes all tokens.

**Why needed:** Access tokens are short-lived (15min). Refresh enables seamless UX. Logout must prevent token reuse.

**Files to modify:**
- `backend/app/auth/service.py` — add `refresh_tokens()`, `logout()`
- `backend/app/auth/routes.py` — add `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`

**Logic:**
- `refresh_tokens(refresh_token, redis)`:
  - Hash incoming refresh token
  - Check Redis: `auth:refresh:{hash}` exists
  - Delete old refresh token from Redis immediately (rotation)
  - Issue new access token + new refresh token
  - Store new refresh token hash in Redis
- `logout(access_token, refresh_token, redis)`:
  - Add access token `jti` to blocklist in Redis (TTL = remaining access token TTL)
  - Delete refresh token hash from Redis

**API changes:**
- `POST /api/v1/auth/refresh` — body: `{"refresh_token": "..."}` → new `TokenPair`
- `POST /api/v1/auth/logout` — requires valid access token, body: `{"refresh_token": "..."}`

**Security requirements:**
- Refresh token rotation: old token immediately deleted on use
- Old refresh token after rotation → 401
- After logout: access token → 401 (blocklist), refresh token → 401

**Tests required:**
- Refresh with valid token → new token pair
- Refresh with already-used token → 401 (rotation enforcement)
- Refresh with expired token → 401
- Access token after logout → 401
- Refresh token after logout → 401

**Performance requirements:** N/A.
**Migration requirements:** None.
**Dependencies:** Task 4.5.

**Definition of done:** Token rotation and revocation verified by tests.
**Manual verification:** Login → refresh → try original refresh token → 401.
**Security verification:** After logout, try both access and refresh tokens → both 401.
**Rollback:** Remove refresh/logout routes.

---

#### Task 4.7 — Auth dependencies + role enforcement
**Purpose:** FastAPI dependencies that protect routes by authentication and role.

**Why needed:** Every protected route uses these. Must be clean and centralized.

**Files to create:**
- `backend/app/core/dependencies.py`:
  - `get_current_user(token, db, redis) → User`:
    - Extract Bearer token from `Authorization` header
    - Decode and validate JWT
    - Check `jti` not in Redis blocklist
    - Load `User` from DB, verify `is_active=True`
  - `require_customer(user) → User` — asserts `user.role == CUSTOMER` → 403 if not
  - `require_worker(user) → User` — asserts `user.role == WORKER`
  - `require_admin(user) → User` — asserts `user.role == ADMIN`
- `backend/app/users/routes.py` — `GET /api/v1/users/me` (first protected endpoint)
- `backend/app/users/schemas.py` — `UserResponse`

**API changes:**
- `GET /api/v1/users/me` → returns `UserResponse`

**Security requirements:**
- Missing `Authorization` header → 401
- Invalid token → 401
- Blocklisted token → 401
- Inactive user → 403
- Wrong role → 403 (not 401 — user IS authenticated, just wrong role)

**Tests required:**
- No token → 401
- Invalid token → 401
- Revoked token → 401
- Inactive user token → 403
- Customer token on worker-only route → 403
- Admin token on customer-only route → 403
- Valid customer token on customer route → 200

**Performance requirements:** DB lookup cached? No — user state (is_active, role) must be fresh. But query is by primary key so it's a fast index scan.
**Migration requirements:** None.
**Dependencies:** Task 4.6.

**Definition of done:** All authorization tests pass. Role enforcement verified for customer/worker/admin.
**Manual verification:** Get a token, hit `/api/v1/users/me` — see own user object. Change role in DB, hit endpoint — should now get 403 (because session is fresh from DB, not cached).
**Security verification:**
- Swap `role` in JWT payload (tamper) → 401 (invalid signature)
- Try expired token → 401
**Rollback:** Remove dependencies, delete `users/routes.py`.

---

#### Task 4.8 — Rate limiting middleware
**Purpose:** Redis-backed rate limiting on all API endpoints, with stricter limits on sensitive endpoints.

**Why needed:** Prevents abuse, brute force, and DoS. Required before exposing any public endpoint.

**Files to create/modify:**
- `backend/app/core/middleware.py` — add `RateLimitMiddleware`:
  - Default: 100 req/min per IP
  - Strict endpoints (configurable list): OTP send, OTP verify, login → 10 req/min
  - Uses sliding window counter in Redis
  - Returns `Retry-After` header on 429

**API changes:** All endpoints now rate-limited. 429 on breach.
**Frontend changes:** None.

**Security requirements:**
- IP extracted carefully: check `X-Forwarded-For` only if trusted proxy is configured
- Default to `request.client.host` in development
- Rate limit keys use IP only (not user ID at this layer — user-level limiting is per-feature)

**Tests required:**
- 101 requests in 1 min → 429 on 101st
- Strict endpoint: 11 requests → 429 on 11th
- `Retry-After` header present on 429 response

**Performance requirements:** Rate limit check adds < 5ms via Redis `INCR` + `EXPIRE`.
**Migration requirements:** None.
**Dependencies:** Task 4.2.

**Definition of done:** Rate limiting verified by tests. All responses include correct status and header.
**Manual verification:** Bash loop: `for i in {1..105}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v1/auth/otp/send; done` → 100x 422 (no phone), then 429.
**Security verification:** Confirm rate limit applies to OTP endpoints specifically.
**Rollback:** Remove RateLimitMiddleware from app.

---

#### Task 4.9 — Audit logging
**Purpose:** All state-changing operations logged to `audit_logs` table.

**Why needed:** Regulatory, dispute resolution, security incident investigation.

**Files to create:**
- `backend/app/core/middleware.py` — `AuditLogMiddleware` (or use structlog event in service layer):
  - Logs: `request_id`, `user_id`, `truncated_ip` (last octet zeroed for IPv4), `user_agent`, `method`, `endpoint`, `response_status`, `timestamp`
  - Only logs: POST/PUT/PATCH/DELETE (state-changing), not GET
- `backend/alembic/versions/0003_audit_logs.py`

**DB changes:**
- Table: `audit_logs` — `id (bigserial pk)`, `user_id (uuid, nullable)`, `request_id (uuid)`, `ip_address (text)`, `user_agent (text)`, `method (text)`, `endpoint (text)`, `response_status (int)`, `created_at`
- Indexes: `idx_audit_user_id`, `idx_audit_created_at`

**API changes:** None visible — transparent middleware.
**Frontend changes:** None.

**Security requirements:**
- IPv4 last octet zeroed: `192.168.1.x` → `192.168.1.0`
- Never log request body (may contain OTP, payment info)
- `user_id` is nullable (unauthenticated requests still logged)

**Tests required:**
- POST request creates audit log row
- GET request does NOT create audit log row
- IP is stored truncated
- user_id is populated when authenticated

**Performance requirements:** Audit log write is async (fire-and-forget to Celery, or direct async insert). Must not add latency to request.
**Migration requirements:** `alembic upgrade head`.
**Dependencies:** Tasks 2.2, 4.7.

**Definition of done:** All state-changing requests appear in audit_logs. IP truncation verified.
**Manual verification:** Make a POST request, query `SELECT * FROM audit_logs` — see the entry.
**Security verification:** Confirm IP last octet is `0`. Confirm body not logged.
**Rollback:** `alembic downgrade -1`. Remove middleware.

---

### PHASE 5 — Customer Domain

---

#### Task 5.1 — Customer profile model + migration
**Purpose:** Customer profile and address tables.

**Files to create:**
- `backend/app/customers/models.py`:
  - `CustomerProfile` — `id`, `user_id (fk unique)`, `default_address_id (nullable fk)`, timestamps
  - `Address` — `id`, `user_id (fk)`, `label`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `location (geography)`, `is_default`, `created_at`
- `backend/alembic/versions/0004_customer_profiles.py`

**DB changes:**
- Tables: `customer_profiles`, `addresses`
- Indexes: `idx_addresses_user_id`, GIST on `addresses.location`

**Tests required:** Migration up/down. Unique constraint on `customer_profiles.user_id`.
**Dependencies:** Task 4.3.

**Definition of done:** Tables created with correct constraints.
**Rollback:** `alembic downgrade -1`.

---

#### Task 5.2 — Customer profile API
**Purpose:** Customer can view and update profile. CRUD on addresses.

**Files to create:**
- `backend/app/customers/schemas.py`
- `backend/app/customers/service.py`
- `backend/app/customers/routes.py`

**API changes:**
- `GET /api/v1/customers/me`
- `PATCH /api/v1/customers/me`
- `GET /api/v1/customers/me/addresses`
- `POST /api/v1/customers/me/addresses`
- `PATCH /api/v1/customers/me/addresses/{id}`
- `DELETE /api/v1/customers/me/addresses/{id}`
- `POST /api/v1/customers/me/addresses/{id}/set-default`

**Security requirements:**
- All endpoints: `require_customer` dependency
- Address ownership verified on every operation: `address.user_id == current_user.id`
- Mass assignment: `user_id` not settable from request body

**Tests required:**
- CRUD happy path
- Customer A accessing Customer B's address → 403 (IDOR)
- Worker hitting customer endpoint → 403
- Mass assignment: send `{"user_id": "other-uuid"}` → 422 or ignored
- Delete address that is `default_address_id` → handled gracefully (nullable FK)

**Performance requirements:** Address list: simple indexed query on `user_id`. No N+1.
**Dependencies:** Task 5.1, 4.7.

**Definition of done:** All IDOR and mass assignment tests pass.
**Security verification:** IDOR test must explicitly test cross-customer access.
**Rollback:** Remove customer routes from `main.py`.

---

### PHASE 6 — Worker Domain

---

#### Task 6.1 — Worker profile model + migration
**Purpose:** Worker profile, KYC documents table.

**Files to create:**
- `backend/app/workers/models.py`:
  - `WorkerLifecycleStatus`, `KYCStatus`, `KYCDocType` enums
  - `WorkerProfile` — all fields per schema design
  - `KYCDocument` — `id`, `worker_id (fk)`, `doc_type`, `file_url`, `status`, `reviewed_by`, `reviewed_at`, `created_at`
- `backend/alembic/versions/0005_worker_profiles.py`

**DB changes:**
- Tables: `worker_profiles`, `kyc_documents`
- PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis` in migration
- GIST index on `worker_profiles.current_location`
- Indexes: `idx_worker_profiles_user_id`, `idx_worker_profiles_lifecycle_status`, `idx_worker_profiles_is_available`

**Tests required:** Migration up/down. PostGIS extension loads. GIST index created.
**Dependencies:** Tasks 2.2, 4.3.

**Definition of done:** `\dx` shows postgis installed. `\d worker_profiles` shows geography column.
**Rollback:** `alembic downgrade -1`.

---

#### Task 6.2 — Worker self-management API
**Purpose:** Worker views/edits own profile, sets categories, areas, availability.

**Files to create:**
- `backend/app/workers/schemas.py`
- `backend/app/workers/service.py`
- `backend/app/workers/routes.py`

**API changes:**
- `GET /api/v1/workers/me`
- `PATCH /api/v1/workers/me`
- `PUT /api/v1/workers/me/categories`
- `PUT /api/v1/workers/me/service-areas`
- `POST /api/v1/workers/me/availability` → `{"is_available": true/false}`
- `POST /api/v1/workers/me/location` → `{"lat": 12.9716, "lng": 77.5946}`

**Location update side-effects:**
- Update `worker_profiles.current_location` (geography point)
- Update `worker_profiles.last_location_update`
- Set Redis: `worker:online:{worker_id}` with TTL 90s

**Security requirements:**
- `require_worker` on all endpoints
- Worker can only touch own profile (service checks `worker.user_id == current_user.id`)
- `lifecycle_status` and `kyc_status` not settable from worker API

**Tests required:**
- Worker A cannot PATCH Worker B's profile → 403
- Customer cannot call worker endpoints → 403
- `lifecycle_status` field in PATCH body is ignored
- Availability toggle updates Redis key
- Location update stores geography point

**Performance requirements:** Location update: write to DB + Redis. Both async.
**Dependencies:** Tasks 6.1, 4.7.

**Definition of done:** All authorization tests pass. Location stored correctly in DB.
**Rollback:** Remove worker routes from main.py.

---

### PHASE 7 — Service Category Management

---

#### Task 7.1 — Category model + migration + seed
**Purpose:** Service category tree in database.

**Files to create:**
- `backend/app/categories/models.py` — `ServiceCategory` with self-referential `parent_id`
- `backend/alembic/versions/0006_service_categories.py`
- `backend/scripts/seed_categories.py` — ~20 categories (Plumber, Electrician, Carpenter, etc.)

**DB changes:**
- Table: `service_categories`
- `pricing_model` ENUM: `FIXED`, `INSPECTION_QUOTE`, `PROJECT_QUOTE`
- `slug` unique index
- `idx_categories_is_active`, `idx_categories_parent_id`

**Tests required:** Migration. Seed runs without error. Slug uniqueness enforced.
**Dependencies:** Task 2.2.

**Definition of done:** Seed inserts 20 categories. `SELECT count(*) FROM service_categories` = 20.
**Rollback:** `alembic downgrade -1`. Seed is idempotent (upsert by slug).

---

#### Task 7.2 — Category API + caching
**Purpose:** Public category list with Redis caching. Admin management.

**Files to create:**
- `backend/app/categories/schemas.py`
- `backend/app/categories/service.py`
- `backend/app/categories/routes.py`

**API changes:**
- `GET /api/v1/categories` — public, cached 1h
- `GET /api/v1/categories/{id}` — public, cached 5min
- `POST /api/v1/admin/categories` — admin only
- `PATCH /api/v1/admin/categories/{id}` — admin only, invalidates cache
- `DELETE /api/v1/admin/categories/{id}` — admin only, sets `is_active=False`

**Caching:** Check `cache:categories` in Redis → if miss, query DB, store result.

**Security requirements:**
- Admin endpoints: `require_admin`
- Non-admin create → 403

**Tests required:**
- List returns active categories only
- Admin creates category → 201
- Non-admin creates category → 403
- Cache invalidated on admin update (verify Redis key deleted)

**Performance requirements:** Single query (no N+1). Cached response on second call.
**Dependencies:** Tasks 7.1, 4.7, 4.2.

**Rollback:** Remove routes. `alembic downgrade` reverts table.

---

### PHASE 8 — Location & Geospatial Infrastructure

---

#### Task 8.1 — Service zones model + migration
**Purpose:** Named service zones (cities, areas) that workers can register to serve.

**Files to create:**
- `backend/app/locations/models.py`:
  - `ServiceZone` — `id`, `name`, `city`, `state`, `polygon (geography nullable)`, `is_active`
  - `WorkerServiceArea` — `worker_id`, `zone_id` (composite PK)
- `backend/alembic/versions/0007_service_zones.py`

**DB changes:**
- Tables: `service_zones`, `worker_service_areas`
- GIST index on `service_zones.polygon`

**Tests required:** Migration up/down. Composite PK on `worker_service_areas`.
**Dependencies:** Tasks 6.1, 2.2.

**Rollback:** `alembic downgrade -1`.

---

#### Task 8.2 — Nearby worker discovery
**Purpose:** Given customer location, return nearby available workers for a service.

**Files to create:**
- `backend/app/workers/service.py` — add `find_nearby_workers(lat, lng, category_id, radius_km, db, redis)`
- `backend/app/workers/routes.py` — add `GET /api/v1/workers/nearby`

**Query logic:**
```sql
SELECT wp.*, ST_Distance(wp.current_location, ST_MakePoint(lng, lat)::geography) as distance_m
FROM worker_profiles wp
JOIN worker_categories wc ON wc.worker_id = wp.id
WHERE wp.lifecycle_status = 'active'
  AND wp.is_available = true
  AND wc.category_id = :category_id
  AND ST_DWithin(wp.current_location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
ORDER BY distance_m
LIMIT 20
```

**Redis check:** After DB query, filter out workers whose `worker:online:{worker_id}` key has expired (offline heartbeat).

**API changes:**
- `GET /api/v1/workers/nearby?lat=&lng=&category_id=&radius_km=` (customer, authenticated)
- Returns: `id`, `full_name`, `rating_avg`, `distance_km`, `profile_photo_url`, `price_estimate`

**Security requirements:**
- `require_customer`
- `lat`/`lng` validated: lat ∈ [-90,90], lng ∈ [-180,180]
- `radius_km` max 50 (capped server-side)

**Tests required:**
- Workers within radius returned
- Workers outside radius excluded
- Suspended/inactive workers excluded
- Workers with expired Redis heartbeat excluded
- Unauthenticated → 401
- Worker calling endpoint → 403
- Invalid lat/lng → 422

**Performance requirements:**
- EXPLAIN ANALYZE confirms GIST index used (`Index Scan using idx_worker_location...`)
- No N+1: categories loaded via join, not lazy
- Result paginated (max 20)

**Dependencies:** Tasks 8.1, 7.1, 4.7, 4.2.

**Definition of done:** PostGIS query uses GIST index. N+1 confirmed absent.
**Manual verification:** Insert 100 worker rows at various locations, run nearby query, verify only correct ones return.
**Security verification:** Radius capped at 50km — sending `radius_km=999` returns max 50km results.
**Rollback:** Remove endpoint from router.

---

### PHASE 9 — Pricing Engine

---

#### Task 9.1 — Pricing rule model + migration + seed
**Purpose:** Pricing rules table. Admin-defined, category/area-specific.

**Files to create:**
- `backend/app/pricing/models.py` — `PricingRule` per schema design
- `backend/alembic/versions/0008_pricing_rules.py`
- `backend/scripts/seed_pricing.py` — sample rules per category

**DB changes:**
- Table: `pricing_rules`
- All monetary columns: `BIGINT` (paise)
- `idx_pricing_rules_category_id`, `idx_pricing_rules_area_id`, `idx_pricing_rules_effective_from`
- Composite: `idx_pricing_rules_category_area` on `(category_id, area_id, effective_from)`

**Tests required:** Migration. Seed runs. Monetary columns are bigint (no float).
**Dependencies:** Tasks 7.1, 8.1, 2.2.

**Rollback:** `alembic downgrade -1`.

---

#### Task 9.2 — Price calculation service
**Purpose:** Given booking context, resolve the correct pricing rule and return an itemized breakdown.

**Files to create:**
- `backend/app/pricing/service.py` — `calculate_price(category_id, zone_id, is_emergency, distance_km, scheduled_at) → PriceBreakdown`

**Rule resolution logic (most specific wins):**
1. Match `category_id` + `zone_id` + date in range → highest priority
2. Match `category_id` + no zone + date in range
3. Match no category + `zone_id` + date in range
4. Match no category + no zone + date in range (global default)

**Return type `PriceBreakdown`:**
```python
class PriceBreakdown(BaseModel):
    base_amount_paise: int
    visit_fee_paise: int
    distance_fee_paise: int
    emergency_fee_paise: int
    platform_fee_paise: int
    tax_paise: int
    total_paise: int
    worker_earnings_paise: int
    pricing_rule_id: uuid.UUID
    pricing_model: PricingModel
```

**Tests required:**
- Fixed price category → correct base
- Emergency → adds emergency fee
- Area-specific rule overrides global
- Category+area rule overrides category-only
- No matching rule → raises `AppError(404, "NO_PRICING_RULE")`
- `total_paise` = sum of components (algebraic test)
- No floating point anywhere in calculation

**Performance requirements:** Pricing rules cached in Redis (TTL 30min). Cache invalidated on admin update.
**Dependencies:** Task 9.1, 4.2.

**Definition of done:** All calculation tests pass. No float operations in service.
**Manual verification:** Calculate price for known category, verify each line item is correct.
**Security verification:** Pricing is server-side only. Frontend receives the breakdown but cannot submit custom price.
**Rollback:** Delete `pricing/service.py`.

---

#### Task 9.3 — Pricing estimate API + admin rule management
**Purpose:** Customer can get a price estimate before booking. Admin manages pricing rules.

**Files to create:**
- `backend/app/pricing/schemas.py`
- `backend/app/pricing/routes.py`

**API changes:**
- `GET /api/v1/pricing/estimate?category_id=&lat=&lng=&is_emergency=` (customer, authenticated)
- `GET /api/v1/admin/pricing/rules` (admin)
- `POST /api/v1/admin/pricing/rules` (admin)
- `PATCH /api/v1/admin/pricing/rules/{id}` (admin) — invalidates cache
- `DELETE /api/v1/admin/pricing/rules/{id}` (admin) — sets `effective_until = today`

**Security requirements:**
- Customer cannot access admin pricing endpoints → 403
- Admin cannot fake pricing in customer booking (price resolved server-side, not accepted from client)

**Tests required:**
- Estimate returns breakdown for known category
- Admin CRUD on rules
- Cache invalidated on rule update
- Non-admin on admin endpoints → 403

**Dependencies:** Tasks 9.2, 4.7, 4.2.

**Rollback:** Remove pricing routes from main.py.

---

### PHASE 10 — Booking Lifecycle

---

#### Task 10.1 — Booking model + migration
**Purpose:** Core booking table and all status transitions defined.

**Files to create:**
- `backend/app/bookings/models.py`:
  - `BookingStatus` enum with all states
  - `Booking` model
  - `BookingMedia` model
- `backend/alembic/versions/0009_bookings.py`

**BookingStatus values:**
```
PENDING_WORKER_ACCEPTANCE, ACCEPTED, WORKER_EN_ROUTE,
WORKER_ARRIVED, IN_PROGRESS, PENDING_QUOTE, QUOTE_SUBMITTED,
QUOTE_ACCEPTED, QUOTE_REJECTED, COMPLETED, PENDING_PAYMENT,
PAID, REVIEWED, CANCELLED_BY_CUSTOMER, CANCELLED_BY_ADMIN,
EXPIRED, WORKER_NO_SHOW
```

**DB changes:**
- Table: `bookings` — `id`, `idempotency_key (unique)`, `customer_id (fk)`, `worker_id (fk nullable)`, `category_id (fk)`, `address_id (fk)`, `status (enum)`, `description`, `is_emergency`, `scheduled_at`, `pricing_rule_id (fk nullable)`, `pricing_snapshot (jsonb nullable)`, all timestamp fields, `created_at`, `updated_at`
- Table: `booking_media` — `id`, `booking_id (fk cascade)`, `media_url`, `media_type (IMAGE|VIDEO)`, `uploaded_at`
- Indexes: `idx_bookings_idempotency_key (unique)`, `idx_bookings_customer_id`, `idx_bookings_worker_id`, `idx_bookings_status`, `idx_bookings_scheduled_at`

**Tests required:** Migration. Idempotency key unique constraint. Status enum enforced.
**Dependencies:** Tasks 5.1, 6.1, 7.1, 9.1, 2.2.

**Definition of done:** All tables created with correct constraints.
**Rollback:** `alembic downgrade -1`.

---

#### Task 10.2 — Create booking
**Purpose:** Customer creates a booking. Pricing resolved and snapshotted server-side. Acceptance timeout scheduled.

**Files to create:**
- `backend/app/bookings/schemas.py`
- `backend/app/bookings/service.py` — `create_booking(customer_id, request, db, redis)`
- `backend/app/bookings/routes.py`

**Logic:**
1. Check Redis: `booking:idem:{idempotency_key}` → if exists, return existing booking (409 with booking)
2. Verify `address_id` belongs to customer
3. Verify category is active
4. Resolve pricing rule via `pricing.service.calculate_price()`
5. Insert booking row (status: `PENDING_WORKER_ACCEPTANCE`)
6. Store pricing snapshot in `booking.pricing_snapshot` (jsonb)
7. Store idempotency key in Redis (TTL 24h)
8. Enqueue Celery task: `handle_acceptance_timeout(booking_id)` in 5 minutes
9. Return booking

**API changes:**
- `POST /api/v1/bookings`
  - Requires: `X-Idempotency-Key` header or body field
  - Body: `{category_id, address_id, description, is_emergency, scheduled_at?, media_keys[]?}`
  - Returns: `BookingResponse` with full pricing breakdown

**Security requirements:**
- `require_customer`
- Address ownership check: `address.user_id == current_user.id`
- Idempotency enforced (Redis + DB unique constraint)
- Pricing calculated server-side — no price accepted from client

**Tests required:**
- Valid booking → 201
- Duplicate idempotency key → 409 with existing booking returned
- Address not owned by customer → 403
- Invalid/inactive category → 400
- Pricing snapshot stored in jsonb
- Celery task enqueued (verify task ID returned from Celery)
- Worker calling this → 403

**Performance requirements:** No N+1. Pricing lookup uses Redis cache.
**Dependencies:** Tasks 10.1, 9.2, 5.2, 4.7, 4.2.

**Definition of done:** Full booking creation flow works. Idempotency verified.
**Security verification:** Change `address_id` to belong to another customer → 403.
**Rollback:** Remove booking create route. Note: DB row may exist if partial failure — idempotency key cleans up.

---

#### Task 10.3 — Worker job request + acceptance
**Purpose:** Workers see nearby job requests and can accept/reject with race condition protection.

**Files to create/modify:**
- `backend/app/bookings/service.py` — `get_job_requests_for_worker(worker, db, redis)`, `accept_booking(booking_id, worker, db, redis)`, `reject_booking(booking_id, worker, db, redis)`
- `backend/app/bookings/routes.py` — add worker endpoints

**Acceptance atomic transaction:**
```python
async with db.begin():
    # 1. SET booking:lock:{booking_id} {worker_id} NX EX 10
    lock_acquired = await redis.set(lock_key, worker_id, nx=True, ex=10)
    if not lock_acquired:
        raise AppError(409, "BOOKING_BEING_ACCEPTED")
    # 2. SELECT ... FOR UPDATE on booking
    booking = await db.execute(select(Booking).where(id=booking_id).with_for_update())
    # 3. Verify status is still PENDING_WORKER_ACCEPTANCE
    # 4. Verify worker is eligible (has matching category)
    # 5. Update booking: worker_id, status=ACCEPTED, worker_accepted_at
```

**API changes:**
- `GET /api/v1/workers/me/job-requests` — paginated list of nearby pending bookings
- `POST /api/v1/bookings/{id}/accept` (worker)
- `POST /api/v1/bookings/{id}/reject` (worker)

**Security requirements:**
- `require_worker` on all
- Worker can only accept bookings matching their categories and service area
- Worker cannot accept booking already assigned to another worker

**Tests required:**
- Accept → booking status ACCEPTED
- Reject → booking status reverts or stays PENDING (for other workers)
- Two workers accept simultaneously → exactly one succeeds, other gets 409
- Accept expired booking → 400
- Worker with wrong category accepts → 403
- Customer calling accept → 403

**Performance requirements:** SELECT FOR UPDATE scoped to single row — fast. Lock TTL prevents deadlocks.
**Dependencies:** Task 10.2, 6.2.

**Definition of done:** Race condition test (concurrent accepts) passes deterministically.
**Manual verification:** Test concurrent acceptance with `asyncio.gather` in test.
**Security verification:** Worker A cannot accept booking that Worker B already accepted.
**Rollback:** Remove accept/reject routes.

---

#### Task 10.4 — Booking status transitions (worker side)
**Purpose:** Worker updates booking status as job progresses.

**Files to modify:**
- `backend/app/bookings/service.py` — `transition_booking_status(booking_id, to_status, worker, db)`
- `backend/app/bookings/routes.py` — add transition endpoints

**Valid transitions (enforced as state machine):**
```
ACCEPTED → WORKER_EN_ROUTE
WORKER_EN_ROUTE → WORKER_ARRIVED
WORKER_ARRIVED → IN_PROGRESS
IN_PROGRESS → COMPLETED           (for FIXED pricing)
IN_PROGRESS → QUOTE_SUBMITTED     (for INSPECTION_QUOTE pricing — triggers quote flow)
COMPLETED → PENDING_PAYMENT       (auto-transition)
```

**API changes:**
- `POST /api/v1/bookings/{id}/en-route`
- `POST /api/v1/bookings/{id}/arrived`
- `POST /api/v1/bookings/{id}/start`
- `POST /api/v1/bookings/{id}/complete`

**Security requirements:**
- `require_worker`
- Worker must be the assigned worker for this booking (`booking.worker_id == current_worker.id`)
- Invalid transition → 409

**Tests required:**
- Each valid transition → 200
- Out-of-order transition → 409
- Worker not assigned to booking → 403
- Customer calling → 403

**Dependencies:** Task 10.3.

**Definition of done:** State machine rejects all invalid transitions.
**Security verification:** Worker B cannot transition Worker A's booking.
**Rollback:** Remove transition routes.

---

#### Task 10.5 — Customer booking views + cancellation
**Purpose:** Customer views booking history and can cancel.

**Files to modify:**
- `backend/app/bookings/routes.py` — add customer list/detail/cancel
- `backend/app/bookings/service.py` — `list_customer_bookings()`, `get_booking_for_customer()`, `cancel_booking_by_customer()`

**API changes:**
- `GET /api/v1/bookings` — customer's own bookings, paginated, cursor-based
- `GET /api/v1/bookings/{id}` — booking detail with pricing snapshot
- `POST /api/v1/bookings/{id}/cancel`

**Cancellation rules:**
- `PENDING_WORKER_ACCEPTANCE` → free cancel → `CANCELLED_BY_CUSTOMER`
- `ACCEPTED` or later → allowed but cancellation note stored (fee policy TBD — flagged for admin review)
- `COMPLETED` or `PAID` → cannot cancel → 409

**Security requirements:**
- `require_customer`
- `booking.customer_id == current_user's customer profile id`

**Tests required:**
- List shows only own bookings (IDOR: customer A cannot see customer B's bookings)
- Cancel in valid state → 200
- Cancel completed booking → 409
- Worker calling list → 403

**Performance requirements:** List query paginated. No N+1 (related fields loaded via join or selectinload).
**Dependencies:** Task 10.4.

**Security verification:** IDOR test: log in as Customer A, try `GET /api/v1/bookings/{B's booking id}` → 403.
**Rollback:** Remove customer booking routes.

---

#### Task 10.6 — Acceptance timeout Celery task
**Purpose:** Auto-expire bookings that no worker accepts within 5 minutes.

**Files to create:**
- `backend/app/bookings/tasks.py` — `handle_acceptance_timeout(booking_id: str)`

**Logic:**
```python
@celery_app.task(bind=True, max_retries=3)
def handle_acceptance_timeout(self, booking_id: str):
    # In async context via asyncio.run or use sync SQLAlchemy session here
    # Load booking
    # If status == PENDING_WORKER_ACCEPTANCE:
    #   Set status = EXPIRED
    #   Enqueue notification: notify customer
    # Else: no-op (idempotent)
```

**Tests required:**
- Task called on PENDING booking → status becomes EXPIRED
- Task called on ACCEPTED booking → no change (idempotent)
- Task registered in Celery worker

**Performance requirements:** Task uses sync DB session (Celery worker is sync by default) or properly bridged async.
**Dependencies:** Tasks 10.2, 4.2.

**Definition of done:** Task is idempotent. Can be called multiple times safely.
**Rollback:** Remove task. Remove from enqueue call in `create_booking`.

---

### PHASE 11 — Worker Matching & Availability

---

#### Task 11.1 — Worker availability heartbeat
**Purpose:** Workers maintain online status via periodic location/heartbeat updates.

**Files to modify:**
- `backend/app/workers/service.py` — `update_worker_online_status(worker_id, redis)` called from location update
- `backend/app/workers/routes.py` — heartbeat endpoint

**API changes:**
- `POST /api/v1/workers/me/heartbeat` — no body required, refreshes Redis TTL
  - Sets `worker:online:{worker_id}` with TTL 90s
  - Updates `last_location_update` in DB

**Tests required:**
- Heartbeat sets Redis key with correct TTL
- After 90s+ without heartbeat, worker not in nearby results
- Worker offline (no heartbeat) excluded from `GET /api/v1/workers/nearby`

**Dependencies:** Tasks 8.2, 4.7.

**Rollback:** Remove heartbeat endpoint.

---

#### Task 11.2 — Worker job notifications (booking broadcast)
**Purpose:** When a booking is created, notify nearby available workers.

**Files to modify:**
- `backend/app/bookings/service.py` — after booking insert, enqueue `broadcast_job_to_workers` task
- `backend/app/bookings/tasks.py` — `broadcast_job_to_workers(booking_id, lat, lng, category_id, radius_km)`

**Logic:**
- Find top 5 nearest available workers (reuses `find_nearby_workers` logic)
- Send push notification to each (via notification service)
- Store notified worker IDs in Redis for 5min (to track who was notified)

**Tests required:**
- Task enqueued on booking create
- Workers within radius receive notification (mock notification service)
- Workers outside radius do not receive notification

**Dependencies:** Tasks 10.2, 8.2.

**Rollback:** Remove task enqueue from booking create. Remove task.

---

### PHASE 12 — Quotes

---

#### Task 12.1 — Quote model + migration
**Files to create:**
- `backend/app/quotes/models.py` — `Quote`, `QuoteStatus` enum
- `backend/alembic/versions/0010_quotes.py`

**DB changes:**
- Table: `quotes`
- Unique partial index: one active quote per booking (`status = 'submitted'`)
- Indexes: `idx_quotes_booking_id`, `idx_quotes_worker_id`

**Tests required:** Migration. Unique constraint on active quotes per booking.
**Dependencies:** Tasks 10.1, 6.1.

**Rollback:** `alembic downgrade -1`.

---

#### Task 12.2 — Quote flow API
**Purpose:** Worker submits quote after inspection. Customer accepts or rejects.

**Files to create:**
- `backend/app/quotes/schemas.py`
- `backend/app/quotes/service.py`
- `backend/app/quotes/routes.py`

**API changes:**
- `POST /api/v1/bookings/{id}/quotes` — worker submits (only valid from `IN_PROGRESS` on `INSPECTION_QUOTE` bookings)
- `GET /api/v1/bookings/{id}/quotes/current` — customer views active quote
- `POST /api/v1/quotes/{id}/accept` — customer accepts → booking moves to `QUOTE_ACCEPTED` → `PENDING_PAYMENT`
- `POST /api/v1/quotes/{id}/reject` — customer rejects → booking moves to `QUOTE_REJECTED`

**Security requirements:**
- Worker can only submit quote on their own assigned booking
- Customer can only accept/reject quotes on their own bookings
- Cannot submit second quote while one is pending

**Tests required:**
- Full quote flow: submit → view → accept → booking status updates
- Customer B accepting Customer A's quote → 403
- Worker submitting second quote while one pending → 409
- Expired quote accept → 400

**Dependencies:** Tasks 12.1, 10.4.

**Rollback:** Remove quote routes from main.py.

---

### PHASE 13 — Payments

---

#### Task 13.1 — Payment model + migration
**Files to create:**
- `backend/app/payments/models.py` — `Payment`, `WorkerEarnings`, `PaymentStatus` enum
- `backend/alembic/versions/0011_payments.py`

**DB changes:**
- Tables: `payments`, `worker_earnings`
- All monetary: BIGINT (paise)
- `idx_payments_booking_id (unique)`, `idx_payments_idempotency_key (unique)`

**Tests required:** Migration. Monetary columns are bigint. Unique constraint on `idempotency_key`.
**Dependencies:** Task 10.1.

**Rollback:** `alembic downgrade -1`.

---

#### Task 13.2 — Razorpay payment initiation
**Purpose:** Create Razorpay order and return to client for checkout.

**Files to create:**
- `backend/app/payments/providers/base.py` — `PaymentProvider` ABC: `create_order()`, `verify_signature()`
- `backend/app/payments/providers/razorpay.py` — concrete implementation
- `backend/app/payments/service.py` — `initiate_payment(booking_id, customer, db, redis)`
- `backend/app/payments/routes.py`
- `backend/app/payments/schemas.py`

**Logic:**
1. Check idempotency key in Redis — return existing if found
2. Verify booking is `COMPLETED` or `QUOTE_ACCEPTED`
3. Calculate amount from `booking.pricing_snapshot`
4. Create Razorpay order via API
5. Insert `Payment` row (status: `INITIATED`)
6. Store idempotency key in Redis

**API changes:**
- `POST /api/v1/payments/initiate`
  - Body: `{"booking_id": "...", "idempotency_key": "..."}`
  - Returns: `{"razorpay_order_id": "...", "amount_paise": ..., "razorpay_key": "..."}`

**Security requirements:**
- `require_customer`
- Customer can only pay for their own booking
- Razorpay secret key NEVER in response
- Amount taken from server-side snapshot, not from client

**Tests required:**
- Valid booking → Razorpay order created (mock Razorpay)
- Duplicate idempotency key → 409
- Customer paying for another customer's booking → 403
- Booking not in payable state → 400
- Amount matches pricing snapshot (not client-provided)

**Dependencies:** Tasks 13.1, 10.4, 12.2.

**Rollback:** Remove payment initiate route. Razorpay order created but payment not completed — low risk.

---

#### Task 13.3 — Payment webhook (Razorpay)
**Purpose:** Handle Razorpay callback confirming payment success or failure.

**Files to modify:**
- `backend/app/payments/routes.py` — add webhook endpoint
- `backend/app/payments/service.py` — `process_payment_webhook(payload, signature, db, redis)`
- `backend/app/payments/tasks.py` — `reconcile_worker_earnings(payment_id)`

**Webhook logic:**
1. Verify Razorpay signature (HMAC-SHA256 of payload with webhook secret)
2. Parse event type (`payment.captured`, `payment.failed`)
3. Check idempotency: `payment:webhook:{razorpay_payment_id}` in Redis → skip if already processed
4. Update `Payment.status` → `SUCCEEDED` or `FAILED`
5. Update `Booking.status` → `PAID` (on success)
6. Enqueue `reconcile_worker_earnings(payment_id)`
7. Store webhook idempotency key in Redis (TTL 48h)

**API changes:**
- `POST /api/v1/payments/webhook` — no JWT auth, but Razorpay signature required

**Security requirements:**
- Signature verification is MANDATORY — reject without it → 400
- No JWT on webhook endpoint (Razorpay doesn't send JWT)
- Idempotent: duplicate webhook → 200, no double-processing
- Webhook endpoint not rate-limited (Razorpay retries)

**Tests required:**
- Valid signature + payment.captured → payment SUCCEEDED, booking PAID
- Invalid signature → 400
- Duplicate webhook for same payment → 200, no double-processing
- payment.failed → payment FAILED, booking stays COMPLETED
- Worker earnings reconciliation task enqueued

**Dependencies:** Task 13.2.

**Security verification:**
- Remove signature header → 400
- Modify one byte of payload → 400
**Rollback:** Remove webhook route. Note: if payment was already captured, refund must be initiated manually.

---

#### Task 13.4 — Worker earnings
**Purpose:** After payment succeeds, calculate and record worker's earnings.

**Files to modify:**
- `backend/app/payments/tasks.py` — implement `reconcile_worker_earnings(payment_id)`
- `backend/app/payments/service.py` — `get_worker_earnings_summary()`, `get_worker_earnings_history()`
- `backend/app/payments/routes.py` — earnings endpoints

**Reconcile logic:**
- Load payment + booking + pricing_snapshot
- Calculate: `worker_earnings = total - platform_fee - tax`
- Insert `WorkerEarnings` row
- `payout_status = PENDING`

**API changes:**
- `GET /api/v1/workers/me/earnings` — summary
- `GET /api/v1/workers/me/earnings/history` — paginated

**Security requirements:**
- `require_worker`
- Worker sees only own earnings

**Tests required:**
- Earnings row created after payment success
- Worker A cannot see Worker B's earnings → 403
- Earnings calculation matches pricing snapshot

**Dependencies:** Task 13.3.

**Rollback:** Remove earnings routes. Task can be re-run (idempotent).

---

### PHASE 14 — Notifications

---

#### Task 14.1 — Notification model + device tokens + migration
**Files to create:**
- `backend/app/notifications/models.py` — `Notification`, `DeviceToken`, enums
- `backend/alembic/versions/0012_notifications.py`

**DB changes:**
- Tables: `notifications`, `device_tokens`
- `idx_notifications_user_id_is_read` (partial: `WHERE is_read = false`)
- `idx_device_tokens_user_id`

**Tests required:** Migration. Partial index for unread notifications.
**Dependencies:** Task 4.3.

**Rollback:** `alembic downgrade -1`.

---

#### Task 14.2 — Notification dispatch infrastructure
**Purpose:** Celery tasks for push, SMS, and email. In-app inbox API.

**Files to create:**
- `backend/app/notifications/tasks.py`:
  - `send_push_notification(user_id, title, body, data)`
  - `send_sms(phone, message)`
  - `send_email(to, subject, template, context)`
- `backend/app/notifications/channels/push.py` — FCM HTTP v1 API adapter
- `backend/app/notifications/channels/sms.py` — MSG91 adapter (dev: log to console)
- `backend/app/notifications/service.py` — `create_notification(user_id, event, title, body, channel, db)`
- `backend/app/notifications/routes.py`

**API changes:**
- `GET /api/v1/notifications` — user's inbox, paginated
- `POST /api/v1/notifications/{id}/read`
- `POST /api/v1/notifications/read-all`
- `POST /api/v1/users/me/device-tokens`

**Security requirements:**
- User sees only own notifications
- `require_customer` or `require_worker` (any authenticated user)

**Tests required:**
- Notification created → appears in inbox
- Mark read → `is_read = true`
- User A cannot read User B's notifications → 403
- Push task enqueued on booking events

**Dependencies:** Tasks 14.1, 4.2.

**Rollback:** Remove notification routes.

---

#### Task 14.3 — Booking event hooks
**Purpose:** Wire notification dispatch into all key booking state changes.

**Files to modify:**
- `backend/app/bookings/service.py` — add notification enqueue after each state transition:
  - Booking created → notify nearby workers (push)
  - Booking accepted → notify customer (push + in-app)
  - Worker en route → notify customer
  - Worker arrived → notify customer
  - Job completed → notify customer (prompt payment)
  - Payment success → notify worker (earnings credited)
  - Booking expired → notify customer

**Tests required:**
- After booking accept: notification exists for customer
- After job complete: notification exists for customer
- Notifications enqueued as Celery tasks (not blocking the request)

**Dependencies:** Tasks 14.2, 10.4, 13.3.

**Rollback:** Remove notification calls from booking service (notifications are side effects, safe to remove).

---

### PHASE 15 — Reviews & Ratings

---

#### Task 15.1 — Review model + migration
**Files to create:**
- `backend/app/reviews/models.py` — `Review`
- `backend/alembic/versions/0013_reviews.py`

**DB changes:**
- Table: `reviews`
- `UNIQUE (booking_id)` — one review per booking
- `CHECK (rating BETWEEN 1 AND 5)`
- `idx_reviews_worker_id`

**Tests required:** Migration. Unique constraint on `booking_id`. Rating CHECK enforced.
**Dependencies:** Task 10.1.

**Rollback:** `alembic downgrade -1`.

---

#### Task 15.2 — Review API + rating aggregation
**Files to create:**
- `backend/app/reviews/schemas.py`
- `backend/app/reviews/service.py`
- `backend/app/reviews/routes.py`

**API changes:**
- `POST /api/v1/bookings/{id}/review` — customer submits (only when `PAID`)
- `GET /api/v1/workers/{id}/reviews` — public, paginated

**Post-review:** Update `worker_profiles.rating_avg` and `rating_count` atomically:
```sql
UPDATE worker_profiles
SET rating_count = rating_count + 1,
    rating_avg = (rating_avg * rating_count + :new_rating) / (rating_count + 1)
WHERE id = :worker_id
```

**Security requirements:**
- `require_customer`
- Booking must belong to customer
- Booking must be in PAID status
- Cannot review same booking twice (DB unique constraint)

**Tests required:**
- Valid review → 201
- Duplicate review → 409
- Booking not PAID → 400
- Customer A reviewing Customer B's booking → 403
- Rating 0 → 422. Rating 6 → 422.
- Worker's `rating_avg` updated after review

**Dependencies:** Tasks 15.1, 13.3.

**Rollback:** Remove review routes.

---

### PHASE 16 — Media & File Uploads

---

#### Task 16.1 — Media upload service
**Purpose:** Generate signed upload URLs for Supabase Storage. Validate files after upload.

**Files to create:**
- `backend/app/media/service.py` — `generate_upload_url(content_type, purpose, user_id)`, `confirm_upload(file_key, user_id, db)`
- `backend/app/media/schemas.py`
- `backend/app/media/routes.py`

**Upload flow:**
1. Client calls `POST /api/v1/media/upload-url` → gets signed URL + `file_key` (UUID path)
2. Client uploads directly to Supabase Storage using signed URL
3. Client calls `POST /api/v1/media/confirm` → backend verifies file exists, validates MIME via python-magic, creates DB record if needed

**API changes:**
- `POST /api/v1/media/upload-url`
  - Body: `{"content_type": "image/jpeg", "purpose": "booking_photo"}`
  - Returns: `{"upload_url": "...", "file_key": "uploads/{purpose}/{uuid}.jpg"}`
- `POST /api/v1/media/confirm`
  - Body: `{"file_key": "..."}`
  - Returns: `{"public_url": "..."}`

**Security requirements:**
- Allowed content types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`
- File key is `{purpose}/{uuid}.{ext}` — no user-controlled path segments
- MIME type verified via python-magic on confirm (not just extension)
- KYC docs stored in separate restricted bucket
- Max file size enforced via Supabase Storage policy (10MB images, 100MB video)

**Tests required:**
- Allowed content type → signed URL returned
- Disallowed type → 400
- Confirm with non-existent file key → 400
- MIME mismatch (jpg declared, exe uploaded) → 400
- Unauthenticated → 401

**Dependencies:** Tasks 4.7, 3.1.

**Security verification:**
- Upload a PHP file claiming `image/jpeg` MIME → confirm should reject
- Try path traversal in file key → 422
**Rollback:** Remove media routes.

---

### PHASE 17 — Subscriptions & Plans

---

#### Task 17.1 — Subscription plans model + migration
**Purpose:** Worker subscription plans (basic worker plan infrastructure — no payment yet).

**Files to create:**
- `backend/app/subscriptions/models.py` — `SubscriptionPlan`, `WorkerSubscription`
- `backend/alembic/versions/0014_subscriptions.py`

**DB changes:**
- Tables: `subscription_plans`, `worker_subscriptions`
- `features` as `JSONB` column on `subscription_plans` (flexible, no schema churn per feature)

**Tests required:** Migration. JSONB features column accepts arbitrary JSON.
**Dependencies:** Tasks 6.1, 2.2.

**Definition of done:** Tables exist. Ready for future payment integration.
**Rollback:** `alembic downgrade -1`.

---

#### Task 17.2 — Subscription API (read-only for now)
**Purpose:** Workers can view available plans. Subscription purchase TBD.

**API changes:**
- `GET /api/v1/subscriptions/plans` — public list of plans
- `GET /api/v1/subscriptions/workers/me` — worker's current subscription (worker only)

**Tests required:**
- Plans list returns plans
- Worker sees own subscription
- Unauthenticated → 401

**Dependencies:** Tasks 17.1, 4.7.

**Rollback:** Remove subscription routes.

---

### PHASE 18 — Admin Domain

---

#### Task 18.1 — Admin worker management API
**Purpose:** Admin can list workers, review KYC, approve/reject, suspend.

**Files to create:**
- `backend/app/admin/routes.py` — worker management
- `backend/app/admin/service.py`
- `backend/app/admin/schemas.py`

**API changes:**
- `GET /api/v1/admin/workers?kyc_status=&lifecycle_status=&city=` — paginated
- `GET /api/v1/admin/workers/{id}` — detail with KYC docs
- `POST /api/v1/admin/workers/{id}/kyc/{doc_id}/review` — approve/reject
- `POST /api/v1/admin/workers/{id}/approve` — set lifecycle_status=ACTIVE
- `POST /api/v1/admin/workers/{id}/suspend` — set lifecycle_status=SUSPENDED

**Security requirements:**
- ALL endpoints: `require_admin`
- Audit log entry for every KYC review, approve, suspend action

**Tests required:**
- Non-admin → 403 on all endpoints
- Admin approves worker → lifecycle_status = ACTIVE
- Audit log created for each action
- KYC doc status updated correctly

**Dependencies:** Tasks 6.1, 4.9, 4.7.

**Rollback:** Remove admin worker routes.

---

#### Task 18.2 — Admin booking management API

**API changes:**
- `GET /api/v1/admin/bookings?status=&date_from=&date_to=&category_id=` — paginated
- `GET /api/v1/admin/bookings/{id}` — full detail
- `POST /api/v1/admin/bookings/{id}/cancel` — force cancel with reason

**Tests required:**
- Non-admin → 403
- Force cancel updates booking, audit log created
- Filters work correctly

**Dependencies:** Tasks 10.1, 4.9, 4.7.

**Rollback:** Remove admin booking routes.

---

### PHASE 19 — Redis Caching (systematic)

---

#### Task 19.1 — Caching audit + completion
**Purpose:** Review all service functions and ensure caching strategy is implemented consistently.

**Scope:**
- Categories list: ✓ (Task 7.2)
- Pricing rules: ✓ (Task 9.2)
- Worker profile (public view): add if missing — `cache:worker:{id}` TTL 5min, invalidated on worker update
- Service zones: add — `cache:zones` TTL 1h
- Worker nearby: NOT cached (real-time data)
- Bookings: NOT cached (transactional)

**Files to modify:** `categories/service.py`, `pricing/service.py`, `workers/service.py`, `locations/service.py`

**Tests required:**
- Each cacheable resource: first request → DB query, second → cache hit
- Cache invalidated on update

**Dependencies:** All service tasks above + Task 4.2.

**Rollback:** Remove cache reads/writes (revert to DB-only queries).

---

### PHASE 20 — Celery / Background Jobs (systematic)

---

#### Task 20.1 — Celery infrastructure + beat schedule
**Purpose:** Celery fully configured with all queues, periodic tasks registered.

**Files to create:**
- `backend/app/celery/app.py`:
  - Queues: `default`, `notifications`, `payments`, `cleanup`
  - Result backend: Redis
  - Task serializer: JSON
- `backend/app/celery/beat.py`:
  - Every 5min: `bookings.tasks.expire_stale_bookings`
  - Daily 2am: `analytics.tasks.aggregate_daily_stats`
  - Daily 3am: `media.tasks.cleanup_orphaned_uploads`
- `backend/celery_worker.py` — entrypoint

**New tasks to implement:**
- `bookings/tasks.py` — `expire_stale_bookings()`: find all bookings `PENDING_WORKER_ACCEPTANCE` older than 10min, expire them

**Tests required:**
- All queues defined
- Beat schedule registered
- `expire_stale_bookings` task: test it transitions only stale pending bookings, not recent ones

**Dependencies:** Tasks 4.2.

**Rollback:** Stop celery worker. Remove from docker-compose.

---

### PHASE 21 — Analytics

---

#### Task 21.1 — Basic analytics
**Purpose:** Admin dashboard stats.

**Files to create:**
- `backend/app/analytics/service.py`
- `backend/app/analytics/schemas.py`
- `backend/app/analytics/routes.py`

**API changes:**
- `GET /api/v1/analytics/summary` — admin only
  - Returns: `{bookings_today, bookings_week, revenue_today_paise, revenue_week_paise, new_customers_today, new_workers_today, pending_kyc_count, active_bookings_count}`

**Tests required:** Admin only → 403 for non-admin. Returns plausible counts from test data.
**Dependencies:** Tasks 10.1, 13.3, 4.7.

**Rollback:** Remove analytics routes.

---

### PHASE 22 — Security Hardening

---

#### Task 22.1 — IDOR security sweep
**Purpose:** Systematic cross-resource access test on every resource endpoint.

**Files to create:**
- `backend/tests/security/test_idor.py`

**Test matrix (all combinations required):**
| Actor | Resource | Expected |
|-------|----------|----------|
| Customer A | Customer B's address | 403 |
| Customer A | Customer B's booking | 403 |
| Customer A | Worker B's earnings | 403 |
| Worker A | Worker B's profile PATCH | 403 |
| Worker A | Worker B's booking (accept) | 403 |
| Customer | Admin endpoints | 403 |
| Worker | Customer endpoints | 403 |
| Unauthenticated | Any protected endpoint | 401 |

**Definition of done:** All IDOR tests pass.

---

#### Task 22.2 — Input validation security sweep
**Purpose:** Verify all inputs are validated. No injection vectors.

**Files to create:**
- `backend/tests/security/test_input_validation.py`

**Test cases:**
- SQL-like strings in all text fields → stored safely (ORM prevents injection)
- HTML/script tags in `description` → stored as-is (no eval on backend)
- Extremely long strings → 422 (schema enforces max lengths)
- Invalid UUIDs in path params → 422
- Negative monetary values → 422
- Invalid lat/lng → 422

**Definition of done:** All validation tests pass.

---

#### Task 22.3 — File upload security sweep
**Purpose:** Test all upload abuse vectors.

**Test cases:**
- MIME type spoofing (PHP with `image/jpeg` header) → 400 on confirm
- Path traversal in file key → 422
- Oversized file → rejected by Supabase policy
- Invalid extension → 400

**Dependencies:** Task 16.1.

---

#### Task 22.4 — Payment security sweep
**Purpose:** Test all payment abuse vectors.

**Test cases:**
- Webhook without signature → 400
- Webhook with tampered signature → 400
- Duplicate webhook → 200, no double-processing
- Initiate payment for another customer's booking → 403
- Mark booking paid without real payment → impossible (server-side state only)

**Dependencies:** Tasks 13.2, 13.3.

---

### PHASE 23 — Performance Optimization

---

#### Task 23.1 — Query performance audit
**Purpose:** EXPLAIN ANALYZE on all list endpoints. Verify indexes used. Fix N+1.

**Scope:**
- `GET /api/v1/bookings` — verify no N+1 on category, worker, address joins
- `GET /api/v1/workers/nearby` — verify GIST index used
- `GET /api/v1/workers/me/earnings/history` — verify `idx_payments_worker_id`
- `GET /api/v1/notifications` — verify partial index on `is_read=false`
- `GET /api/v1/admin/bookings` — verify filters use indexes

**Deliverables:** Query plan report. Add indexes if missing.

---

#### Task 23.2 — Connection pool + Redis pool tuning
**Purpose:** Verify pool settings are correct for expected load.

**Config review:**
- SQLAlchemy: `pool_size=10`, `max_overflow=20`
- Redis: connection pool configured
- Celery: concurrency setting

**Test:** Simulate 100 concurrent requests to booking creation — no pool exhaustion errors.

---

### PHASE 24 — Frontend: Design System & Auth

---

#### Task 24.1 — Stitch design system creation
**Purpose:** Create the Avatar design system in Stitch MCP before writing any component code.

**Actions:**
- Use Stitch MCP `create_design_system` with Avatar brand colors, typography, spacing
- Generate screen explorations for: Home (service category grid), Booking flow, Booking status, Worker dashboard
- Export design decisions as `frontend/design/stitch-export.md`

**Definition of done:** Stitch design system created. Visual direction approved before writing React components.

**Dependencies:** Task 1.2.

---

#### Task 24.2 — UI base components
**Purpose:** Build the 7 base components using the Stitch-defined design system.

**Files to create:**
- `frontend/src/components/ui/Button.tsx` — primary, secondary, destructive, loading state
- `frontend/src/components/ui/Input.tsx` — label, error state, helper text
- `frontend/src/components/ui/Card.tsx` — default shadow, 8px radius
- `frontend/src/components/ui/StatusChip.tsx` — booking status color coding
- `frontend/src/components/ui/Spinner.tsx`
- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/ui/EmptyState.tsx` — icon + title + subtitle + optional CTA

**Rules:** No Tailwind. Pure CSS Modules. All from design tokens in `tokens.css`. Buttons: 48px min height.

**Tests required:** TypeScript strict mode. `next build` passes.
**Dependencies:** Tasks 24.1, 1.2.

---

#### Task 24.3 — Auth pages (login + OTP verify)
**Purpose:** Phone login flow in Next.js.

**Files to create:**
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/verify/page.tsx`
- `frontend/src/lib/api/auth.ts`
- `frontend/src/lib/hooks/useAuth.ts`

**Auth state:** Store token in `httpOnly` cookie via Next.js route handler (`/app/api/auth/set-token/route.ts`). Never store in localStorage.

**Tests required:**
- Valid OTP → redirect to customer dashboard (or worker dashboard based on role)
- Invalid OTP → inline error
- TypeScript: no `any` types

**Security requirements:**
- `httpOnly` cookie prevents XSS token theft
- HTTPS-only cookie in production (`secure` flag)
- `SameSite=Lax` cookie

**Dependencies:** Tasks 24.2, 4.5.

---

### PHASE 25 — Frontend: Customer Application

---

#### Task 25.1 — Customer home + service selection
**Stitch:** Generate home page screen mockup before implementation.

**Files to create:**
- `frontend/src/app/(customer)/page.tsx` — service category grid
- `frontend/src/components/booking/CategoryGrid.tsx`
- `frontend/src/lib/api/categories.ts`

**Design:** Category cards: icon + name. Clean grid. Amber CTA. Large tap targets.

---

#### Task 25.2 — Booking flow (multi-step)
**Files to create:**
- `frontend/src/app/(customer)/book/[category]/page.tsx` — step machine:
  1. Describe problem (text area + photo upload)
  2. Confirm address (select existing or add new)
  3. Choose date/time or "Now"
  4. See price estimate
  5. Confirm booking

- `frontend/src/lib/api/bookings.ts`
- `frontend/src/lib/api/pricing.ts`

**UX rules:** One step per screen on mobile. Progress indicator. Back button works. No jargon.

---

#### Task 25.3 — Nearby workers display
**Files to create:**
- `frontend/src/app/(customer)/book/[category]/workers/page.tsx`
- `frontend/src/components/worker/WorkerCard.tsx` — photo, name, rating stars, distance, price

---

#### Task 25.4 — Booking status + history
**Files to create:**
- `frontend/src/app/(customer)/bookings/page.tsx` — history list
- `frontend/src/app/(customer)/bookings/[id]/page.tsx` — detail with live status
- `frontend/src/components/booking/BookingStatusBanner.tsx` — large, clear status display

---

#### Task 25.5 — Payment + review
**Files to create:**
- `frontend/src/app/(customer)/bookings/[id]/pay/page.tsx` — Razorpay checkout integration
- `frontend/src/app/(customer)/bookings/[id]/review/page.tsx` — star rating + comment

---

#### Task 25.6 — Customer profile
**Files to create:**
- `frontend/src/app/(customer)/profile/page.tsx` — name, email, addresses

---

### PHASE 26 — Frontend: Worker Application

---

#### Task 26.1 — Worker dashboard
**Stitch:** Generate worker dashboard screen mockup before implementation.

**Files to create:**
- `frontend/src/app/(worker)/dashboard/page.tsx`:
  - Large "Available / Busy" toggle (primary CTA, very visible)
  - Earnings summary card
  - Incoming job requests (if available)

---

#### Task 26.2 — Job request + acceptance
**Files to create:**
- `frontend/src/app/(worker)/jobs/page.tsx` — list of incoming requests
- `frontend/src/app/(worker)/jobs/[id]/page.tsx`:
  - Job details (service, description, photos, location distance)
  - Large Accept / Decline buttons
  - Status transition buttons (En Route, Arrived, Start Job, Complete Job)

**UX rules:** Large buttons. Simple language. No technical jargon.

---

#### Task 26.3 — Worker earnings
**Files to create:**
- `frontend/src/app/(worker)/earnings/page.tsx` — total earned, this week, per-job list

---

#### Task 26.4 — Worker profile + KYC
**Files to create:**
- `frontend/src/app/(worker)/profile/page.tsx` — bio, categories, areas
- `frontend/src/app/(worker)/kyc/page.tsx` — document upload flow

---

### PHASE 27 — Admin Dashboard

---

#### Task 27.1 — Admin layout + stats
**Files to create:**
- `frontend/src/app/(admin)/page.tsx` — dashboard with summary stats

---

#### Task 27.2 — Admin: Workers
**Files to create:**
- `frontend/src/app/(admin)/workers/page.tsx` — list with KYC status filters
- `frontend/src/app/(admin)/workers/[id]/page.tsx` — detail + KYC review

---

#### Task 27.3 — Admin: Bookings, Categories, Pricing
**Files to create:**
- `frontend/src/app/(admin)/bookings/page.tsx`
- `frontend/src/app/(admin)/categories/page.tsx`
- `frontend/src/app/(admin)/pricing/page.tsx`

---

### PHASE 28 — Integration & E2E Testing

---

#### Task 28.1 — E2E: Customer booking flow
**File:** `backend/tests/e2e/test_full_booking_flow.py`

**Scenario:**
1. Customer registers (OTP)
2. Customer adds address
3. Customer creates booking (Plumber, FIXED pricing)
4. Worker accepts booking
5. Worker transitions: en-route → arrived → start → complete
6. Customer initiates payment (mock Razorpay)
7. Webhook fires → booking PAID
8. Customer submits review
9. Worker earnings recorded

**All steps in single test** using shared DB transaction that rolls back.

---

#### Task 28.2 — E2E: Worker onboarding flow
**File:** `backend/tests/e2e/test_worker_onboarding.py`

**Scenario:**
1. Worker registers
2. Worker completes profile
3. Worker uploads KYC
4. Admin reviews + approves
5. Worker sets availability
6. Worker appears in nearby search
7. Worker receives job request notification

---

#### Task 28.3 — E2E: Quote flow
**Scenario:**
1. Customer books (Electrician, INSPECTION_QUOTE pricing)
2. Worker accepts, transitions to in-progress
3. Worker submits quote
4. Customer accepts quote
5. Payment flow proceeds

---

### PHASE 29 — Production Readiness

---

#### Task 29.1 — Observability
**Files to create/modify:**
- `backend/app/main.py` — add `prometheus-fastapi-instrumentator` `/metrics` endpoint
- Verify `structlog` JSON output in production format
- Slow query middleware: log DB queries > 500ms as WARNING
- Celery task monitoring: Flower config in docker-compose

---

#### Task 29.2 — Production configuration review
**Checklist:**
- CORS: no wildcard origin
- Debug mode: `False`
- JWT secret: >= 32 chars, truly random
- DB pool tuned for expected connections
- Redis with AUTH password
- Supabase service key not in any `.env` committed to git
- All Celery queues have workers assigned
- Beat schedule verified
- Alembic migrations all applied
- No TODO comments without task IDs

---

#### Task 29.3 — Deployment verification
**Steps:**
- `docker-compose up --build` fresh → all services healthy
- `alembic upgrade head` from baseline → all migrations apply cleanly
- `alembic downgrade base` → all migrations reverse cleanly
- Full test suite passes against local docker-compose stack
- `ruff check .` → zero warnings
- `mypy app/` → zero errors

---

## F. Critical Security Checkpoints

Verify at each checkpoint before proceeding:

| Checkpoint | After Task | Checks |
|-----------|-----------|--------|
| Auth foundation | 4.9 | OTP rate limit, brute force lockout, token revocation, audit log |
| First domain | 5.2 | IDOR on addresses, mass assignment protection |
| Worker live | 6.2 | Worker IDOR, lifecycle status not self-settable |
| Booking create | 10.2 | Address ownership, idempotency, server-side pricing |
| Worker acceptance | 10.3 | Race condition, worker can only accept eligible bookings |
| Payment | 13.3 | Webhook signature, no double-processing, amount from snapshot |
| File upload | 16.1 | MIME validation, no user-controlled paths |
| Admin | 18.1 | Admin-only enforcement on every admin endpoint |
| Full sweep | 22.1–22.4 | IDOR matrix, input validation, file abuse, payment abuse |

---

## G. Critical Performance Checkpoints

| Checkpoint | After Task | Checks |
|-----------|-----------|--------|
| Pagination | 3.3 | Cursor pagination working, no OFFSET on large tables |
| Geospatial index | 8.2 | GIST index used in EXPLAIN ANALYZE |
| Pricing cache | 9.2 | Cache hit on second pricing request |
| Booking list N+1 | 10.5 | Single query or selectinload for related data |
| Notification inbox | 14.1 | Partial index on `is_read=false` used |
| Worker nearby N+1 | 8.2 | Worker categories loaded via join, not lazy |
| Full audit | 23.1 | EXPLAIN ANALYZE on all list endpoints |

---

## H. Critical Database Checkpoints

| Checkpoint | After Task | Checks |
|-----------|-----------|--------|
| Migration chain | 2.2 | `alembic upgrade head` + `downgrade base` complete cleanly |
| Monetary types | 9.1 | All monetary columns are BIGINT. Zero FLOAT or DOUBLE columns. |
| Geospatial | 6.1 | PostGIS extension present. `geography(Point,4326)` on location columns. |
| Idempotency | 10.1 | `bookings.idempotency_key` has UNIQUE constraint at DB level |
| Review integrity | 15.1 | `reviews.booking_id` has UNIQUE constraint. Rating CHECK 1–5. |
| Payment integrity | 13.1 | `payments.idempotency_key` UNIQUE. No FLOAT monetary columns. |
| FK ON DELETE | All | Every FK has explicit ON DELETE (RESTRICT or CASCADE) |

---

## I. Definition of Production-Ready

The system is production-ready when ALL of the following are true:

**Functional:**
- [ ] Full customer booking flow works end-to-end (Task 28.1)
- [ ] Full worker onboarding flow works (Task 28.2)
- [ ] Quote flow works (Task 28.3)
- [ ] Payment with real Razorpay sandbox works
- [ ] Notifications delivered (push, SMS, in-app)
- [ ] Admin can manage workers, bookings, categories, pricing
- [ ] All frontend pages work on 375px width (mobile)

**Security:**
- [ ] IDOR matrix all pass (Task 22.1)
- [ ] Input validation sweep all pass (Task 22.2)
- [ ] File upload sweep all pass (Task 22.3)
- [ ] Payment security sweep all pass (Task 22.4)
- [ ] No wildcard CORS in production
- [ ] JWT secret is 32+ chars, random
- [ ] Supabase service key not in frontend
- [ ] All security headers on every response
- [ ] Rate limiting active on all endpoints
- [ ] OTP rate limit and brute force protection active

**Database:**
- [ ] All Alembic migrations applied cleanly
- [ ] `alembic check` returns no pending migrations
- [ ] All monetary columns are BIGINT
- [ ] PostGIS extension installed
- [ ] All FK constraints in place
- [ ] All required indexes exist

**Performance:**
- [ ] No N+1 queries on any list endpoint
- [ ] GIST index used for geospatial queries
- [ ] All list endpoints paginated
- [ ] Connection pool configured

**Observability:**
- [ ] `/metrics` endpoint active
- [ ] Structured JSON logs in production
- [ ] Slow query logging configured
- [ ] Celery task visibility (Flower or equivalent)
- [ ] Error alerting documented

**Code quality:**
- [ ] `ruff check .` → zero warnings
- [ ] `mypy app/` → zero errors
- [ ] All tests pass (`pytest tests/ -v`)
- [ ] No `TODO` without task ID
- [ ] No hardcoded secrets

---

## J. Recommended First Task

**Start with: Task 1.1 — Backend repository skeleton**

**Reason:** Every other task depends on the folder structure existing. It's the smallest, safest, most reversible first step. It produces visible, verifiable output (the directory tree) with zero risk of breaking anything.

**After Task 1.1 completes, the order is:**
1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 4.1 → 4.2 → 4.3 → 4.4 → ...

**Do not skip steps. Do not combine steps. Stop after each.**

---

*Roadmap version: 1.0*
*Last updated: 2026-10-08*
*Total phases: 29. Total tasks: ~80.*
*Recommended first task: Task 1.1*
