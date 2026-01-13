# Extension Testing Improvement Plan

## Executive Summary

This document outlines the strategy for improving the extension's Playwright test suite to:
1. Support testing both legacy and new `extensionRevamp` code paths
2. Adopt BDD-style testing with feature files
3. Migrate to MSW-style mocking (matching apps/web)
4. Share test utilities via the `@leather.io/test-config` package
5. Improve test coverage and speed

## Current State Assessment

### Test Infrastructure
- **29 test specs** organized by feature domain
- **9 Page Object Models** for UI abstraction
- **27 mock files** for API responses
- **14 selector files** with enum-based organization
- Tests run with `extensionRevamp: true` by default (via LaunchDarkly mock)

### Strengths
- Well-organized fixtures and POMs
- Comprehensive mock library
- Good coverage of core flows (send, receive, RPC, settings)

### Problems
- No way to test legacy code path (flag always true)
- Mocks are route-based, not MSW-style handlers
- No BDD feature files for business-readable specs
- Coverage gaps (buy flows, backup/recovery, theme switching)
- No shared test infrastructure between extension and web

## Implementation Plan

### Phase 1: BDD Framework Setup

#### 1.1 Install playwright-bdd
```bash
pnpm --filter @leather.io/extension add -D playwright-bdd@^8.4.2
```

#### 1.2 Update playwright.config.ts
Add feature file discovery and BDD test generation:
```typescript
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: './tests/features/**/*.feature',
  steps: './tests/steps/**/*.ts',
});
```

#### 1.3 Create feature file structure
```
tests/
├── features/               # NEW: Gherkin feature files
│   ├── onboarding/
│   │   └── sign-in.feature
│   ├── send/
│   │   ├── send-btc.feature
│   │   └── send-stx.feature
│   ├── settings/
│   │   └── settings.feature
│   └── ...
├── steps/                  # NEW: Step definitions
│   ├── common.steps.ts     # Given I am signed in, etc.
│   ├── send.steps.ts
│   └── settings.steps.ts
├── specs/                  # KEEP: Existing tests (run in parallel)
└── ...
```

### Phase 2: Feature Flag Testing Strategy

#### 2.1 Create dual-mode LaunchDarkly mock

```typescript
// tests/mocks/mock-launchdarkly.ts
interface FeatureFlagOptions {
  extensionRevamp?: boolean;
  releaseOnramperBuy?: boolean;
}

export async function mockLaunchDarkly(page: Page, options: FeatureFlagOptions = {}) {
  const { extensionRevamp = true, releaseOnramperBuy = true } = options;

  await page.route(launchDarklyEvalx, route =>
    route.fulfill({
      json: {
        extension_revamp: {
          flagVersion: 3,
          trackEvents: false,
          value: extensionRevamp,
          variation: extensionRevamp ? 0 : 1,
          version: 8,
        },
        releaseOnramperBuy: {
          flagVersion: 7,
          trackEvents: false,
          value: releaseOnramperBuy,
          variation: releaseOnramperBuy ? 0 : 1,
          version: 8,
        },
      },
    })
  );
}
```

#### 2.2 Update fixtures to support flag configuration

```typescript
// tests/fixtures/fixtures.ts
interface TestOptions {
  extensionRevamp: boolean;
}

export const test = base.extend<TestFixtures, TestOptions>({
  extensionRevamp: [true, { option: true }],

  globalPage: async ({ page, extensionRevamp }, use) => {
    const globalPage = new GlobalPage(page, { extensionRevamp });
    await use(globalPage);
  },
});
```

#### 2.3 Create Playwright projects for each flag state

```typescript
// playwright.config.ts
projects: [
  {
    name: 'revamp-enabled',
    use: {
      ...devices['Desktop Chrome'],
      extensionRevamp: true,
    },
    testDir: './tests/specs',
  },
  {
    name: 'revamp-disabled',
    use: {
      ...devices['Desktop Chrome'],
      extensionRevamp: false,
    },
    testDir: './tests/specs-legacy',
  },
],
```

### Phase 3: MSW-Style Handler Migration

#### 3.1 Create handler definitions (matching apps/web pattern)

```typescript
// tests/mocks/handlers/stacks-balances.handler.ts
export const stacksBalancesHandler = {
  path: 'https://api.mainnet.hiro.so/extended/v1/address/*/balances',
  method: 'get',
  resp: {
    stx: { balance: '1000000', locked: '0' },
    fungible_tokens: {},
    non_fungible_tokens: {},
  },
} as const;
```

#### 3.2 Create handler registry

```typescript
// tests/mocks/handlers/index.ts
import { stacksBalancesHandler } from './stacks-balances.handler';
import { btcUtxosHandler } from './btc-utxos.handler';
// ... more imports

export const allHandlers = [
  stacksBalancesHandler,
  btcUtxosHandler,
  // ... all handlers
];

export const successHandlers = allHandlers;
export const errorHandlers = allHandlers.map(h => ({
  ...h,
  resp: { error: 'Internal Server Error' },
  status: 500,
}));
```

#### 3.3 Create Playwright route helper

```typescript
// tests/mocks/setup-handlers.ts
interface Handler {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  resp: unknown;
  status?: number;
  delay?: number;
}

export async function setupHandlers(page: Page, handlers: Handler[]) {
  for (const handler of handlers) {
    await page.route(handler.path, async route => {
      if (handler.delay) await new Promise(r => setTimeout(r, handler.delay));
      await route.fulfill({
        status: handler.status ?? 200,
        json: handler.resp,
      });
    });
  }
}
```

### Phase 4: New Test Folder Structure

```
tests/
├── specs/                      # Existing tests (keep running)
│   └── ...
├── specs-revamp/               # NEW: Tests for revamp features only
│   ├── settings/
│   │   └── settings-page.spec.ts
│   ├── network/
│   │   ├── select-network.spec.ts
│   │   └── add-network.spec.ts
│   ├── theme/
│   │   └── select-theme.spec.ts
│   └── home/
│       ├── account-card.spec.ts
│       └── action-buttons.spec.ts
├── specs-legacy/               # NEW: Tests that only apply to legacy
│   └── ...                     # (may be empty, for deprecated code paths)
├── features/                   # NEW: BDD feature files
│   └── ...
├── steps/                      # NEW: Step definitions
│   └── ...
├── mocks/
│   ├── handlers/               # NEW: MSW-style handlers
│   │   ├── index.ts
│   │   ├── stacks/
│   │   ├── bitcoin/
│   │   └── services/
│   └── ...                     # Keep existing mocks for migration period
└── ...
```

### Phase 5: test-config Package Enhancements

#### 5.1 Add Playwright utilities

```typescript
// packages/test-config/src/playwright/index.ts
export { createTestSelector } from './create-test-selector';
export { json, delayedJson } from './response-helpers';
export { createPlaywrightConfig } from './config-builder';
```

#### 5.2 Add shared test data

```typescript
// packages/test-config/src/test-data/addresses.ts
export const TEST_ADDRESSES = {
  BTC_MAINNET_NATIVE_SEGWIT: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
  BTC_TESTNET_NATIVE_SEGWIT: 'tb1qr8me8t9gu9g6fu926ry5v44yp0wyljrespjtnz',
  STX_MAINNET: 'SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE',
  // ... more
} as const;
```

#### 5.3 Add mock handler utilities

```typescript
// packages/test-config/src/playwright/handler-utils.ts
export interface MockHandler<T = unknown> {
  path: string | RegExp;
  method: 'get' | 'post' | 'put' | 'delete';
  resp: T;
  status?: number;
  delay?: number;
}

export function createHandler<T>(config: MockHandler<T>): MockHandler<T> {
  return config;
}
```

### Phase 6: CI Strategy

#### 6.1 Update workflow to test both flag states

```yaml
# .github/workflows/extension:integration-tests.yml
jobs:
  test:
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        shardTotal: [10]
        extensionRevamp: [true, false]  # NEW: Test both states
    steps:
      - name: run-playwright-tests
        run: xvfb-run pnpm playwright test tests/specs --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} --project=${{ matrix.extensionRevamp && 'revamp-enabled' || 'revamp-disabled' }}
```

#### 6.2 Create separate test commands

```json
// package.json scripts
{
  "test:integration": "playwright test",
  "test:integration:revamp": "playwright test --project=revamp-enabled",
  "test:integration:legacy": "playwright test --project=revamp-disabled",
  "test:integration:all": "playwright test"
}
```

### Phase 7: Coverage Gap Analysis

#### Features needing tests (extensionRevamp enabled)

| Feature | Priority | Files to Test |
|---------|----------|---------------|
| Settings Page | High | `settings.tsx`, `menu-buttons.tsx` |
| Network Selection | High | `select-network.tsx`, `network-list-item.tsx` |
| Theme Selection | Medium | `select-theme.tsx`, `theme-list-item.tsx` |
| Account Card (Current) | High | `account-current.card.tsx` |
| Account Actions | High | `account-actions.tsx`, `fund-buttons.tsx`, `transfer-buttons.tsx` |
| Header Grid | Medium | `header-grid-current.tsx` |
| Secret Key View | Medium | `view-secret-key-current.tsx` |

#### General coverage gaps

| Feature | Priority | Notes |
|---------|----------|-------|
| Buy/Sell Flows | High | Onramper integration |
| Backup/Recovery | High | Secret key export, recovery |
| Token Details | Medium | Price history, balance breakdown |
| Error Recovery | Medium | Network failures, retry logic |
| Accessibility | Low | WCAG compliance |

## Migration Strategy

### Week 1-2: Foundation
- [ ] Install playwright-bdd
- [ ] Create feature file structure
- [ ] Update LaunchDarkly mock for flag toggling
- [ ] Update fixtures with flag option

### Week 3-4: Handler Migration
- [ ] Create MSW-style handler definitions
- [ ] Migrate critical mocks (Stacks, Bitcoin, Leather API)
- [ ] Create handler registry and setup utilities
- [ ] Update test-config package

### Week 5-6: New Tests
- [ ] Write extensionRevamp feature tests
- [ ] Extract existing tests to BDD format
- [ ] Add coverage gap tests
- [ ] Create legacy-only test suite

### Week 7-8: CI Integration
- [ ] Update CI workflow for dual-flag testing
- [ ] Add parallel test projects
- [ ] Set up reporting for both flag states
- [ ] Document new testing patterns

## Example Feature File

```gherkin
# tests/features/settings/network-selection.feature
Feature: Network Selection
  As a user
  I want to switch between networks
  So that I can use different blockchain environments

  Background:
    Given I am signed in with a test account
    And I am on the home page

  Scenario: User can view available networks
    When I open the settings menu
    And I click on "Network"
    Then I should see the network selection page
    And I should see "Mainnet" as the current network
    And I should see at least 3 network options

  Scenario: User can switch to testnet
    When I open the settings menu
    And I click on "Network"
    And I select "Testnet"
    Then I should be redirected to the home page
    And I should see the testnet indicator

  Scenario: User can add a custom network
    When I open the settings menu
    And I click on "Network"
    And I click "Add network"
    And I fill in the network form with valid data
    And I click "Save"
    Then I should see my custom network in the list
```

## Success Metrics

1. **Coverage**: All extensionRevamp features have E2E tests
2. **Speed**: Test suite runs in <15 minutes per flag state
3. **Reliability**: <2% flaky test rate
4. **Maintainability**: BDD feature files readable by non-developers
5. **Parity**: Both flag states tested in CI on every PR
