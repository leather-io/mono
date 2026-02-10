DO NOT ADD, REMOVE, OR MODIFY COMMENTS IN CODE — including punctuation and formatting in existing comments. Only touch comments if explicitly asked.

After ANY code changes, you MUST run verification (see Verification section). Do not report a task as complete or move on until all checks pass.

# Claude Instructions

Leather is a Bitcoin & Stacks wallet — browser extension, mobile app (Expo/React Native), and web app.

## Architecture

Turborepo monorepo using `pnpm`, organized in **CLEAN architecture** layers. Use the `monorepo-navigation` skill for detailed package structure and decision trees.

**Presentation**: `apps/` (extension, mobile, web), `@leather.io/ui`, `@leather.io/features`
**Application**: `@leather.io/queries` (React Query), `@leather.io/services` (orchestration, API calls, DI, caching)
**Domain**: `@leather.io/models` (types), `@leather.io/bitcoin`, `@leather.io/stacks`
**State**: `@leather.io/state` (Redux Toolkit slices for shared state)
**Foundation**: `@leather.io/utils`, `@leather.io/constants`, `@leather.io/tokens`, `@leather.io/crypto`

- **State management**: Redux Toolkit. Extension uses `{feature}.slice.ts`; mobile uses `{feature}.write.ts` (slice + actions) and `{feature}.read.ts` (selectors + hooks).
- **Server state**: React Query (`@tanstack/react-query`). Queries live in `packages/queries/` and app-level `src/queries/`.
- **Feature flags**: LaunchDarkly with `camelCase` flag keys in extension; also used in mobile.

Use the `monorepo-navigation` skill for the full decision tree on where new code goes.

## Development commands

First-time setup:

```bash
pnpm i && pnpm build
```

Run extension:

```bash
pnpm dev
```

Run web:

```bash
pnpm dev
```

Run mobile:

```bash
cd apps/mobile
pnpm 1password:env:dev    # requires 1Password CLI — or ask developer to add EXPO_PUBLIC_LAUNCH_DARKLY to .env
pnpm ios
```

Mobile requires an `apps/mobile/.env` file with `EXPO_PUBLIC_LAUNCH_DARKLY` set. Run `pnpm 1password:env:dev` to generate it, or ask the developer to provide the LaunchDarkly key.

## React Native / Expo

- Mobile app uses Expo with EAS Build. pnpm has known fingerprint-drift issues with EAS.
- SDK upgrades: check the official upgrade guide for deprecated/renamed APIs before starting.
- Firebase native modules: use `forceStaticLinking` in `expo-build-properties` plugin.
- Clear bundler cache: `npx expo start --dev-client --clear`.
- `BUILD_TARGET` env var controls platform builds: `mobile`, `extension`, or `web`. Unset builds everything.

## Code style

- Don't use enums.
- Default to `interface` for object shapes. Name component props `ComponentNameProps`.
- Use `function` declarations for top-level functions and React components. Arrow functions for callbacks only.
- Destructure props directly in the function signature.
- Prefer Remeda (`keys`, `entries`, `pipe`, `filter`, etc.) over `Object.keys`/`Object.entries` for typed utilities and non-trivial transforms. Use native methods for trivial cases.
- No `as` casts, `!` non-null assertions, or `any`. Use runtime checks, type guards, or `unknown` with narrowing.
- Prefer `const` over `let`. Prefer named constants over magic numbers or strings.
- No nested ternary expressions.
- Use object method shorthand syntax in objects and interfaces (`{ foo() {} }` not `{ foo: () => {} }`).
- camelCase for file-level constants; SCREAMING_SNAKE_CASE in the constants package or `constants.ts` files.

## Error handling

- `throw` is acceptable for genuinely invalid states (wrong keychain type, missing required config).
- For expected failure paths (user input, optional lookups), prefer returning `null`, `undefined`, or typed result objects.
- Never throw in React render paths, reducers, or selectors.
- In React render paths: use error boundaries for unexpected errors; return `null` or fallback UI for expected empty states.

## File naming

- Kebab-case file names (e.g., `alternate-header-layout.tsx`).
- Platform suffixes for cross-platform code: `.web.tsx`, `.native.tsx`, `.shared.ts`.
- Convention-named config files are exempt (e.g., `babel.config.cjs`, `tsconfig.json`).
- No `index.ts(x)` except barrel exports from library packages or file-based router requirements.
- Use `*.spec.ts(x)` for tests, co-located next to the file under test.

## Circular dependencies

- Never import from a barrel export (`index.ts`) within the same package's sub-modules.
- Place `initialState` in write/slice modules, not shared read modules.
- Metro require cycle warnings are bugs to fix, not warnings to ignore.
- Concrete anti-pattern: slice → utils → store → slice. Break by keeping `initialState` in write/slice files and never importing from `store/index.ts` within slices.

## Security

- Sanitize HTML from external sources (NFT metadata, collectible descriptions) before rendering.
- Validate responses from IPFS gateways and untrusted origins.
- Never expose private keys, seeds, or mnemonics in error messages or logs.

## Commits

- Conventional commits format with scope: `feat(mobile)`, `refactor(web)`, `fix(utils)`.
- Imperative language. No body unless explicitly asked.
- Branches and PRs are always based against `dev`, not `main`.

## Verification

You MUST run these after any code changes. Do not consider a task complete until they pass:

```bash
pnpm format
pnpm lint
pnpm typecheck
```

If working on mobile, run `pnpm lingui` from `apps/mobile/` before running verification.

For faster feedback in a specific package:

```bash
pnpm --filter @leather.io/{package} lint
pnpm --filter @leather.io/{package} typecheck
```

## Tooling

- Turborepo + `pnpm`.
- Vitest for unit/integration tests. Use the `testing-patterns` skill for conventions.
- Playwright for E2E tests (extension). Avoid `force: true` — it hides accessibility issues. Never nest interactive elements.

## Common tasks

- **Add a UI component** → `@leather.io/ui`, use the `monorepo-navigation` skill
- **Add a Redux slice** → Extension: `{feature}.slice.ts`; Mobile: `{feature}.write.ts` + `{feature}.read.ts`
- **Add a React Query hook** → `packages/queries/` or app-level `src/queries/`
- **Run a single package's tests** → `pnpm --filter @leather.io/{package} test:unit`
