# Asset List Playground

An interactive script for exploring the asset list service. Edit a query, run the script, see real token data.

## Setup

From the repo root:

```bash
pnpm i && pnpm build
```

Then run:

```bash
cd packages/services
pnpm asset-list
```

## How to use

1. Open `scripts/asset-list-playground.mjs`
2. Edit the `request` object near the top of the file
3. Run `pnpm asset-list`
4. Repeat

The file has several commented-out recipe presets you can swap in — top tokens, trending, daily movers, runes, etc.

## Balances (optional)

Balance data requires an account context. To enable it:

1. Add `ASSET_LIST_TEST_ACCOUNT_CONTEXT` to `packages/services/.env` as a JSON string
2. Uncomment `balance: true` in `includes` and/or `hasBalance: true` in `filters`

Without this, the script runs fine — balance-related options are just skipped with a warning.

## Available query options

Quick summary:

**Filters:** `protocols`, `chain`, `minMarketCap`, `minTrustScore`, `minTrendingScore`, `minDistributionScore`, `hasBalance`, `includeHidden`

**Includes:** `marketData`, `marketStats`, `analytics`, `balance`

**Sort fields:** `name`, `price`, `marketCap`, `change1d`, `change1w`, `change1m`, `trustScore`, `trendingScore`, `distributionScore`, `holderCount`, `quoteTotalBalance`, `quoteAvailableBalance`

**Pagination:** `{ limit, offset }`
