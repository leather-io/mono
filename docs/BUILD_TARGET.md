# Build System Quick Reference

## Core Principle

**Decouple builds from package management.**

- ❌ Don't use `prepare` lifecycle hooks for builds
- ✅ Use explicit `prepare:build` scripts called by build systems
- ✅ Let Turbo handle dependency build order
- ✅ Use BUILD_TARGET for optimization only

## Package Lifecycle Scripts

### ❌ DON'T Use These for Builds

```json
{
  "prepare": "pnpm build"  // ❌ Runs during install, causes problems
  "postinstall": "pnpm build"  // ❌ Runs during install, causes problems
}
```

**Why not?**
- Couples builds to package installation
- Runs before dependencies are ready
- Causes cross-contamination (mobile installs trigger web builds)
- Hard to debug and maintain

### ✅ DO Use These

```json
{
  "prepare:build": "panda codegen",  // ✅ Explicit, called by build system
  "prebuild": "pnpm run prepare:build",  // ✅ Explicit pre-build step
  "build": "pnpm run prepare:build && webpack ..."  // ✅ Explicit in build
}
```

**Why?**
- Explicit and clear what's happening
- Only runs during build phase, not install
- Full control over when it runs
- Easy to debug

### When Lifecycle Hooks ARE Appropriate

```json
{
  "preinstall": "npx only-allow pnpm",  // ✅ Validation
  "prepublish": "pnpm build",  // ✅ For npm publishing
  "postpublish": "echo 'Published!'"  // ✅ Notification
}
```

## BUILD_TARGET Usage

### Purpose

**Optimization only** - skip building components not needed for target platform.

| Value | Purpose | What Gets Built |
|-------|---------|-----------------|
| `mobile` | Mobile/native only | UI native, tokens, mobile deps |
| `web` | Web only | UI web, panda-preset, web deps |
| `extension` | Extension only | UI web, panda-preset, extension deps |
| `(unset)` | Local dev | Everything |

### Root Commands

```bash
# Mobile build (only native UI)
pnpm build:mobile

# Web build (only web UI)  
pnpm build:web

# Extension build (only web UI)
pnpm build:extension

# Build everything (local dev)
pnpm build
```

### Manual Override

```bash
# Force mobile-only build (saves time)
BUILD_TARGET=mobile pnpm build:mobile

# Build everything even for mobile (debugging)
BUILD_TARGET= pnpm build:mobile
```

## Build Flow

### Install Phase (No Builds!)

```bash
pnpm install --filter=@leather.io/mobile...
# Just installs packages
# NO prepare scripts run
# NO builds happen
✅ Fast and predictable
```

### Build Phase (Explicit Builds)

```bash
BUILD_TARGET=mobile pnpm build:mobile

# Turbo runs:
1. Builds @leather.io/tokens (dependency)
2. Builds @leather.io/ui (calls build-conditional.sh)
   - BUILD_TARGET=mobile → only native build
3. Skips @leather.io/panda-preset (not a mobile dep)
4. Builds mobile app
✅ Correct order, only what's needed
```

## How Apps Should Build

### Web App

```json
{
  "scripts": {
    "prepare:build": "pnpm cf-typegen && panda codegen",
    "build": "pnpm run prepare:build && react-router build"
  }
}
```

**Flow:**
1. Build script explicitly calls `prepare:build`
2. Runs codegen before main build
3. No lifecycle hooks involved

### Extension

```json
{
  "scripts": {
    "prepare:build": "panda codegen",
    "prebuild": "pnpm run prepare:build",
    "build": "webpack ..."
  }
}
```

**Flow:**
1. Build script implicitly calls `prebuild` (built-in pnpm hook)
2. `prebuild` explicitly calls `prepare:build`
3. Runs codegen before main build

## Turbo Dependency Management

### How It Works

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

**The `^` means:** "Build all workspace dependencies first"

### Example: Building Mobile

```
turbo build:mobile
└── Discovers mobile depends on:
    ├── @leather.io/ui
    │   └── Build native only (BUILD_TARGET=mobile)
    ├── @leather.io/tokens
    │   └── Build (no prepare hook, explicit turbo build)
    ├── @leather.io/models
    │   └── Build
    └── ... other deps
```

### Example: Building Web

```
turbo build:web
└── Discovers web depends on:
    ├── @leather.io/ui
    │   ├── First builds panda-preset (dependency)
    │   └── Build web only (BUILD_TARGET=web, runs panda)
    ├── @leather.io/tokens
    │   └── Build
    └── ... other deps
    
Web app runs:
└── build script → prepare:build → panda codegen
```

## Dependency Chains

### Mobile Dependency Chain

```
mobile
├── ui/native ← Only native, no panda
├── tokens ← Builds via turbo, not prepare
├── models ← Builds via turbo
└── [other packages] ← Builds via turbo

✅ panda-preset NOT in chain
✅ No web builds triggered
```

### Web Dependency Chain

```
web
├── ui/web ← Needs panda
│   └── panda-preset ← Builds via turbo (no prepare)
├── tokens ← Builds via turbo
└── [other packages] ← Builds via turbo

Web build script:
└── prepare:build → panda codegen
```

## Common Patterns

### Adding a New App with Codegen

```json
{
  "scripts": {
    // ❌ DON'T
    "prepare": "codegen",
    
    // ✅ DO
    "prepare:build": "codegen",
    "build": "pnpm run prepare:build && build-tool"
  }
}
```

### Adding a New Package

```json
{
  "scripts": {
    // ❌ DON'T
    "prepare": "pnpm build",
    
    // ✅ DO
    "build": "tsdown",
    // Let turbo handle when it builds
    
    // ✅ OK for npm publishing
    "prepublish": "pnpm build"
  }
}
```

### Adding UI Component Library

```json
{
  "scripts": {
    // ✅ Conditional build script
    "build": "sh build-conditional.sh",
    "build:native": "tsdown --config native.ts",
    "build:web": "panda && tsdown --config web.ts"
  }
}
```

```bash
# build-conditional.sh
case "$BUILD_TARGET" in
  mobile) pnpm build:native ;;
  web|extension) pnpm build:web ;;
  *) pnpm build:native && pnpm build:web ;;
esac
```

## CI/CD Setup

### Web CI

```yaml
- name: Install
  run: pnpm install --filter=@leather.io/web...
  
- name: Build
  run: BUILD_TARGET=web pnpm build:web
  env:
    BUILD_TARGET: web
```

### Extension CI

```yaml
- name: Install
  run: pnpm install --filter=@leather.io/extension...
  
- name: Build
  run: BUILD_TARGET=extension pnpm build:extension
  env:
    BUILD_TARGET: extension
```

## Testing

```bash
# Test mobile build
./scripts/test-mobile-build.sh

# Expected output:
# ✅ No prepare scripts executed during install
# ✅ Only native UI built
# ✅ panda-preset not built
# ✅ Decoupled build from package management

# Test web build
BUILD_TARGET=web pnpm build:web

# Test extension build
BUILD_TARGET=extension pnpm build:extension
```

## Troubleshooting

### Install Phase Issues

```bash
# Problem: Builds running during install
grep -r '"prepare":' packages/ apps/
# Should only find "prepare:build", not "prepare"

# Problem: Prepare scripts still exist
# Solution: Remove them, use explicit scripts instead
```

### Build Phase Issues

```bash
# Problem: Dependency not built
# Check turbo config has dependsOn
cat turbo.json | grep dependsOn

# Problem: Wrong target built
# Check BUILD_TARGET is set
echo $BUILD_TARGET
```

## Key Principles (Remember These!)

1. **Install phase:** Just install packages, no builds
2. **Build phase:** Explicit builds, controlled by build systems
3. **Turbo handles order:** Trust `dependsOn: ["^build"]`
4. **BUILD_TARGET is optimization:** Not required for correctness
5. **Be explicit:** Call `prepare:build` explicitly, don't rely on lifecycle hooks

## See Also

- [Test Script](../scripts/test-mobile-build.sh) - Validation script
