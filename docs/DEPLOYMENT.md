# Complete independent deployment

These steps create new resources. Nothing in this archive accesses the original owner's resources or transfers existing users/records.

## 1. Cloudflare

Create a Cloudflare account, then from this project:

```sh
pnpm install --frozen-lockfile
pnpm exec wrangler login
pnpm exec wrangler d1 create cryptoblock-db
```

Copy the returned **database_id** into `wrangler.jsonc`. Choose a unique Worker name and R2 bucket name if needed. The all-zero ID is a local-development placeholder, not a production database.

Activate R2 through its subscription checkout, review billing, then:

```sh
pnpm exec wrangler r2 bucket create cryptoblock-backups
pnpm db:remote
```

`DB` and `BUCKET` binding names must remain unchanged. Keep R2 private; do not enable its public access. D1/R2 usage and Workers CPU limits apply even with small visitor counts. There is no always-free guarantee.

## 2. Supabase Auth

Create your own Supabase project. Get its Project URL and **enabled publishable key** from project API settings. Never place a service-role, secret/admin key or SMTP credentials in frontend files.

```sh
pnpm exec wrangler secret put SUPABASE_URL
pnpm exec wrangler secret put SUPABASE_PUBLISHABLE_KEY
```

Enter each value at Wrangler's prompt. For local development put the same two values in ignored `.dev.vars` using `.dev.vars.example` as the format. Production secrets are not read from your local file.

In Supabase Authentication > URL Configuration:

- Site URL: your actual HTTPS Worker domain.
- Allow redirects to `https://YOUR-DOMAIN/auth/confirm` and `https://YOUR-DOMAIN/auth/confirm?recovery=1`.
- For local testing, allow the equivalent callback URLs on the exact localhost origin/port Vite prints; do not use broad production wildcards.

Keep email confirmation enabled and configure your own SMTP provider before public registration. Supabase's default sender only delivers to organization-team addresses; it is not a public production email service. Test confirmation, recovery, expired links, login/logout and a second device before announcing the app.

### Account deletion

Deploy `supabase/functions/delete-own-account/index.ts` to **your own** Supabase project using its Edge Function editor or Supabase CLI. If using the CLI, install the official CLI, inspect its current help, link your project, then deploy `delete-own-account` with gateway JWT verification disabled (`--no-verify-jwt`). This function performs its own server-side `GET /auth/v1/user` verification, current-password verification and same-user checks before revoking sessions and deleting the identity. Gateway verification is not used because modern Supabase signing keys require this explicit verification path.

The function uses Supabase-provided server environment variables; do not copy its service-role key into the Worker or browser. Negative tests must reject missing/invalid credentials. Do not test deletion on a real account containing needed data. This function is required for the application's Delete account control; login itself does not need it.

## 3. Build and publish

```sh
pnpm test
pnpm build
pnpm deploy
```

The Cloudflare Vite plugin generates `dist/server/wrangler.json`. Deploy that generated config as the package script does; **do not deploy the unbuilt TypeScript worker directly**. The generated config includes the built entry and static assets. After editing the original config or bindings, rebuild.

For Cloudflare Git integration, connect this GitHub repository, set build command `pnpm build`, deploy command `pnpm deploy`, and set the same bindings/secrets in the selected Worker. Provision/apply migrations before the first deployment. Review the deployment log and resource configuration.

## 4. Background maintenance

`wrangler.jsonc` declares `10 * * * *` (minute 10 of each UTC hour). Its internal Worker `scheduled()` handler records a bounded batch of forecasts, reconciles due outcomes, checks one-shot in-app alerts and creates the daily R2 snapshot. The hosted ChatGPT automation is **not** needed or copied. Enable just one scheduler for this independent deployment.

The public `/mcp` writer is disabled on independent hosting: callers must not be able to forge platform identity headers. There is no public HTTP maintenance-write endpoint. Cron is provisioned by deployment; check Cloudflare Cron events/logs and `/api/maintenance` afterward. A saved cron expression alone does not prove a successful run. Inspect persisted counters and errors.

If a provider is blocked or a model cannot run within the selected plan, maintenance reports failure/unavailable; it does not invent forecasts or outcomes. Upgrade compute or redesign/offload the calculation before claiming a reliable deployment.

## 5. Smoke checklist

- `/` and chart assets load; live and demo are distinct.
- `/api/auth` returns configured:true after secrets are deployed; guest `/api/account` returns 401.
- Foreign-Origin account writes return 403; a forged `oai-authenticated-user-id` cannot run `/mcp` (404).
- Sign up/confirm/login, save a watchlist and drawing, sign out, log in on a second device; verify isolation between two disposable accounts.
- Password recovery returns to the correct HTTPS domain; secrets never appear in HTML or Git.
- Live exchange feeds, forecast recording and sourced news work in the target hosting region.
- After Cron runs, check `/api/maintenance`: completed run, forecast/error counters and backup status. Wait for real due dates to verify prospective accuracy.
- Test mobile Safari and Chrome, chart gestures, text contrast and account dialogs.

## 6. Limits and data migration

- Workers Free: 100,000 requests/day, 10 ms CPU per invocation; the CPU limit is a material concern for this model. D1 also limits reads, writes and size. Verify with actual deployed workload.
- R2 has included monthly usage, subscription checkout and overage charges. Public/free viral traffic is not unlimited.
- Supabase Free may pause after low activity; SMTP has independent limits and possible charges.
- GitHub Pages serves static content only. Vercel/Netlify/Render do not directly supply this app's `cloudflare:workers`, D1 and R2 runtime bindings; a migration is required to use a different backend.
- User JSON exports can import supported watchlists/drawings after creating a new account, but this is not a full automatic transfer of users, alerts or all settings. Supabase IDs and D1 ownership mappings need a deliberate migration plan. Never publish personal backups in Git.

Official references (checked 2026-10-23):
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/r2/get-started/
- https://developers.cloudflare.com/r2/pricing/
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/deployment/going-into-prod
