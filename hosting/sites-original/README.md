# CryptoBlock — current architecture

CryptoBlock now runs on the Sites Vinext/Cloudflare Worker starter with a D1 database for permanent forward prediction records. The existing dashboard is preserved under `public/radar/` and displayed by the root page. API routes live under `app/api/predictions/`; `lib/history-service.js` owns server verification, record creation and outcome reconciliation.

Run `node --test *.test.mjs` for 32 model/range/ledger tests. Build with the Sites skill build helper. Database schema is `db/schema.ts`; inspect generated SQL and Drizzle metadata under `drizzle/`. Local D1 and hosted D1 are separate. Hosted migrations apply during publication.

## Prediction history

Opening a live coin requests server-computed 2/3/7-day forecasts from independently fetched exchange daily history. Records are immutable and deduplicated by model version, coin, horizon and UTC origin. Caller-supplied prices or forecasts are never stored. The API returns the stored snapshot on repeat openings. The target time remains the model's last completed UTC daily close plus its horizon; both issue time and reference time are visible.

History checks up to 12 due records when opened/refreshed, comparing against the exact daily candle that ends at each target time. It catches up after the site has been closed. There is no continuously running scheduler or notification system. Source failures remain Awaiting exchange data and never count as correct. Newly generated predictions are never backdated to create an impressive past track record. Earlier browser-only forecasts are not imported. Synthetic demo forecasts do not enter D1.

Live direction accuracy uses only completed non-flat directional tests, separately for 2/3/7 days. MAE in percentage points, unchanged-price baseline error and interval coverage are shown alongside counts of saved, completed, pending and awaiting-data records. API results are public/shared like the rest of this site's market data; no personal portfolio or user identity is stored. Summaries cover the full filtered ledger and the table shows the latest 200 rows. These prospective live results are separate from the model's historical backtesting.

If server exchange access fails but the visitor's browser can fetch data, a local forecast may still be displayed with an explicit Not saved warning. It is excluded from live accuracy. Only the server verified records are eligible. No completed results exist at launch, and future-directional accuracy cannot be validated until real target dates pass.

Verification: 32 tests, in-memory SQLite migration/trigger checks, local D1 migrations, DOM simulation of completed/pending rows, and real browser verification of history API and honest empty state passed. No fake outcome data was inserted in the production database. Exact real-market recording/outcome retrieval is subject to exchange availability.

---

# Earlier implementation notes (historical; current architecture above supersedes buildless paths)

# CryptoBlock — graphical crypto scanner

Graphical market radar and ranked rule-based setups inspired by the observed Order-Block workflow. Independent implementation; the private scoring algorithm is not reproduced.

## Run / publish
Buildless ES modules in `dist/`. Serve over HTTP. Existing Sites manifest preserves the private owner audience. `node --test scanner.test.mjs` verifies closed-candle handling, readiness invariants, and Bybit parsing.

## Data
Bybit public linear USDT ticker REST initializes 24 configured markets. Three concurrent candle requests warm 300 bars. WebSocket tickers and klines maintain prices and closed-candle decisions. Opening a coin subscribes to public trades and top-50 depth. Snapshot/delta book updates are applied locally. Data is exchange-specific, not an aggregated global market.

Public endpoints require network/region access from the visitor's browser and support for CORS/WebSockets. No exchange API keys or account access are used. Runtime disconnection/staleness disables Ready. Synthetic demonstration mode is explicit, manually selected, and cannot be mistaken for live data. Demo assets outside the original 12 use illustrative series and values.

VWAP resets at UTC midnight; delta covers only the detail-open session. Funding and OI are exchange-provided context. Order-block zones, trend, volume ratios, swing targets, risk/reward and scores are calculated in `scanner.mjs` and `engine.mjs`. The methodology dialog describes thresholds. A score is not an accuracy percentage. No profitability or win-rate claim is made.

## REA reference
REA was installed and used for the public reference HTML inspection. Prior evidence and limitations remain in `research/rea-inspection-summary.json`. No private source or backend scoring rules were recovered. This rebuild follows observable interface/workflow behavior, not recovered proprietary code.

## Verification limits
Node syntax checks and scanner tests passed. Live API access from the development environment returned a Site Unavailable HTML response; live connectivity remains unverified. Browser visual QA was unavailable under the required Sites managed workflow because the control-browser skill was not available.

## Buying/selling volume bars
Cards, ranked candidates and detail panels show taker-buy versus taker-sell base-volume percentages. `flow.mjs` normalizes REST and WebSocket execution fields and deduplicates execution IDs. It retains the latest up to 1,000 executions observed within five minutes. Each sample displays its count and duration. This is not a complete historical five-minute aggregation, count of unique traders, account long/short ratio, or prediction probability. Empty samples do not show a ratio; old samples are marked stale. Synthetic demo values are labelled illustrative. `flow.test.mjs` tests weighted ratios, overlapping REST/stream events, expiration, invalid data, and bounded retention.

Reference review: sequential one-second frames across the 112.99-second upload, with enlarged detail around 43 and 54 seconds. At 43 seconds EICHERMOT shows BULLISH, 97 and +4.17%; ANANDRATHI shows BEARISH, 97 and -4.68%. These visible labels do not establish unique-person buy/sell percentages. The requested taker-volume display is an independently defined feature.

## Reference-image layout update

The first uploaded reference shows a full-height daily normalized-price map and a current-change distribution strip. The second shows a green/red grid with horizontal volume-at-price profiles and expanded top-three feature cards. The third shows the hover detail panel; the fourth shows expanded shortlist charts. The layout now follows that structure.

- Live scan universe: top 60 USDT-ending linear contracts by 24h turnover at initialization.
- Today view: selected-timeframe candles beginning at 00:00 UTC and current last price. Missing daily-open history is excluded rather than inferred. This is price breadth/performance, not proof of capital inflow.
- Ranking: up to 20 buy-dominant and 20 sell-dominant fresh samples, ordered by respective taker base-volume share, with sampled USDT notional as tie-breaker. Do not pad a sparse list. Top three of each side get expanded charts.
- Market flow header: sampled execution-price × size notional summed across markets, separated by taker side. Samples cover different observed durations and are not a complete daily flow estimate.
- Volume profiles: price-binned executed taker volume from the same observed sample. Green buy volume extends left and red sell volume right. This is not resting order-book depth or daily volume profile.
- Hover opens a non-modal preview after 450ms. Click or Pin chart opens the modal detailed view. Touch uses click; Escape/close dismisses it.

Validation: 15 engine/flow tests pass. DOM simulation verifies offline handling, demo 20+20 ranking rows, 40 profiles, six expanded cards, daily map and distribution, modal details, watchlist/filter changes, delayed hover and pin-to-modal behavior. DOM simulation does not validate browser layout or actual exchange connectivity. Prior managed browser QA limitations still apply.

## Focused radar and seven-day ML outlook

The radar adds a left category rail, endpoint-volume ladder, curved price paths, asymmetric layout by current price breadth, and focus/full scaling. Focus scale uses the 85th percentile of absolute endpoint changes, rounded up to half-percent units and bounded to 1–10%; curves beyond the bounds are clipped and marked with their true percentage. Full mode includes all endpoints. Category performance is an equal-weight average of available member daily returns. These are crypto groupings, not the reference's stock sectors. No part of the graph predicts a path. The ranking rail shows all rows without overlapping sticky headers. The scan universe is now restricted to the explicitly curated crypto base symbols in `radar.mjs`, so exchange-listed stocks/commodities do not enter the crypto radar.

`forecast.mjs` implements a mathematical ML model: standardized k-nearest historical analogues with seven-day outcomes. Opening a coin fetches up to 1,000 daily candles from the public exchange API, independent of the intraday timeframe. The model needs at least 210 consecutive completed daily bars. It uses 7/14/28-day log momentum, 14-day return volatility and gain balance, normalized daily range and relative volume. Training origins are spaced seven days apart, and each full forward label must be known at the query origin. It uses up to 730 prior days. Weighted median/10th/90th percentile analogue returns are displayed as point estimate/historical outcome range. The analogue up frequency is explicitly not a calibrated probability. The forecast horizon begins at the last completed UTC daily close, whose price and timestamp are shown, and ends seven days later. It predicts endpoint price, not maximum intraperiod upside.

Up to 26 non-overlapping prior weekly origins are evaluated using only earlier information at each origin. Metrics: directional hit rate, unchanged-price baseline MAE, model MAE in percentage points, always-up directional baseline, and empirical outcome-range coverage. The panel states No demonstrated edge unless at least 12 evaluation weeks exist and model MAE is smaller than unchanged-price MAE. This is a limited historical comparison, not statistical significance or evidence of future performance. Stale histories, API errors, gaps and insufficient data are reported. Synthetic demo forecasts are explicitly labelled.

Validation: 20 automated tests pass. Additional DOM simulation verifies forecast panels and chart, demo labelling, validation text, and category rail alongside prior interaction checks. No real-market forecast accuracy result is claimed from these implementation tests. Actual live history retrieval and visual rendering remain unverified in this environment.

Primary implementation references: Bybit V5 Get Kline documentation (D interval, up to 1000 rows) and scikit-learn time-series evaluation guidance (evaluate on future observations using earlier training data, not randomized splits).

## Click-only interaction, expanded views and stronger reference curves (18 October)

This update supersedes the earlier hover-preview behavior. Pointer hover highlights only a line; it cannot open a detail panel or start a forecast request. Detail panels open only through click/tap or Enter/Space on the graph's accessible controls. The pin-preview branch and hover event handlers have been removed.

The selector now describes a viewing range: 15 minutes, 1 hour, 4 hours, 1 week, 1 calendar month and 6 calendar months. Chart granularity is automatic: respectively 1m, 1m, 5m, 1h, 4h and daily candles. Warm-up history is fetched beyond the visible range so setup indicators do not operate on only 15 bars. The radar, price-change boxes, category performance and detailed charts normalize/filter against the selected range. This is separate from the explicitly labelled recent taker-volume sample used for buy/sell rankings. The seven-day forecast remains a separate daily-history model.

The one-second option is live trade-built OHLC, not unsupported historical exchange klines. REST recent trades seed the bars when available; public trade events maintain them. Up to two minutes of observed trade bars are shown, with no invented bars for seconds without trades. Duplicate execution IDs are ignored and OHLC opening/closing prices use execution event time, not arrival order. Order-block analysis in this mode remains based on one-minute closed candles and is labelled accordingly. Model estimates still use daily bars.

Reference styling: stronger green/red strokes, fixed physical stroke width via non-scaling vector effect, rounded joins and monotone cubic paths through sampled data. Interpolation preserves sampled prices and does not invent historical extrema. Hover adds a heavier highlight; it does not open a panel. Live price at an identical x-coordinate overrides an older candle endpoint.

Validation: 25 unit tests pass; DOM interaction checks verify that hover does not open details, clicks still do, every selector mode renders a map/detail chart, and forecast/watchlist/filters remain functional. Range tests cover month-end/leap-year calendar windows, visible-sample filtering, live second OHLC ordering/deduplication, and exact line endpoints. Compared sampled frames from both new uploaded recordings. Browser visual QA and actual live feed connectivity remain unverified in this execution environment.

## Evidence-based ranking explanations and 2/3/7-day outlooks

Opening a coin now places the ML forecast first, followed by a measured ranking explanation before metrics/chart. Explanations show sampled taker share, actual full-universe rank/top-three/top-20 qualification, base-coin buy/sell volume, trade count/time range, selected-range price movement, closed-candle trend/momentum/relative volume, and order-block conditions. Current rank is omitted if the sample is stale or unqualified. Filtered dashboard lists can narrow the universe; explanation ranks explicitly refer to the complete scan. Reasons are deterministic descriptions of measured factors, never invented personal motives, unique-participant counts, or unverified news catalysts.

The forecast horizon tabs select 2, 3, or 7 days. Each horizon is calculated independently from the same daily-history fetch, using horizon-specific forward targets, analogue spacing, and up to 26 earlier nonoverlapping validation periods. A short forecast is not obtained by dividing the weekly result. Existing forecastWeek/predictAt APIs retain a 7-day default for compatibility. Reference timestamps, error metrics, historical range and No demonstrated edge behavior apply separately at each horizon.

Validation: 28 tests pass. The DOM simulation checks the measured explanation, forecast placement before metrics, and all horizon tabs, alongside click-only interaction and seven viewing ranges. Tests do not establish actual forecast accuracy. Live history retrieval and browser visual layout remain unverified here.

### News and market research
Opening a live coin requests `/api/research?symbol=ETH`. The server scans recent publisher RSS, Google News RSS and selected official feeds, plus a separate Bybit 24h breadth comparison. Results include dated links, short source excerpts, topic tags and explicit source coverage. Responses cache for five minutes. No keys or paid search service are required. This is a limited evidence scan, not full-article investigative research or a causal model. Reports are attributed; absent evidence produces an explicit abstention. News is not incorporated into quantitative forecasts. Synthetic demo prices never receive real-news explanations.

### Market evidence and reference card
Coin details now start with data freshness/completeness checks, a consolidated setup card and annotated candles (order block, VWAP estimate, R1/R2/S1/S2, stop and target). Rule strength is not a success probability. Per-coin checks also appear on the ranking cards; gapped/insufficient candle history cannot report Ready.

`/api/intelligence` retrieves Bybit open-interest history, matching 1h price movement, account-position ratios, settled funding and Bybit/OKX recent trade samples. A browser-direct Bybit fallback is attempted when server egress cannot reach Bybit. Only exact matching completed hourly price/OI windows are classified. Venues and spot/perpetuals are shown separately with each sample's timestamps. No cross-venue notional is aggregated, and a limited recent trade sample is not represented as a full five-minute window. Liquidations subscribe to Bybit allLiquidation only while a live detail is open; totals are approximate notional at bankruptcy prices since opening, not historical global liquidation totals.

News research attempts up to three allowlisted direct publisher articles with redirects disabled and explicit per-article access status. Related-topic agreement across publishers is exposed as a lead, not independent verification. Missing news never generates an invented causal explanation. Forecasts still use historical prices rather than news.

The immutable prediction ledger now exposes performance by coin and horizon, including completed/sample counts, direction accuracy, endpoint error and an unchanged-price error baseline. Existing predictions/schema are preserved. Small samples are labelled; pending results are not counted as wins.

### Per-coin chart workspace
Each coin detail mounts an independent interactive OHLCV workspace. It retains its DOM during detail updates so annotations and zoom are preserved. Timeframes: observed 1s, 1m, 5m, 15m, 1h, 4h, daily, six-day aggregate, weekly, calendar monthly, plus a six-month daily view. Six-day buckets are anchored at UTC 1970-01-01; incomplete buckets are labelled. Other intervals use Bybit candle endpoints, with a separate public candle stream and heartbeat. Changing this chart does not change the dashboard's ranking window or its setup summary; chart overlays recalculate from the chart's closed candles. One-second charts use observed public trades and do not invent untraded seconds.

The chart includes base-coin candle volume, OHLCV crosshair, candle opening time/countdown, source-update age, pan/zoom/expand, optional EMA/VWAP/order-block/support-resistance overlays. Drawing tools support trend lines, horizontal levels, rectangular zones and notes, selected-object movement, endpoint adjustment, colour changes, note editing, deletion, undo/redo, and temporary price/percentage/time measurement. Drawings and preferred interval persist only in browser localStorage per coin, separately for live/demo. They are not synchronized to other devices, accounts or the shared prediction ledger.

### Accounts, tracking, alerts and recovery
Supabase email/password Auth is the chosen identity provider. Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as hosted environment variables; no Supabase service-role key is required. Set Supabase Auth Site URL to the deployed origin and allow `<origin>/auth/confirm` and `<origin>/auth/confirm?recovery=1` redirect URLs. Keep email confirmation enabled. Configure a production email provider/SMTP in Supabase for public signup/reset emails; its built-in test email service is limited. No credentials or real user accounts are created by deployment. Missing configuration disables authentication clearly and never falls back to trusting submitted IDs.

Supabase owns passwords; CryptoBlock exchanges/verifies sessions server-side and stores access/refresh tokens in HttpOnly SameSite cookies. Every private API derives the user ID from Supabase verification, never the request payload. Watchlists, drawings, cost assumptions and one-shot alert rules use D1 records scoped by the verified Supabase ID. Per-record versions prevent a stale device from silently overwriting newer saves. The Supabase Auth project can remain independent of the current site host, but the D1/R2 account data must also be migrated if hosting moves.

Guest drawing edits are session-only; signed-in live drawings save privately to the account. Demo drawings stay separate and local. Existing browser watchlists/drawings import only after the user presses Import. Account JSON backups can be downloaded and restored to the current account; restoration merges drawings and watchlists and does not reactivate alert rules.

The separate 1h strategy replay uses up to 500 closed candles, next-bar-open entries, no overlapping trades, 1x full-equity positions and a 48h maximum hold. It chooses the stop first for ambiguous bars and uses worse open prices on stop gaps. User-editable fees and slippage are charged per side; funding is a scenario estimate, not actual settled funding. Results are not the forecast accuracy ledger or prospective performance.

`run_market_maintenance` is an authenticated Site MCP tool. Each UTC-hour lease limits it to one bounded run. It rotates through 20 fixed major crypto symbols and attempts up to five missing daily-origin forecasts per run, verifies up to four due outcomes, samples one-shot in-app alert conditions and creates one daily ledger/account backup in private R2 storage. Publication enables the writer but does not by itself schedule it. An enabled linked hourly cloud task must call the tool while the browser is closed. Status is readable at `/api/maintenance`. Failures and unavailable source data are recorded without invented forecasts/results. Price conditions may move between hourly samples; retests use 15m closed candles and are not instant alerts. No emails or external messages are sent.

Shared prediction CSV export streams all rows at `/api/export?kind=predictions`. Authenticated users can export only their own private workspace at `/api/export?kind=account`; `/api/export?kind=backup` downloads the latest shared ledger snapshot. Private account snapshots in R2 have no public download endpoint. Daily backups remain subject to the hosting/storage quota; there is no automatic deletion/retention purge. Supabase Auth passwords and sessions are not backed up by CryptoBlock.
