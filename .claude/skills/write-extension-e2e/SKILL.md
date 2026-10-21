---
name: write-extension-e2e
description: Conventions for writing and changing the extension's Playwright E2E tests in apps/extension/tests. Use when adding a spec, a page-object action, a selector or a mock, or when an E2E test is flaky. Covers readiness-owning actions, the sleep ban, selectors, mocks, popups and how to run one spec locally.
---

# Extension E2E tests

Specs live in `apps/extension/tests/specs/<feature>/<feature>.spec.ts` and use the `test` fixture from
`apps/extension/tests/fixtures/fixtures.ts`, which launches a fresh headless Chromium with the
extension from `apps/extension/dist` for every test. Each test gets its own profile, so
`chrome.storage` is never shared between tests or workers.

## Run locally

```bash
pnpm --filter @leather.io/extension build:test     # rebuild dist after any src change
cd apps/extension
EXTENSION_INTEGRATION_TEST_MNEMONIC="$(gh variable get EXTENSION_INTEGRATION_TEST_MNEMONIC -R leather-io/mono)" \
  pnpm playwright test tests/specs/send/send-stx.spec.ts --workers=3
```

The mnemonic is a readable repository variable. Without it the whole run fails at load time. A
running `pnpm dev` rewrites `dist`, so stop it before testing. CI runs 10 shards with three workers
each; `fullyParallel` is on, so tests in one file may run on different workers.

## The rules ESLint enforces

`eslint.config.js` applies `eslint-plugin-playwright` recommended rules to the tests tree plus
these bans. Fix the cause, never add a suppression.

| Banned                                                                                                                                                                                                                                                                       | Use instead                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `page.waitForTimeout()`, `delay()` from utils                                                                                                                                                                                                                                | A locator wait, `expect(locator).toBeVisible()`, `expect.poll()` or `expect(async () => …).toPass()` |
| `waitUntil: 'networkidle'`                                                                                                                                                                                                                                                   | A plain `goto`; wait for the element you need next                                                   |
| `allInnerTexts()`                                                                                                                                                                                                                                                            | `toHaveText`, `toContainText`, `toHaveCount` on the locator                                          |
| `page.locator('text="X"')`, raw CSS selectors                                                                                                                                                                                                                                | `getByTestId`, `getByText('X', { exact: true })`, `getByRole`                                        |
| `waitForSelector()`                                                                                                                                                                                                                                                          | `locator.waitFor()` or a web-first assertion                                                         |
| `{ force: true }`                                                                                                                                                                                                                                                            | Fix the locator or the UI; forced clicks hide real problems                                          |
| `innerText()` + `toEqual`                                                                                                                                                                                                                                                    | `expect(locator).toHaveText()` so the assertion retries                                              |
| In `specs/**`: `SendCryptoAssetSelectors.SendForm`, `SharedComponentsSelectors.CardAvailableBalance`, `ActivitySelectors.TransactionActionFeeInput`, `ActivitySelectors.TransactionActionBalance`, `SettingsSelectors.UnlockWalletBtn`, `OnboardingSelectors.SetPasswordBtn` | The page-object action named in the lint message                                                     |

Every test must end with an assertion and sit inside a top-level `test.describe`. To assert that
something does _not_ happen, use `expectToSettleAt(read, value)` from `tests/utils.ts`: it polls
until the value has held for five consecutive reads, which replaces a sleep-then-recheck. Test bodies
cannot contain `if`: narrow optional values with `assertExistence(value, message)` from
`@leather.io/utils` or a zod `schema.parse(value)`, and move any genuine branch into a named helper
outside the test. Expectations cannot sit inside callbacks or `catch`; assert directly so a failure
cannot be swallowed.

## Actions own their preconditions

Several screens validate against data that loads after the screen renders. Acting before the data
is there fails silently or leaves a stale validation error. The page objects wait for that data
inside the action, so a spec never has to know about it:

| Action                                                                                                       | What it waits for before returning                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OnboardingPage.signInWithTestAccount`, `signInWithMixedSoftwareAndLedgerWallets`, `signInWithLedgerAccount` | Seeds storage, reloads, polls until the home tabs render; re-seeds up to three times. Dismisses the multi-wallet introducer and waits for its seen-flag to reach storage, so it cannot reappear over the next screen |
| `GlobalPage.setupAndUseApiCalls`                                                                             | Registers the API mocks, then waits for the onboarding or home screen                                                                                                                                                |
| `SendPage.selectStxAndGoToSendForm`, `selectSip10AndGoToSendForm`                                            | The fee estimate, which the amount validator needs                                                                                                                                                                   |
| `SendPage.selectBtcAndGoToSendForm(expectedBalance?)`                                                        | The available balance and the Send max link, which only renders once the UTXO list the validator reads has loaded                                                                                                    |
| `SendPage.previewBitcoinTransaction`                                                                         | A single Continue click, then the fee list                                                                                                                                                                           |
| `HomePage.setBitcoinIncreasedFeeRate`                                                                        | The RBF dialog's balance caption, which its validation closes over                                                                                                                                                   |
| `HomePage.lock`                                                                                              | Reopens the settings menu if a re-render closed it                                                                                                                                                                   |
| `SwitchAccountPage.submitNewWalletPassword`                                                                  | Home or the mismatch error; the password check derives a key, which is slow on CI runners                                                                                                                            |
| `HomePage.unlock`                                                                                            | The password screen to go away; key derivation is slow on CI runners                                                                                                                                                 |
| `HomePage.setStacksTransactionActionFee`                                                                     | Scopes the fee input to the cancel or increase-fee sheet                                                                                                                                                             |

When you add a flow whose first interaction depends on loaded data, add the wait inside a new
page-object action and add the element's selector to `pageObjectOnlySelectors` in
`eslint.config.js` so specs cannot bypass it. If a readiness signal does not exist in the UI, add a
`data-testid` in app code (see `tests/selectors`) rather than sleeping.

## Selectors

Selectors are string constants in `apps/extension/tests/selectors/*.selectors.ts`, grouped per
screen, and app code imports the same constants for `data-testid`. Add the constant first, then use
it from both sides. Prefer `getByTestId` for anything you own and `getByRole` or
`getByText(…, { exact: true })` for popups whose markup you do not control.

## Mocks

`GlobalPage.setupAndUseApiCalls` installs the default API mocks on the browser context. Register
test-specific mocks on `page` or `context` before `signInWithTestAccount`: the home page fetches
on mount and React Query caches the first answer. Page-level routes win over context-level ones.
Mocks live in `apps/extension/tests/mocks`; add to an existing file when the API already has one.

## RPC popups

Requests from the test app at `localhost:3000` open an approver window. Wait for it with
`context.waitForEvent('page')` in a `Promise.all` with the request, then act on the popup with
web-first waits. Close the popup and assert on the request's promise so the test ends with an
assertion. The test app pre-bundles the polyfill shims Vite would otherwise discover on the first
visit (`optimizeDeps.include` in `apps/test-app/vite.config.ts`) and global setup warms it once, so
the first navigation never reloads mid-test; if you add a dependency that Vite reports as "new
dependencies optimized", add it to that list.

## Failure output

Every failure writes `test-results/<test>/error-context.md` with an accessibility snapshot of the
page at the moment of failure. Read it before re-running. Traces are kept on first retry.
