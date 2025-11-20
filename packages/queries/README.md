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
- **SIP-10 balances** – `createSip10AccountBalanceQueryKey`, `createSip10AccountBalanceQueryConfig`, `createSip10AddressBalanceQueryKey`, `createSip10AddressBalanceQueryConfig`
- **Activity** – `createActivityQueryKey`, `createActivityQueryConfig`, `createActivityByAssetQueryKey`, `createActivityByAssetQueryConfig`
- **SIP-10 activity** – `createSip10ActivityByAssetIdQueryKey`, `createSip10ActivityByAssetIdQueryConfig`

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

## Lint Invariants

To keep this package and its consumers aligned on the “builder only” pattern, a few ESLint rules are enforced:

- **No React Query hooks in `@leather.io/queries`**
  - `packages/queries` may import types from `@tanstack/react-query` (e.g. `UseQueryOptions`, `QueryFunctionContext`), but importing hooks like `useQuery` or `useInfiniteQuery` is disallowed.
  - This guarantees the package only exports pure key/config builders and never React hooks.
- **No `use*` exports in `@leather.io/queries`**
  - Declarations whose identifiers start with `use[A-Z]` are rejected in this package.
  - Hooks are defined in apps (`apps/web`, `apps/mobile`, `apps/extension`), not in the query-config layer.
- **No `*QueryOptions` wrapper types in `@leather.io/queries`**
  - Type aliases ending in `QueryOptions` are banned here to avoid patterns like `Omit<UseQueryOptions, 'queryKey' | 'queryFn'>`.
  - Apps should use `UseQueryOptions` (or `Partial<UseQueryOptions<...>>`) directly when they need configuration objects.
- **App query modules must not import certain `get*Service` helpers**
  - In `apps/*` query directories we forbid importing `getActivityService`, `getMarketDataService`, and `getBtcBalancesService` from `@leather.io/services`.
  - Instead, query modules should rely on the corresponding builders exported from `@leather.io/queries` and call `useQuery` themselves.
- **`useQuery` object calls must be complete or builder-based**
  - For object-literal `useQuery({ ... })` calls in app query modules, ESLint requires either:
    - the object spreads an existing query config (e.g. `...createXQueryConfig(...)`), or
    - it explicitly defines both `queryKey` and `queryFn`.
  - This helps prevent accidental “wrapper” helpers that partially hide React Query configuration or forget to specify a key or fetch function.

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
