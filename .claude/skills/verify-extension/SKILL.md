---
name: verify-extension
description: Verify that an extension screen renders after a code change by running the extension verify CLI, which builds dist, launches the extension headless with the E2E mocks, opens a route and captures a screenshot, aria snapshot, console log and persisted state. Use after changing apps/extension/src, packages/ui, packages/features or packages/state, before reporting done, and when a bug report names a screen.
---

# Verify an extension screen

`pnpm --filter @leather.io/extension verify` drives the built extension the way the E2E suite does
(same launcher, same mocks, same seeded test wallet) without the Playwright runner, and writes
evidence to `apps/extension/.verify/<timestamp>-<route>/`. It needs no secret: the default
`signed-in` session seeds the test wallet's encrypted state directly.

## When

- After any change under `apps/extension/src`, `packages/ui`, `packages/features` or
  `packages/state` that an extension screen renders, before reporting the task done.
- When a bug report names a screen: verify the screen first, then fix, then verify again.

## How

1. Find the screen's route in `apps/extension/src/shared/route-urls.ts` and a `data-testid` that
   is in the DOM only once the screen is ready, from `apps/extension/tests/selectors/*.selectors.ts`.
   Prefer a selector reference over a literal id so a rename fails loudly. Layout containers such
   as `HomePageSelectors.HomePageContainer` stay mounted on nested and unknown routes, so pick a
   marker from the changed screen itself.
2. Run, from the repo root:

   ```bash
   pnpm --filter @leather.io/extension verify -- --route /send/btc --ready SendCryptoAssetSelectors.SendPageReady
   ```

   Flags: `--session signed-in | signed-out | locked`, `--network <id>`, `--param name=value`
   for `:params` in the route, `--shot viewport | full | testid:<id> | none`, `--state <slices>`
   or `all`, `--console error | warning | all`, `--timeout <ms>`, `--out <dir>`, `--no-build`.
3. The CLI rebuilds `dist` only when the hashed build inputs changed since the last stamped build.
   It refuses to run while `pnpm dev` serves this worktree, because the dev server rewrites `dist`.

## Reading the result

- Exit 0 and `verdict: verified` plus a screenshot that shows the change means the screen is
  verified. Open `screenshot.png` and `aria.txt` and check the change is actually visible.
- Exit 2 (`ready-not-met`) or 3 (`errors`, a page error or a console error not in
  `apps/extension/tests/cli/console-allowlist.ts`) is a finding to fix, not a flake to rerun.
  Read `console.jsonl` and `aria.txt` before touching code. Allowlist entries are substrings of
  `<message text> <source url>`, so a `404` entry can be scoped to one mocked endpoint; add one
  only for noise that is deterministic on `dev`, never for the change under test.
- Exit 4 (`env`) is the environment: stop `pnpm dev`, fix the failed build in `build.log`, rerun.
- Exit 1 is a usage error; `--help` lists the flags.
- Say explicitly when a run only proves "did not crash": the ready target is not on the changed
  screen, or `--allow-console-errors` was used.

## PR evidence

Paste the `summary.json` block and attach `screenshot.png` under a "Verification" heading. The CLI
redacts `softwareKeys` secrets in `state.json`, but never paste state that includes key material.

## Never

Do not write a Playwright script outside `apps/extension/tests` to check a screen. Use this command,
and extend it in `apps/extension/tests/cli` when a flag is missing.
