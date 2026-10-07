# AGENT.md — Avatar Local Services Marketplace

This file is the authoritative instruction source for all implementation agents working on this project.
Read it in full before writing any code.

---

## Project Purpose

Avatar is a two-sided local services marketplace connecting customers with nearby local service providers
(plumbers, electricians, maids, carpenters, mechanics, etc.).

Core flow: Customer describes job → sees nearby workers → books → worker accepts → visits → completes → payment → review.

---

## CRITICAL EXECUTION RULE — ONE TASK AT A TIME

**This rule overrides everything else.**

DO NOT implement multiple tasks in one run.
DO NOT anticipate the next task and add extra code "for later".
DO NOT scaffold things that are not required by the current task.

For every task:
1. Implement ONLY that task.
2. Run relevant tests.
3. Run lint/type checks (`ruff check`, `mypy`).
4. Run security/authorization checks.
5. Check database migrations (alembic upgrade head, alembic check).
6. Check for N+1 queries where applicable.
7. Fix all failures before reporting done.
8. Report the completion summary (see format below).
9. STOP. Wait for explicit instruction to continue.

**Completion report format (required after every task):**
```
## Task X.Y — [Name] COMPLETE

### Files changed
- path/to/file.py (created/modified)

### Database changes
- Migration: XXXX_description.py
- Tables: created/modified
- Indexes: added

### API changes
- POST /api/v1/...
- GET /api/v1/...

### Tests executed
- test_file.py::test_name — PASS
- ...

### Security checks
- Unauthorized access → 401 ✓
- Wrong role → 403 ✓
- ...

### Performance checks
- No N+1 detected ✓
- ...

### Known issues / ponytail deferred
- [anything consciously deferred]

### Next task
Task X.Z — [Name]
```

---

## Technology Stack

### Backend
- Python 3.12+
- FastAPI (async)
- SQLAlchemy 2.x (async, ORM only — no raw SQL string interpolation)
- Alembic (migrations)
- Pydantic v2 + Pydantic Settings (config)
- PostgreSQL via Supabase
- PostGIS extension (geospatial queries)
- Redis (async, via `redis-py` asyncio client)
- Celery + Redis broker (background tasks)
- `structlog` (structured JSON logging)
- `ruff` (linting + formatting)
- `mypy` (type checking)
- `pytest` + `pytest-asyncio` (testing)
- `httpx` (async test client)

### Frontend
- Next.js (App Router)
- TypeScript
- Vanilla CSS / CSS Modules (no Tailwind unless explicitly requested)
- No UI component library by default — build components from the design system
- `fetch` for API calls (no axios unless explicitly needed)

### Infrastructure
- Supabase: PostgreSQL + Storage (object store)
- Redis: Upstash (prod) / Docker (local)
- Deployment: Docker + docker-compose (local), Railway/Render (prod)

---

## Domain Boundaries

Each domain owns its own models, schemas, services, routes, and tests.
Do not import one domain's models directly into another domain's service.
Cross-domain communication goes through service function calls, not ORM queries across domains.

Domains:
```
auth          — OTP, JWT, token management
users         — user account (shared by all roles)
customers     — customer profile, addresses
workers       — worker profile, categories, areas, KYC, availability, location
categories    — service category tree
bookings      — booking lifecycle, status transitions
quotes        — worker quotes for complex jobs
pricing       — pricing rules, price calculation engine
payments      — payment initiation, webhook, worker earnings
reviews       — post-job ratings and comments
media         — file upload, signed URLs, validation
notifications — push, SMS, email, in-app inbox
subscriptions — worker and customer plans (future)
admin         — admin-only management APIs
analytics     — aggregated platform stats
```

---

## Backend Folder Structure

```
backend/
  app/
    core/
      config.py           # Pydantic Settings — all env vars from .env
      security.py         # JWT, password hashing, token helpers
      dependencies.py     # FastAPI dependency injectors
      middleware.py        # Request ID, logging, CORS, security headers
      exceptions.py       # Custom exceptions + global handlers
      pagination.py       # Cursor pagination
    database/
      session.py          # Async engine + session factory
      base.py             # Declarative base (imported by all models)
    redis/
      client.py           # Async Redis client singleton
      keys.py             # All Redis key name constants/functions
    celery/
      app.py              # Celery instance + config
      beat.py             # Periodic task schedule
    auth/
    users/
    customers/
    workers/
    categories/
    bookings/
    quotes/
    pricing/
    payments/
    media/
    reviews/
    notifications/
    subscriptions/
    admin/
    analytics/
    main.py               # App factory, router registration
  alembic/
    versions/
    env.py
    alembic.ini
  tests/
    conftest.py
    auth/
    customers/
    workers/
    bookings/
    pricing/
    payments/
    reviews/
    security/
    e2e/
  .env
  .env.example
  pyproject.toml
  Dockerfile
  docker-compose.yml
```

### Within each domain:
```
{domain}/
  models.py      # SQLAlchemy ORM models
  schemas.py     # Pydantic request/response schemas
  service.py     # Business logic (queries live here)
  routes.py      # FastAPI router
  tasks.py       # Celery tasks (if domain needs them)
  tests/         # Domain-specific tests (or in top-level tests/{domain}/)
```

Do not create a `repository.py` abstraction layer unless a domain genuinely needs it.
Do not create `interfaces/`, `abstract/`, or `base/` classes unless there is more than one real implementation.

---

## Frontend Folder Structure

```
frontend/
  src/
    app/                    # Next.js App Router pages
      (customer)/           # Customer-facing routes
      (worker)/             # Worker-facing routes
      (admin)/              # Admin routes
      api/                  # Next.js API routes (thin proxy if needed)
      layout.tsx
      page.tsx
    components/
      ui/                   # Base UI components (Button, Input, Card, etc.)
      {domain}/             # Domain-specific components
    lib/
      api/                  # API client per domain
      hooks/                # Custom React hooks
      utils.ts
    styles/
      globals.css
      tokens.css            # Design tokens (colors, spacing, typography)
    types/                  # TypeScript types (API response types, etc.)
  public/
  next.config.ts
  tsconfig.json
  package.json
```

---

## API Rules

- All routes versioned: `/api/v1/{domain}/...`
- Every endpoint has explicit authentication + role check
- Every request body validated by Pydantic schema
- Every response is a typed Pydantic schema (no raw dict returns)
- Pagination on all list endpoints (cursor-based for high-volume, offset for admin)
- `X-Request-ID` header on every request (middleware generates if not provided)
- Error format: `{ "error": { "code": "SNAKE_CASE_CODE", "message": "Human readable" } }`
- No business logic in route handlers — routes call service functions only
- HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 422, 429, 500

---

## Database Rules

- UUID primary keys on all business tables (`uuid_generate_v4()` or `gen_random_uuid()`)
- `created_at` and `updated_at` on every table (updated_at via trigger or SQLAlchemy `onupdate`)
- `NUMERIC(12,2)` or `BIGINT` (paise/cents) for all monetary amounts — NEVER `FLOAT`
- Foreign keys with explicit `ON DELETE` behavior (RESTRICT by default, CASCADE only where justified)
- Soft delete (`deleted_at`) only where business requirements justify it (not by default)
- Status fields: use PostgreSQL ENUM or VARCHAR with CHECK constraint
- Every migration: run `alembic check` before committing; migrations must be reversible where practical
- Index every foreign key, every status field used in WHERE clauses, every `created_at` used for ordering
- Composite indexes where queries filter by multiple columns together
- `UNIQUE` constraints at DB level for business uniqueness rules (not just application-level)
- PostGIS `geography` type for all location columns (not `geometry`)

---

## Security Rules

- OTP rate limited: max 5 sends per phone per hour
- OTP brute force: lockout after 5 wrong attempts
- JWT access token TTL: 15 minutes
- Refresh token TTL: 30 days, stored in Redis, rotated on use
- Revoked tokens stored in Redis blocklist until natural expiry
- Never log: passwords, OTPs, full tokens, card numbers, file contents
- File uploads: validate MIME type (python-magic, not extension), extension whitelist, max size, UUID rename
- All DB queries via SQLAlchemy ORM — no f-string SQL
- CORS: explicit origins, no wildcard in production
- Security headers on every response: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- Rate limiting: Redis-backed, per-IP and per-user
- Audit log: all state-changing operations (booking create/cancel, payment, KYC review, admin actions)
- IP stored truncated (last octet zeroed for IPv4) for privacy
- Supabase service role key: NEVER in frontend code or client-side environment variables

### Authorization checks (required on every endpoint):
1. Is user authenticated? (401 if not)
2. Does user have the right role? (403 if not)
3. Does user own the resource? (403 if not — IDOR prevention)
4. Is the resource in a valid state for this action? (409 or 400)

---

## Naming Rules

Use meaningful domain names. Avoid generic names.

**Good:**
- `BookingService`, `WorkerAvailability`, `PricingRule`, `BookingStatus`, `CustomerProfile`
- `create_booking`, `calculate_price`, `accept_job_request`, `complete_booking`

**Avoid:**
- `data`, `result`, `response_data`, `temp`, `helper`, `manager`, `processor`
- Unnecessary underscore prefixes/suffixes (`_data`, `_obj`, `__result`)
- Single-letter variables outside list comprehensions/math

Use Python naming conventions: `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE` for constants.

---

## Redis Rules

All Redis keys are defined in `redis/keys.py` — never hardcode key strings in business code.

Key naming pattern: `{namespace}:{entity}:{identifier}`

Examples:
```
auth:refresh:{token_hash}
auth:otp:{phone}
auth:otp_attempts:{phone}
rate_limit:{endpoint}:{ip}
worker:online:{worker_id}
booking:lock:{worker_id}
cache:categories
cache:pricing:{category_id}:{area_id}
```

TTLs are constants defined alongside keys, not scattered through the codebase.

---

## Celery Rules

- Celery broker and result backend: Redis
- Queues: `default`, `notifications`, `payments`, `cleanup`
- All tasks: idempotent (safe to retry)
- Retry with exponential backoff on transient failures
- Max retries: 3 (configurable per task)
- Tasks must not contain business logic — call service functions
- Beat schedule defined in `celery/beat.py`, not scattered in task files

---

## Async / Performance Rules

- Async SQLAlchemy sessions only — no synchronous DB calls in async handlers
- No blocking I/O inside async route handlers (no `time.sleep`, no sync HTTP calls)
- Detect N+1: when loading a list with related data, use `selectinload` or `joinedload`, not lazy loading
- Pagination on all list endpoints — no `SELECT *` with no LIMIT
- Use `RETURNING` clause for INSERT/UPDATE when you need the created/updated row
- Connection pool: configure `pool_size`, `max_overflow`, `pool_pre_ping`
- Avoid loading full object graphs — select only needed columns where performance matters

---

## Testing Rules

- Framework: `pytest` + `pytest-asyncio`
- Test client: `httpx.AsyncClient` (not `TestClient`)
- Test database: real PostgreSQL (not mocked) — separate test DB
- Factory fixtures for test data — no copy-paste test setup
- Never mock the database in integration tests
- Every domain must have:
  - Service function unit tests
  - API integration tests
  - Authorization tests (unauthenticated, wrong role, wrong owner)
- Run tests: `pytest tests/ -v`
- Run lint: `ruff check .`
- Run type check: `mypy app/`

---

## Migration Rules

- One migration per task (not one per model)
- Migration filenames: `NNNN_descriptive_name.py` (alembic auto-generates)
- Always test: `alembic upgrade head` and `alembic downgrade -1`
- Never edit an already-applied migration — create a new one
- Never run `alembic upgrade head` automatically on app startup in production
- Run as a separate deployment step before restarting the app

---

## Git / Code Quality Rules

- Commit after each task completes and all checks pass
- Commit message format: `task(X.Y): description`
- No commented-out code in commits
- No `TODO` without a corresponding task number
- `ruff` must pass with zero warnings before commit
- `mypy` must pass (strict mode on new code)

---

## Prohibited Practices

- ❌ Microservices — this is a modular monolith
- ❌ Raw SQL string interpolation
- ❌ Float for monetary values
- ❌ Business logic in route handlers
- ❌ Business logic in frontend/Next.js API routes
- ❌ Supabase service role key in frontend
- ❌ Mocking the database in integration tests
- ❌ `SELECT *` on large tables without pagination
- ❌ Lazy-loading related data in list endpoints (N+1)
- ❌ Hardcoded Redis key strings outside `redis/keys.py`
- ❌ Hardcoded secrets (use `.env` + Pydantic Settings)
- ❌ Migration auto-run on app startup
- ❌ Skipping authorization checks on any endpoint
- ❌ Logging passwords, OTPs, tokens, or card data
- ❌ User-controlled filenames in object storage
- ❌ Implementing multiple tasks in one run
- ❌ Adding "future-proof" abstractions not required by current task

---

## Design System Rules (Frontend)

Visual identity: Professional, neutral, trustworthy. Not AI-gradient. Not fintech.

**Colors:**
- Primary: `#1a2e5e` (deep indigo)
- Accent/CTA: `#e8a020` (warm amber)
- Success: `#16a34a`
- Destructive: `#dc2626`
- Background: `#ffffff` / `#f8f9fa`
- Text: `#1a1a1a` / `#6c757d`

**Typography:** Inter (Google Fonts). Headings: 600–700. Body: 400–500.

**Spacing:** 4px base grid.

**Component rules:**
- Buttons: 48px min height (mobile tap target)
- Cards: `box-shadow` subtle, 8px border-radius
- Status chips: color-coded (amber=pending, green=active, red=cancelled)
- No pink/purple gradients, no neon colors, no excessive glassmorphism
- Mobile-first — all layouts work on 375px width

**Stitch MCP** should be used for design exploration before implementing UI components.

---

## Observability Rules

- All logs: structured JSON via `structlog`
- Every log line includes: `request_id`, `user_id` (if authenticated), `timestamp`, `level`
- Log levels: DEBUG (dev only), INFO (normal ops), WARNING (business anomalies), ERROR (exceptions)
- Prometheus metrics: `/metrics` endpoint via `prometheus-fastapi-instrumentator`
- Slow query threshold: log queries > 500ms as WARNING

---

*Last updated: 2026-10-07*
*All agents working on this project must re-read this file at the start of every task.*
