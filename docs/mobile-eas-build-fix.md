# EAS Mobile Build Fix - Decoupling Builds from Package Management

## Problem

The EAS build for the mobile app was failing because:

1. Web-specific `prepare` lifecycle scripts were running during `pnpm install`
2. These scripts (panda codegen, type generation) required dependencies that weren't ready
3. This coupled build requirements to package management, creating fragile build chains

### Error Symptoms
```
apps/mobile postinstall: @leather.io/models:build: ℹ Build start
apps/web prepare: ✘ [ERROR] Could not resolve "@leather.io/tokens"
apps/web prepare:     ../../packages/panda-preset/src/typography.ts:3:35:
apps/web prepare:       3 │ import { getWebTextVariants } from '@leather.io/tokens';
```

## Root Cause Analysis

**The Lifecycle Hook Problem:**

NPM/PNPM lifecycle hooks like `prepare` run automatically during `pnpm install`, causing:

1. **Tight Coupling**: Build requirements coupled to package installation
2. **Ordering Issues**: Scripts run before dependencies are ready
3. **Cross-Contamination**: Mobile installs trigger web build scripts
4. **Fragility**: Any change to dependency tree can break builds

**What Was Happening:**

```
pnpm install (anywhere in monorepo)
├── packages/tokens/prepare → builds tokens
├── packages/panda-preset/prepare → tries to build (needs tokens)
├── apps/web/prepare → runs panda codegen (needs panda-preset)
└── apps/extension/prepare → runs panda codegen (needs panda-preset)
```

This created a fragile chain where mobile installs would trigger web builds!

## Solution: Remove Lifecycle Hooks, Explicit Builds

Following the lead dev's guidance, we've **completely removed `prepare` scripts** and made each build system explicitly declare what it needs.

### Design Principles

1. **Decouple builds from package management**: Builds happen in build phase, not install phase
2. **Explicit over implicit**: Each app's build script declares what it needs
3. **Let Turbo handle dependencies**: Turbo's `dependsOn: ["^build"]` builds deps in correct order
4. **Optimize with BUILD_TARGET**: Only build what each platform needs

## Implementation

### 1. Removed ALL Prepare Scripts

#### `packages/tokens/package.json`
```diff
- "prepare": "pnpm build",
  "prepublish": "pnpm build"  # Only for npm publishing
```

#### `packages/panda-preset/package.json`
```diff
- "prepare": "pnpm build"
+ # No lifecycle hooks!
```

#### `apps/web/package.json`
```diff
- "prepare": "pnpm cf-typegen && panda codegen"
+ "prepare:build": "pnpm cf-typegen && panda codegen"
+ "build": "pnpm run prepare:build && NODE_OPTIONS='--import ./instrument.server.mjs' react-router build"
```

**Key Change:** Web build now **explicitly calls** `prepare:build` instead of relying on lifecycle hooks.

#### `apps/extension/package.json`
```diff
- "prepare": "panda codegen"
+ "prepare:build": "panda codegen"
+ "prebuild": "pnpm run prepare:build"
```

**Key Change:** Extension build now **explicitly calls** `prepare:build` via `prebuild`.

### 2. Mobile EAS Build Hook (Simplified!)

#### `apps/mobile/package.json`
```json
{
  "scripts": {
    "eas-build-post-install": "cd ../.. && pnpm install --filter=@leather.io/mobile... && BUILD_TARGET=mobile pnpm build:mobile"
  }
}
```

**Key Changes:**
- No special env vars needed during install (no prepare scripts to avoid!)
- Just install mobile deps normally
- Build phase sets `BUILD_TARGET=mobile` for optimization

### 3. Turbo Handles Build Order

#### `turbo.json`
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

**How It Works:**

When building mobile:
```
turbo build:mobile
├── Builds @leather.io/tokens first ✅
├── Builds @leather.io/ui (native only) ✅
├── Skips @leather.io/panda-preset (not a mobile dep) ✅
└── Builds mobile app ✅
```

When building web:
```
turbo build:web
├── Builds @leather.io/tokens first ✅
├── Builds @leather.io/panda-preset ✅
├── Builds @leather.io/ui (web only) ✅
├── Web app calls prepare:build (panda codegen) ✅
└── Builds web app ✅
```

### 4. BUILD_TARGET for Optimization

#### `packages/ui/build-conditional.sh`
```bash
case "$BUILD_TARGET" in
  mobile)
    pnpm build:native  # Only native
    ;;
  web|extension)
    pnpm build:web  # Only web (includes panda)
    ;;
  *)
    pnpm build:native && pnpm build:web  # Both (local dev)
    ;;
esac
```

**Purpose:** Performance optimization only, not error prevention
- Mobile doesn't need web UI components
- Web doesn't need native UI components
- Saves build time and resources

## Verification: Mobile Never Needs Panda

✅ **Confirmed:**

1. **Mobile doesn't depend on panda-preset**:
   ```bash
   grep -r "@leather.io/panda-preset" apps/mobile/
   # No matches!
   ```

2. **UI native build doesn't use panda**:
   ```json
   {
     "build:native": "tsdown --config tsdown.config.native.ts"
     "build:web": "panda && tsdown --config tsdown.config.web.ts"
   }
   ```

3. **Panda config only includes *.web.ts files**:
   ```js
   // packages/ui/panda.config.ts
   include: [
     './src/**/*.web.{ts,tsx}',
     // NOT *.native.ts files!
   ]
   ```

## Build Flow Comparison

### Before (Broken - Coupled)
```
pnpm install
├── prepare scripts run automatically ❌
│   ├── tokens/prepare → builds
│   ├── panda-preset/prepare → builds
│   ├── web/prepare → panda codegen (may fail)
│   └── extension/prepare → panda codegen (may fail)
└── Mobile install triggers web builds! ❌

turbo build:mobile
└── Assumes everything is already built ⚠️
```

### After (Fixed - Decoupled)
```
pnpm install
└── No prepare scripts run ✅
    Just installs packages!

turbo build:mobile (BUILD_TARGET=mobile)
├── Builds tokens ✅
├── Builds UI (native only) ✅
├── Skips panda-preset (not needed) ✅
└── Builds mobile ✅

turbo build:web (BUILD_TARGET=web)
├── Builds tokens ✅
├── Builds panda-preset ✅
├── Builds UI (web only) ✅
├── Web app explicitly calls prepare:build ✅
└── Builds web ✅
```

## Benefits

1. ✅ **Decoupled**: Builds happen in build phase, not install phase
2. ✅ **Explicit**: Each app declares what it needs
3. ✅ **Reliable**: Turbo ensures correct build order
4. ✅ **No Cross-Contamination**: Mobile installs don't trigger web builds
5. ✅ **Maintainable**: Clear, predictable build flow
6. ✅ **Optimized**: BUILD_TARGET skips unnecessary builds

## Why This is Better Than Lifecycle Hooks

| Aspect | Lifecycle Hooks (`prepare`) | Explicit Builds |
|--------|----------------------------|-----------------|
| **When** | During `pnpm install` | During build phase |
| **Control** | Automatic (implicit) | Manual (explicit) |
| **Order** | Unpredictable | Controlled by Turbo |
| **Coupling** | Tight (install → build) | Loose (separate phases) |
| **Debugging** | Hard to trace | Clear call chain |
| **Cross-contamination** | Common | Impossible |

## Testing

### CI Validation (Recommended)

A GitHub Actions workflow runs on every release and mobile-related PR:

```yaml
# .github/workflows/validate-mobile-build.yml
name: Validate Mobile Build

on:
  release:
    types: [published]
  pull_request:
    paths:
      - 'apps/mobile/**'
      - 'packages/**'
```

**This catches issues before EAS builds**, saving ~10-15 minutes per failed build.

**What it validates:**
- ✅ Mobile build succeeds
- ✅ No web artifacts created
- ✅ No prepare scripts ran during install
- ✅ Only native UI built

**View results:** Check the Actions tab on GitHub

### Local Testing

```bash
# Run the same validation locally
./scripts/test-mobile-build.sh

# Or manually
cd /path/to/mono
pnpm install --filter=@leather.io/mobile...
BUILD_TARGET=mobile pnpm build:mobile
```

### Expected Results

✅ **During Install:**
- No prepare scripts run
- No build errors during install
- Just installs packages

✅ **During Build:**
- Turbo builds dependencies in correct order
- Only mobile-relevant packages built
- No panda, no web artifacts

✅ **Validation Script Output:**
```
✅ PASS: No web artifacts (correct)
✅ PASS: UI native build exists
🎉 Ready for EAS build!
```

### Verify Prepare Scripts Are Gone

```bash
# Should find no "prepare" scripts in these files:
grep '"prepare":' packages/tokens/package.json
grep '"prepare":' packages/panda-preset/package.json
grep '"prepare":' apps/web/package.json
grep '"prepare":' apps/extension/package.json

# Should only find "prepare:build" (explicit, not lifecycle):
grep '"prepare:build":' apps/web/package.json
grep '"prepare:build":' apps/extension/package.json
```

## CI/CD Configuration

### Mobile (EAS)

**No changes needed!** The `eas-build-post-install` hook handles everything:

```json
{
  "eas-build-post-install": "cd ../.. && pnpm install --filter=@leather.io/mobile... && BUILD_TARGET=mobile pnpm build:mobile"
}
```

### Web CI

```yaml
# .github/workflows/web.yml
- name: Install dependencies
  run: pnpm install --filter=@leather.io/web...

- name: Build web app
  run: BUILD_TARGET=web pnpm build:web
  # Web's build script explicitly calls prepare:build
```

### Extension CI

```yaml
# .github/workflows/extension.yml
- name: Install dependencies
  run: pnpm install --filter=@leather.io/extension...

- name: Build extension
  run: BUILD_TARGET=extension pnpm build:extension
  # Extension's prebuild explicitly calls prepare:build
```

## Root Package Scripts

```json
{
  "scripts": {
    "build:mobile": "BUILD_TARGET=mobile turbo run build --filter=@leather.io/mobile",
    "build:web": "BUILD_TARGET=web turbo run build --filter=@leather.io/web",
    "build:extension": "BUILD_TARGET=extension turbo run build --filter=@leather.io/extension"
  }
}
```

Each platform build:
1. Sets BUILD_TARGET for optimization
2. Uses Turbo filter to scope build
3. Turbo builds dependencies in correct order
4. Apps explicitly call their prepare:build when needed

## Future Considerations

### Adding New Apps

When adding a new app that needs panda/codegen:

1. ❌ **DON'T** use `prepare` lifecycle hook
2. ✅ **DO** create a `prepare:build` script
3. ✅ **DO** call it explicitly in your build script or prebuild

Example:
```json
{
  "scripts": {
    "prepare:build": "panda codegen",
    "prebuild": "pnpm run prepare:build",
    "build": "webpack ..."
  }
}
```

### Adding New Packages

When adding a new package with build requirements:

1. ❌ **DON'T** use `prepare` lifecycle hook
2. ✅ **DO** let Turbo's `dependsOn: ["^build"]` handle build order
3. ✅ **DO** keep `prepublish` for npm publishing only

### When to Use Lifecycle Hooks

**Good uses:**
- `prepublish` - For npm package publishing
- `preinstall` - For validation (e.g., "use pnpm")

**Bad uses:**
- `prepare` - For building packages (use explicit builds)
- `postinstall` - For building packages (use explicit builds)

## Troubleshooting

### Problem: "Cannot find module" during build

**Likely Cause:** Turbo isn't building dependencies

**Solution:** Ensure `turbo.json` has:
```json
{
  "build": {
    "dependsOn": ["^build"]
  }
}
```

### Problem: Panda styles not generated for web

**Likely Cause:** `prepare:build` not called

**Solution:** Check web's build script calls `prepare:build`:
```json
{
  "build": "pnpm run prepare:build && react-router build"
}
```

### Problem: Mobile build still triggers web builds

**Likely Cause:** Stale prepare scripts or wrong deps

**Solution:**
1. Verify no prepare scripts: `grep -r '"prepare":' packages/ apps/`
2. Check mobile doesn't depend on web packages
3. Run clean install: `pnpm install:fresh`

## Related Files

- `apps/mobile/package.json` - EAS build hook (no BUILD_TARGET during install)
- `apps/web/package.json` - Explicit `prepare:build` script
- `apps/extension/package.json` - Explicit `prepare:build` script
- `packages/panda-preset/package.json` - NO prepare script
- `packages/tokens/package.json` - NO prepare script (only prepublish)
- `packages/ui/build-conditional.sh` - BUILD_TARGET optimization
- `turbo.json` - Dependency build order
- `scripts/test-mobile-build.sh` - Validation script

## Key Takeaways

1. **Lifecycle hooks are for package management, not builds**
2. **Decouple build requirements from install phase**
3. **Let build systems (Turbo) handle build order**
4. **Be explicit about what each app needs**
5. **Optimize with BUILD_TARGET, but don't rely on it for correctness**
