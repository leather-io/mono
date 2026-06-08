---
date: 2026-05-26
type: reference
title: Multisig design iteration toolkit
companion_to: docs/plans/2026-05-26-001-feat-multisig-prototype-import-plan.md
audience: the designer iterating in the multisig sandbox fork after the initial import
---

# Multisig design iteration toolkit

Companion to the [multisig prototype import plan](plans/2026-05-26-001-feat-multisig-prototype-import-plan.md). The plan covers *what to build* (the sandbox + screens). This doc covers *how to iterate* once the import has landed — the design-pass phase, where most of the actual design work happens.

This is reference material, not implementation scope. Nothing here is a deliverable of the import plan; it's the toolkit you reach for when doing design passes in the fork. When you set up the fork, consider copying this into `apps/web/app/pages/multisig/_sandbox/ITERATING.md` so it lives next to the work.

Curated for the apps/web + Panda CSS + React Router v7 + Claude Code setup specifically.

---

## Iterating on a component or screen in code

**Claude Code as the primary iteration surface.** Highest-leverage tool — Claude reads the rendered screen, reads the code, proposes edits. Three modes worth practicing:

- **Direct intent** — describe how the screen should feel, not what to change. "The VaultCard feels visually heavy compared to the dashboard's other surfaces — try a quieter treatment." Let Claude propose the specific tokens, spacing, weight changes.
- **Targeted change** — name the element and the exact tweak. "Change StatusPill's pending variant to use `text.mono.md` instead of `text.mono.lg`, with 2px more vertical padding."
- **Comparison variations** — the mode Figma can't do without three files. "Show me three layouts side by side for the vault hero: chain-pill-left, chain-pill-right, and chain-pill-stacked-above-name. Render each in a new file under `vault/components/__variants/` so I can compare in browser tabs."

The `compound-engineering:ce-frontend-design` skill is built for this loop — it checks screenshots, verifies against design quality standards, avoids common AI-generated UI failure modes. Worth invoking when starting a new iteration cycle.

---

## Live in-browser tweaking with Tweakpane

For the "I want to move this 4px and see what happens *right now*" loop — inspired by dialkit, but token-aware and self-hosted. [Tweakpane](https://tweakpane.github.io/docs/) (~30KB) renders a floating control panel; you bind its inputs to Panda CSS variables and tweak live without touching source.

### ⚠️ Verify this works against the actual Panda config FIRST

Before investing in a Tweakpane panel, confirm Panda actually emits CSS custom properties for the tokens you want to tweak. This is **not guaranteed** — Panda's static extraction can compile `css={{ p: 'space.04' }}` to a literal class (`.pl_4 { padding-left: 1rem }`) rather than `var(--leather-spacing-space\.04)`. If it compiles to a literal, a runtime CSS-variable override does nothing.

30-minute check before building the panel:
1. Add a throwaway `<Box p="space.04">` somewhere in apps/web
2. Run `pnpm dev`, inspect the compiled CSS for that element in DevTools
3. Confirm whether `padding` resolves to `var(--leather-spacing-...)` or a literal `1rem`

If it's `var(...)` → Tweakpane works for that token category. If it's a literal → Tweakpane only works for token categories Panda *does* emit as vars (commonly colors via semantic tokens), and you should scope the panel to those.

### Correct variable names

apps/web's Panda config sets `prefix: 'leather'`, and token paths with dots are **literally dot-escaped** in the emitted CSS variable. The real names look like:

- `--leather-spacing-space\.04` (note the escaped dot)
- `--leather-colors-ink-action-primary-default`

Two gotchas:
- The sketch's `--spacing-4` / `--accent` / `--borderRadius` names **do not exist** — don't use them
- `document.documentElement.style.setProperty()` takes the **unescaped** form: `setProperty('--leather-spacing-space.04', ...)`. The escape is only in the CSS source, not the DOM API. Verify the round-trip on one token before wiring the whole panel

The reliable way to get names right: import the token map from `leather-styles/tokens` and read each token's `.variable` string rather than hand-writing names.

### Setup

```bash
pnpm --filter @leather.io/web add -D tweakpane
```

Create `apps/web/app/pages/multisig/_sandbox/tweak-panel.tsx`, mount in `multisig.layout.tsx` behind `import.meta.env.DEV`. Sketch (names are illustrative — derive real ones from `leather-styles/tokens`):

```tsx
import { Pane } from 'tweakpane';
import { useEffect } from 'react';

export function TweakPanel() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const pane = new Pane({ title: 'Sandbox tweaks', expanded: false });
    const state = { spacing04: 16, accent: '#FF5500' };

    pane.addBinding(state, 'spacing04', { min: 0, max: 64, step: 1 })
      .on('change', e => {
        // unescaped form for the DOM API
        document.documentElement.style.setProperty('--leather-spacing-space.04', `${e.value}px`);
      });

    return () => pane.dispose();
  }, []);
  return null;
}
```

### What to expose (resolve actual token keys before building)

Don't ship the panel with guessed token keys. Pull the real keys from `leather-styles/tokens` and build a small table — display name / CSS variable / default / why it matters — then bind those. Likely v1 set:
- Everyday spacing tokens (`space.03`–`space.08`)
- Cross-screen colors (accent, surface, border, text-primary, text-secondary) — most likely to actually be emitted as vars
- Border radii
- Chain-specific colors (BTC orange + STX accent) — they drive the multisig visual identity

### Translate-back: when is a tweaked value "ready" to commit to code?

Tweakpane values don't ship — they're a thinking surface. When a value feels right, bake it into code using this decision rule:
- **Matches an existing Panda token exactly** → use the token reference
- **Net-new and used in 2+ places** → propose a TOKEN-GAP addition (batched per the plan's U2 convention)
- **One-off component override** → inline it with a comment

Visual review criterion before committing: screenshot before/after, check it at 1x and 2x; if you wouldn't change it on a second look, it's ready.

### Persistence caveat

Tweakpane state can persist to `localStorage` via `pane.exportState()`. **But** if you persist overrides and then `git fetch upstream` lands a token-default change, your stale localStorage override masks the real new value — you'll think the token change didn't apply. Either tie the localStorage key to the `@leather.io/tokens` package version (prompt to clear on mismatch), or skip persistence entirely and accept that a reload loses tweaks (sliders are cheap to re-drag).

### Boundary

Dev-only via `import.meta.env.DEV`; Tweakpane in `devDependencies` so production tree-shakes it out. Never appears in extracted production code.

---

## Pulling design references from real apps

The `lazyweb` plugin skills are the strongest reference-finders here:

- **`/lazyweb:lazyweb-quick-references`** — "show me how other apps do an empty-state vault list" — downloads real screenshots locally, grouped by pattern. Fast unblocking.
- **`/lazyweb:lazyweb-design-research`** — deeper research combining Lazyweb's screenshot DB with web research; structured report with downloaded references. For real design decisions (e.g., "how should the tx status timeline progress visually?").
- **`/lazyweb:lazyweb-design-brainstorm`** — deliberately searches outside the obvious category for cross-pollination. For when a screen feels generic.
- **`/lazyweb:lazyweb-design-improve`** — screenshot your current design, get backed-by-references improvement ideas. For "this feels off but I can't articulate why."

---

## Self-critique via the rendered output

Iterating blind is much worse than iterating against a screenshot:

- **Screenshot every change.** Chrome DevTools (Cmd+Shift+P → "Capture full size screenshot") or Playwright's screenshot tool. Paste before/after into the conversation with Claude — visual comparison beats reading diffs.
- **Multi-viewport check on every milestone.** Chrome DevTools device emulation for spot checks; Polypane (~$15/mo) for side-by-side viewports if you want systematic responsive review.

---

## Finding the right atom before reinventing

Before building a new primitive in `pages/multisig/components/`, check `@leather.io/ui`:

- Browse `packages/ui/src/components/` (one folder per atom)
- Or grep: `grep -r "export" packages/ui/src/exports.web.ts | head -50`
- For tokens: `packages/ui/leather-styles/tokens/`; `@leather.io/panda-preset` holds the active theme

If an atom is close but not exact, wrap it over building from scratch. Document the wrapping decision in the sandbox README so Edgar sees the pattern at extraction.

---

## Connecting Figma and code (when Storybook lands or before)

Once Edgar's Storybook is up, the figma plugin skills bridge the design system:

- **`/figma:figma-generate-design`** — push a completed screen back into Figma for non-engineers to browse
- **`/figma:figma-code-connect`** — map sandbox components to Figma counterparts

Forward-looking — useful when there's a stable Figma design system to round-trip with. The first multisig pass doesn't need it.

---

## Animation and interaction review

For the prototype's motion (sidebar transitions, modal stepper, tx status progression):

- **Chrome DevTools → Animations panel** — captures running animations; scrub at slow speed, inspect timing functions
- **React DevTools** — for Framer Motion (if `@leather.io/ui` uses it), shows current motion values

---

## Accessibility / contrast / color

- **axe DevTools** (browser extension) — a11y audits; surfaces contrast/focus issues that are often visual problems too
- **Stark** — color-blindness simulation, contrast checking. Pair with the Hurff error-state designs (destructive red is the most common contrast failure)

---

## What NOT to add (yet)

- **Chromatic / Percy** — overkill until Storybook lands and there's a component catalog to diff
- **Vercel v0 / AI design-to-code services** — generate code that doesn't match Panda or `@leather.io/ui`; more un-doing than building
- **Histoire / Ladle** — Edgar is going with Storybook; don't bring a second preview tool

---

## Suggested rhythm for a design pass

A rhythm worth *trying* — not a mandate; adjust to how you actually work:

1. Pick one screen + scenario + state cell (a single sandbox link)
2. Screenshot the current state
3. ~10 minutes with `/lazyweb:lazyweb-quick-references` on how other apps handle the pattern
4. Iterate in Claude Code (direct intent or comparison variations), 2-3 cycles
5. Screenshot the result, compare against the start
6. Worse → revert; better → keep
7. Next cell

Designed to converge fast without over-engineering any single screen. Goal is good-enough-for-Edgar-to-extract, not perfect.
