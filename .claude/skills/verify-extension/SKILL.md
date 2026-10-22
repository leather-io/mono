---
name: verify-extension
description: Verify that an extension screen or RPC approval popup renders after a code change by running the extension verify CLI, which builds dist, launches the extension headless with the E2E mocks, opens a route or drives an RPC request through the test app, and captures a screenshot, aria snapshot, console, network, background errors and persisted state. Use after changing apps/extension/src, packages/ui, packages/features or packages/state, before reporting done, and when a bug report names a screen.
---

# Verify an extension screen

`pnpm --filter @leather.io/extension verify` drives the built extension the way the E2E suite does
(same launcher, same mocks, same seeded test wallet) without the Playwright runner, and writes
evidence to `apps/extension/.verify/<timestamp>-<route-or-method>/`. The default `signed-in`
session needs no secret: it seeds the test wallet's encrypted state directly.

## When

- After any change under `apps/extension/src`, `packages/ui`, `packages/features` or
  `packages/state` that an extension screen renders, before reporting the task done.
- When a bug report names a screen or an RPC method: verify first, then fix, then verify again.

## How

1. Find the screen's route in `apps/extension/src/shared/route-urls.ts` and a `data-testid` that
   is in the DOM only once the screen is ready, from `apps/extension/tests/selectors/*.selectors.ts`.
   Prefer a selector reference over a literal id so a rename fails loudly. Layout containers such
   as `HomePageSelectors.HomePageContainer` stay mounted on nested and unknown routes, so pick a
   marker from the changed screen itself. Popups render `ConnectAccountSelectors.WalletName`.
2. Run, from the repo root:

   ```bash
   pnpm --filter @leather.io/extension verify -- --route /send/btc --ready SendCryptoAssetSelectors.SendPageReady
   pnpm --filter @leather.io/extension verify -- --rpc catalog:signMessage-p2wpkh --ready ConnectAccountSelectors.WalletName
   ```

   Flags: `--session signed-in | signed-out | locked`, `--account-type software | ledger | mixed |
   policy`, `--network <id>`, `--param name=value` for `:params`, `--flag key=true|false` for a
   LaunchDarkly flag, `--mocks default | none | default,+name` (names from
   `tests/cli/mock-registry.ts`), `--rpc <method> --params file.json` or `--rpc catalog:<id>`
   (ids from `pnpm --filter @leather.io/test-app catalog list`), `--session signed-out --onboard`
   with `--mnemonic-from-gh`, `--shot viewport | full | testid:<id> | none`, `--state <slices>` or
   `all`, `--console error | warning | all`, `--timeout <ms>`, `--out <dir>`, `--no-build`.
3. The CLI rebuilds `dist` only when the hashed build inputs changed since the last stamped build.
   It refuses to run while `pnpm dev` serves this worktree, because the dev server rewrites `dist`.
   `--rpc` starts the test app on port 3000 when nothing listens there and stops it afterwards.

## Reading the result

- Exit 0 and `verdict: verified` plus a screenshot that shows the change means the screen is
  verified. Open `screenshot.png` and `aria.txt` and check the change is actually visible.
- Exit 2 (`ready-not-met`) or 3 (`errors`) is a finding to fix, not a flake to rerun. Exit 3 means
  a page error, a console error not in `tests/cli/console-allowlist.ts`, a background service
  worker error (`background-errors.json`), or a `real` request in `network.jsonl` under default
  mocks. Read `console.jsonl`, `network.jsonl` and `aria.txt` before touching code.
- A `real` request under default mocks means the suite is no longer hermetic: add a mock to
  `tests/mocks` (see `mock-apis.ts`), never an allowlist entry. Allowlist entries are substrings
  of `<message text> <source url>` and only cover noise that is deterministic on `dev`.
- `--mocks none` sends every request to the real network: `real` counts are expected there and do
  not fail the run, so say the run only proves "renders against live APIs".
- Exit 4 (`env`) is the environment: stop `pnpm dev`, fix the failed build in `build.log`, supply
  the mnemonic, rerun. Exit 1 is a usage error; `--help` lists the flags.
- Say explicitly when a run only proves "did not crash": the ready target is not on the changed
  screen, or `--allow-console-errors` was used.
- With `--rpc`, `summary.rpc` records the method, the popup url, the test app mode and the
  response, which stays `pending` while the popup waits for approval; `rpc-request.json` holds the
  params that were sent.

## PR evidence

Paste the `summary.json` block and attach `screenshot.png` under a "Verification" heading. The CLI
redacts `softwareKeys` secrets and the onboarding mnemonic, but never paste state that includes
key material.

## Never

Do not write a Playwright script outside `apps/extension/tests` to check a screen. Use this command,
and extend it in `apps/extension/tests/cli` when a flag is missing.
