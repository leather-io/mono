---
name: monorepo-navigation
description: Navigate and understand the Leather monorepo structure. Use when adding new code, finding existing implementations, or understanding package relationships. Helps locate the right package for new features and understand cross-package dependencies.
---

# Leather Monorepo Navigation

This is a Turborepo monorepo with 3 apps and packages organized in a **CLEAN architecture**.

## Architecture Layers

```
┌────────────────────────────────────────────┐
│  Presentation Layer                        │
│  ├─ apps/ (extension, mobile, web)         │
│  ├─ ui (components, icons, styles)         │
│  └─ features (view models, UI transforms)  │
├────────────────────────────────────────────┤
│  Application Layer                         │
│  ├─ queries (React Query configs)          │
│  └─ services (orchestration + infra only)  │
├────────────────────────────────────────────┤
│  Domain Layer (peers)                      │
│  ├─ domain (business logic + types)        │
│  ├─ bitcoin (protocol utilities)           │
│  └─ stacks (protocol utilities)            │
├────────────────────────────────────────────┤
│  Foundation                                │
│  └─ utils, constants, tokens, crypto       │
└────────────────────────────────────────────┘
```

## Apps

| App | Path | Purpose |
|-----|------|---------|
| **extension** | `apps/extension/` | Chrome/Firefox browser extension |
| **mobile** | `apps/mobile/` | React Native iOS/Android app (Expo) |
| **web** | `apps/web/` | Next.js web app at app.leather.io |

## Domain Layer Packages (Peers)

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/domain` | `packages/domain/` | **Pure business logic + domain types** (target) |
| `@leather.io/bitcoin` | `packages/bitcoin/` | Bitcoin protocol utilities, address handling, PSBTs |
| `@leather.io/stacks` | `packages/stacks/` | Stacks protocol utilities, transactions |

**Import rules for domain peers:**
- All three can import **types** from each other
- `domain` can import protocol utilities from `bitcoin`/`stacks`
- `bitcoin`/`stacks` should NOT import logic from `domain` (only types)

## Application Layer Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/services` | `packages/services/` | **Orchestration only** — API calls, DI, caching, multi-service coordination |
| `@leather.io/queries` | `packages/queries/` | React Query configurations |
| `@leather.io/query` | `packages/query/` | Legacy React Query hooks (being deprecated) |

**Services should NOT contain:**
- Pure domain logic (move to `domain`)
- Utility functions (move to `domain` or `utils`)

## Foundation Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/utils` | `packages/utils/` | Generic utilities (money, formatting, guards) |
| `@leather.io/constants` | `packages/constants/` | Shared constants, currency decimals |
| `@leather.io/crypto` | `packages/crypto/` | Cryptographic primitives, key derivation |
| `@leather.io/tokens` | `packages/tokens/` | Token metadata |

## Presentation Layer Packages

| Package | Path | Scope |
|---------|------|-------|
| `@leather.io/ui` | `packages/ui/` | Shared UI components (React) |
| `@leather.io/features` | `packages/features/` | View models, UI transforms |
| `@leather.io/state` | `packages/state/` | State management (Zustand/Jotai) |

## Legacy Packages (Being Deprecated)

| Package | Path | Status |
|---------|------|--------|
| `@leather.io/models` | `packages/models/` | → Migrating to `@leather.io/domain` |
| `@leather.io/query` | `packages/query/` | → Migrating to `services` + `queries` |

## Decision Tree: Where Does New Code Go?

```
Is it PURE business logic (no I/O, no async, no side effects)?
├─ Yes → Is it chain-specific protocol code?
│   ├─ Bitcoin protocol → packages/bitcoin/src/
│   ├─ Stacks protocol → packages/stacks/src/
│   └─ No → packages/domain/src/{area}/
│       ├─ activity/       ← transaction activity mapping
│       ├─ assets/         ← asset creation utilities
│       ├─ balances/       ← balance calculations
│       ├─ fees/           ← fee calculations
│       ├─ utxos/          ← UTXO categorization
│       ├─ swap/           ← swap calculations
│       ├─ yield/          ← yield protocol parsing
│       └─ transactions/   ← tx helpers (organized by chain)
│
Is it orchestration (API calls, DI, caching, coordination)?
├─ Yes → packages/services/src/{domain}/
│
Is it a domain type/interface?
├─ Yes → packages/domain/src/{area}/{area}.model.ts
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

## Domain Package Structure (Target)

```
packages/domain/src/
├── activity/
│   ├── activity.model.ts
│   ├── activity.utils.ts
│   ├── bitcoin/
│   │   └── bitcoin-tx-activity.utils.ts
│   └── stacks/
│       └── stacks-tx-activity.utils.ts
├── assets/
│   ├── asset.model.ts
│   ├── rune-asset.utils.ts
│   ├── sip9-asset.utils.ts
│   └── sip10-asset.utils.ts
├── balances/
│   ├── balance.model.ts
│   ├── btc-balance.utils.ts
│   ├── stx-balance.utils.ts
│   └── sip10-balance.utils.ts
├── fees/
│   ├── fees.model.ts
│   ├── bitcoin-fees.utils.ts
│   └── stacks-fees.utils.ts
├── utxos/
│   ├── utxo.model.ts
│   ├── utxo.utils.ts
│   └── utxo.constants.ts
└── ...
```

**Domain package principles:**
- Pure functions only (no side effects, no I/O)
- Organize by feature/concept, not by chain: `domain/transactions/bitcoin/` ✅ not `domain/bitcoin/transactions/` ❌
- Trivially unit testable (no mocks needed)

## Key Conventions

- **Barrel exports**: Each package has `src/index.ts` exporting public API
- **Internal imports**: Use `@leather.io/{package}` not relative paths across packages
- **Co-located tests**: `{file}.spec.ts` next to source file
- **Snake-case filenames**: `bitcoin-address.ts` not `bitcoinAddress.ts`

## Common Tasks

### Adding pure domain logic
```
packages/domain/src/{area}/{feature}.utils.ts
packages/domain/src/{area}/{feature}.spec.ts
```
Export from `packages/domain/src/{area}/index.ts` and `packages/domain/src/index.ts`

### Adding a Bitcoin protocol utility
```
packages/bitcoin/src/utils/{feature-name}.ts
packages/bitcoin/src/utils/{feature-name}.spec.ts
```
Export from `packages/bitcoin/src/utils/index.ts`

### Adding a domain type
```
packages/domain/src/{area}/{area}.model.ts
```
Export from `packages/domain/src/{area}/index.ts`

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
