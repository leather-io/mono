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

## Release evidence — 27 October 2026

The frozen implementation `e048c31a9aeecd0b023800c1d01271e8e9a18939` was compared with the same agent configuration in the same app without the agent-facing kit. Three fixture tasks (rename account, custom networks and connected apps), two independent repetitions and two arms produced 12 builds. Shared production components, tokens and reliability fixes were identical in both arms.

All 12 final builds passed the tested fixture journeys and native keyboard paths. Two blinded agent reviewers scored the final outputs at a mean of 10.00/10 with the kit and 9.83/10 without it. All six matched pairs were consensus ties. The predeclared gate for a material final-quality advantage **failed**.

Initial drafts showed promising token and layout gains on the network forms and a connection confirmation. Some apparent first-draft navigation differences remain capture uncertainties. This supports evaluating the kit as an opt-in workflow pilot with review; it does not establish better final UX, faster delivery or universal reliability. The complete protocol, all checkpoints, original reviewer votes and corrected automation records are retained with the Etch project. The scores describe these bounded fixture tasks, not a population estimate or a human usability study.

This evidence note was added after the comparison closed; the measured implementation remains the frozen commit above.
