# Underflow

Private onchain research dashboard. Built with React, Vinext, Cloudflare Workers and D1.

## Data flow
`POST /api/radar` fetches public DefiLlama protocol, fees, and protocol-revenue datasets; DEX Screener reference pairs; recent public RPC activity. It persists one snapshot in D1. `GET /api/radar` reads the latest snapshot. A five-minute server cooldown reduces repeated requests. Up to 180 snapshots are retained. If every provider fails, the previous snapshot is returned with a visible error.

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

## Limits
Gas is a two-block EVM sample, attributed to top-level recipients including transfers and failed transactions, not internal traces or verified protocol contracts. No claim of full-chain continuous gas discovery. Solana exposes network TPS including votes, not program-level compute. Gas is not currently part of the score. Unlisted utility projects may be missed. No bot/Sybil detector, retained-wallet analysis, emissions adjustment, lifecycle classifier, or historical runner backtest. Wallet bookmarks are device-local; shared market snapshots persist in D1. Unknown market caps are included unless explicitly excluded. CEX and Chain categories are excluded from discovery.

## Development
Use Node 22+ and the project lockfile. Run the Sites dependency helper, `pnpm exec tsc --noEmit`, and the Sites build helper. DB schema is in db/schema.ts; generate new migrations using `pnpm db:generate`. Never mutate an applied migration. Publish through Sites source workflow; the hosting manifest declares DB and preserves the project ID.

## Verification
TypeScript and production build pass. Collector tests verify metric mapping and missing-value handling. End-to-end browser QA requires the supported control-browser capability, which was unavailable in the authoring environment.
