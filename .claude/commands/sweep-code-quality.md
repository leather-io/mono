---
description: Sweep the monorepo (or a path) for code-quality improvements — contract shims, duplication, dead code, type-safety and rule violations, weak tests — and report a ranked, verified backlog
argument-hint: '[path or package] [--only <category numbers, e.g. 1,6>]'
allowed-tools: Bash(git log:*), Bash(git blame:*), Bash(git show:*), Bash(git grep:*), Bash(rg:*), Bash(pnpm knip), Read, Grep, Glob, Agent, Skill
disable-model-invocation: true
---

# Sweep code quality

Find places where the code could be simpler, safer or more consistent, verify each one, and report a ranked backlog. Do not edit files.

Scope: the path or package in `$ARGUMENTS` (excluding `--only`) if given, otherwise `apps/` and `packages/`. `--only` takes category numbers (e.g. `--only 1,6`) and limits the sweep to them. Skip `node_modules`, `dist`, build output and generated code (codegen, lingui catalogs).

The repo-root `CLAUDE.md` is the source of truth for rules. Read it first.

## Categories

1. **Contract shims.** Code that reshapes an outcome only to pass through a contract that can't express it.
   - `null` → throw → `null` bridges: a function returns `null`, a wrapper turns it into a throw, and a caller catches it back into `null`.
   - Private sentinel error classes, and duplicate copies of the same sentinel in different files.
   - Errors identified by message text, especially a literal shared by several files (`'User cancelled the signing operation'` is thrown by the Ledger signing event listeners and matched in `apps/extension/src/app/pages/swap/swap-utils.ts`).
   - `null` for one meaning and `undefined` for another (`useSignStacksTransaction`).
   - Outcome unions flattened into throws and re-caught higher up.
2. **Duplication.** The same logic hand-written in several places, components or hooks that differ only by a parameter (e.g. chain), and copies of helpers that already exist in `@leather.io/utils`, `bitcoin`, `stacks`, etc.
3. **Dead and leftover code.** Unreachable branches, unused options or members, compatibility layers that wrap an old API with no remaining reason, and stale feature flags. Use `pnpm knip` output as a seed (run it from the repo root; from a package directory it reports bogus unused files), but verify.
4. **Type safety and exhaustiveness.** `as` casts, `!` assertions, `any`, `switch` statements ending in `default: return null` instead of `assertUnreachable` (only where a throw is acceptable: not in render paths or on untrusted input), and loose guards where a schema exists.
5. **CLAUDE.md rule violations** that lint doesn't already catch: enums, `Object.keys/entries` on non-trivial transforms, throwing in render, reducers or selectors, `index.ts` files that aren't package barrels or router files, barrel imports inside the same package, wrong file naming, and anything hidden behind `eslint-disable`, `@ts-expect-error` or `@knipignore`.
6. **Error handling.** Exceptions used for expected paths, swallowed errors (catch that only logs), errors that reach users as raw codes, and secrets that could appear in logs.
7. **Layering.** Code in the wrong CLEAN layer (see the `monorepo-navigation` skill): app code that belongs in a package, packages importing from apps, and circular imports (including within a package, e.g. slice → utils → store → slice).
8. **React and performance.** Expensive work on every render, contexts whose single value re-renders every consumer, effects that should be event handlers, and unstable callbacks passed to memoised children.
9. **Tests.** Specs that can't fail (assert on something that would be true anyway), missing coverage on branches with user impact, roots and mocks never cleaned up, and mocks of barrels that hide real behaviour.

## How to sweep

1. **Seed** each category with fast searches. Examples:
   - `rg -n "class \w+Error extends Error" --type ts`
   - `rg -n "\.message\b\s*(===|!==|\.(includes|startsWith|match)\()|\.(includes|test)\(\w+\.message\)" --type ts`
   - `rg -n -U "default:\s*\n?\s*return null" --type ts`
   - `rg -n -P "^(?!\s*(import|export|//|\*|/\*)).*\bas (?!const\b)\w+" --type ts -g '!*.spec.*' -g '!*.test.*'`
   - `rg -n "\w!\.|: any\b|<any>" --type ts -g '!*.spec.*' -g '!*.test.*'`
   - `rg -n "^export enum |^enum " --type ts`
   - `rg -n "eslint-disable|@ts-expect-error|@ts-ignore|@knipignore" --type ts`
   - Seeds are leads, not findings: discard matches inside comments and strings.
   - Finders run the seeds inside their own slice; don't run them in the main context.
2. **Find with subagents.** Split the work into area × category-group slices and give each slice its own `general-purpose` subagent:
   - Areas: `apps/extension`, `apps/mobile`, `apps/web`, `packages/*` (split large areas, e.g. extension `features/` vs `pages/`). Slices together must cover the whole scope.
   - Category groups: shims + error handling (1, 6), duplication + dead code + layering (2, 3, 7), types + rules (4, 5), React + tests (8, 9).
   - Each finder gets: its slice, the category text above, the seed searches, `CLAUDE.md`, and the instruction to return candidates only as `file:line | category | one-sentence why`, with no edits. Duplication and layering finders may search outside their slice for the matching copy or import.
   - Launch finders in parallel batches of about 4 (send each batch as one message with several Agent calls) to stay under rate limits. Retry any finder that fails once.
3. **De-duplicate** the candidates from all finders: merge identical `file:line` entries and group candidates that share one root cause.
4. **Verify with subagents.** Give each group (or batch of ~5 small candidates) to a separate `general-purpose` subagent that did not find it, with the category text. The verifier must:
   - Open the code and its callers, and confirm the issue is real and not deliberate (check nearby comments, git blame and the commit message when unsure).
   - For contract or shared-package changes, list every implementer and consumer across extension, mobile and web. Treat exports of published `packages/*` as having external npm consumers too.
   - Return `CONFIRMED`, `PLAUSIBLE` or `REFUTED` with evidence, plus the proposed change, blast radius and effort.
   - Run verifiers in batches of about 4 as well.
5. **Gap pass.** Launch one final subagent with every verified candidate (any verdict) and ask it to look for anything the slices missed, especially issues that cross areas (e.g. the same helper duplicated in extension and mobile). Verify its additions the same way.
6. Keep only the subagents' conclusions in your context, not their file dumps.

## Report

For each finding or group:

- **Title** and category
- **Where:** `file:line` list
- **Problem:** one or two sentences
- **Proposed change:** concrete (new signature, helper to extract, branch to delete)
- **Blast radius:** packages and apps affected, and whether it breaks other consumers
- **Effort / payoff:** S / M / L, and what gets deleted or simplified

End with:

1. A ranked backlog, highest payoff for the lowest effort first.
2. Quick wins (S effort, no cross-package changes) listed separately.
3. `PLAUSIBLE` findings, refuted candidates and anything you could not confirm.
