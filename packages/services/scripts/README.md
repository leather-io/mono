# Service Test Scripts

Utility scripts for manual testing and visual verification of the service layer. These call real APIs and return real data.

## Setup

From the repo root:

```bash
pnpm i && pnpm build
```

Create `packages/services/.env`:

```
LEATHER_API_BASIC_AUTH="Basic <credentials>"
TEST_ACCOUNT_CONTEXT='{"account":{"id":{"fingerprint":"...","accountIndex":0},"bitcoin":{"nativeSegwitDescriptor":"...","taprootDescriptor":"...","zeroIndexNativeSegwitPayerAddress":"...","zeroIndexTaprootAddress":"..."},"stacks":{"stxAddress":"..."}}}'
```

`TEST_ACCOUNT_CONTEXT` is required for activity testing and optional for asset-list balance features.

## Scripts

### Activity

```bash
pnpm test:activity                                  # full activity (BTC + Stacks)
pnpm test:activity -- --chain=bitcoin               # filter by chain
pnpm test:activity -- --chain=stacks
pnpm test:activity -- --asset=<contractId>           # filter by SIP-10 asset
pnpm test:activity -- --protocol=stacking-dao        # filter by protocol
pnpm test:activity -- --limit=10 --offset=0          # paginate
pnpm test:activity -- --raw                          # raw JSON output
pnpm test:activity -- --diag                         # diagnostics mode
```

### Asset List

```bash
pnpm test:asset-list                                # default (all tokens, market data)
pnpm test:asset-list -- --protocol=sip10            # filter by protocol (nativeBtc, nativeStx, sip10, rune)
pnpm test:asset-list -- --chain=stacks              # filter by chain
pnpm test:asset-list -- --sort=marketCap            # sort field (desc by default)
pnpm test:asset-list -- --sort=price:asc            # sort with direction
pnpm test:asset-list -- --trust=50                  # min trust score
pnpm test:asset-list -- --trending=5                # min trending score
pnpm test:asset-list -- --mcap=1000000              # min market cap
pnpm test:asset-list -- --balance                   # include balance data (requires TEST_ACCOUNT_CONTEXT)
pnpm test:asset-list -- --limit=10 --offset=0       # paginate
pnpm test:asset-list -- --raw                       # raw JSON output
pnpm test:asset-list -- --scenarios                 # run automated test scenarios
```
