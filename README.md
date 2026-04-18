# ColdCraft

Free AI cold email generator — paste product + prospect details, get 3 personalised variants (Problem-Solution, AIDA, Pattern Interrupt) in seconds. 3 free/day, €19/mo or €149/yr Pro.

Live at https://coldcraft.rgwnd.app.

## Stack

- **Next.js 16** (App Router, standalone output) · **React 19** · **TypeScript 5**
- **Postgres** for free-tier rate limiting (single `usage` table)
- **Stripe** subscriptions (checkout + webhook)
- **Claude CLI** via `CLAUDE_CODE_OAUTH_TOKEN` — not the Anthropic API
- **Vitest** + **GitHub Actions** CI

> **Architecture note:** The app shells out to the `claude` CLI using a Claude Pro/Max subscription OAuth token, not the Anthropic SDK. This is a deliberate billing choice. See `src/lib/claude-cli.ts`.

## Required environment variables

Put these in `.env.local` for dev, `.env.production` in the container:

| Variable | Purpose |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Auth for the Claude Pro subscription |
| `DATABASE_URL` | Postgres connection string |
| `PRO_TOKEN_SECRET` | HMAC secret for the signed Pro cookie (required in production) |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Verifies `/api/stripe/webhook` payloads |
| `NEXT_PUBLIC_BASE_URL` | Base URL used in checkout success/cancel redirects |

## Local development

```bash
npm install
# populate .env.local with the vars above
npm run dev       # http://localhost:3000
npm test          # vitest
npm run lint
npx tsc --noEmit
```

The `claude` CLI must be on your `$PATH` (`npm install -g @anthropic-ai/claude-code`).

### Postgres for integration tests

```bash
docker run --rm -d --name cc-test-pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres postgres:16
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres npm test
```

## Docker / deployment

The container installs `@anthropic-ai/claude-code` globally at build time, so `claude` is on `$PATH` at runtime.

On the production host, pull latest and redeploy with:

```bash
git pull
npm run deploy
```

`npm run deploy` stamps `GIT_SHA` (short commit) and `BUILD_AT` (UTC timestamp) into the image as build args, then runs `docker compose build && docker compose up -d`. Verify afterwards by calling:

```bash
curl https://coldcraft.rgwnd.app/api/version
# → { "sha": "<short-sha>", "builtAt": "...", "nodeEnv": "production" }
```

Requires the external Docker network `infra_network` to exist.

## Project layout

```
src/
  app/
    api/
      generate/       Claude CLI shellout for 3-email generation
      scrape/         URL → product info via claude CLI
      stripe/         checkout, webhook, session lookup
      verify-pro/     Stripe lookup → signed Pro cookie
  components/         EmailGenerator, UpgradeModal, PricingSection
  lib/
    claude-cli.ts     Async spawn wrapper around `claude -p`
    db.ts             pg Pool + initDb
    pro-token.ts      HMAC sign/verify for Pro cookie
    schema.sql        Single DDL
instrumentation.ts    Runs initDb once at server boot
docs/plans/           Design + implementation plans
```

## Plans & design

- `docs/plans/2026-04-17-v0.2.0-hardening-design.md` — v0.2.0 hardening design
- `docs/plans/2026-04-17-v0.2.0-hardening.md` — v0.2.0 implementation plan
