# Golden UI tasks

These are three UI tasks we give to an agent, unchanged, on a fixed schedule:

- once a month
- every time a new model ships
- every time we change `CLAUDE.md`, the `leather-ui` skill, `i-need-to.md` or a design rule

Over time the scores show which guidance still changes the output. Guidance that stops changing it
gets deleted, as described in [updating-the-system.md](./updating-the-system.md).

## How to run

1. Start each task from a clean worktree on `origin/dev`, with dependencies installed and packages
   built (`pnpm i && pnpm build:packages`).
2. Paste the **Prompt** exactly as written. Don't add hints, links or file paths that aren't in it.
3. Let the agent finish. Then the scorer, a person or a second agent using this rubric, reads the
   diff and the screenshots. Score the first draft, before any fix round, and put the number of
   fix rounds in `notes`: finished output saturates the rubric, first drafts are where differences
   show.
4. Record the result as one row in `docs/design/golden-results.csv`:
   `date, model, guidance version, task id, score per criterion, total, notes`.

Each task is small and takes an agent about 15 minutes. Add a task for the extension or mobile
when the kit expands there, with the incident that motivates it in its **Traps**.

## Shared rubric

Each criterion scores 0, 1 or 2. The maximum is 10.

| Criterion        | 2                                                                                     | 1                                                     | 0                                               |
| ---------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| **Lint**         | `pnpm --filter <pkg> lint` and `typecheck` pass. No new suppressions or disables.     | Passes after one fix round prompted by a lint message | Fails, or adds suppressions or `eslint-disable` |
| **Components**   | Uses the component `i-need-to.md` names for each job                                  | Right component, wrong props or variant               | Hand-rolled markup or a local copy              |
| **Tokens**       | Every colour, text style and space is a token, and text colour follows the ink ladder | One ladder slip (subdued on a tinted surface, say)    | Raw values or opacity text                      |
| **Pattern fit**  | Matches the nearest existing pattern named in the task                                | Works, but diverges from the pattern                  | Invents a new pattern                           |
| **Visual check** | Before and after screenshots in light and dark, and the checkpoints below hold        | Screenshots taken, one checkpoint missed              | No screenshots, or broken layout                |

Each task also lists **traps**, which are the mistakes we expect when the guidance isn't working.
Any trap that appears in the diff costs 1 point under the matching criterion.

---

## G1: Empty state for the portfolio activity list (small, web)

**Prompt:** "On the web portfolio page, the activity list shows plain text when there's no
activity. Give it a proper empty state."

- **Where:** `apps/web/app/pages/portfolio/components/activity-list/index.tsx`
- **Pattern:** "Show an empty state" in `i-need-to.md`, and `ActivityEmptyState` in
  `apps/web/app/pages/multisig/components/activity-empty-state.tsx`.
- **Visual checkpoints:**
  - The empty state is centred in the panel.
  - The copy uses `caption.01` or `label.02` with `ink.text-subdued` or `ink.text-secondary`.
  - There's no layout jump between the loading state and the empty state.
  - It reads correctly in dark mode.
- **Traps:**
  - Building a new illustration with a raw `fill`.
  - Using `fontSize` instead of `textStyle`.
  - Using `opacity` on the copy.
  - Making a third empty-state component instead of reusing or extracting `ActivityEmptyState`.

## G2: Copy-address row (small, web)

**Prompt:** "Add a row under the account name on the Playground's component gallery showing the
account's Stacks address with a copy button that confirms when copied."

- **Where:** `apps/web/app/pages/playground/areas/component-gallery/component-gallery.page.tsx`
- **Pattern:** reuse `CopyAddress` from `~/components/copy-address`, or `useClipboard` +
  `IconButton` + `BasicTooltip` as shown in "Let someone copy a value" in `i-need-to.md`.
- **Visual checkpoints:**
  - The address is truncated with `truncateMiddle` or grouped.
  - The copy affordance has a hover state and visible focus.
  - The "Copied" feedback appears and then resets.
- **Traps:**
  - Using `<button>` or `styled.button`.
  - Adding a fourth clipboard hook.
  - Slicing the address by hand.
  - Using `navigator.clipboard` directly.

## G3: Key-value row in packages/ui (small, ui)

**Prompt:** "Add a KeyValueRow component to @leather.io/ui (web) for review screens: a label on
the left, a value on the right, and an optional info tooltip next to the label. Export it and
show it in the Playground."

- **Where:**
  - `packages/ui/src/components/key-value-row/key-value-row.web.tsx`
  - an export in `exports.web.ts`
  - a section in `docs/design/i-need-to.md`
  - a Playground area
- **Pattern:** the label is `caption.01` / `ink.text-secondary`, because review-screen labels
  inform a decision. The value is `label.02` / `ink.text-primary`. The tooltip is `BasicTooltip`
  wrapping `InfoCircleIcon` in a `span`.
- **Visual checkpoints:**
  - Long values wrap or truncate without pushing the label.
  - The tooltip opens on hover and on focus.
  - The row is 4px aligned (`space.*`).
- **Traps:**
  - Using `ink.text-subdued` for the label.
  - Using a Radix `Tooltip` import.
  - Leaving out the `i-need-to.md` section.
  - Using a `px` gap instead of `space.*`.
