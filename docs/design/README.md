# Leather Design Toolkit v0.1

Give an agent a feature brief. It uses existing Leather components and compositions, returns a clickable Playground, and includes checks and light/dark screenshots for review. New flows and missing patterns still need design decisions.

## Start

Use the repository's supported Node 22.15 or newer and pinned pnpm. Toolkit TypeScript commands include the required stripping flag on Node 22. Run `pnpm install --ignore-scripts`, then `pnpm build:packages`. Run `pnpm dev` from `apps/web` and use the local URL it prints. Rendering checks need `pnpm exec playwright install chromium --only-shell`.

1. Give the agent the feature brief and tell it to follow the `leather-ui` skill. Start with [component lookup](./i-need-to.md) and [recipes](./recipes.md).
2. Use one Playground area and the shared `ExplorationCanvas`. Keep current entry points or explicitly explain changes. `/playground/receive-example` is a complete fixture-only example; `/playground/recipes` shows the reusable compositions.
3. Run package lint/typecheck, `pnpm design:check <feature-path>`, and the [visual checks](./explore.md) against light/dark and narrow/long states. Keep screenshots and disclose any unresolved gaps.
4. Share the Playground link, source diff and check results. Fab reviews new UX decisions; approved recurring decisions become shared patterns.

## What is automatic

Root lint enforces the design rules on this release's recipes, recipe gallery and Receive example, with no new suppressions. `pnpm design:check <feature-path>` applies the same rules to a new web/extension feature explicitly. Production-wide and mobile enforcement are not enabled by this release.

The focused CI job runs rule/script regression tests, cheatsheet freshness and the owned-surface design lint. `words`, `align` and `fidelity` run against a local dev server; they do not prove usability or replace visual review.

## Scope

This release covers extension-shaped web UI, the web Playground and shared web UI components. It does not include historical experiments, the private-send concept, native/mobile validation, a new recipient design or an automatic production redesign. The fixture example is a toolkit demonstration and preserves no claim of a full product-flow improvement.

Evidence of agent benefit must identify the frozen kit, app commit, identical task briefs and all compared outputs. A successful example alone is not a kit-versus-vanilla result.
