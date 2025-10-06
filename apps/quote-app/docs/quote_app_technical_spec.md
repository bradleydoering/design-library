# Cloud Renovation – Quote App (Contractor & Customer)

## Goals
1) **Customers must authenticate** to view their quote. No public/unguarded links.
2) **Anti-sharing**: make it difficult and risky to share access with other contractors.
3) **Notify** the contractor/org whenever a customer re-opens their quote after the initial meeting.
4) **Fail loud**: any degraded dependency (auth, design pricing, DB, Stripe, etc.) blocks the action with a hard error.
5) **Zero impact** on existing **design-library** runtime and data; monorepo is code-only consolidation.

---

## Assumptions (developer will adjust against design-library realities)
- **Auth**: Supabase Auth (email OTP / magic link + optional OAuth).
- **Primary DB**: Supabase Postgres with RLS.
- **Stripe** is already your PSP.
- **Design pricing** is exposed to the quote-app **via a read-only SDK or HTTPS API** (no DB coupling).
- **Domains**:
  - quote app: `https://quote.cloudrenovation.ca`
  - design-library: unchanged (its current URL stays as-is).
- **Monorepo** hosts code for both apps, but **deployments, databases, and migrations are separate**.

---

## High-level Architecture

### Services
- **Quote App (Next.js)**: contractor-facing + customer portal
- **Quote API (Next.js API routes / Edge Functions)**: server-side auth checks, pricing orchestration, Stripe, events
- **Design Pricing Adapter**: thin wrapper to call design-library pricing (SDK or HTTPS). **Read-only**.
- **Notifications Worker**: listens to `quote_viewed` events → SendGrid email / Slack webhook / optional SMS
- **Audit/Event Store**: append-only table for security & analytics (Postgres)

### Separation & Blast-Radius Control
- **Separate DB/schema** for Quote App (e.g., `cr_quote` schema or a separate Supabase project).
- **No design-library DB reads/writes** from Quote App. Only call a **versioned pricing SDK** or HTTPS endpoint.
- Independent deploy pipelines: a change in the quote app **cannot** deploy the design-library automatically.
- **Version pinning**: the quote app depends on a specific version of the design pricing SDK; upgrades are explicit.

---

## Data Model (Postgres, RLS enforced)

```sql
-- Organizations & users
orgs(id uuid pk, name text, ...);
users(id uuid pk, email citext unique, ...);
org_members(org_id uuid fk->orgs, user_id uuid fk->users, role text check in ('owner','staff'), pk(org_id, user_id));

-- Projects & customers
customers(id uuid pk, org_id uuid fk->orgs, email citext unique null, phone text null, name text, ...);
projects(id uuid pk, org_id uuid fk->orgs, customer_id uuid fk->customers, address jsonb, building_type text check in ('house','condo'), ...);

-- Quotes
quotes(
  id uuid pk,
  org_id uuid fk->orgs,
  project_id uuid fk->projects,
  status text check in ('draft','customer_viewable','reserved','accepted','expired','cancelled') not null,
  currency text not null,
  deposit_required_pct numeric not null,
  labour_subtotal_cents bigint not null default 0,
  materials_subtotal_cents bigint not null default 0,
  grand_total_cents bigint not null default 0,
  initial_customer_viewed_at timestamptz null,
  created_by uuid fk->users, created_at timestamptz default now()
);

-- Inputs & snapshots
labour_inputs(quote_id uuid pk fk->quotes, jsonb not null);
materials_config(quote_id uuid pk fk->quotes, config jsonb not null);
materials_snapshot(
  quote_id uuid pk fk->quotes,
  sdk_version text not null,
  priced_at timestamptz not null,
  totals jsonb not null, -- includes line items and subtotal
  source_hash text not null -- signature of catalog/version for reproducibility
);

-- Rate cards
rate_cards(id uuid pk, org_id uuid fk->orgs, effective_from date, data jsonb not null, active boolean default true);

-- Access control bindings
quote_access(
  quote_id uuid fk->quotes,
  customer_user_id uuid fk->users null,  -- required for login binding
  email_hash text not null,              -- salted hash of customer email
  devices jsonb not null default '[]'    -- bound device fingerprints
);

-- Payments & events
payments(id uuid pk, quote_id uuid fk->quotes, stripe_payment_intent text, status text, amount_cents bigint, created_at timestamptz default now());
audit_events(
  id bigserial pk,
  org_id uuid, project_id uuid, quote_id uuid,
  actor_user_id uuid null, actor_role text null,   -- 'contractor'|'customer'|'system'
  event_type text,                                 -- 'QUOTE_VIEWED','LOGIN','CHECKOUT_CREATED', etc.
  meta jsonb, created_at timestamptz default now()
);
```

### RLS (outline)
- `quotes`: only visible to users in the same `org`, **or** the specific `customer_user_id` bound in `quote_access`.
- `quote_access`: only visible to org and that customer user.
- `materials_snapshot`, `labour_inputs`, etc.: same policy keying off the parent `quote`.

---

## Authentication & Session

### Customer Account Creation (Required)
- Contractor creates a quote → enters customer **email** (required).
- Server issues **customer invite**: email OTP/magic-link to create a password **or** complete passwordless with device binding (see below).
- On first login, the app binds:
  - `customer_user_id` to `quote_access.customer_user_id`
  - **Device fingerprint** (hashed: user-agent + platform + passkey presence + a first-party, httpOnly, sameSite=strict cookie ID)
- **Passkeys**: encourage WebAuthn passkeys during first login (UX prompt); this hardens against credential sharing.

### Session “Remember Me”
- Supabase refresh tokens with rotation; `remember=true` for 60–90 days.
- Device list visible to customer; customer or org can revoke devices.

### Device Binding & Re-Verification
- If a **new device** logs in:
  - Require **step-up verification** (email OTP or passkey) **and** alert the contractor (audit + notification).
- If device fingerprint **changes materially** (e.g., UA/os/major screen changes, or cookie missing):
  - Treat as new device → step-up verification.

> **Fail loud**: Any auth anomaly (invalid token, missing cookie, failed fingerprint match) → **HTTP 401/403** with a blocking error screen; no read-only previews.

---

## Anti-Sharing Controls (defense-in-depth)

1) **No public share links.** All quote URLs require authenticated session + **server-side authorization**.
2) **Single customer principal per quote** (`quote_access.customer_user_id`).
3) **Device binding**: first device trusted; new devices require re-verification and notify the org.
4) **Optional IP/geolocation heuristic**: large geo jumps trigger step-up verification (configurable).
5) **Watermark & metadata**: all on-screen and PDF views show the customer’s name/email and **view timestamp**.
6) **PDF export policy** (org setting):
   - `disabled` (default), **or**
   - `enabled_but_watermarked` (big diagonal watermark + footer with quote ID + customer email + org phone), **or**
   - `enabled_strict`: PDF files are **streamed** with short-lived signed URLs; downloads logged.
7) **Strict Stripe gating**: checkout session creation requires **active authenticated customer session** whose `customer_user_id` matches `quote_access` for that quote. Server **re-checks** before creating PaymentIntent.
8) **Rate limiting**: per customer per quote view (e.g., 60/min) to reduce scraping attempts.
9) **Contractor ACL**: Only users in the org with `role in ('owner','staff')` can read/manage quotes.

---

## “View Again” Notifications

### Definition
- “Initial meeting” is operationalized as: the **first customer-authenticated view** of a **customer_viewable** quote, which sets `quotes.initial_customer_viewed_at`.
- **Any subsequent customer-authenticated view** triggers `QUOTE_VIEWED_AGAIN` event.

### Event Flow
1) Customer opens quote (authenticated & authorized) → server records `audit_events(QUOTE_VIEWED)` with `meta` including `device_id`, `ip`, `ua`, `is_new_device`.
2) If `initial_customer_viewed_at` is null: set it and **do not** notify.
3) Else: enqueue `QUOTE_VIEWED_AGAIN` → Notifications Worker:
   - **Email** to assigned contractor(s) via SendGrid (template with project, timestamp, device info).
   - **Slack** via webhook to `#sales-pipeline`.
   - Optional **SMS** via Twilio for “hot” quotes.
4) **Noise controls** (server-side, not silent fallback): hard **cooldown** window of **10 minutes** (per quote) to avoid spam if the customer refreshes repeatedly. Views outside cooldown always notify.

> **Fail loud**: If notifications infrastructure is down, record an error `audit_events` **and show a red banner** in contractor UI (“We couldn’t send notifications for 1 event”). No silent retry loops in the request path; retries happen in the worker with backoff & dead-letter queue.

---

## API Contracts (selected)

**GET /api/quotes/:id**
- Auth: contractor in org OR `customer_user_id` bound to quote
- Errors: 401/403 if not permitted; 410 if quote expired; 423 if quote locked
- Side-effect: when `actor_role='customer'`, logs `QUOTE_VIEWED` and possibly emits `QUOTE_VIEWED_AGAIN`

**POST /api/quotes/:id/checkout**
- Auth: customer only (must match `quote_access.customer_user_id`)
- Pre-conditions (all must pass or **412 Precondition Failed**):
  - `quotes.status IN ('customer_viewable','reserved')`
  - `materials_snapshot.priced_at` is **fresh** (<= 24h) and `sdk_version` **compatible**
  - `grand_total_cents > 0`, `deposit_required_pct > 0`
- Returns: Stripe Checkout Session URL
- Errors: 403 (wrong user), 412 (stale pricing), 409 (already paid), 424 (Stripe error—bubble message)

**POST /api/quotes/:id/pricing/materials/refresh**
- Auth: contractor only
- Action: calls design pricing adapter; **no cache** if adapter fails → **424 Failed Dependency** (loud).
- On success: upserts `materials_snapshot` with version/signature.

**POST /api/customers/invite**
- Auth: contractor
- Creates or reuses `users` record for customer; sends email OTP / magic link; binds to quote on first login.

---

## Design Pricing Adapter (read-only)

Two equally valid integration options:

**A) SDK (preferred for speed)**
- Publish `@cloudreno/design-pricing` from the design-library repo.
- Surface stable functions:
  - `priceDesign(config): Promise<{ subtotalCents: number, items: Item[], catalogVersion: string, signature: string }>`
  - `getDefaultDesign(level: 'budget'|'mid'|'high')`
- The SDK **must not mutate** or require design-library DB access from the quote app.

**B) HTTPS API (strong isolation)**
- `POST /pricing/price` with `config` payload, returns same shape as above.
- Rate limited; versioned path, e.g., `/v1/pricing/price`.

> **Fail loud** rule: If pricing call fails or returns stale/incompatible version, the UI shows a blocking error; **no stale snapshot fallbacks** for accepting deposits.

---

## UI/UX Constraints (what the customer experiences)
- **Always authenticated**: hitting a quote URL without a valid session redirects to login; after login, the server re-validates authorization.
- **No read-only pre-login previews**.
- **Watermark visible** at all times (customer name/email + timestamp); **Download** button may be disabled by org policy.
- When a blocking error occurs (auth, pricing, Stripe): show a **full-screen error** with a short human message and a unique error code (maps to logs).

---

## Error Handling & “Fail Loud” Matrix

| Area | Example Failure | Behavior |
|---|---|---|
| Auth | Missing/expired token, device mismatch | 401/403; full-screen error; event logged |
| Authorization | Customer tries to view another customer’s quote | 403; event logged with actor & IP |
| Pricing | Adapter fails or version/signature mismatch | 424; block totals; contractor-only “Refresh” action; event logged |
| DB | RLS denies, or write conflict | 409 or 500; block action; event logged |
| Stripe | PaymentIntent/Checkout error | 424; no deposit; event logged |
| Notifications | Worker down / provider error | Event logged; red banner in contractor UI; worker retries with backoff |

All errors: include `X-Request-Id` in response; Sentry captures full context (no PII in breadcrumbs).

---

## Security Controls
- **RLS everywhere**; no broad service-role keys used client-side.
- **JWT claims** include `org_id`, `role`, `is_customer`.
- **CSP**: script-src self; frame-src only Stripe; disallow mixed content.
- **Signed URLs** for any file assets (PDFs, exports).
- **Brute-force/OTP** throttling via Supabase rate limits.
- **Audit immutability**: `audit_events` insert-only.
- **PII**: store **hashed** email in `quote_access.email_hash` for quick checks; full email only in `users`.

---

## Deployment & Monorepo Strategy
- Monorepo **workspaces**:
  - `apps/quote-app` (Next.js) → deploy to Vercel (or your host)
  - `apps/design-library` (unchanged deployment)
  - `packages/design-pricing-sdk` (published as a versioned package)
  - `packages/pricing-core` (labour engine only)
- **Independent CI** jobs per app; **no shared migrations**.
- Quote app uses its **own Supabase project or schema** with isolated migrations.
- Feature flags & environment variables namespaced per app.

---

## Notifications
- **SendGrid**: transactional template `quote_viewed_again` with variables: quote id, project address, viewed_at (customer local & org local), device info (trusted/new), link to open in contractor dashboard.
- **Slack**: webhook payload with compact summary and a one-click deep link.
- **SMS (opt-in)**: Twilio message to assigned rep.

---

## Observability
- **Sentry** for FE & BE.
- **Structured logs** (pino) with `request_id`, `user_id`, `quote_id`, `org_id`.
- **Metrics**: counts of logins, new-device logins, view-again events, blocked errors by type.
- **Alerts**: error-rate threshold, notification-worker backlog, pricing-adapter 4xx/5xx rate.

---

## QA / Test Scenarios (minimum)
1) Customer can’t access without login (expect 302→login; after login, 200).
2) Customer with one quote cannot access another quote (403).
3) New device login triggers step-up verification + contractor notification.
4) View-again after initial view sends notification (and respects 10-min cooldown).
5) Pricing adapter down → block totals and checkout with a 424; no stale fallback.
6) Stripe failure → 424 + no status change.
7) PDF export disabled → no UI entry point + server 403 if hit directly.
8) RLS regression tests: org isolation, customer-only access to bound quote.
9) Monorepo: deploy quote app changes without touching design-library; verify independent build artifacts.

---

## Rollout Plan
1) Ship **customer-login-only** portal with one quote binding & device binding; PDF export disabled.
2) Enable notifications worker (email + Slack).
3) Add optional SMS.
4) Consider passkeys “required” toggle at org level once adoption is smooth.

