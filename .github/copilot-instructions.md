# Copilot / AI Agent Instructions for Ocasion

This file gives concise, project-specific guidance for AI coding agents to be productive immediately.

**Big Picture**
- **Framework**: This is a Next.js (App Router) + TypeScript project (`next@16`, `react@19`). App pages live in `app/`.
- **Frontend / Backend split**: UI lives in `components/` and `app/` (server & client components). HTTP API routes are Next app routes under `app/api/*`.
- **Data & payments**: Supabase is the primary DB/auth/store; Stripe handles payments and webhooks. The app ties them together via server routes.

**Key integration points (read before changing behavior)**
- `lib/supabase/client.ts` and `lib/supabase/server.ts`: wrappers to create Supabase clients. Use `createClient()` in client components and `await createClient()` in server code.
- `lib/stripe.ts`: single Stripe SDK instance using `process.env.STRIPE_SECRET_KEY`.
- `app/api/checkout/route.ts`: creates a booking in Supabase, starts a Stripe Checkout session, then writes `stripe_session_id` to the booking.
- `app/api/webhooks/stripe/route.ts`: Stripe webhook endpoint; on `checkout.session.completed` it marks the booking `confirmed` in Supabase.
- `supabase/schema.sql`: contains DB schema including `bookings.stripe_session_id` (useful when changing booking/payment fields).

**Important front-end / domain code**
- Budget calculator: `components/calculator/BudgetCalculator.tsx` (client component using `use client`).
- Hook: `hooks/useBudgetCalculator.ts` wraps the Zustand store and the pricing engine.
- Pricing logic: `lib/utils/pricing-engine.ts` — single source of truth for how totals, fees and min-spend are calculated. Tests and UI rely on its outputs.
- State store: `lib/store/calculator.ts` (Zustand) — small, local store for the calculator UI.

**Conventions & patterns**
- Server vs Client: Files using React hooks or browser-only APIs are marked with `'use client'` (e.g., `BudgetCalculator.tsx`). Default components under `app/` are server components.
- API routes are Next app-route handlers in `app/api/*` and return `NextResponse` or JSON. Keep network and DB work in these server routes.
- Supabase server usage expects cookie access (`next/headers`) — `lib/supabase/server.ts` uses `cookies()` and `createServerClient`.
- Pricing changes: update `lib/utils/pricing-engine.ts` first, then UIs (`components/...`) and the checkout flow to ensure consistency.

**Environment variables (local dev)**
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- The repo includes `.env.local` locally — do NOT commit secrets. Webhook secret is required for `app/api/webhooks/stripe/route.ts` to verify signatures.
- Note: `app/api/checkout/route.ts` builds `success_url`/`cancel_url` using `NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co','') || 'http://localhost:3000'`. When running locally ensure this resolves to your frontend domain or update the logic.

**Developer workflows**
- Run dev server: `npm run dev` (starts Next dev at `http://localhost:3000`).
- Build: `npm run build` and run: `npm run start`.
- Lint: `npm run lint` (project uses `eslint`).
- Stripe webhook testing: use the Stripe CLI to forward events and set `STRIPE_WEBHOOK_SECRET` to the signing secret (important for `stripe.webhooks.constructEvent`).

**When editing payments or bookings**
- Update `supabase/schema.sql` first (if DB changes needed), then update server routes: `app/api/checkout/route.ts` and `app/api/webhooks/stripe/route.ts`.
- Keep the booking lifecycle in mind: booking is created with `status = 'pending_payment'`, Stripe session is created, the webhook marks `confirmed`.

**Files to inspect for context when making changes**
- `app/api/checkout/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `lib/stripe.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`
- `lib/utils/pricing-engine.ts`
- `components/calculator/BudgetCalculator.tsx`, `hooks/useBudgetCalculator.ts`, `lib/store/calculator.ts`
- `supabase/schema.sql`

**Examples (copyable snippets)**
- Create server supabase client: `const supabase = await createClient()` (from `lib/supabase/server.ts`).
- Create Stripe session: see `app/api/checkout/route.ts` — call `stripe.checkout.sessions.create(...)`, then save `session.id` to `bookings.stripe_session_id`.

If anything here is unclear or you'd like more detail about a specific area (auth flows, bookings schema, or testing Stripe webhooks locally), tell me which part and I'll expand or adjust this file.
