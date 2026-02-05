---
name: monorepo-navigation
description: Navigate and understand the Leather monorepo structure. Use when adding new code, finding existing implementations, or understanding package relationships. Helps locate the right package for new features and understand cross-package dependencies.
---

# Leather Monorepo Navigation

This is a Turborepo monorepo with 3 apps and packages organized in a **CLEAN architecture**.

## Architecture Layers

**Presentation** → `apps/`, `@leather.io/ui`, `@leather.io/features`, `@leather.io/provider`
**Application** → `@leather.io/queries`, `@leather.io/services`, `@leather.io/rpc`, `@leather.io/sdk`, `@leather.io/cms`
**Domain** → `@leather.io/models`, `@leather.io/bitcoin`, `@leather.io/stacks`
**State** → `@leather.io/state` (Redux Toolkit)
**Foundation** → `@leather.io/utils`, `@leather.io/constants`, `@leather.io/tokens`, `@leather.io/crypto`, `@leather.io/analytics`

## Apps

| App | Path | Purpose |
|-----|------|---------|
| **extension** | `apps/extension/` | Chrome/Firefox browser extension |
| **mobile** | `apps/mobile/` | React Native iOS/Android app (Expo) |
| **web** | `apps/web/` | React Router web app at app.leather.io |

## Domain Layer Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/models` | `packages/models/` | Domain types and interfaces |
| `@leather.io/bitcoin` | `packages/bitcoin/` | Bitcoin protocol utilities, address handling, PSBTs |
| `@leather.io/stacks` | `packages/stacks/` | Stacks protocol utilities, transactions |

**Import rules for domain peers:**
- All three can import **types** from each other
- `bitcoin`/`stacks` should NOT import logic from `models` (only types)

## Application Layer Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/services` | `packages/services/` | **Orchestration only** — API calls, DI, caching, multi-service coordination |
| `@leather.io/queries` | `packages/queries/` | React Query configurations |
| `@leather.io/query` | `packages/query/` | Legacy query package (migrate to @leather.io/queries) |
| `@leather.io/rpc` | `packages/rpc/` | RPC client abstraction |
| `@leather.io/sdk` | `packages/sdk/` | SDK utilities |
| `@leather.io/cms` | `packages/cms/` | CMS integration |

**Services should NOT contain:**
- Pure domain logic (move to `models`, `bitcoin`, or `stacks`)
- Utility functions (move to `utils`)

## State Management

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/state` | `packages/state/` | Shared Redux Toolkit slices (wallet, keychains) |

App-specific state:
- **Extension**: `apps/extension/src/app/store/` — `{feature}.slice.ts` convention
- **Mobile**: `apps/mobile/src/store/` — `{feature}.write.ts` (slice + actions) and `{feature}.read.ts` (selectors + hooks)

## Foundation Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/utils` | `packages/utils/` | Generic utilities (money, formatting, guards) |
| `@leather.io/constants` | `packages/constants/` | Shared constants, currency decimals |
| `@leather.io/crypto` | `packages/crypto/` | Cryptographic primitives, key derivation |
| `@leather.io/tokens` | `packages/tokens/` | Token metadata |
| `@leather.io/analytics` | `packages/analytics/` | Mixpanel analytics |

## Presentation Layer Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/ui` | `packages/ui/` | Shared UI components (React) |
| `@leather.io/features` | `packages/features/` | View models, UI transforms |
| `@leather.io/provider` | `packages/provider/` | App provider utilities |

## Decision Tree: Where Does New Code Go?

```
Is it PURE business logic (no I/O, no async, no side effects)?
├─ Yes → Is it chain-specific protocol code?
│   ├─ Bitcoin protocol → packages/bitcoin/src/
│   ├─ Stacks protocol → packages/stacks/src/
│   └─ No → packages/models/src/
│
Is it orchestration (API calls, DI, caching, coordination)?
├─ Yes → packages/services/src/{domain}/
│
Is it a domain type/interface?
├─ Yes → packages/models/src/
│
Is it a generic utility (not domain-specific)?
├─ Yes → packages/utils/src/
│
Is it a UI component?
├─ Yes → packages/ui/src/components/
│
Is it React Query configuration?
├─ Yes → packages/queries/src/
│
Is it app-specific?
└─ Yes → apps/{app}/src/
```

## Key Conventions

- **Barrel exports**: Each package has `src/index.ts` exporting public API
- **Internal imports**: Use `@leather.io/{package}` not relative paths across packages
- **Co-located tests**: `{file}.spec.ts` next to source file
- **Kebab-case filenames**: `bitcoin-address.ts` not `bitcoinAddress.ts`
- **Platform suffixes**: `.web.tsx`, `.native.tsx`, `.shared.ts` for cross-platform code

## Common Tasks

### Adding a Bitcoin protocol utility
```
packages/bitcoin/src/utils/{feature-name}.ts
packages/bitcoin/src/utils/{feature-name}.spec.ts
```
Export from `packages/bitcoin/src/utils/index.ts`

### Adding a domain type
```
packages/models/src/{area}.model.ts
```

### Adding orchestration logic
```
packages/services/src/{domain}/{domain}.service.ts
```
Should only contain: API calls, DI, caching, multi-service coordination

### Adding a UI component
```
packages/ui/src/components/{component-name}/
├─ {component-name}.tsx
├─ {component-name}.web.tsx (if platform-specific)
└─ index.ts
```
