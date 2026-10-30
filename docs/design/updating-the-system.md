# Updating the design system

Every rule in this system started as an incident: a review comment, a bug, or a screen that
shipped wrong. This page covers what to do with the next one, and the routine to follow when a
new model ships.

## When something ships wrong

1. **Write down the incident.** Record the link (PR, issue or screenshot), one sentence on what
   went wrong, and one sentence on what right looks like.
   For example: "#2658: `caption.02` used in 14 places, never defined. Text rendered at browser
   default."

2. **Climb the ladder from the top.** Stop at the first rung that works.

   | Rung                            | What it looks like here                                                                      | Example                                                   |
   | ------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
   | 1. Make it impossible           | A type, a required prop, a missing export, or a token that doesn't exist                     | `Button` `intent` is a union, and native has no `success` |
   | 2. Catch it                     | A rule in `eslint-rules/design-system/` with a "Use X instead — link" message, or a CI check | `valid-text-style`, `no-raw-color`, cheatsheet `--check`  |
   | 3. Make the right path findable | A row in `i-need-to.md`, an entry in a `*.meta.shared.ts`, or a Playground example           | "Show an address" → `AddressDisplayer`                    |
   | 4. Prose                        | One line in the `leather-ui` skill, or in `CLAUDE.md` as a last resort, citing the incident  | "Use `ink.text-secondary` on tinted surfaces (#2800)"     |

   - A fix at rung 2 or above also gets a rung-3 entry, so the lint message has a section to link to.
   - Prose without an incident link doesn't get merged.
   - New lines in `CLAUDE.md` have to replace an existing line or cite an incident. The design
     section stays at 10 lines or fewer.

3. **If you're writing a rule:**

   - Put it in `eslint-rules/design-system/<rule>.js`, in the same shape as the existing rules.
   - Add a section to [never.md](./never.md). The heading becomes the anchor in the message.
   - Write a RuleTester spec with one real snippet from the incident as an invalid case.
     `messages.spec.js` enforces the message shape.
   - Count the existing hits:
     `pnpm exec eslint -c eslint.design.config.js --no-inline-config apps/extension/src apps/web/app apps/mobile/src packages/ui/src`.
   - If the count is small (under about 10), fix them in the same PR and enforce the rule at 0.
   - If it's larger, enable the rule only on a clean, explicitly scoped set of files, then widen
     that scope as existing violations are fixed. Do not add suppression entries or inline
     disables. The existing suppression baseline may only shrink with `--prune-suppressions`.
   - If the fix needs a token that doesn't exist yet, such as shadows or motion, add the token
     first. A message that points at nothing teaches nothing.

4. **If it's rung 3:** update the component's `*.meta.shared.ts`, run
   `pnpm --filter @leather.io/ui gen:cheatsheet`, and add or extend the matching
   `i-need-to.md` section with a snippet that compiles.

5. **Add or update a golden task** if the incident is the kind an agent would repeat. Put the
   incident into the task's **Traps**.

## When a new model ships

Do this within a week of the release, before switching the team's default model.

1. Run G1–G3 from [golden-tasks.md](./golden-tasks.md) on the current guidance, three times each.
   Record the scores in `golden-results.csv`.
2. Run the same three tasks with the design section of `CLAUDE.md` and the `leather-ui` skill
   removed. Keep the lint rules and `i-need-to.md`.
3. Compare the two runs.
   - If a line of prose doesn't change the score, remove it. Lint is still doing that job.
   - If the score drops without the skill, keep the skill. Look at which trap reappeared, and try
     to move that guidance one rung up the ladder.
   - If the new model does worse with the skill than without, the skill is over-prescribing.
     Shorten it to specs and examples, and drop the instructions about how to think.
4. Run G4–G8 once on the winning setup and record the result.
5. Note the outcome in the PR that changes the guidance: the model, the scores, and what was cut.

## Monthly

- Run G1–G8 once and record the scores.
- Check the suppression counts per rule. They should only go down. Pick one file with the most
  debt and fix it.
- Read the last month's design review comments. Any comment that appears twice is an incident:
  start at step 1.
