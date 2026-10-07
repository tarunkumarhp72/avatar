# Avatar — Implementation Task List

> **Rule:** Do exactly ONE task per run. Complete all checks. Stop. Wait for instruction.
> Frontend: **Next.js** (App Router, TypeScript).
> Backend: **FastAPI + SQLAlchemy 2 async + PostgreSQL (Supabase) + Redis + Celery**.

---

## Status Key
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase 0 — Foundation

### [ ] Task 0.1 — Repository structure + AGENT.md
**Goal:** Empty but correctly shaped project. No running code yet.

**Deliverables:**
- `backend/` folder tree (all domain folders, empty `__init__.py` files)
- `frontend/` folder tree (Next.js directory shape, no Next.js install yet)
- `d:\tarun project\avatar\AGENTS.md` (project rules — already done)
- `backend/pyproject.toml` (all dependencies declared, nothing installed yet)
- `backend/.env.example` (all required env vars documented)
- `backend/.gitignore`
- Root `README.md` (project name + brief description only)
- `docker-compose.yml` (postgres+postgis, redis, backend, celery — not running yet)
- `backend/Dockerfile` (basic Python 3.12 image)

**Tests:** None (no code yet).
**Checks:** Verify all folders exist. Verify pyproject.toml parses.
**Security:** N/A.

---

### [ ] Task 0.2 — Backend: FastAPI app bootstrap
**Goal:** Runnable FastAPI app with zero business logic.

**Files to create:**
- `backend/app/main.py` — app factory, CORS, router registration stub
- `backend/app/core/config.py` — Pydantic Settings reading from `.env`
- `backend/app/core/middleware.py` — Request ID injection, structured logging middleware
- `backend/app/core/exceptions.py` — Global 422 and 500 handlers, custom `AppError` base
- `backend/app/core/security.py` — JWT encode/decode helpers (no routes yet)

**Endpoints created:**
- `GET /health` → `{ "status": "ok", "version": "0.1.0" }`

**Tests:**
- `GET /health` returns 200
- Request ID header is present on response
- Invalid JSON body returns 422 in correct error format

**Lint:** `ruff check .` passes.
**Type check:** `mypy app/` passes.
**Security:** N/A (no auth yet).

---

### [ ] Task 0.3 — Backend: Database connection (async SQLAlchemy)
**Goal:** App connects to PostgreSQL. Session dependency works.

**Files to create:**
- `backend/app/database/session.py` — async engine, `AsyncSession` factory, `get_db` dependency
- `backend/app/database/base.py` — `Base` declarative class, `TimestampMixin` (`created_at`, `updated_at`)

**Endpoints updated:**
- `GET /health` → also checks DB connectivity, returns `{ "status": "ok", "db": "ok" }`

**Tests:**
- Health endpoint shows `"db": "ok"` when DB is reachable
- Health endpoint shows `"db": "error"` (not 500) when DB is unreachable

**Checks:** Connection pool configured (`pool_size`, `max_overflow`, `pool_pre_ping`).
**Security:** DB credentials only from env vars, never hardcoded.

---

### [ ] Task 0.4 — Backend: Alembic setup
**Goal:** Alembic configured for async SQLAlchemy. First baseline migration runs.

**Files to create:**
- `backend/alembic/env.py` — async migration runner
- `backend/alembic/alembic.ini`
- `backend/alembic/versions/0001_baseline.py` — empty baseline (no tables yet, just proves it works)

**Checks:**
- `alembic upgrade head` runs without error
- `alembic downgrade -1` runs without error
- `alembic check` passes (no pending migrations)

**Tests:** None beyond migration commands passing.

---

### [ ] Task 0.5 — Backend: Redis setup
**Goal:** Async Redis client available. Health check includes Redis.

**Files to create:**
- `backend/app/redis/client.py` — async Redis client setup (`redis.asyncio`)
- `backend/app/redis/keys.py` — empty file with module docstring (keys added per task)

**Endpoints updated:**
- `GET /health` → also checks Redis, returns `{ "status": "ok", "db": "ok", "redis": "ok" }`

**Tests:**
- Health shows `"redis": "ok"` when reachable
- Health shows `"redis": "error"` (not 500) when Redis is down

---

### [ ] Task 0.6 — Backend: Celery setup
**Goal:** Celery app configured. Test task can be enqueued and executed.

**Files to create:**
- `backend/app/celery/app.py` — Celery instance, broker config, queue definitions
- `backend/app/celery/beat.py` — empty beat schedule (populated per task)
- `backend/celery_worker.py` — Celery worker entrypoint

**Test task:**
- `ping_task()` — logs "pong" and returns `"pong"` (used only to verify Celery works)

**Tests:**
- Enqueue `ping_task`, verify it returns `"pong"` (use `task.apply()` in tests, not async)

---

### [ ] Task 0.7 — Testing infrastructure
**Goal:** Test suite can run. First real test passes.

**Files to create:**
- `backend/tests/conftest.py` — event loop, async test DB setup/teardown, `AsyncClient` fixture
- `backend/tests/test_health.py` — health endpoint smoke tests

**Checks:**
- `pytest tests/ -v` runs and all tests pass
- Separate test database used (not dev DB)
- Test DB cleaned between test runs

---

## Phase 1 — Authentication & Users

### [ ] Task 1.1 — User model + migration
**Goal:** `users` table exists in DB.

**Files to create:**
- `backend/app/users/models.py` — `User` SQLAlchemy model
- `backend/alembic/versions/0002_users_table.py`

**Schema:**
```
users: id (uuid), phone (unique, not null), email (nullable, unique),
       full_name, role (CUSTOMER|WORKER|ADMIN), is_active (bool),
       created_at, updated_at
```

**Tests:**
- Migration runs up and down
- `users` table has correct columns, constraints, indexes
- `phone` unique constraint enforced

**Security:** No sensitive columns beyond what's listed.

---

### [ ] Task 1.2 — OTP authentication
**Goal:** Customer/worker can request OTP and verify it to get tokens.

**Files to create:**
- `backend/app/auth/schemas.py`
- `backend/app/auth/service.py` — OTP generate, store in Redis, verify; token issue
- `backend/app/auth/routes.py`
- `backend/app/redis/keys.py` — add OTP keys + TTL constants

**Endpoints created:**
- `POST /api/v1/auth/otp/send` — validates phone, generates OTP, stores hashed in Redis (TTL 10min), returns `{ "message": "OTP sent" }` (always same response — no enumeration)
- `POST /api/v1/auth/otp/verify` — verifies OTP, creates user if first login, returns `{ "access_token", "refresh_token", "token_type" }`

**Tests:**
- Valid OTP → tokens returned
- Wrong OTP → 401
- Expired OTP → 401
- 5th wrong attempt → 429 (lockout)
- 6th OTP send within 1h → 429 (rate limited)
- New phone auto-creates user
- Response body identical whether phone exists or not (enumeration protection)

**Security checks:**
- Rate limiting verified at 5 sends/hour/phone
- Brute force lockout verified at 5 wrong OTPs
- OTP stored hashed, not plaintext
- Response gives no indication of whether phone is registered

---

### [ ] Task 1.3 — JWT + refresh token lifecycle
**Goal:** Access token validation, refresh, and logout work correctly.

**Files to create:**
- `backend/app/auth/routes.py` — add refresh + logout
- `backend/app/core/dependencies.py` — `get_current_user` dependency
- `backend/app/redis/keys.py` — add refresh token keys, blocklist keys

**Endpoints created:**
- `POST /api/v1/auth/refresh` — rotates refresh token, issues new access token
- `POST /api/v1/auth/logout` — invalidates refresh token, adds access token to blocklist

**Tests:**
- Valid access token → authenticated
- Expired access token → 401
- Revoked access token (after logout) → 401
- Refresh with valid refresh token → new tokens
- Refresh with old refresh token (after rotation) → 401
- Refresh with revoked refresh token → 401

**Security:**
- Token replay after logout → 401
- Refresh token rotation (old token invalidated on use)

---

### [ ] Task 1.4 — Current user endpoint + role enforcement
**Goal:** Role-based access control working.

**Files to create:**
- `backend/app/users/schemas.py`
- `backend/app/users/service.py`
- `backend/app/users/routes.py`
- `backend/app/core/dependencies.py` — add `require_customer`, `require_worker`, `require_admin`

**Endpoints created:**
- `GET /api/v1/users/me` — returns current user (authenticated, any role)
- `PATCH /api/v1/users/me` — update full_name, email (authenticated, any role)

**Tests:**
- Authenticated → 200 with correct user data
- Unauthenticated → 401
- Customer cannot use worker-only dependency → 403
- Worker cannot use admin-only dependency → 403
- PATCH updates only allowed fields (no role, no is_active via this endpoint)

**Security:**
- Mass assignment check: user cannot set `role` or `is_active` via PATCH
- IDOR: user can only see/update their own profile

---

## Phase 2 — Service Categories

### [ ] Task 2.1 — Category model + migration + seed
**Files to create:**
- `backend/app/categories/models.py`
- `backend/alembic/versions/0003_service_categories.py`
- `backend/scripts/seed_categories.py` — seed script with ~20 initial categories

**Schema:**
```
service_categories: id (uuid), name, slug (unique), icon_url (nullable),
                    parent_id (fk self, nullable), pricing_model (FIXED|INSPECTION_QUOTE|PROJECT_QUOTE),
                    is_emergency_eligible (bool), is_active (bool), sort_order (int),
                    created_at, updated_at
```

**Tests:**
- Migration runs up/down
- Seed script inserts categories without error
- Slug unique constraint enforced

---

### [ ] Task 2.2 — Category API + Redis caching
**Files to create:**
- `backend/app/categories/schemas.py`
- `backend/app/categories/service.py`
- `backend/app/categories/routes.py`
- `backend/app/redis/keys.py` — add category cache keys

**Endpoints created:**
- `GET /api/v1/categories` — list all active categories (cached 1h, public)
- `GET /api/v1/categories/{id}` — single category (public)
- `POST /api/v1/admin/categories` — create (admin only)
- `PATCH /api/v1/admin/categories/{id}` — update + invalidate cache (admin only)
- `DELETE /api/v1/admin/categories/{id}` — soft-disable (admin only)

**Tests:**
- List returns categories
- Second request served from cache (mock Redis `get` called)
- Cache invalidated on admin update
- Non-admin create → 403
- Non-admin delete → 403

**Performance:** No N+1 (single query for list).

---

## Phase 3 — Customer Profile

### [ ] Task 3.1 — Customer profile + addresses model + migration
**Files to create:**
- `backend/app/customers/models.py`
- `backend/alembic/versions/0004_customer_profiles_addresses.py`

**Schema:**
```
customer_profiles: id (uuid), user_id (fk users, unique), default_address_id (nullable fk),
                   created_at, updated_at

addresses: id (uuid), user_id (fk users), label (nullable), address_line1, address_line2 (nullable),
           city, state, pincode, location (geography point), is_default (bool),
           created_at
```

---

### [ ] Task 3.2 — Customer profile API
**Files to create:**
- `backend/app/customers/schemas.py`
- `backend/app/customers/service.py`
- `backend/app/customers/routes.py`

**Endpoints created:**
- `GET /api/v1/customers/me` — customer profile (customer role)
- `PATCH /api/v1/customers/me` — update profile
- `GET /api/v1/customers/me/addresses` — list addresses
- `POST /api/v1/customers/me/addresses` — add address
- `PATCH /api/v1/customers/me/addresses/{id}` — update address
- `DELETE /api/v1/customers/me/addresses/{id}` — delete address
- `POST /api/v1/customers/me/addresses/{id}/set-default` — set default

**Tests:**
- CRUD works
- Customer A cannot access customer B's addresses (IDOR → 403)
- Worker cannot access customer endpoints (403)
- Delete default address handled gracefully

**Security:** IDOR check on every address endpoint (user_id match).

---

## Phase 4 — Worker Profile & Onboarding

### [ ] Task 4.1 — Worker model + migration (PostGIS)
**Files to create:**
- `backend/app/workers/models.py`
- `backend/alembic/versions/0005_worker_profiles.py`

**Schema:**
```
worker_profiles: id, user_id (fk unique), bio (nullable), profile_photo_url (nullable),
                 kyc_status (PENDING|SUBMITTED|APPROVED|REJECTED), 
                 lifecycle_status (REGISTERED|ACTIVE|SUSPENDED|DEACTIVATED),
                 is_available (bool, default false), current_location (geography(Point,4326), nullable),
                 last_location_update (timestamp, nullable),
                 rating_avg (numeric 3,2, default 0), rating_count (int, default 0),
                 created_at, updated_at

worker_categories: worker_id, category_id, years_experience (nullable) — PK (worker_id, category_id)

worker_service_areas: worker_id, area_id — PK (worker_id, area_id)

service_zones/areas: id, name, city, polygon (geography, nullable), is_active, created_at

kyc_documents: id, worker_id (fk), doc_type (AADHAAR|PAN|DRIVING_LICENCE|OTHER),
               file_url, status (PENDING|APPROVED|REJECTED),
               reviewed_by (fk users, nullable), reviewed_at (nullable), created_at
```

**PostGIS:** Enable extension in migration. Add GIST index on `current_location`.

---

### [ ] Task 4.2 — Worker profile API (self-management)
**Files to create:**
- `backend/app/workers/schemas.py`
- `backend/app/workers/service.py`
- `backend/app/workers/routes.py`

**Endpoints created:**
- `GET /api/v1/workers/me` — own profile (worker role)
- `PATCH /api/v1/workers/me` — update bio, photo URL
- `PUT /api/v1/workers/me/categories` — replace category list
- `PUT /api/v1/workers/me/service-areas` — replace service area list
- `POST /api/v1/workers/me/availability` — toggle `{ "is_available": true/false }`, update Redis heartbeat
- `POST /api/v1/workers/me/location` — update GPS coords (stored to DB + Redis)

**Tests:**
- Worker can update own profile
- Worker A cannot update Worker B's profile (403)
- Customer cannot access worker-only endpoints (403)
- Availability toggle updates Redis key with TTL

---

### [ ] Task 4.3 — KYC document upload
**Depends on:** Task 5.1 (media upload) — implement after 5.1 OR implement with stub upload URL.

**Files to create/modify:**
- `backend/app/workers/routes.py` — add KYC routes
- `backend/app/workers/service.py` — KYC document logic

**Endpoints created:**
- `POST /api/v1/workers/me/kyc/upload-url` — generate signed upload URL for a doc type
- `POST /api/v1/workers/me/kyc/confirm` — confirm upload, create kyc_document record, set status to PENDING
- `GET /api/v1/admin/workers/{id}/kyc` — list worker's KYC docs (admin only)
- `POST /api/v1/admin/workers/{id}/kyc/{doc_id}/review` — approve/reject (admin only)
- `POST /api/v1/admin/workers/{id}/approve` — set lifecycle_status to ACTIVE (admin only)
- `POST /api/v1/admin/workers/{id}/suspend` — suspend worker (admin only)

**Tests:**
- Worker cannot view/review other worker's KYC (403)
- Customer cannot access KYC endpoints (403)
- Non-admin cannot approve KYC (403)
- Worker cannot approve own KYC (403)
- Invalid file type rejected

---

### [ ] Task 4.4 — Nearby worker discovery
**Endpoints created:**
- `GET /api/v1/workers/nearby?lat=&lng=&category_id=&radius_km=` — public (authenticated customer)

**Logic:**
- PostGIS `ST_DWithin` on `current_location`
- Filter: `lifecycle_status = ACTIVE`, `is_available = true`, has matching category
- Check Redis heartbeat key for online status
- Return: id, name, rating, distance_km, profile_photo, estimated_price (from pricing service)
- Paginated (max 20 per page)

**Tests:**
- Returns workers within radius
- Excludes suspended/inactive workers
- Excludes workers with no matching category
- Excludes offline workers (Redis heartbeat expired)
- Customer with no auth → 401
- Worker cannot call this endpoint (403 — customer only)

**Performance:** `EXPLAIN ANALYZE` the PostGIS query. Confirm GIST index is used.

---

## Phase 5 — Media Upload

### [ ] Task 5.1 — Media upload service (signed URLs)
**Files to create:**
- `backend/app/media/schemas.py`
- `backend/app/media/service.py`
- `backend/app/media/routes.py`

**Endpoints created:**
- `POST /api/v1/media/upload-url` — generate Supabase Storage signed upload URL
  - Body: `{ "content_type": "image/jpeg", "purpose": "booking_photo" | "profile_photo" | "kyc_document" }`
  - Returns: `{ "upload_url": "...", "file_key": "uuid-based-path" }`
- `POST /api/v1/media/confirm` — after client uploads, validate the file exists in storage, return final URL
  - Body: `{ "file_key": "..." }`

**Validation:**
- Allowed content types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`
- Max sizes enforced via signed URL policy
- File key is UUID-based (no user-controlled filenames)

**Tests:**
- Valid content type → signed URL generated
- Disallowed content type → 400
- Confirm with non-existent file key → 400
- Unauthenticated → 401

**Security:** No user-controlled path segments in storage key.

---

## Phase 6 — Pricing Engine

### [ ] Task 6.1 — Pricing rule model + migration + seed
**Files to create:**
- `backend/app/pricing/models.py`
- `backend/alembic/versions/0006_pricing_rules.py`
- `backend/scripts/seed_pricing.py`

**Schema:**
```
pricing_rules: id, category_id (nullable), area_id (nullable),
               pricing_model (FIXED|INSPECTION_QUOTE|PROJECT_QUOTE),
               base_amount_paise (bigint), visit_fee_paise (bigint),
               distance_fee_per_km_paise (bigint), distance_fee_threshold_km (numeric),
               emergency_fee_paise (bigint), platform_fee_percent (numeric 5,2),
               worker_commission_percent (numeric 5,2),
               material_charges_allowed (bool), material_charges_max_paise (bigint),
               effective_from (date), effective_until (date, nullable),
               created_by (fk users), created_at
```

---

### [ ] Task 6.2 — Pricing calculation service + estimate API
**Files to create:**
- `backend/app/pricing/schemas.py`
- `backend/app/pricing/service.py` — pure function: `calculate_price(ctx) → PriceBreakdown`
- `backend/app/pricing/routes.py`
- `backend/app/redis/keys.py` — add pricing cache keys

**Endpoints created:**
- `GET /api/v1/pricing/estimate?category_id=&lat=&lng=&is_emergency=` — pre-booking price estimate (customer)

**Rule resolution:** most-specific wins: (category+area) > (category only) > (area only) > (default). Most recent `effective_from` ≤ today, `effective_until` ≥ today or null.

**Tests:**
- Fixed price category → correct amount
- Emergency flag → adds emergency fee
- Area-specific rule overrides global rule
- Category+area rule overrides category-only rule
- No matching rule → 404 with clear error
- Cached result on second identical request

**Performance:** Pricing rules cached in Redis (TTL 30min).

---

### [ ] Task 6.3 — Admin pricing rule management
**Endpoints created:**
- `POST /api/v1/admin/pricing/rules`
- `GET /api/v1/admin/pricing/rules`
- `GET /api/v1/admin/pricing/rules/{id}`
- `PATCH /api/v1/admin/pricing/rules/{id}`
- `DELETE /api/v1/admin/pricing/rules/{id}` — soft disable (set `effective_until` to today)

**Tests:**
- Non-admin → 403 on all endpoints
- Create rule + verify cache invalidated
- Effective date filtering works correctly

---

## Phase 7 — Bookings (Core)

### [ ] Task 7.1 — Booking model + migration
**Files to create:**
- `backend/app/bookings/models.py`
- `backend/alembic/versions/0007_bookings.py`

**Schema:**
```
bookings: id (uuid), idempotency_key (uuid, unique),
          customer_id (fk), worker_id (fk, nullable),
          category_id (fk), address_id (fk),
          status (enum — all lifecycle states),
          description (text), is_emergency (bool, default false),
          scheduled_at (timestamp, nullable),
          pricing_rule_id (fk, nullable), pricing_snapshot (jsonb, nullable),
          worker_accepted_at, worker_arrived_at, job_started_at, job_completed_at (timestamps),
          created_at, updated_at

booking_media: id, booking_id (fk), media_url, media_type (IMAGE|VIDEO), uploaded_at
```

**Indexes:** status, worker_id, customer_id, scheduled_at, idempotency_key (unique).

---

### [ ] Task 7.2 — Create booking
**Files to create:**
- `backend/app/bookings/schemas.py`
- `backend/app/bookings/service.py`
- `backend/app/bookings/routes.py`
- `backend/app/bookings/tasks.py` — stub (acceptance timeout task registered but no-op for now)

**Endpoint created:**
- `POST /api/v1/bookings` (customer only)
  - Body: `{ "category_id", "address_id", "description", "is_emergency", "scheduled_at" (nullable), "idempotency_key", "media_keys" (list) }`
  - Validates: address belongs to customer, category exists and is active, pricing rule resolved
  - Stores pricing snapshot
  - Status: `PENDING_WORKER_ACCEPTANCE`
  - Enqueues acceptance timeout task (fires in 5 min)
  - Returns: full booking object

**Tests:**
- Valid booking → 201
- Duplicate `idempotency_key` → 409 (returns existing booking, no duplicate)
- Address not belonging to customer → 403
- Invalid category → 400
- Worker calling this endpoint → 403
- Unauthenticated → 401

**Security:**
- Address ownership checked (IDOR)
- Idempotency key enforced at DB level (unique constraint)

---

### [ ] Task 7.3 — Worker job request & acceptance
**Endpoints created:**
- `GET /api/v1/workers/me/job-requests` — pending bookings near worker (worker only)
- `POST /api/v1/bookings/{id}/accept` (worker only)
- `POST /api/v1/bookings/{id}/reject` (worker only)

**Acceptance logic (atomic):**
1. Redis distributed lock: `SET booking:lock:{booking_id} {worker_id} NX EX 10`
2. DB transaction: verify booking is still `PENDING_WORKER_ACCEPTANCE`, set `worker_id`, set `ACCEPTED`, set `worker_accepted_at`
3. Release lock

**Tests:**
- Accept → booking moves to ACCEPTED
- Reject → booking moves back (or stays PENDING for other workers)
- Two workers accept simultaneously → exactly one succeeds, other gets 409
- Accept already-accepted booking → 409
- Worker accepts booking they're not eligible for (wrong category) → 403
- Accept expired booking → 400

**Security:**
- Worker cannot accept booking assigned to another worker
- Customer cannot call accept/reject → 403

---

### [ ] Task 7.4 — Booking status transitions (worker side)
**Endpoints created:**
- `POST /api/v1/bookings/{id}/en-route` (worker)
- `POST /api/v1/bookings/{id}/arrived` (worker)
- `POST /api/v1/bookings/{id}/start` (worker)
- `POST /api/v1/bookings/{id}/complete` (worker)

**State machine:** Only allow valid transitions. Any invalid transition → 409.

```
ACCEPTED → WORKER_EN_ROUTE → WORKER_ARRIVED → IN_PROGRESS → COMPLETED
```

**Tests:**
- Each valid transition → 200
- Skipping a step (ACCEPTED → IN_PROGRESS without en-route) → 409
- Worker who did not accept the booking cannot transition → 403
- Customer cannot call these endpoints → 403
- Complete transition requires material charges or amount within allowed range

---

### [ ] Task 7.5 — Customer booking views + cancellation
**Endpoints created:**
- `GET /api/v1/bookings` — paginated list of customer's bookings (customer only)
- `GET /api/v1/bookings/{id}` — booking detail with pricing snapshot (customer only)
- `POST /api/v1/bookings/{id}/cancel` — customer cancels (rules apply)

**Cancellation rules:**
- `PENDING_WORKER_ACCEPTANCE` → free cancel → `CANCELLED_BY_CUSTOMER`
- `ACCEPTED` or later → note that cancellation fee policy applies (flag for future payment)

**Tests:**
- Customer sees only own bookings
- Customer A accessing customer B's booking → 403
- Worker cannot call GET /bookings as customer → 403 (worker has own endpoint)
- Cancel in valid state → 200
- Cancel already-completed booking → 409

**Security:** IDOR on every booking endpoint — `customer_id` match enforced in service.

---

### [ ] Task 7.6 — Acceptance timeout Celery task
**Files to create/modify:**
- `backend/app/bookings/tasks.py` — implement `handle_acceptance_timeout(booking_id)`

**Logic:**
- Called 5 minutes after booking created
- If booking still `PENDING_WORKER_ACCEPTANCE` → set to `EXPIRED`
- Notify customer (enqueue notification task — stub if notifications not yet built)

**Tests:**
- Task runs: if still pending → status becomes EXPIRED
- Task runs: if already accepted → no change (idempotent)
- Task registered in Celery, can be enqueued

---

## Phase 8 — Quotes

### [ ] Task 8.1 — Quote model + migration
**Files to create:**
- `backend/app/quotes/models.py`
- `backend/alembic/versions/0008_quotes.py`

**Schema:**
```
quotes: id (uuid), booking_id (fk, unique per active quote), worker_id (fk),
        amount_paise (bigint), description (text),
        material_charges_paise (bigint, default 0),
        status (SUBMITTED|ACCEPTED|REJECTED|EXPIRED),
        submitted_at, responded_at (timestamps), expires_at
```

---

### [ ] Task 8.2 — Quote flow API
**Files to create:**
- `backend/app/quotes/schemas.py`
- `backend/app/quotes/service.py`
- `backend/app/quotes/routes.py`

**Endpoints created:**
- `POST /api/v1/bookings/{id}/quotes` — worker submits quote (only when booking is `IN_PROGRESS` for INSPECTION_QUOTE type)
- `GET /api/v1/bookings/{id}/quotes/latest` — customer views current quote
- `POST /api/v1/quotes/{id}/accept` — customer accepts → booking moves to `QUOTE_ACCEPTED`
- `POST /api/v1/quotes/{id}/reject` — customer rejects → booking moves to `QUOTE_REJECTED`

**Tests:**
- Worker submits quote → 201
- Worker submits second quote before response → 409 (only one active quote)
- Customer accepts → booking status updates
- Customer B accepts customer A's quote → 403
- Worker cannot accept own quote → 403
- Accepting expired quote → 400

---

## Phase 9 — Payments

### [ ] Task 9.1 — Payment model + migration
**Files to create:**
- `backend/app/payments/models.py`
- `backend/alembic/versions/0009_payments.py`

**Schema:**
```
payments: id (uuid), booking_id (fk), customer_id (fk),
          amount_paise (bigint), platform_fee_paise (bigint),
          worker_earnings_paise (bigint), tax_paise (bigint),
          status (INITIATED|PENDING|SUCCEEDED|FAILED|REFUNDED),
          provider (RAZORPAY), provider_order_id, provider_payment_id (nullable),
          idempotency_key (uuid, unique), created_at, updated_at

worker_earnings: id, worker_id, booking_id, payment_id,
                 gross_amount_paise, commission_deducted_paise, net_amount_paise,
                 payout_status (PENDING|PAID|HOLD), payout_reference (nullable), created_at
```

---

### [ ] Task 9.2 — Razorpay payment integration
**Files to create:**
- `backend/app/payments/providers/base.py` — abstract `PaymentProvider` (two methods: `create_order`, `verify_signature`)
- `backend/app/payments/providers/razorpay.py`
- `backend/app/payments/schemas.py`
- `backend/app/payments/service.py`
- `backend/app/payments/routes.py`
- `backend/app/payments/tasks.py` — `reconcile_worker_earnings(payment_id)`

**Endpoints created:**
- `POST /api/v1/payments/initiate` — create Razorpay order, return order_id + key to client
  - Body: `{ "booking_id", "idempotency_key" }`
  - Only callable when booking is `COMPLETED` (or `QUOTE_ACCEPTED` for quoted jobs)
- `POST /api/v1/payments/webhook` — Razorpay webhook (no auth, but signature verified)
  - On success: update payment → SUCCEEDED, booking → PAID, enqueue `reconcile_worker_earnings`
  - Idempotent: duplicate webhook → 200 (no re-processing)

**Tests:**
- Initiate → Razorpay order created (mock Razorpay API)
- Duplicate idempotency key → 409
- Webhook success → payment and booking updated
- Webhook duplicate → no double-processing (idempotent)
- Webhook invalid signature → 400
- Customer cannot initiate payment for another customer's booking → 403
- Unauthenticated webhook still validates signature

**Security:**
- Webhook signature verification is mandatory — never skip
- Idempotency enforced at DB constraint level

---

### [ ] Task 9.3 — Worker earnings view
**Endpoints created:**
- `GET /api/v1/workers/me/earnings` — summary: total earned, pending payout, completed jobs count
- `GET /api/v1/workers/me/earnings/history` — paginated per-booking breakdown

**Tests:**
- Worker sees own earnings only
- Worker A accessing Worker B's earnings → 403
- Customer cannot access earnings endpoints → 403

---

## Phase 10 — Reviews

### [ ] Task 10.1 — Review model + migration
**Files to create:**
- `backend/app/reviews/models.py`
- `backend/alembic/versions/0010_reviews.py`

**Schema:**
```
reviews: id (uuid), booking_id (fk, unique — one review per booking),
         customer_id (fk), worker_id (fk), rating (smallint 1-5), comment (text, nullable),
         created_at
```

---

### [ ] Task 10.2 — Review API
**Files to create:**
- `backend/app/reviews/schemas.py`
- `backend/app/reviews/service.py`
- `backend/app/reviews/routes.py`

**Endpoints created:**
- `POST /api/v1/bookings/{id}/review` — submit review (customer, after booking is PAID)
- `GET /api/v1/workers/{id}/reviews` — public worker reviews (paginated, any authenticated user)

**Post-review:** Update `worker_profiles.rating_avg` and `rating_count` (in same transaction, or via Celery — choose simplest correct approach).

**Tests:**
- Valid review after PAID booking → 201
- Review when booking not PAID → 400
- Duplicate review on same booking → 409
- Customer A reviewing Customer B's booking → 403
- Worker trying to review own job → 403
- Rating out of range (0 or 6) → 422

---

## Phase 11 — Notifications

### [ ] Task 11.1 — Notification model + device tokens + migration
**Files to create:**
- `backend/app/notifications/models.py`
- `backend/alembic/versions/0011_notifications.py`

**Schema:**
```
notifications: id (uuid), user_id (fk), channel (PUSH|SMS|EMAIL|IN_APP),
               event_type (text), title, body, is_read (bool, default false),
               sent_at (nullable), created_at

device_tokens: id (uuid), user_id (fk), token (text), platform (IOS|ANDROID|WEB),
               created_at, last_seen_at
```

---

### [ ] Task 11.2 — Notification dispatch + inbox API
**Files to create:**
- `backend/app/notifications/schemas.py`
- `backend/app/notifications/service.py`
- `backend/app/notifications/routes.py`
- `backend/app/notifications/tasks.py` — Celery notification tasks
- `backend/app/notifications/channels/push.py` — FCM stub
- `backend/app/notifications/channels/sms.py` — SMS stub (MSG91)

**Endpoints created:**
- `GET /api/v1/notifications` — inbox (authenticated user, their own only, paginated)
- `POST /api/v1/notifications/{id}/read` — mark read
- `POST /api/v1/notifications/read-all` — mark all read
- `POST /api/v1/users/me/device-tokens` — register device token for push

**Booking event hooks:** After completing each booking task, hook in notification dispatch for key events:
- Booking created → notify nearby workers
- Booking accepted → notify customer
- Worker en-route → notify customer
- Job completed → notify customer
- Payment success → notify both

**Tests:**
- Inbox shows only own notifications (IDOR check)
- Mark read updates is_read
- Device token registered and retrievable
- Celery task enqueued on booking event

---

## Phase 12 — Admin APIs

### [ ] Task 12.1 — Admin worker management
**Endpoints created:**
- `GET /api/v1/admin/workers` — list workers with filters (kyc_status, lifecycle_status, city)
- `GET /api/v1/admin/workers/{id}` — worker detail
- Already built in 4.3: KYC review, approve, suspend endpoints

**Tests:**
- Non-admin → 403
- Filters work correctly
- Returns paginated results

---

### [ ] Task 12.2 — Admin booking management
**Endpoints created:**
- `GET /api/v1/admin/bookings` — list all bookings with filters (status, date range, category)
- `GET /api/v1/admin/bookings/{id}` — booking detail
- `POST /api/v1/admin/bookings/{id}/cancel` — force cancel with reason

**Tests:**
- Non-admin → 403
- Force cancel updates booking status and notifies both parties

---

### [ ] Task 12.3 — Admin analytics (basic)
**Endpoints created:**
- `GET /api/v1/analytics/summary` — admin only
  - Returns: bookings today/week/month, revenue today/week/month, new users, new workers, pending KYC count

**Tests:**
- Non-admin → 403
- Returns correct counts

---

## Phase 13 — Frontend (Next.js)

### [ ] Task 13.1 — Next.js project setup + design system
**Goal:** Runnable Next.js app with design tokens and base components. No pages yet.

**Deliverables:**
- `frontend/` initialized with Next.js (App Router, TypeScript)
- `frontend/src/styles/tokens.css` — all color, typography, spacing tokens as CSS custom properties
- `frontend/src/styles/globals.css` — reset, base typography
- `frontend/src/components/ui/Button.tsx` — primary, secondary, destructive variants
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/StatusChip.tsx` — booking status display
- `frontend/src/components/ui/Spinner.tsx`
- `frontend/src/lib/api/client.ts` — base fetch wrapper (adds auth header, handles errors)
- Stitch MCP: create design system and generate initial component explorations

**Tests:** `next build` completes without error. All components render in isolation.

---

### [ ] Task 13.2 — Auth flow (customer/worker login)
**Pages:**
- `/login` — phone input + OTP request
- `/verify` — OTP entry + submit

**API integration:** `auth/otp/send`, `auth/otp/verify`. Token stored in `httpOnly` cookie via Next.js route handler (not localStorage).

**Tests:**
- Valid OTP → redirect to dashboard
- Invalid OTP → error message shown
- Already logged in → redirect away from login

---

### [ ] Task 13.3 — Customer: Home + service selection
**Pages:**
- `/` (home) — service category grid, search bar, location prompt
- `/services/{category-slug}` — category detail + "Book Now" CTA

**Stitch:** Generate screen mockups before implementing.

---

### [ ] Task 13.4 — Customer: Booking flow
**Pages:**
- `/book/{category-slug}` — multi-step flow:
  1. Describe problem (text + optional photo upload)
  2. Select/confirm address (map or manual)
  3. Select date/time (or "Now")
  4. Price estimate shown
  5. Confirm booking

**API integration:** media upload, pricing estimate, create booking.

---

### [ ] Task 13.5 — Customer: Booking status + history
**Pages:**
- `/bookings` — booking history list
- `/bookings/{id}` — booking detail, status, worker info, price breakdown

---

### [ ] Task 13.6 — Customer: Payment + review
**Pages:**
- `/bookings/{id}/payment` — Razorpay checkout integration
- `/bookings/{id}/review` — post-payment review form

---

### [ ] Task 13.7 — Worker: Dashboard + job requests
**Pages:**
- `/worker/dashboard` — availability toggle, earnings summary, incoming requests
- `/worker/jobs/{id}` — job detail, accept/reject, status transitions

---

### [ ] Task 13.8 — Worker: Profile + onboarding
**Pages:**
- `/worker/profile` — edit profile, categories, areas
- `/worker/kyc` — document upload flow
- `/worker/earnings` — earnings history

---

### [ ] Task 13.9 — Admin: Management dashboard
**Pages:**
- `/admin` — stats overview
- `/admin/workers` — worker list + KYC review
- `/admin/bookings` — booking list + management
- `/admin/pricing` — pricing rule management
- `/admin/categories` — category management

---

## Phase 14 — Hardening

### [ ] Task 14.1 — Security audit
- Full IDOR sweep: every endpoint that takes a resource ID — verify ownership checked
- Mass assignment: verify Pydantic schemas reject unexpected fields
- File upload abuse: test MIME spoofing, oversized files, invalid extensions
- Auth bypass: attempt to access protected endpoints without token
- Privilege escalation: customer → worker endpoints, worker → admin endpoints

### [ ] Task 14.2 — Performance review
- Review `EXPLAIN ANALYZE` on top 10 most-called queries
- Verify no N+1 on booking list, worker list, notification list
- Add any missing indexes discovered during review
- Review connection pool settings under simulated load

### [ ] Task 14.3 — Observability setup
- Prometheus metrics endpoint (`/metrics`)
- Slow query logging (> 500ms)
- Celery task monitoring
- Error alerting documentation

### [ ] Task 14.4 — End-to-end tests
- Full flow: customer registers → books service → worker accepts → completes → payment → review
- Full flow: worker registers → KYC approved → goes online → receives job → completes → earnings recorded

---

## Dependency Graph (quick reference)

```
0.1 → 0.2 → 0.3 → 0.4
             ↓
            0.5 → 0.6
             ↓
            0.7

0.4 → 1.1 → 1.2 → 1.3 → 1.4
0.4 → 2.1 → 2.2 (needs 1.4)
0.4 → 3.1 → 3.2 (needs 1.4)
0.4 → 4.1 → 4.2 (needs 1.4) → 4.3 (needs 5.1) → 4.4
0.4 → 5.1 (needs 1.4)
0.4 → 6.1 → 6.2 → 6.3 (needs 1.4)
0.4 → 7.1 → 7.2 (needs 3.2, 6.2, 1.4)
             → 7.3 (needs 4.4)
             → 7.4 (needs 7.3)
             → 7.5 (needs 7.2)
             → 7.6 (needs 0.6)
0.4 → 8.1 → 8.2 (needs 7.4)
0.4 → 9.1 → 9.2 (needs 7.4) → 9.3
0.4 → 10.1 → 10.2 (needs 9.2)
0.4 → 11.1 → 11.2 (needs 0.6)
Phase 12 depends on all previous backend phases
Phase 13 can start parallel to backend Phase 6+ (mock API or backend running)
Phase 14 runs after all other phases
```

---

## Task Count Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 0 | 7 | Foundation |
| 1 | 4 | Auth |
| 2 | 2 | Categories |
| 3 | 2 | Customer profile |
| 4 | 4 | Worker profile |
| 5 | 1 | Media upload |
| 6 | 3 | Pricing |
| 7 | 6 | Bookings |
| 8 | 2 | Quotes |
| 9 | 3 | Payments |
| 10 | 2 | Reviews |
| 11 | 2 | Notifications |
| 12 | 3 | Admin APIs |
| 13 | 9 | Frontend (Next.js) |
| 14 | 4 | Hardening |
| **Total** | **54** | |

---

*Current task: None started. Awaiting instruction to begin Task 0.1.*
