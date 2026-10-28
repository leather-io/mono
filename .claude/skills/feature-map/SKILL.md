---
name: feature-map
description: Turn a bug report or route into the extension screen it belongs to, its preconditions, the covering Playwright spec and a reproduction. Use when triaging a bug, writing an E2E repro for a report, or adding a route or an rpc handler to the extension (the feature-map check fails until it has an entry).
---

# Feature map

`pnpm lt feature-map generate --app extension` writes `extension.md` next to this file: a generated
inventory of the extension, one entry per screen, dialog, dApp method or behavior a user would name.
The file is gitignored, so generate it at the start of a session (a few seconds; the first run also
builds the tools package). Each entry resolves its anchor, routes or opener,
gate, feature flags, params, entry steps, preconditions, selectors, page-object actions and covering
specs. The sources are typed TypeScript in
`apps/extension/tests/feature-map/*.features.ts`; they import the real `RouteUrls` and
`*Selectors` objects, so a rename breaks `pnpm --filter @leather.io/extension typecheck`.

## From a report to a reproduction

1. **Generate, then find the entry.** Run `pnpm lt feature-map generate --app extension`, then grep
   `extension.md` for what you have: a route (`/send/btc`), a `RouteUrls` key, a selector, or words
   from the description of what the screen shows.
2. **Read the entry.** Routes shows where the router mounts it, which gate wraps it and which
   LaunchDarkly flags must be on; a dialog or sheet shows **Opened by** instead: the start route and
   the page-object action that reveals it. Preconditions gives the session state, network, account
   type and the mock functions the specs register. Entry lists the click path and deep link.
3. **Open the covering spec and action.** Specs are repo-relative paths; Actions link to the
   page-object method that owns the readiness wait for that screen (see `write-extension-e2e`).
   Copy the spec's `beforeEach`, call the listed actions, then assert on the listed selectors.
4. **Write the repro** following the `write-extension-e2e` skill. Never bypass a page-object action
   with a raw selector from the entry; the action waits for the data the screen validates against.

## Anchors

Every entry declares what it is anchored on. The check enumerates routed `RouteUrls` keys and rpc
handler files and fails when one has no entry; `selectors` and `behavior` entries are optional.

| `anchor`                                | Use for                                                                                         | Enumerated from                                                         | Claimed by                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `{ kind: 'route' }`                     | a screen with a URL                                                                             | `RouteUrls` keys the routers reference                                  | the entry's `routes`                                                                                 |
| `{ kind: 'selectors', objects: [...] }` | a dialog, sheet, banner or badge with no URL                                                    | exported `*Selectors` objects in `apps/extension/tests/selectors`       | `objects` (whole object `'SwitchAccountSelectors'` or members `'HomePageSelectors.NetworkSwitcher'`) |
| `{ kind: 'rpc', handlers: [...] }`      | a dApp method whose handler opens no approver (`open`, `openSwap`, `supportedMethods`)          | file basenames in `apps/extension/src/background/messaging/rpc-methods` | `handlers`, or a routed entry whose `entry[].method` the handler registers                           |
| `{ kind: 'behavior' }`                  | something the wallet does with no screen (wallet lock, store migrations, the Ledger flow steps) | nothing; hand-authored                                                  | —                                                                                                    |

Selector objects are not enforced: a dialog rendered inside a routed screen can live in that
screen's entry, and a `selectors` entry is added when a dialog needs one of its own. Popup-opening
rpc methods keep their route anchor; their
`entry[].method` claims the handler. Behaviors are listed under **Behaviors** in `extension.md`
and skip the gate cross-check; everything else they reference (specs, actions, selectors, mocks) is
still validated.

Entries without a route carry `startRoute` (a `RouteUrls` value, default `/`) and `open`: the
page-object action or sequence of actions (`'HomePage.goToReceiveDialog'`,
`['SwitchAccountPage.open']`) that reveals the screen from the start route. Any public
page-object method can be used. Leave `open` empty when no action reveals the screen (a
form must be filled, a storage key set); the specs are then the reproduction. A routed entry may
also set `open` when the screen only renders after an action from its route.

## Commands

```bash
pnpm lt feature-map generate --app extension                  # write .claude/skills/feature-map/extension.md (gitignored; run before reading)
pnpm lt feature-map check                                      # CI gate: entries, references, route and rpc coverage
```

Run `pnpm --filter @leather.io/tools build` first if `pnpm lt` reports an unknown command.

## Adding or changing an entry

- Every routed `RouteUrls` key and every rpc handler file must be claimed by an entry. A nested
  sheet (`edit-tx-nonce`, `recipient-accounts`) is listed in the `routes` of the feature whose route
  mounts it.
- `specs`, `actions` and `open` (`PageObject.method`), `preconditions.mocks` (mock functions
  exported from `tests/mocks`) and `entry[].method` (an RPC method string) must exist; `flags` must be keys of
  `FeatureFlags`; `anchor.objects` must name exported `*Selectors` objects or members and
  `anchor.handlers` files under `rpc-methods`.
- `selectors.ready` is the element whose presence means the screen is usable; it is required for
  route and selectors anchors and may be omitted for rpc anchors without UI and for behaviors.
  `others` are the elements a repro will touch on this screen; the control on the previous screen
  that opens it belongs in the `entry` steps. Both are `*Selectors.Member` references, never raw
  strings, and both must render on this screen in the precondition state (say in the description
  when one is conditional).
- `preconditions.mocks` lists the mock functions that take only a page or context handle: always
  `setupMockApis` and `mockUnhandledRequests` (what `globalPage.setupAndUseApiCalls` registers),
  plus the ones the screen's default state needs on top. A mock that `setupMockApis` already calls
  fails the check when listed next to it. A variant mock only some covering specs register
  (`mockMixedUtxosForSend`) and a mock that needs data arguments
  (`mockLeatherBitcoinTransactions`, `mockMixedUtxoRequests`, `mockBnsV2NameLookup`,
  `mockFundedStacksAddress`, `overrideLaunchDarklyFlags`, …) is named in the description together
  with the spec that registers it and what it changes on the screen.
- `preconditions.network` is set whenever a covering spec switches network or the screen requires
  one (swap needs mainnet; most send specs run on testnet4).
- Descriptions state only what a component, hook or spec shows, with UI strings quoted verbatim.
  Write "back goes to the previous page" when the header back button calls `navigate(-1)`, and say
  when a control opens a full-page tab from the popup (Buy, Sell, Send on Ledger); specs run
  full-page, so they never show that branch.
- `gate` must match what the router mounts the route behind (the innermost of AccountGate,
  OnboardingGate, LedgerStacksGate, LedgerBitcoinGate, or `none`); the check compares it per mounted
  path for route anchors, so an entry whose routes sit behind different gates has to be split. For
  other anchors it documents the gate of the screen that hosts the dialog.
- `entry` for an RPC popup is `kind: 'rpc'` with the `method` string the dApp calls; the steps say
  how the test app at localhost:3000 triggers it and that the popup is awaited with
  `context.waitForEvent('page')`.
- `deepLinkable: false` marks a screen that reads router state the previous screen passes (the send
  confirmations, the sent summaries, the BTC fee sheet, the swap review): a bare URL redirects or
  throws, so `extension.md` says so and the specs are the reproduction.
- `specs: []` is allowed; those entries are listed under **Uncovered screens** in `extension.md`
  so E2E work can target them.
- Whenever a spec, page object, mock or selector under `apps/extension/tests` changes, or the screen
  a spec covers changes, proofread the entries that reference it (grep the file path or selector in
  `*.features.ts`) and fix their steps, preconditions and description. The check validates
  references only; wrong prose passes it.
- After editing a source run `check`, then `generate` to refresh your local `extension.md`; the file
  is gitignored and never committed.
- The check validates references, not prose. Every Monday `repo:feature-map-fix` reads every entry
  against the source (`.github/prompts/feature-map-fix.md`), fixes the statements it can prove
  false and opens or updates the `bot/feature-map-fix` pull request with a per-row citation; it
  closes that PR when a run finds nothing. Re-read the cited lines before merging it.

## Web

`pnpm lt feature-map generate --app web` writes `web.md` next to this file from
`apps/web/tests/feature-map/*.features.ts`, and `pnpm lt feature-map check --app web` is the CI
gate for the web app (`apps/web`, React Router 7 framework mode, SSR on Cloudflare). The web app is
a dApp: it has no wallet of its own and talks to the extension through `@stacks/connect` and the
Leather SDK, so a web entry describes a page, its loader and the wallet state it needs.

- **Routes** are the `routes.ts` config, not JSX routers. The check reads
  `apps/web/app/routes.ts` and the spread sub-tables (`multisig.routes.ts`,
  `playground.routes.ts`, `bitcoin-staking.routes.ts`, including the `playgroundAreas.map`
  expansion) and mounts every `index`, `route`, `layout` and `prefix` entry at its absolute path.
  Entries claim routes through `RouteUrls` in `apps/web/app/route-urls.ts`, a const object whose
  values are typed against the route paths the `react-router typegen` register emits, so renaming
  a path in `routes.ts` fails `pnpm --filter @leather.io/web typecheck`. Every mounted path must
  have a `RouteUrls` member (the check fails on an unkeyed path) and every member must be claimed
  exactly once. Index routes claim the parent path (`/staking` is the `index` under the
  `staking` prefix) and the fallback is `RouteUrls.NotFound` (`/*`).
- **Anchors** are `route`, `selectors` and `behavior`; there is no `rpc` anchor on web.
  `selectors.ready` is optional for web route anchors because resource routes and redirects have
  no screen; add it whenever the page has a stable test id. Selector objects live in
  `apps/web/tests/selectors/*.selectors.ts` and the app components reference their members
  (templated ids keep a `[slug]`-style placeholder that the component replaces).
- **Gates** are the layouts the route config mounts a path under: `multisigLayout`
  (`multisig.layout.tsx` redirects to `/multisig/onboarding` without a session),
  `playgroundLayout` (`playground.layout.tsx` 404s in production) or `none`. The root
  `NetworkGate` is not in the route config; entries record it as `preconditions.network`
  (`mainnet` for everything outside `/multisig`).
- **Flags** are build conditions, not LaunchDarkly: a route registered inside
  `import.meta.env.MODE !== 'production'` carries `flags: ['nonProductionBuild']`.
- **Preconditions** express the Playwright `mode` fixture (`apps/web/tests/index.ts`):
  `session` is `uninstalled` (no provider), `mock-installed` (localStorage `leather-mock-mode`
  seeds the mock provider and the in-page MSW worker) or `mock-connected` (the fixture's
  worker-scoped storage with the mock STX address already connected). `network` is the app's
  network atom (`mainnet` or `testnet`). `mocks` name exports of `apps/web/app/mocks`
  (`successHandlers` for mock mode, `seedMultisigMockSessions` for multisig); the per-test
  localStorage flags read by `pox5-mock-overrides.ts` are named in the description. There are no
  page objects, so `actions` and `open` stay empty and the entry steps are the reproduction.
- **Specs** are repo-relative paths under `apps/web/tests`. Redirect specs use plain Playwright
  without the fixture; everything else starts from `mode({ mode })`.
