# Weekly feature-map review

You are correcting the Leather extension feature map: the typed entries in
`apps/extension/tests/feature-map/*.features.ts`. Read the schema in
`tools/src/feature-map/feature-entry.ts` and the authoring rules in
`.claude/skills/feature-map/SKILL.md` first; the rules define what counts as correct.

Work through the groups below in order, one at a time: finish a group (edits verified, report
section written) before starting the next, so a run that stops early still leaves usable work.

| Group    | Files under `apps/extension/tests/feature-map/`                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| home     | `home.features.ts`, `activity.features.ts`, `all-balances.features.ts`, `token-details.features.ts`, `fund.features.ts`                                     |
| send     | `send.features.ts`, `swap.features.ts`                                                                                                                      |
| settings | `onboarding.features.ts`, `settings.features.ts`, `network.features.ts`, `switch-account.features.ts`, `ledger.features.ts`, `store-migrations.features.ts` |
| rpc      | `rpc-bitcoin.features.ts`, `rpc-stacks.features.ts`, `rpc-general.features.ts`                                                                              |

## The job

Find statements that are false and fix them. Read every sentence of every entry in every file and
open the code it describes; do not sample.

In scope: a sentence, entry step, selector, action, spec, mock, network, gate, startRoute, open
action or deepLinkable value that does not match the source; a quoted UI string or error message
that is not verbatim; a cited file that does not exist or does not contain the claimed logic; a claim
about which spec registers which mock, runs on which network or reaches which screen that is wrong; a
condition stated the wrong way round; a selector listed in `others` that never renders on that screen
in the stated conditions; an error code, stage or result shape that the handler or page contradicts.

Out of scope: anything an entry omits, could add, or could say more precisely. A statement that is
true but incomplete is not a finding. Do not touch wording, structure or formatting for its own sake.

Where reality lives: routers in `apps/extension/src/app/routes` and the nested `*.routes.tsx` and
`home.tsx`; screens in `apps/extension/src/app/{pages,features,components}`; rpc handlers in
`apps/extension/src/background/messaging` with method schemas in `packages/rpc/src/methods`;
selector values in `apps/extension/tests/selectors` (grep the value in `apps/extension/src` and
`packages/ui` to see where it renders); page objects, mocks (`setupMockApis` in `mock-apis.ts`) and
specs under `apps/extension/tests`.

## Fixing

- Confirm every finding at the source before editing, and cite the file and line in the report.
- Change only the false statement. Do not add detail, restructure an entry or reformat a file.
- Keep the rules: no comments of any kind in the files; selectors stay `XSelectors.Member`
  references, never raw strings; specs are exact repo-relative paths that exist; UI strings verbatim;
  `preconditions.mocks` follows the mocks rule in SKILL.md.
- Never edit application source, specs, page objects, mocks or selector files. When a fix needs a
  code change (a test id that never reaches the DOM, a missing selector), say so in the entry's
  description and list it under "Needs a code change" in the report.
- After editing, run from the repository root and make all three pass, fixing or reverting your edit
  until they do:

```bash
pnpm lt feature-map check --app extension
pnpm --filter @leather.io/extension exec prettier --write tests/feature-map/<file>.features.ts
pnpm --filter @leather.io/extension exec eslint tests/feature-map/<file>.features.ts
```

## Report

Write `tmp/feature-map-review.md` (create the directory) even when you fixed nothing: one section
per group, appended as soon as that group is done, in this exact shape:

```markdown
### <group>

Entries read: N. False statements fixed: N.

| entry | false statement | reality (file:line) | fix applied |
| ----- | --------------- | ------------------- | ----------- |

Needs a code change: none

Suspected but not confirmed: none
```

List one row per fixed statement. Under "Needs a code change" name the file and what it should do.
Under "Suspected but not confirmed" name statements you could not verify either way, so a human can
look; never edit those. The workflow fails the run when a file outside
`apps/extension/tests/feature-map/` changed, when a new file appears outside `tmp/`, or when the
check, prettier or eslint fail, so leave the tree in that state.
