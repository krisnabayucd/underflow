# Underflow

Private onchain research dashboard. Built with React, Vinext, Cloudflare Workers and D1.

## Data flow
`POST /api/radar` fetches public DefiLlama protocol, fees, and protocol-revenue datasets; DEX Screener reference pairs; recent public RPC activity. It persists one snapshot in D1. `GET /api/radar` reads the latest snapshot. A five-minute server cooldown reduces repeated requests. Up to 180 snapshots are retained. Failed sources retain their own previous successful values and timestamps, marked stale. A protocol-index outage retains the previous joined protocol rows. Missing values in a successful response remain unknown. Snapshots use gzip/base64 with backward-compatible reads of existing JSON rows.

The open dashboard polls every four hours. Background execution is enabled every four hours (00/04/08/12/16/20 WIB) using a linked Sites automation calling the same POST endpoint, then reading GET to verify the timestamp. Owner-private access is enforced by the Sites platform. Do not make this Site public without adding explicit authorization and abuse controls to the POST route.

## Sources
- https://api.llama.fi/protocols
- https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true
- Same fees endpoint with `dataType=dailyProtocolRevenue` for revenue retained by the protocol (not all fees or holder revenue).
- https://api.dexscreener.com/tokens/v1/{chainId}/{address}
- Ethereum publicnode, Base mainnet, Robinhood mainnet, Hyperliquid EVM and Solana PublicNode public RPCs.

Protocol datasets are joined by provider protocol ID, falling back to exact normalized slug/name. Protocol data is multichain aggregated, not attributed to the selected chain. Fee growth uses `change_7dover7d` (weekly totals compared to previous weekly totals). Token prices/liquidity use only the deepest indexed exact-address base-token pool. Solana addresses are case sensitive. Data sources can reject requests, be delayed, or have limited coverage. Unavailable values remain null.

## Score
Positive daily fees: 25 points. Positive daily protocol revenue: 15. Half of weekly fee growth, clamped to -20..35. Half of 7-day TVL change, clamped to -10..15. Known positive market cap at or below $100m: 10. Final score clamped to 0..100. Missing growth adds 0 points, not a claim of zero growth. This is an unvalidated screening heuristic.

## Signal evidence and changes

The 0–100 score remains visible with a one-line explanation. Positive fee-growth points require at least $700 in the preceding week and an absolute weekly increase of $700. Prior weekly fees are reconstructed from the reported weekly total and week-over-week percentage. A default, reversible filter hides positive growth below these thresholds.

Daily fee history uses DefiLlama summary endpoints for the top 12 eligible growing projects at or below $100m (or unknown market cap). Ten consecutive complete UTC days are required: the latest three must each exceed the preceding seven-day average by at least 30% and $100/day; baseline must be at least $100/day. This is corroborating evidence, not an extra score component. History cache lasts six hours and is invalidated at UTC day rollover. Unchecked projects remain unconfirmed. Errors never become positive signals.

Since-visit labels use device-local storage: New means newly indexed relative to the previous visit, not newly launched. Strengthening/fading means a score change of at least five points. Stale rows and unchanged fee-observation timestamps are excluded. A partial provider outage does not overwrite the previous comparison baseline.

Exact chain/address identity mappings currently cover three Aerodrome deployments and the Ethereum Aave V3 pool, with official deployment-source links and purpose. AERO's verified token address is displayed; Aave's token remains unverified in this registry. No fuzzy name matching is used for contract identity. Protocol-list token addresses remain explicitly provider-reported.

## Limits
Gas is a two-block EVM sample, attributed to top-level recipients including transfers and failed transactions, not internal traces. A small exact-address registry labels selected recipients; the rest remain unidentified. No claim of full-chain continuous gas discovery. Solana exposes network TPS including votes, not program-level compute. Gas is not currently part of the score. Unlisted utility projects may be missed. No bot/Sybil detector, retained-wallet analysis, emissions adjustment, lifecycle classifier, or historical runner backtest. Project bookmarks are device-local; shared market snapshots persist in D1. Unknown market caps are included unless explicitly excluded. CEX and Chain categories are excluded from discovery.

## Development
Use Node 22+ and the project lockfile. Run the Sites dependency helper, `pnpm exec tsc --noEmit`, and the Sites build helper. DB schema is in db/schema.ts; generate new migrations using `pnpm db:generate`. Never mutate an applied migration. Publish through Sites source workflow; the hosting manifest declares DB and preserves the project ID.

## Verification
TypeScript and production build pass. Collector tests verify metric mapping and missing-value handling. End-to-end browser QA requires the supported control-browser capability, which was unavailable in the authoring environment.
