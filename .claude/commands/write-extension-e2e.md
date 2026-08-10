---
description: Analyze branch changes and write Playwright E2E tests for the extension
allowed-tools: Bash(git:*), Bash(cd apps/extension && pnpm test:integration*), Bash(pnpm build*), Bash(cd apps/extension && pnpm typecheck), Read, Grep, Glob, Write, Edit
---

# Write Extension E2E Tests

Analyze the current branch's changes against `dev` and write Playwright E2E tests for the extension app.

## Step 1: Gather branch diff

```bash
git diff origin/dev...HEAD --stat
```

Then get the full diff scoped to relevant paths:

```bash
git diff origin/dev...HEAD -- apps/extension/ packages/ui/ packages/features/
```

Review the diff output carefully. Focus on extension-relevant changes: new routes, UI components, user flows, form logic, RPC handlers, selectors, and state changes.

After identifying the changed files, read each changed source file in full — do not write tests based solely on the diff output. Understand the component structure, props, and user interactions before planning tests.

**Identify test cases from the diff:** For each user-visible behavior change, plan one happy-path test. For critical flows (form validation, transaction submission, error states), also plan an error or edge-case test. Aim for 1-3 tests per behavior change.

**Skip changes that don't need E2E tests:**
- Types-only files, CI config, documentation
- Pure refactors with no UI-visible changes
- Redux slice internals or selector logic (use unit tests)
- React Query hook refactors (use unit tests)
- Package-level utility changes without UI impact (use unit tests)

If no changes need E2E tests, report that to the user and stop.

## Step 2: Read existing test infrastructure

Before writing any tests, read these two things:

**Always read:** The closest existing spec to the feature you're testing — match its patterns exactly. Use this mapping to find it:
  - Send flow → `specs/send/`
  - Swap flow → `specs/swap/`
  - RPC handlers → `specs/rpc-*/`
  - Onboarding → `specs/onboarding/`
  - Settings/network → `specs/settings/`, `specs/network/`
  - Token/collectible display → `specs/tokens/`, `specs/collectibles/`, `specs/token-details/`
  - If unclear, glob `apps/extension/tests/specs/` to browse directories

**Read as needed:**
- `tests/fixtures/fixtures.ts` — if you need to see what fixtures are available (exports `test` with extension-specific fixtures)
- `tests/page-object-models/` — the POM for the page you're testing (navigation helpers, interaction methods)
- `tests/selectors/` — if you need `data-testid` enum values
- `tests/mocks/` — if the test calls external APIs you need to mock
- `tests/utils.ts` — shared helpers like `json()` and `createTestSelector()`

## Step 3: Write tests

### Decision guide

- **New route/page** → create new spec file, may need a new POM
- **Form/UI change on existing page** → add tests to existing spec or new spec in the same directory, reuse existing POM
- **RPC handler** → use the RPC popup pattern (see appendix at the end)
- **State/data change with UI impact** → mock the data layer, assert the UI reflects it

### File placement

Prefer adding tests to an existing spec if one already covers the feature. Only create a new spec file at `apps/extension/tests/specs/{feature}/{feature}.spec.ts` for genuinely new features or routes.

### Setup pattern

Always use `signInWithTestAccount` unless specifically testing the onboarding flow:
- `signInWithTestAccount` — injects wallet state directly into `chrome.storage` (fast, no UI interaction)
- `signInExistingUser` — drives the full onboarding UI (slow, only for testing onboarding itself)

**Choosing a setup method:** Use `setupAndUseApiCalls` (default) when the test can tolerate real network calls. Use `setupAndUseMockedApiCalls` for tests that should run fully offline with all external APIs mocked.

**Choosing a test account:** Read `tests/mocks/constants.ts` for available accounts. Default to `STANDARD_BIP_FAKE_MNEMONIC` for general tests. Use Ledger account helpers (`makeLedgerTestAccountWalletState`) for Ledger-specific flows. If the test needs specific on-chain state, check which account addresses match the mocked data.

```typescript
test.describe('feature name', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    // For Ledger tests: onboardingPage.signInWithLedgerAccount(id, makeLedgerTestAccountWalletState([...]))
  });

  test('that it does something expected', async ({ page }) => {
    // Arrange, Act, Assert
  });
});
```

**Navigation:** Check the relevant POM for navigation helpers (e.g., `homePage.clickSend()`) to reach the page under test. Avoid raw `page.goto()` for internal extension routes.

### Rules

**Naming & structure:**
- Use `test()` not `it()`. Use `test.describe()` to group related tests.
- Name tests with behavioral descriptions of what the user does and sees, e.g. `'sends BTC to a valid address'`, not implementation details.

**Imports:**
- Import `test` with a relative path: `import { test } from '../../fixtures/fixtures';`
- Import everything else with the `@tests/` alias: `import { SomeSelectors } from '@tests/selectors/…';`
- `expect` is not exported from fixtures. Some specs import `expect` from `@playwright/test`, others use `test.expect()`. Match the closest existing spec.

**Assertions & selectors:**
- Selectors: `page.getByTestId(SelectorEnum.Value)` — never raw CSS selectors or strings. When `data-testid` isn't available, prefer semantic locators: `getByRole()`, `getByText()`, `getByLabel()`.

**Waits & timeouts:**
- Use `.waitFor()`, `.waitForURL()`. Use `.waitForTimeout()` sparingly.
- Use `test.slow()` or `test.setTimeout(60_000)` for extended timeouts. Use `test.describe.configure({ retries: 0 })` to disable retries.
- Use `test.skip()` for conditionally skipped tests and `test.fixme()` to mark known-broken tests.

**State & isolation:**
- Tests run sequentially (`fullyParallel: false`) — extensions share `chrome.storage` across workers.
- State that leaks between tests: `chrome.storage.local` (persisted wallet data), `page.route()` mocks (carry over if not unrouted), and in-memory extension state.
- Routes are not explicitly cleaned up. Each `beforeEach` call to `setupAndUseApiCalls` resets routes with a catch-all. Additional `page.route()` mocks set within a test carry over — set them in `beforeEach` if they apply to all tests.
- Fixtures auto-disable CSS animations and transitions — no need to add waits for animations.

**Reuse existing infrastructure:**
- Reuse existing POM methods. Only extend POMs or create new ones for genuinely new interaction patterns.
- Reuse existing selector enums. Only add new selectors for new `data-testid` attributes.
- If new UI elements lack `data-testid` attributes, add them to the source component code before creating selector enums. These are production code changes — include them in the same PR.
- Reuse existing mock functions from `apps/extension/tests/mocks/`. Only add new mocks for new API endpoints.

### API mocking

Mock external APIs and third-party services. Let internal extension state flow naturally unless the test requires specific data. Match the mocking strategy (full mock vs partial) of the closest existing spec.

Internal API mocking uses `page.route()` with `route.fulfill(json({ ... }))`:

```typescript
await page.route('**/api/endpoint', route => route.fulfill(json({ data: 'mocked' })));
```

External API mocking (ordinals.com, bestinslot, etc.) follows the same pattern:

```typescript
await page.route('**/ordinals.com/**', route =>
  route.fulfill({ status: 200, contentType: 'text/html', body: mockHtmlResponse })
);
```

### Chrome storage and debug APIs

Access and manipulate extension state via `window.debug` (see `apps/extension/src/app/debug.ts` for all available methods):

```typescript
// Read persisted store
const walletState = await page.evaluate(() => window.debug.getPersistedStore());

// Set debug state
await page.evaluate(() => window.debug.setHighestAccountIndex(2));
```

## Step 4: Add supporting files if needed

Only create these if existing infrastructure doesn't cover the changes:
- New selector enum: `apps/extension/tests/selectors/{feature}.selectors.ts`
- New mock functions: `apps/extension/tests/mocks/mock-{feature}.ts` (specs import directly from `@tests/mocks/mock-{feature}`)
- New POM methods or class: `apps/extension/tests/page-object-models/{feature}.page.ts`

## Step 5: Verify

The extension must be built before tests can run (`dist/` must exist). If not already built, run `pnpm build` first.

To iterate on a single test by name:

```bash
cd apps/extension && pnpm test:integration tests/specs/{feature}/{feature}.spec.ts --grep "test name"
```

Run the full spec file:

```bash
cd apps/extension && pnpm test:integration tests/specs/{feature}/{feature}.spec.ts
```

For visual debugging, add `--headed` to either command.

If tests fail, debug and fix. Repeat until green.

Also verify that new test files pass typecheck:

```bash
cd apps/extension && pnpm typecheck
```

If you added new `data-testid` selectors, confirm they exist in the source components.

## Appendix: RPC popup handling

RPC tests use the test app (auto-started on localhost:3000 by Playwright's webServer config). Navigate to it in `beforeEach`, then initiate requests with `page.evaluate` against the injected provider:

```typescript
await page.goto('localhost:3000', { waitUntil: 'networkidle' });

function initiateRpcRequest(page: Page) {
  return async (params: RpcParams<typeof stxCallContract>) =>
    page.evaluate(
      params =>
        (window as any).LeatherProvider.request('stx_callContract', { ...params }).catch(
          (e: unknown) => e
        ),
      { ...params }
    );
}
```

Handle RPC approval popups with `Promise.all`. Prefer `waitForSelector` or `waitForLoadState` to wait for the popup to render. Fall back to `waitForTimeout` only if those don't work:

```typescript
function clickActionButton(context: BrowserContext) {
  return async (buttonToPress: 'Cancel' | 'Approve') => {
    const popup = await context.waitForEvent('page');
    await popup.waitForLoadState('domcontentloaded');
    const btn = popup.locator(`text="${buttonToPress}"`);
    await btn.waitFor();
    await btn.click();
  };
}

const [result] = await Promise.all([
  initiateRpcRequest(page)(params),
  clickActionButton(context)('Approve'),
]);
```

Intercept broadcast requests on the popup:

```typescript
const popup = await context.waitForEvent('page');
const requestPromise = popup.waitForRequest('**/api/tx');
await popup.route('**/api/tx', async route => await route.fulfill(json({ txid: '0x123' })));
// Later: await requestPromise to inspect the request body
const request = await requestPromise;
```
