# Demo builds (all feature flags enabled)

Demo builds bypass LaunchDarkly and enable **all feature flags** automatically. This is useful for showcasing unreleased features to stakeholders, QA, or design reviews without needing LaunchDarkly configuration.

## Creating a demo build

### Option 1: Via workflow_dispatch (easiest)

1. Go to [Actions → extension:pr-build](https://github.com/leather-io/mono/actions/workflows/extension:pr-build.yml)
2. Click **Run workflow**
3. Select your branch
4. Check **"Enable demo mode (all flags on)"** _(if checkbox exists)_
5. Click **Run workflow**

**Note:** If the checkbox doesn't exist yet, use Option 2 or request the checkbox be added to the workflow.

### Option 2: Temporarily modify your PR branch

Add `DEMO_MODE: true` to the build step in `.github/workflows/extension:pr-build.yml`:

```yaml
- name: build-project
  working-directory: apps/extension
  run: pnpm build
  env:
    DEMO_MODE: true # ← Add this line
    WALLET_ENVIRONMENT: feature
    # ... rest of env vars
```

Commit and push. The PR build will have all flags enabled.

**Don't forget to remove this before merging!**

### Option 3: Local demo build

```bash
cd apps/extension
DEMO_MODE=true pnpm build
```

The extension will be built in `apps/extension/dist` with all flags enabled.

## How it works

When `DEMO_MODE=true`:

- `createLDProvider()` returns a noop provider (no LD connection)
- `useFlags()` returns all flags set to `true`
- No network calls to LaunchDarkly

## Current feature flags

```typescript
interface FeatureFlags {
  releaseOnramperBuy: boolean;
  releaseOnramperSell: boolean;
  extensionRevamp: boolean;
}
```

Update this list when adding new flags so stakeholders know what's enabled in demo mode.

## Regular PR builds (with LaunchDarkly)

PR builds use different client IDs depending on the label:

### Default PR builds (no label)
- Each install gets a random UUID
- **Not targetable** in LaunchDarkly (normal isolation)
- Suitable for most development work

### Internal testing PR builds (`internal-testing` label)
PR builds with the `internal-testing` label use a stable client ID: `leather-pr-builds`.

**To enable for a PR:**
1. Add the `internal-testing` label to your PR
2. Trigger a new build (or wait for automatic rebuild)
3. All artifacts will use stable ID `leather-pr-builds`

**To target in LaunchDarkly:**
1. Go to your LD project
2. Add targeting rule for context key: `leather-pr-builds`
3. Enable the flags you want internal-testing PR builds to use

**Benefits:**
- Control which features QA/designers see without rebuilding
- Test specific flag combinations in PRs
- Gradually roll out: internal-testing PRs → staging → production

**When to use:**
- QA testing specific feature combinations
- Design reviews of feature-flagged work
- Stakeholder demos that need LD control (but not full demo mode)
