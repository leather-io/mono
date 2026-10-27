# Golden UI tasks

These are eight UI tasks we give to an agent, unchanged, on a fixed schedule:

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
   diff and the screenshots.
4. Record the result as one row in `docs/design/golden-results.csv`:
   `date, model, guidance version, task id, score per criterion, total, notes`.

Tasks **G1–G3** are small and take an agent about 15 minutes. Use them for a quick check after
each model release. **G4–G8** are the full set.

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
  - a `key-value-row.meta.shared.ts`
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
  - Leaving out the meta file.
  - Using a `px` gap instead of `space.*`.

## G4: Sponsored fee row in the Stacks approval (extension)

**Prompt:** "When a Stacks transaction request is sponsored, the approval screen shows a grey
banner. Replace it with a normal fee row that says the fee is sponsored and explains what that
means."

- **Where:** `apps/extension/src/app/components/sponsored-label.tsx` and
  `apps/extension/src/app/components/fees-row/fees-row.tsx`.
- **Pattern:** an `Approver.Section` fee row. The label is `ink.text-secondary`. The value reads
  "Sponsored" in `label.02`, and the explanation sits in a `BasicTooltip` from `@leather.io/ui`.
- **Visual checkpoints:**
  - It is aligned with the other fee rows.
  - The tooltip copy is one sentence.
  - The `ErrorCircleIcon` (error iconography) for a non-error state is gone.
- **Traps:**
  - Importing `@app/ui/components/tooltip/basic-tooltip`.
  - Keeping `color="stacks"` on an icon to mean "info".
  - Using a raw hex.

## G5: Error toast on a failed broadcast (extension)

**Prompt:** "If broadcasting a Stacks transaction from an app request fails, the user gets no
clear feedback. Show an error they can understand, and keep the details available."

- **Where:**
  `apps/extension/src/app/features/rpc-stacks-transaction-request/stacks/use-sign-and-broadcast-stacks-transaction.ts`
  and its screen.
- **Pattern:** `toast.error(...)` from `@app/features/toasts/use-toast` for the moment of failure.
  If the user has to act, use a `Callout variant="error"` on the screen, with the fix in the copy.
- **Visual checkpoints:**
  - The toast copy is short and says what failed.
  - Technical detail is not in the toast.
  - The Callout (if used) has a title and a next step.
- **Traps:**
  - Using `console.error` only.
  - Using `alert()`.
  - Writing a custom red box with `bg="red..."` and `<button>` Retry.
  - Putting the raw error message in the toast.

## G6: Staking balance card (web)

**Prompt:** "On the staking page, add a card that shows the user's staked amount, its fiat value,
the position status, and a Manage action. Handle loading and not-staking."

- **Where:** `apps/web/app/pages/bitcoin-staking/` and `apps/web/app/features/bitcoin-staking/components/`.
- **Pattern:**
  - `Balance` + `formatCurrency` for the amounts, with fiat in `ink.text-subdued`.
  - `Badge` for the status.
  - One `Button` (`outline` if the page already has a primary action).
  - `SkeletonLoader` sized to the content.
  - An empty state that says what staking is and offers the start action.
- **Visual checkpoints:**
  - The card surface is `ink.background-secondary` or `ListContainer`, and the text on it isn't subdued.
  - The skeleton and the loaded card are the same height.
  - It looks right in both themes and at 390px wide.
- **Traps:**
  - Using a raw `boxShadow` value for the card.
  - Formatting numbers by hand.
  - Using `textTransform="uppercase"` on the status.
  - Using `ink.text-subdued` on the tinted card.

## G7: Confirm before removing a wallet, with an export reminder (mobile)

**Prompt:** "On mobile, when someone removes a wallet, remind them to back up their Secret Key
first and make the confirm step clearly destructive."

- **Where:** `apps/mobile/src/features/settings/wallet-and-accounts/remove-wallet-sheet.tsx`
- **Pattern:** `WarningSheetLayout` with `variant="critical"`. The body copy is in Lingui `t`.
  The confirm label repeats the verb.
- **Visual checkpoints:**
  - The danger button is the only red element.
  - The copy fits in the sheet without scrolling on a small phone.
  - Dark mode works.
- **Traps:**
  - Importing `TouchableOpacity` from `react-native`.
  - Using `Text` with `opacity`.
  - Using a raw `#FF…` colour.
  - Leaving strings unlocalised (the Lingui lint catches these).

## G8: Pending transaction row (extension)

**Prompt:** "In the activity list, pending transactions look the same as confirmed ones. Make
pending ones clearly pending without making them hard to read."

- **Where:** `apps/extension/src/app/features/activity-list/components/activity-row.tsx`
- **Pattern:**
  - `ListItemBox` as it's used today.
  - `PendingIndicatorIcon` from `@leather.io/ui` as the leading badge.
  - The caption "Pending" in `ink.text-subdued`.
  - The amount stays `ink.text-primary`.
- **Visual checkpoints:**
  - The pending row is distinguishable at a glance.
  - Contrast stays at AA or above.
  - The row height doesn't change.
- **Traps:**
  - Fading the whole row with `opacity`. This is the classic one.
  - Making the amount `ink.text-non-interactive`.
  - Adding a custom yellow hex.
