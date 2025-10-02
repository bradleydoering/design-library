# Quote App Authentication Debugging Log (living doc)

This document chronicles the authentication issues observed in the Quote App, the changes made to fix them, and persistent gaps that future developers should know when working on auth. It intentionally captures context, failed experiments, and the rationale behind decisions to avoid repeating the same loops.

## Goal

- Provide a robust, simple, end-to-end authentication flow where:
  - New users sign up → verify email → land on `/dashboard` already signed in
  - Existing users sign in reliably (optionally “remember me”)
  - Password reset links work and land in a signed-in state (or as required)
  - Contractor profile is guaranteed (present + `status = active`) before the dashboard renders

## Environment & Key Dependencies

- Next.js App Router (`apps/quote-app`)
- Supabase JS SDK v2
- Email delivery via SendGrid (SMTP)
- Database table: `contractor_profiles` (app-level profile for authenticated users)
- Service Role key available in `.env.local` for server mutations

## Symptoms We Saw

- Verification links landed on pages without establishing a client session (e.g., links with URL hash tokens `#access_token=...&refresh_token=...`) → stuck on a spinner or bounced to `/login`.
- Hydration errors on `/dashboard` (“Expected server HTML to contain a matching <div>…”), especially around auth gating components.
- API routes used `window.location` (server env) → runtime errors.
- `setSession()` in the verify page occasionally hung or double-ran (Strict Mode) → 401 after code consumed once.
- Users authenticated (SIGNED_IN reported) but were redirected to `/login?error=no-profile` because `contractor_profiles` was missing.
- Duplicate profile creation attempts during signup → unique constraint violations; some profiles remained `pending`.
- 401 in console from `contentOverview.js` (likely a browser extension; not from app APIs).
- SendGrid branded-link HTTPS warning (TLS on click-tracking domain), occasionally breaking the redirect to local.

## Design Constraints (Supabase specifics)

- Supabase email links may arrive in two shapes:
  - Code links: `?code=...` (exchange server-side for a session)
  - Hash-token links: `#access_token=...&refresh_token=...` (set client-side session via SDK)
- Tokens are single-use; double-calls in dev (Strict Mode/HMR) can cause a 401 on the second attempt.
- Client SDK needs a memory/local session even if server cookies exist; HttpOnly cookies alone don’t initialize the browser SDK state.

## Timeline of Changes & Experiments

1) Hardening basic routes and pages
- Fixed API routes to stop using `window` on server; switched to env/headers for `redirectTo` base URL.
- Verify page initially parsed hash tokens and called `supabase.auth.setSession` with timeouts; reset-password page updated to parse hash tokens too.
- Wired resend verification in the smart login form.

2) Introduced SSR-friendly Supabase clients
- Added `@supabase/ssr` clients (browser + server) and middleware to refresh cookies and support “remember me”.
- This helped SSR but didn’t fully solve client SDK initialization after email links.

3) Hydration fixes
- Removed mismatched top-level client-only wrappers; ensured auth-gated routes render an identical shell until mounted.
- Updated `ProtectedRoute` to avoid shape changes during hydration.

4) Pivot to canonical server callback
- Added `/auth/callback` (server route) to `exchangeCodeForSession(code)` once, ensure profile (service role), and redirect to the dashboard.
- Simplified `/auth/verify` to a “check your email” page.
- Updated all `redirectTo` targets (signup/resend/reset) to point at `/auth/callback`.

5) Bridging the client session
- Realized the browser Supabase client needs tokens in memory; server cookies aren’t enough.
- Added a client bridge: initially `/auth/bridge` (page) that read hash tokens → `setSession()` → navigate.
- Observed navigation stalls in dev/HMR; added logging, hash clearing, and fallback hard redirects.

6) Global token hash catcher
- Added `TokenHashBridge` rendered in layout. It:
  - Detects hash tokens on any route
  - Calls `supabase.auth.setSession`
  - Ensures profile via service role endpoint
  - Clears the hash and navigates to a safe destination (defaults `/dashboard`)

7) Profile guarantee & ProtectedRoute behavior
- Added `/api/auth/ensure-profile-client` (service role) to get-or-create + activate `contractor_profiles`.
- `AuthContext` now calls ensure-profile client-side if session exists but profile is null (one-time fallback).
- `ProtectedRoute` no longer redirects on `user && !profile` — it shows a loading state, letting ensure-profile complete.

8) Removed profile creation during signup
- Creating the profile at signup caused duplicate key errors and left `status = pending` if verification flow failed to upgrade it. We now rely solely on post-verification ensure/activation.

9) Callback fallback for hash links
- `/auth/callback` now redirects to `/auth/bridge` (instead of `/login`) if `?code` is missing, so fragments are processed in a dedicated place.

## Current Known States

- SIGNED_IN events appear in the console and Supabase tokens are present in `localStorage` after hash-link flows.
- Inconsistent navigation from `/auth/bridge` was reduced by clearing hash, replacing history, and using `window.location.assign` with fallbacks. The global `TokenHashBridge` further reduces reliance on a single page.
- Contractor profiles are now ensured either server-side (code links) or client-side (hash links) and should be set to `active` before dashboard content is enforced.

## Persistent/Recurring Problems Observed

- Links landing on `/login` with a hash fragment can be confusing; earlier, we redirected to `/login?error=missing-code` (now changed to `/auth/bridge`).
- Dev/HMR/Strict Mode sometimes triggers double effect runs; code that exchanges tokens must be idempotent and guarded.
- Some dev machines/extensions produce stray 401s in the console (`contentOverview.js`) not tied to the app; noise during debugging.
- SendGrid branded links with HTTPS issues can break redirects; the simplest fix in dev is to disable click-tracking or use the raw link.
- RLS for `contractor_profiles` means the app client must read via authenticated session; for writes/activation, service role APIs are required.

## Why some attempts didn’t help (post‑mortem)

- Early redirect on `user && !profile`: The app bounced to `/login?error=no-profile` before ensure-profile could run. This created the impression that profile creation was failing, when the logic was never reached.
- Creating profile at signup: Duplicates and race conditions led to `duplicate key` errors and stuck `pending` status. The fix is to defer all profile creation/activation to post-verification.
- Relying on server cookies alone: The client SDK needs a session in memory (localStorage in our current setup). Without feeding the tokens into the client SDK, authenticated reads and listeners won’t behave as expected.

## Canonical Flow (target state)

- Code-link emails (preferred):
  1) User clicks email `?code=...`
  2) `/auth/callback` exchanges code server-side → sets cookies
  3) Callback ensures/activates `contractor_profiles`
  4) Redirect to `/dashboard`

- Hash-link emails (alternate):
  1) User clicks email with `#access_token=...&refresh_token=...`
  2) Layout’s `TokenHashBridge` detects it on any route
  3) Client sets session via `supabase.auth.setSession`
  4) Client calls `/api/auth/ensure-profile-client` to create/activate
  5) Hash cleared, navigate to `/dashboard`

- Password reset:
  - Use `/auth/callback?type=recovery` to guarantee session, then `/auth/reset-password` to change password.

## Configuration Checklist

- Supabase Auth Redirect URLs must include: `http://localhost:3333/auth/callback` (and prod eq.)
- `.env.local` (apps/quote-app):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3333`
- SendGrid (dev): consider disabling click tracking to avoid TLS/click-redirect issues.

## Recommendations for Future Work

- Prefer code-link flow everywhere: ensure all auth emails use `redirectTo=/auth/callback` so server callback handles session + profile without client bridging.
- If keeping hash support, keep `TokenHashBridge` minimal and idempotent (guards against re-entry, Strict Mode, HMR).
- Consider moving dashboard profile fetch server-side (using a server client) instead of from the browser; return a consolidated server payload. This reduces flicker and client gating.
- Add lightweight server logging for auth callback and ensure-profile calls (local only) to make future triage faster.
- E2E sanity tests for auth (local): signup → verify → dashboard, resend verify, password reset path.

## Quick Triage Guide

- Hash shows in URL on any page → expect `TokenHashBridge` to run. If you don’t see network `POST /api/auth/ensure-profile-client`, profile won’t be present; look for console errors.
- Redirected to `/login?error=missing-code` → should no longer happen; `/auth/callback` now forwards to `/auth/bridge` when `code` is missing.
- “No contractor profile found” → check Network for `ensure-profile-client` and confirm RLS/service role env; verify that `ProtectedRoute` is not redirecting on missing profile.
- Verification link HTTPS warning → disable SendGrid click tracking or copy the raw link during local dev.

## Files Most Relevant to Auth

- `src/contexts/AuthContext.tsx` — session tracking, profile ensure fallback
- `src/components/auth/ProtectedRoute.tsx` — gating behavior, loading vs redirects
- `src/app/auth/callback/route.ts` — server-side exchange and ensure profile (code links)
- `src/components/TokenHashBridge.tsx` — client-side session + profile ensure (hash links)
- `src/app/api/auth/ensure-profile-client/route.ts` — service role endpoint to create/activate profile

## Status

- The flow is now resilient in both code-link and hash-link scenarios without premature redirects.
- If a regression occurs, validate Redirect URLs in Supabase, confirm service role env, and verify that `ensure-profile-client` is called (Network tab) when landing via hash links.

---

This is a living document — append findings, logs, and hypotheses as you debug. The most frequent pitfalls have been premature redirects (before profile exists), relying on only one of the two Supabase link shapes, and not initializing the browser SDK session.
