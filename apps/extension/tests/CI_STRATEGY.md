# CI Testing Strategy for extensionRevamp Flag

## Overview

This document outlines the CI strategy for testing both the legacy and new extensionRevamp code paths.

## Current Setup

The test infrastructure now supports testing with different feature flag configurations via Playwright projects:

- `revamp-enabled`: Runs existing specs with extensionRevamp=true (new UI)
- `revamp-disabled`: Runs existing specs with extensionRevamp=false (legacy UI)
- `revamp-only`: Runs new specs in specs-revamp/ (only for new features)
- `chromium`: Default project (revamp enabled)

## Available Commands

```bash
# Run with revamp enabled (default, same as current behavior)
pnpm test:integration

# Run with revamp enabled explicitly
pnpm test:integration:revamp

# Run with revamp disabled (legacy code path)
pnpm test:integration:legacy

# Run only revamp-specific tests
pnpm test:integration:revamp-only

# Run all revamp tests (existing + new specs)
pnpm test:integration:all
```

## CI Workflow Options

### Option 1: Keep Current Behavior (Recommended for Initial Rollout)
Run only with revamp enabled until the flag is ready to be deprecated:

```yaml
- name: run-playwright-tests
  run: xvfb-run pnpm playwright test tests/specs --project=revamp-enabled --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} --workers=1
```

### Option 2: Test Both Flag States (Comprehensive)
Add a matrix dimension for the flag state:

```yaml
jobs:
  test:
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        shardTotal: [10]
        project: ['revamp-enabled', 'revamp-disabled']
    steps:
      - name: run-playwright-tests
        run: xvfb-run pnpm playwright test tests/specs --project=${{ matrix.project }} --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} --workers=1
```

**Note**: This doubles CI time. Consider running legacy tests on a schedule or only on main branch.

### Option 3: Separate Workflows
Create two workflows:
1. `extension:integration-tests.yml` - Run revamp-enabled on PRs
2. `extension:legacy-tests.yml` - Run revamp-disabled on schedule or main branch

### Option 4: Conditional Based on Branch
Run both on dev/main, only revamp-enabled on PRs:

```yaml
- name: run-revamp-tests
  run: xvfb-run pnpm playwright test tests/specs --project=revamp-enabled --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} --workers=1

- name: run-legacy-tests
  if: github.ref == 'refs/heads/dev' || github.ref == 'refs/heads/main'
  run: xvfb-run pnpm playwright test tests/specs --project=revamp-disabled --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} --workers=1
```

## Recommended Approach

1. **During Development**: Run revamp-enabled tests on PRs (faster feedback)
2. **On Main/Dev Branch**: Run both flag states to ensure no regressions
3. **After Flag Removal**: Remove revamp-disabled project, delete legacy-only tests

## Test Organization

```
tests/
├── specs/                  # Shared tests (work with both flag states)
├── specs-revamp/           # Tests specific to new extensionRevamp features
├── specs-legacy/           # Tests specific to legacy features (if needed)
├── features/               # BDD feature files
└── steps/                  # Step definitions
```

## Migration Path

1. **Phase 1 (Current)**: Tests run with revamp enabled by default
2. **Phase 2**: Add CI coverage for both flag states
3. **Phase 3**: Deprecate flag, remove revamp-disabled project
4. **Phase 4**: Consolidate specs-revamp into specs, remove legacy code
