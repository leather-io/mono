# Reviewing a UI PR (design)

Lint already covers the [Never list](./never.md), so don't re-check those items by hand. Spend
review time on the things a rule can't see. Work through the steps in order. Most PRs are settled
by step 3.

## 1. Evidence is attached

- [ ] There are before and after screenshots in light and dark, taken from the Playground
      (`/playground/<area>`), a PR preview, or the simulator.
- [ ] Each state that changes is shown: loading, empty, error, disabled, long content, and 390px
      wide for the extension popup.
- [ ] If an intent wasn't covered by `i-need-to.md`, the PR says so. Treat that as a system gap,
      not a nit.
- [ ] Playground explorations: the recreated today screens match the baseline (`pnpm
design:fidelity` side-by-side attached), and the baseline has a clean state plus edge states.

## 1b. Every change from shipped UI has a reason

- [ ] Unchanged parts are the real components or the extension's exact composition (recipes
      with `mirrors`), not a redraw.
- [ ] Each style change to an existing pattern (a lighter second line, a smaller button, a bigger
      icon, an inset tab bar) is reverted or has a `DEVIATIONS.md` row with a why. The promote
      report lists them as restyles (`Caption.color`, `Button.size`).
- [ ] Each existing path the change breaks or moves (token details, receive) is listed, with
      where it went.

## 2. Right component for the job

- [ ] Each new piece of UI maps to one row in `i-need-to.md`. If it doesn't, either the system is
      missing something (open an issue) or the PR is inventing a pattern (ask why).
- [ ] There's one `solid` button per screen, and `intent="danger"` appears only on the destructive
      confirm. `pnpm design:words <url>` counts solid buttons per frame (`primaries`) and exits 1
      when a frame has more than one. Icons inside a button take its label's ink.
- [ ] Important actions are labelled buttons ("Save to address book"), not a bare `+` or bookmark
      icon on a row. Follow-up choices need explicit product review; never leave Save and Done competing.
- [ ] Toasts are for transient feedback and Callouts are for problems the user must act on, not
      the other way round. Callouts run edge to edge at the top of their region, never as an
      inset note between rows.
- [ ] Screen actions (Add, Save, Done) are in the footer; never two competing primaries.
- [ ] When an asset is the subject, its token icon is shown. Selection marks and other UI symbols
      use exported Leather icons, not text glyphs.
- [ ] No new component in an app duplicates something in `@leather.io/ui`. If the ui version is
      missing a prop, the PR adds the prop to ui.

## 3. Ink ladder and hierarchy

- [ ] Text that informs a decision is `ink.text-secondary`. This covers fees, warnings,
      approval details and key-value labels on review screens.
- [ ] `ink.text-subdued` is used only on `ink.background-primary` and only for skippable metadata.
- [ ] `ink.text-non-interactive` appears only on disabled elements.
- [ ] The most important thing on the screen is the most prominent, usually the amount or the
      action.
- [ ] Inline icons (info, lock, chevron, user) match their text's ink or are lighter, never
      darker, and sit on the text line at the text's size (`InlineIcon`).
- [ ] Structure: rows are grouped by the question they answer, groups are split by a divider,
      nested values are smaller than their parent, and no small area uses more than three text
      styles.
- [ ] No single word alone on a paragraph's last line (sentences in `p`, or `textWrap="pretty"`).

## 3b. One gutter

- [ ] `pnpm design:align <url>` is clean: list rows, inputs, section headers and the footer sit on
      the page shell's one rail (24px in the popup), and the header's back and trailing glyphs sit
      the same distance from each edge, on that rail. No `px` on a row or input inside the body.
- [ ] Review addresses are complete and readable, with no negative margins.
- [ ] Amounts lead with `AmountDisplay`, so amount → fiat spacing is the same on send, review and
      related screens. New success-screen patterns need design review.

## 4. Copy

- [ ] Button labels are verbs, and the confirm label repeats the action ("Remove wallet", not
      "OK").
- [ ] Errors say what happened and what to do next. Technical detail goes behind "Details", not in
      the toast.
- [ ] Money is formatted by `Balance` or `formatCurrency`, never by hand.
- [ ] Copy doesn't promise outcomes: no "will earn" or "guaranteed".
- [ ] On mobile, every string is wrapped in Lingui.

## 5. Interaction

- [ ] Hover, pressed, focus-visible and disabled states all exist. Use ui components and they come
      free.
- [ ] One hover per row (nested actions inside it), hovers never overlap other content, icon
      buttons are square, and chevrons appear only on rows that open a deeper view that exists
      (lint: `no-dead-chevron`).
- [ ] Scrolling: the header and any pinned region (the recipient field over a contact list)
      stay fixed while the body scrolls; the footer stays at the bottom (`PopupPage pinned`).
- [ ] Every changed state, including edit forms, fits horizontally at 390px. Check nested body
      scrollers as well as the document; clipping or hiding a scrollbar does not count as a fix.
- [ ] The keyboard path works: you can tab to every action, and Escape closes sheets.
- [ ] Destructive actions have a confirm step, and that step can be cancelled.
- [ ] Loading never shifts layout: skeletons are sized to the content.

## 6. Lint and suppressions

- [ ] CI is green (`pnpm lint --max-warnings 0`), and the diff adds no `eslint-disable` for a
      `design-system/*` rule.
- [ ] `eslint-suppressions.json` changes only go down. If a count went up, that's a block.

## When you find something

When you find a problem, ask whether a rule could have caught it. If one could, don't just comment
on the PR. Follow [updating-the-system.md](./updating-the-system.md) so the next PR can't repeat
it. Link the PR as the incident.
