# CryptoBlock

Open-source crypto market radar, interactive technical charts, sourced news context and a permanent forward-forecast track record.

Independent research software. No exchange account connection, real order execution or demonstrated profitability is claimed. Direction hit rate, price error and after-cost strategy replay are separate measurements. A high score is not a probability of profit.

## Included

- Up to 60 curated Bybit USDT perpetual markets; up to 20 buy-pressure / sell-pressure candidates and three highlighted per side.
- Taker-volume shares from observed executions—not the percentage of people buying/selling or total capital inflow.
- Click-to-open OHLCV charts, timeframe controls, drawing tools, volume, VWAP and order blocks.
- Support/resistance, EMA, SMA, RSI, MACD, Bollinger Bands, ATR, ADX/DMI, Stochastic, OBV and relative volume. Rule-based chart/candlestick candidates are labelled as candidates.
- Independent 15m/1h/4h/daily agreement, live spread/depth checks and hypothetical execution-impact estimates.
- Historical analogue forecasts for 2/3/7 days. Immutable original snapshots; outcomes checked only against the exact target daily close. Pending and missing outcomes never count as successes.
- Historical strategy replay with explicit cost assumptions, and sourced news/exchange context with coverage disclosure.
- Supabase email/password authentication. Private per-user watchlists, chart drawings, preferences and one-shot in-app alerts stored in D1.
- Prediction CSV export, private account exports, R2 backups, service-health status and hourly Cloudflare Cron maintenance.

## Architecture

Frontend: standalone browser ES modules in `public/radar/`, embedded by `app/page.tsx`. API: Vinext App Router on Cloudflare Workers. Data: D1 (`DB` binding); backups: private R2 (`BUCKET` binding). Auth: Supabase Auth, server-verified access tokens in HttpOnly cookies. Account data is in **D1, not Supabase Postgres**.

`hosting/sites-original/` contains original hosting entry files for provenance only. This export uses ordinary Cloudflare configuration without a ChatGPT subscription, Sites identity headers, Sites Git repository or ChatGPT scheduler. See [SOURCE_PROVENANCE.md](SOURCE_PROVENANCE.md).

## Local setup

Use Node 22.13+ (Node 24 recommended) and pnpm 11.25.0. Do not commit credentials or `.dev.vars`.

```sh
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars
pnpm db:local
pnpm dev
```

Open the local URL Vite prints. Guest market viewing/demo can be explored without Auth. For login, fill `.dev.vars` with your own Supabase URL and enabled publishable key. Until configured, account saving fails closed. External exchange access is subject to regional/network restrictions; the explicit synthetic demo is not live data.

```sh
pnpm test
pnpm build
pnpm start
```

The database command applies `drizzle/*.sql` in order, including immutable-forecast triggers. Local and production databases are separate. Do not edit old migrations after applying them.

## Deploy the complete app

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Cloudflare D1, R2, secrets, Supabase redirects/email, account-deletion function and Cron. **GitHub Pages alone cannot run the API, accounts, D1 or scheduled tracking.**

The closest fit is Cloudflare Workers + D1 + R2 and Supabase Auth. Free allowances exist, but this is **not a guarantee of free production operation**: Workers Free currently has a 10 ms CPU allowance per request, which the historical forecasting routines may exceed. R2 requires subscription checkout and bills overages. Supabase Free projects can pause for low activity; public signup requires custom SMTP. Check current provider terms before enabling services.

No exchange API credentials, paid LLM or OpenAI API key is needed by the current numerical forecast model. Each person deploying this project must create their own backend resources. An empty deployment starts with no forecast record; the live site's database/users are not bundled.

## Verification

78 automated calculation/security/ledger tests pass in the exported source. The independent Cloudflare build and migrations are validated locally; remote deployment, live feeds and delivery of signup emails still require deployment-owner setup and testing. No future forecast accuracy is established by implementation tests.

One-second charts use observed trade bars, which may omit empty seconds; technical indicators are intentionally limited to regular 1m-or-higher bars. Indicators wait for sufficient contiguous closed history. Synthetic demo data is clearly labelled and excluded from the prospective ledger.

## Open source

MIT for project-authored code; preserve [LICENSE](LICENSE) and third-party notices. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md).

This is not affiliated with Order-Block.com, TradingView, Bybit, OKX or Supabase. REA was used as a public-page inspection tool, not as a bundled runtime or a recovered private algorithm.
