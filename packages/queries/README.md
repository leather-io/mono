# @leather.io/queries

Canonical React Query configurations for Leather's services layer.

## Purpose

This package provides standardized query key factories and configuration builders for `@leather.io/services`, ensuring consistent caching behavior and dependency management across all Leather applications.

- **Eliminates opaque dependencies** – Query keys automatically include the settings required by each service
- **Single source of truth** – One canonical way to call each service from React Query
- **Type-safe** – Full TypeScript support with service return types
- **Maintainable** – Add new configs by extending a small registry + factory

## Architecture

```
Apps (extension/mobile/web)
↓
@leather.io/queries
↓
@leather.io/services (business logic)
```

This package serves as the **adapter layer** between React Query and the services layer, keeping services framework-agnostic while providing idiomatic React Query integration.

## Usage

### Basic Pattern

```typescript
import { useQuery } from '@tanstack/react-query';

import { createMarketDataQueryConfig } from '@leather.io/queries';

function useMarketData(asset: FungibleCryptoAsset) {
  const settings = useUserSettings(); // App-specific adapter -> UserSettings
  return useQuery(createMarketDataQueryConfig(asset, settings));
}
```

### Available Query Configs

- **Market data** – `createMarketDataQueryKey`, `createMarketDataQueryConfig`
- **BTC balances** – `createBtcBalanceQueryKey`, `createBtcBalanceQueryConfig`, aggregate helpers
- **SIP-10 balances** – `createGetSip10*` helpers for account, address, asset, and contract queries

Each helper accepts:

1. The service params (asset, account request, etc.)
2. A `UserSettings` object supplied by the consuming app

## How It Works

### Query Key Registry

`src/shared/query-key.registry.ts` is the single source of truth for which **settings dependencies** a given service call cares about. Each entry looks like this:

```typescript
export const querySettingsDepsRegistry = {
  'market-data-service--get-market-data': ['currency', 'network'],
  'sip10-balances-service--get-sip10-account-balance': ['currency', 'network', 'assetVisibility'],
} as const;
```

The `createServiceQueryKey()` factory uses this registry to pull the required values (via the `UserSettings` adapter), ensuring query keys react to changes in currency, network, or asset visibility only when necessary.

### Query Option Presets

- `balanceQueryOptions` – Tight 5s cache window for balance reads
- `marketDataQueryOptions` – 1 minute cache window for price data

## Adding New Query Configs

Follow this pattern when adding new service query configs:

1. **Add registry entry**
   - In `src/shared/query-key.registry.ts`, register a new prefix + required deps.
2. **Create config file**
   - e.g. `src/activity/activity.query-config.ts`
3. **Key factory**
   - Use `createServiceQueryKey(prefix, paramsArray, settings)`
4. **Config builder**
   - Return a `UseQueryOptions` that spreads the shared query options and calls the service
5. **Export**
   - Re-export from `index.ts`

## Design Principles

1. **Export builders, not hooks** – Apps own their React Query hooks
2. **Always accept `UserSettings`** – Drive reactivity through the adapter pattern
3. **Use the registry** – Every query key goes through `createServiceQueryKey`
4. **Keep it pure** – Builders are deterministic and side-effect free

## Relationship to Other Packages

- **`@leather.io/services`** - This package wraps service calls with query configs
- **`@leather.io/query`** (legacy) - Older package with low-level API queries, being gradually deprecated
- **`@tanstack/react-query`** - Peer dependency, types imported but not included in runtime

## Migration from Inline Queries

**Before (manual query key management):**

```typescript
function useBtcBalance(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings(); // Easy to forget!
  return useQuery({
    queryKey: ['btc-balance', request, fiatCurrencyPreference], // Manual key construction
    queryFn: ({ signal }) => getBtcBalancesService().getBtcAccountBalance(request, signal),
    staleTime: 5000,
    // ... more options
  });
}
```

**After (using query config):**

```typescript
function useBtcBalance(request: AccountRequest) {
  const settings = useSettings();
  return useQuery(createBtcBalanceQueryConfig(request, settings));
}
```

Benefits:

- ✅ Dependencies are never forgotten (enforced by config builder)
- ✅ Query keys are consistent across the app
- ✅ Query options are standardized
- ✅ Less boilerplate in application code

## License

MIT
