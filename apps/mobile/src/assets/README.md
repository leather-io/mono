# Lottie Animation Assets

This directory contains Lottie animation files used throughout the mobile app.

## Auto-Generated Colors

The following Lottie files have their background colors **automatically synchronized** with design tokens from `@leather.io/tokens`:

- `lottie-splash-screen-light.json` - Uses `ink.text-primary` from light theme
- `lottie-splash-screen-dark.json` - Uses `ink.text-non-interactive` from dark theme
- `lottie-locked-splash-screen-light.json` - Uses `ink.text-primary` from light theme
- `lottie-locked-splash-screen-dark.json` - Uses `ink.text-non-interactive` from dark theme

### How It Works

The `scripts/sync-lottie-colors.js` script automatically updates the `metadata.backgroundColor` field in these files based on the current token values from `@leather.io/tokens`.

This script runs:

- ✅ Automatically during `pnpm install` (via postinstall hook)
- ✅ Manually with `pnpm sync-lottie-colors`
- ✅ After any changes to `@leather.io/tokens`

### Updating Colors

**⚠️ DO NOT manually edit the `backgroundColor` in these JSON files.**

Instead, follow this workflow:

1. **Update the source tokens** in `packages/tokens/src/colors.ts`
2. **Rebuild the tokens package**: `pnpm -w build` (from monorepo root)
3. **Run the sync script**: `cd apps/mobile && pnpm sync-lottie-colors`
4. The Lottie files will be automatically updated with the new colors

### Why This Matters

The Lottie animations contain a "helper shape" (named `random-ass-thing-to-keep-stroke-intact`) that's used for animation-technical reasons. This shape must match the app's background color exactly, otherwise it becomes visible as an artifact.

**The "hat" bug** (reported on Google Pixel 8A): This was caused by the dark mode Lottie files having `rgb(113, 106, 96)` instead of the correct `rgb(158, 153, 150)` that matches `ink.text-non-interactive`.

By binding to design tokens, we ensure:

- ✅ Colors stay in sync when tokens are updated
- ✅ No manual updates to multiple files
- ✅ Prevents visual bugs like the "hat" artifact
- ✅ Single source of truth for colors
- ✅ Type-safe color references

### Current Color Mappings

| File                                     | Theme | Token                      | Current Value             |
| ---------------------------------------- | ----- | -------------------------- | ------------------------- |
| `lottie-splash-screen-light.json`        | Light | `ink.text-primary`         | `#12100F` (18, 16, 15)    |
| `lottie-locked-splash-screen-light.json` | Light | `ink.text-primary`         | `#12100F` (18, 16, 15)    |
| `lottie-splash-screen-dark.json`         | Dark  | `ink.text-non-interactive` | `#9E9996` (158, 153, 150) |
| `lottie-locked-splash-screen-dark.json`  | Dark  | `ink.text-non-interactive` | `#9E9996` (158, 153, 150) |

### Troubleshooting

**If you see a visual artifact on the splash screen:**

1. Verify the script has run: `pnpm sync-lottie-colors`
2. Check the `metadata.backgroundColor` values in the JSON files match the table above
3. Verify the background colors in `apps/mobile/src/components/splash-screen-guard/splash-screen-guard.tsx` match:
   ```typescript
   backgroundColor={whenTheme({
     light: 'ink.text-primary',
     dark: 'ink.text-non-interactive',
   })}
   ```
4. Clear the Metro bundler cache: `pnpm start --clear`

**If the script fails:**

- Make sure `@leather.io/tokens` is built: `pnpm -w build`
- Check that Node.js can import ES modules
- Verify the file paths in `scripts/sync-lottie-colors.js` are correct

### CI/CD Integration

The postinstall hook ensures colors are always synced when dependencies are installed, including:

- Local development: `pnpm install`
- CI builds
- EAS builds
- Teammate setups

This guarantees everyone has the correct colors without manual intervention.

## Testing

The sync script is covered by comprehensive unit tests in [`apps/mobile/scripts/sync-lottie-colors.spec.js`](../scripts/sync-lottie-colors.spec.js).

### Running Tests

```bash
# Run only the Lottie color sync tests
pnpm test:unit scripts/sync-lottie-colors.spec.js

# Run all unit tests (includes Lottie tests)
pnpm test:unit
```

### Test Coverage

The tests verify:

- Hex-to-RGB conversion for all color formats
- Correct token-to-file mappings for light and dark themes
- Lottie JSON metadata updates preserve structure
- Regression prevention (e.g., the "hat" bug with wrong colors)
- Edge cases and error handling

These tests run automatically in CI to catch any regressions before deployment.
