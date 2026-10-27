---
name: leather-ui
description: Build or change Leather UI in apps/extension, apps/web, apps/mobile, packages/ui or packages/features. Use when adding or editing a screen, sheet, row, card, button, toast, empty or loading state, or any styling, colour, text style or spacing. Covers which @leather.io/ui component to use, the token and ink-ladder specs, and how to check the result.
---

# Leather UI

Leather's UI comes from `@leather.io/ui` (web), `@leather.io/ui/native` (mobile) and
`@leather.io/tokens`. Prefer composing what exists over adding new markup. When this skill and
the code disagree, the code wins. Note the mismatch in the PR so it can be fixed here.

## Where to look

- `docs/design/i-need-to.md`: each job ("confirm a risky action", "show an address") mapped to one
  component, with a working snippet. Read the matching section before writing JSX.
- `docs/design/never.md`: the things lint rejects, and what to use instead.
- `packages/tokens/README.md`: the ink text ladder.
- `packages/ui/src/exports.web.ts` and `packages/ui/src/native.ts`: everything the ui package exports.
- `docs/design/recipes.md`: page shells, rows, review sheet, amount, section header and inline info.
  Compose screens from these. Variants differ in concept, not in how a row is built.
- `docs/design/explore.md`: the protocol for exploring a feature (today's flow first, recreated
  faithfully and diffed with `pnpm design:fidelity`, then 2–3 variants).
- `apps/extension/AGENTS.md`, `apps/web/AGENTS.md`: platform sizes, input and what to verify.

**When no pattern fits**, don't invent a one-off. Follow the escalation step in `explore.md`:
show options to design, then the answer becomes a recipe or a component.

## Specs

**Colour.** Use semantic tokens only: `ink.*`, `red.*`, `green.*`, `yellow.*`, `blue.*`,
`orange.*`. Each one already switches between light and dark.

| Need                           | Token                                                      |
| ------------------------------ | ---------------------------------------------------------- |
| Page background                | `ink.background-primary`                                   |
| Raised or grouped surface      | `ink.background-secondary`                                 |
| Component fill (inputs, chips) | `ink.component-background-default`                         |
| Hover / pressed fill           | `ink.component-background-hover` / `-pressed`              |
| Divider, border                | `ink.border-default` (or `border="default"`)               |
| Error, warning, success, info  | `red`, `yellow`, `green`, `blue` + `.background-secondary` |

**Text colour: the ink ladder.** Pick the step by how much the reader depends on the text.

1. `ink.text-primary`: the content itself (titles, amounts, names, values).
2. `ink.text-secondary`: text that informs a decision. This covers dialog and sheet body copy,
   warnings, fee explanations, approval details, and labels in key-value rows on review screens.
   Use it for any supporting text on a tinted surface.
3. `ink.text-subdued`: metadata someone can skip, such as row captions, fiat values next to an
   amount, and timestamps. Only use it on `ink.background-primary`.
4. `ink.text-non-interactive`: disabled only.

If you're unsure, use `ink.text-secondary`. Don't use opacity to make an in-between shade.
An icon next to text matches the text's ink or is lighter, never darker: use `InlineIcon`.

**Type.** Web `textStyle` values are `display.01–02`, `heading.01–05`, `label.01–03`,
`body.01–02`, `caption.01–02`, `code` and `address`. Native `Text variant` uses the same names
without the dot (`label01`).

- Sheet titles: `heading.05`
- Row titles: `label.01` (use `Title`)
- Buttons and values: `label.02`
- Captions: `caption.01` (use `Caption`)
- Addresses: `address`. Mono (`address`, `code`) is for full addresses and code only, never an
  amount, total or fee (lint `no-mono-amount`; on web that includes `tabular-nums`).

`display.*`, `heading.02` and `heading.03` are Marche and already uppercase. Don't set
`textTransform` yourself. Keep a small area (a row, a card, a review group) to about three text
styles; nested numbers and labels go a size smaller than their parent.

**Spacing.** Use `space.01`–`space.11`, which are 4, 8, 12, 16, 24, 32, 40, 48, 64, 72 and 128px.
Use them for padding, gaps and margins. Radii are `xs`, `sm`, `md`, `lg` and `round`. A page has
one horizontal gutter (`space.05` in the popup): rows, inputs and header icon glyphs all sit on it.

**Components.**

| Job                   | Web (`@leather.io/ui`)                                    | Native (`@leather.io/ui/native`)    |
| --------------------- | --------------------------------------------------------- | ----------------------------------- |
| Action with a label   | `Button` (`solid` once per view, then `outline`, `ghost`) | `Button`                            |
| Important action      | labelled `Button` with an icon, never a bare `+` icon     | `Button`                            |
| Text field            | `Input` (floating label; see `i-need-to.md` for when)     | `Input`                             |
| Icon-only action      | `IconButton` + `aria-label`                               | `IconButton` + `label`              |
| Clickable row or card | `Pressable`                                               | `Pressable`                         |
| List row              | `ListItemBox` or `ItemLayout`                             | `Cell`, `ItemLayout`                |
| Focused task, confirm | `Sheet` + `SheetHeader`                                   | `Sheet` (ref), `WarningSheetLayout` |
| Approve or sign       | `Approver`                                                | `Approver`                          |
| Problem that stays    | `Callout` (edge to edge, top of its region)               | `Callout`                           |
| Icon beside text      | `InlineIcon`                                              | —                                   |
| Asset as the subject  | its token icon: `BtcAvatarIcon`, `StxAvatarIcon`, …       | same names                          |
| Short feedback        | the app's `useToast`                                      | `useToastContext().displayToast`    |
| Loading               | `SkeletonLoader`, `Button aria-busy`                      | `SkeletonLoader`                    |
| Address               | `AddressDisplayer`, `truncateMiddle`                      | `AddressDisplayer`                  |
| Money                 | the app's `Balance` + `formatCurrency`                    | `Balance`                           |
| Tooltip               | `BasicTooltip`                                            | info sheet                          |

Don't use raw `<button>`, `styled.button`, `radix-ui` imports, or the extension's local tooltip.
Lint rejects all of them.

## Example

A fee row on a review screen (web). The info icon sits inside the label, so it takes the label's
line, size and ink:

```tsx
<Flex justifyContent="space-between" alignItems="flex-start">
  <styled.span textStyle="body.02" color="ink.text-secondary">
    Sponsored fee
    <BasicTooltip label="A sponsor pays this fee, so you need no STX for this transaction" asChild>
      <InlineIcon icon={InfoCircleIcon} tone="subdued" placement="end" tabIndex={0} />
    </BasicTooltip>
  </styled.span>
  <Balance balance={fee} formatCurrency={formatCurrency} textStyle="label.02" />
</Flex>
```

A destructive confirm, and every other job: `docs/design/i-need-to.md`.

## Copy and density

UI copy is not documentation. Hold every screen to this budget:

- Title: 5 words or fewer. Buttons: 1–3 words, verb first ("Send", "Review", "Remove wallet").
  Screen actions (Add, Save, Done) sit in the footer; never two competing primaries. A
  follow-up after a task is a footer choice requiring product review.
- At most one helper sentence visible per screen. Explanations go behind `BasicTooltip` or
  "Learn more".
- Review screens: labels and numbers in key-value rows, not sentences.
- After screenshotting, do a subtraction pass. Remove each element that doesn't change a
  decision, then count words again (`pnpm design:words <url>`).

## Before you say done

1. Run `pnpm --filter @leather.io/<package> lint`. The design rules are part of it. When a design
   rule fails, its message names the replacement, so apply that. Don't add suppressions.
2. Run `pnpm --filter @leather.io/<package> typecheck`.
3. Look at it. For web or ui changes, render it in the web Playground (`pnpm dev` in `apps/web`,
   then `/playground`). Take a screenshot in light and dark, and attach before and after to the PR.
   For mobile, take a simulator screenshot. On Playground screens run `pnpm design:words <url>`
   (one solid per frame) and `pnpm design:align <url>` (one gutter, symmetric header); both exit 1
   on a finding.
4. Check the ladder. Is every piece of supporting text that informs a decision in
   `ink.text-secondary`? Is `ink.text-subdued` used only on `ink.background-primary`?
5. If you needed something that isn't in `i-need-to.md`, say so in the PR description.
6. In the Playground, every deviation from shipped UI, restyles included (`Caption.color`,
   `Button.size`), needs a row in `DEVIATIONS.md`, keyed by the promote ledger's Key, with a
   why. `pnpm design:promote <folder>` checks this. You're done at 0 undocumented and 0 stale.
