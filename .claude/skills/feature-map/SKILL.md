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
`['SwitchAccountPage.open']`) that reveals the screen from the start route. Only zero-argument
public methods of the page objects the fixtures expose (GlobalPage, HomePage, OnboardingPage,
SendPage, SwapRevampPage, NetworkPage, SettingsPage, SwitchAccountPage) can be used. Leave `open`
empty when no action reveals the screen (a form must be filled, a storage key set); the entry then
says so under Verify and the specs are the reproduction. A routed entry may also set `open` when
the screen only renders after an action from its route.

## Commands

```bash
pnpm lt feature-map generate --app extension                  # write .claude/skills/feature-map/extension.md (gitignored; run before reading)
pnpm lt feature-map check                                      # CI gate: entries, references, route and rpc coverage
```

Run `pnpm --filter @leather.io/tools build` first if `pnpm lt` reports an unknown command.

## Verify a screen

`pnpm lt verify extension` opens one mapped screen in a headless Chromium with the extension loaded,
under the preconditions the entry describes, and writes evidence an agent can read to confirm a bug
or a fix. It reuses the Playwright fixtures, page objects and mocks; nothing is reimplemented.

```bash
pnpm lt verify extension --feature send-btc-form                       # entry decides route, session, wallet, network, flags, mocks, ready selector
pnpm lt verify extension --feature receive-dialog                      # goes to startRoute, runs the open actions, waits for ready
pnpm lt verify extension --feature home-tokens --account-type ledger   # software | ledger | mixed | policy; entries with accountType derive it; non-software wallets are mainnet-only
pnpm lt verify extension --feature home-tokens --network testnet4      # wallet network id; entries with network derive it; catalog rpc runs take mainnet, testnet4, signet or devnet
pnpm lt verify extension --feature rpc-stx-call-contract               # params come from the first test-app catalog spec for the method
pnpm lt verify extension --route / --rpc catalog:signMessage-p2wpkh --ready current-account-display-name   # a bare --rpc must be a wallet rpc method; policy accounts need --params
pnpm lt verify extension --feature rpc-get-addresses --params ./req.json   # or hand-written params
pnpm lt verify extension --feature home-tokens --mocks none            # no mocks at all: every request is real, flags come from the real LaunchDarkly (no --flags)
pnpm lt verify extension --feature home-tokens --state all             # state.json slices; default active,networks,wallets
pnpm lt verify extension --feature home-tokens --allow-console-errors  # report instead of block
pnpm lt verify extension --feature home-tokens --build                  # run the extension test build first
```

For a `selectors` entry the run signs in, navigates to `startRoute`, calls each `open` action on the
fixtures' page objects, then waits for `selectors.ready`. A `behavior` entry, an entry with no
`selectors.ready`, or a dialog with no `open` action is a usage error that points at its specs. RPC
runs drive the request through the test app on port 3000 (Playwright starts it), seed that origin as
a connected dApp (`--no-connect-test-app` to skip), resolve catalog params against the wallet, approving
any `getAddresses` prompt the builder needs, and capture the approver popup.

Prerequisites: `LAUNCH_DARKLY_KEY` in `apps/extension/.env` (gitignored; without it the app falls back to
a no-op flag provider, so `--flags` does nothing and flag-gated routes such as `/fund` and `/sell` never
register, and verify exits 2 on them) and a test build in `apps/extension/dist`
(`pnpm --filter @leather.io/extension build:test` or `--build`; a running `pnpm dev` rewrites it, so
stop that first). `/fund` and `/sell` also need `ONRAMPER_WIDGET_HOST`, `ONRAMPER_API_KEY` and
`ONRAMPER_SIGNING_SECRET` in that `.env` (CI reads the public `PUBLIC_ONRAMPER_*` repository variables);
without them the widget iframe gets a relative src, the page frames the extension itself and verify
exits 3 on a `frame-ancestors` console error. No mnemonic is needed: every session is seeded from the
test wallet's encrypted state.

Entries with `deepLinkable: false` read router state the previous screen passes (the send
confirmations, the sent summaries, the BTC fee sheet, the swap review), so a bare URL redirects or
throws; verify refuses them with a usage error and `extension.md` prints the reason instead of a
command. Reproduce those through their specs.

### Reading the result

The CLI prints the verdict, the blocking findings and the artifact directory; `summary.json` holds the
same data. Exit codes:

| Exit | Verdict         | Meaning                                                                                                                                                                                                                                           |
| ---- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | `verified`      | the ready selector appeared and nothing blocked; open `screenshot.png` and `a11y.md` and check the change is actually visible                                                                                                                     |
| 1    | usage           | bad arguments; the message names the fix                                                                                                                                                                                                          |
| 2    | `ready-not-met` | the ready selector never attached; `a11y.md` and `console.json` show what rendered instead                                                                                                                                                        |
| 3    | `errors`        | the rpc request answered with an error before any approver opened, a page error or console error not in `apps/extension/tests/verify/console-allowlist.ts`, a background service worker error (`background-errors.json`), a `real` request in `network.json` under mocks, or a listed mock the registry cannot apply |
| 4    | `env`           | no dist, a dist that is not a `build:test` build, a failed `--build`, or the Playwright run died before writing `summary.json`                                                                                                                                                             |

- Exit 2 and 3 are findings to fix, not flakes to rerun. Read `console.json`, `network.json` and
  `a11y.md` before touching code.
- A `real` request under mocks means the suite is no longer hermetic: add a mock to
  `apps/extension/tests/mocks`, register it in `apps/extension/tests/verify/mock-registry.ts` and
  list it in the entry's `preconditions.mocks`, never an allowlist entry. Allowlist entries are substrings of `<message text> <source url>` and only cover noise that
  is deterministic on `dev`.
- `--mocks none` sends every request to the real network: `real` counts are expected there and do
  not fail the run, so say the run only proves "renders against live APIs".
- Say explicitly when a run only proves "did not crash": the ready target is not on the changed
  screen, or `--allow-console-errors` was used.
- With an rpc entry, `summary.rpc` records the method, the catalog id the params came from, the popup
  url and the response, which stays `pending` while the popup waits for approval; `rpc-request.json`
  holds the params that were sent.

Artifacts land in `apps/extension/verify-results/<feature-or-route>-<timestamp>/` (gitignored) unless
`--out` is given:

| File                     | Contents                                                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `screenshot.png`         | Full-page screenshot of the target page                                                                                                                         |
| `a11y.md`                | `ariaSnapshot()` of the page body, the same format as a failure's `error-context.md`                                                                            |
| `console.json`           | Every console message and page error with level, text and location                                                                                              |
| `network.json`           | Every request, page and service worker, classified as extension, local, mocked, fallback, real, failed or other                                                 |
| `background-errors.json` | Errors the background service worker buffered in test builds (uncaught errors, unhandled rejections, console.error)                                             |
| `state.json`             | The requested persisted slices only; `softwareKeys.salt` and every `encryptedSecretKey` are replaced, and the session key is reported as `encryptionKeyPresent` |
| `rpc-request.json`       | The method and params an rpc run sent                                                                                                                           |
| `summary.json`           | Verdict, exit code, resolved inputs, ready outcome, timings, console, network and background counts, blocking findings, notes                                   |

When pasting evidence into a PR, use `summary.json` and the screenshot; never paste state that
includes key material, even redacted.

## Adding or changing an entry

- Every routed `RouteUrls` key and every rpc handler file must be claimed by an entry. A nested
  sheet (`edit-tx-nonce`, `recipient-accounts`) is listed in the `routes` of the feature whose route
  mounts it.
- `specs`, `actions` and `open` (`PageObject.method`), `preconditions.mocks` (mock functions
  exported from `tests/mocks` and registered in `tests/verify/mock-registry.ts`, so a mock that
  needs arguments cannot be listed) and `entry[].method` (an RPC method string) must exist; `flags` must be keys of
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
