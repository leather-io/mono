---
title: "refactor: Redesign Add Wallet as a compact popover flow"
type: refactor
status: completed
date: 2026-06-19
deepened: 2026-06-19
---

# refactor: Redesign Add Wallet as a compact popover flow

## Summary

Replace the extension's Add Wallet bottom **Sheet** with a compact Radix **`DropdownMenu`** anchored to the existing "Add wallet" button inside the wallet switcher, mirroring the settings-menu pattern. All three options (Create new wallet, Restore wallet, Connect Ledger) are kept as compact menu items, the over-the-top illustration is dropped from this surface, and the existing add-wallet navigation behavior is preserved unchanged. Extension-only.

---

## Problem Frame

The current Add Wallet view ([`add-wallet-sheet.tsx`](apps/extension/src/app/features/dialogs/add-wallet-sheet/add-wallet-sheet.tsx)) opens as a full bottom Sheet with a large illustration on top. For a three-item picker it feels too large, blocking, and "over the top" relative to the lightweight settings menu it sits next to. The wallet switcher already exposes the entry point as an "Add wallet" button — but it launches a heavyweight modal instead of a quick, attached menu. Linear: [LEA-3590](https://linear.app/stackslabs/issue/LEA-3590/redesign-add-wallet-as-a-compact-popover-flow) · GitHub mirror [leather-io/mono#2406](https://github.com/leather-io/mono/issues/2406).

---

## Requirements

- R1. Add Wallet opens as a compact popover-style surface — a `DropdownMenu` anchored to the "Add wallet" button — instead of a bottom Sheet (origin AC1).
- R2. All three wallet options (Create new wallet, Restore wallet, Connect hardware wallet/Ledger) remain clear and accessible within the compact surface (origin AC2; confirmed: keep all three, do not collapse to Software + Ledger).
- R3. The Add Wallet illustration is removed from this surface so it reads as utilitarian (origin AC3; confirmed: remove).
- R4. Existing add-wallet navigation behavior (create / restore / connect-Ledger routing) is preserved exactly.

**Origin acceptance examples:** AE1 (covers R1) — clicking "Add wallet" inside the switcher opens a compact menu attached to the button, not a full sheet. AE2 (covers R2, R4) — all three options are visible and each routes to the same destination as today.

---

## Scope Boundaries

- **Extension only.** The mobile app's Add Wallet flow is out of scope and untouched.
- **Restore flow page unchanged.** The full-screen `/add-wallet` restore page ([`add-wallet.tsx`](apps/extension/src/app/pages/add-wallet/add-wallet.tsx), the `EnterMnemonic` flow) is a navigation destination, not the entry surface — it stays as-is.
- **No option restructuring.** Keep three discrete options; do not introduce a "Software wallet" parent with a Create/Restore sub-step.
- **Navigation hook unchanged.** [`use-add-wallet-navigation.ts`](apps/extension/src/app/features/dialogs/switch-account-sheet/use-add-wallet-navigation.ts) and its routing behavior are not modified.

### Deferred to Follow-Up Work

- **`MultiWalletIllustration` + SVG retirement:** the component ([`multi-wallet-illustration.tsx`](apps/extension/src/app/features/feature-introducer/implementations/multi-wallet-illustration.tsx)) and asset (`apps/extension/public/assets/illustrations/multi-wallet-intro.svg`) are still used by the multi-wallet feature-introducer ([`multi-wallet-introducer.tsx`](apps/extension/src/app/features/feature-introducer/implementations/multi-wallet-introducer.tsx)), so they are NOT deleted here. Retiring them belongs to a separate cleanup if the introducer is ever removed.
- **`DropdownMenu.Group` bug:** the shared primitive's `Group` is mis-wired to render a `RadixDropdownMenu.Separator` ([dropdown-menu.web.tsx:143](packages/ui/src/components/dropdown-menu/dropdown-menu.web.tsx:143)), placing menu items under a `role="separator"`. Pre-existing and used by the in-Sheet precedents (`account-action-menu.tsx`) without visible breakage, so this plan mirrors the precedent rather than fixing the primitive. The a11y fix is a separate change.
- **Capture the learning:** the Radix-menu-inside-Radix-Dialog pattern is undocumented in this repo — a strong `/ce-compound` candidate once the working configuration is known.

---

## Context & Research

### Relevant Code and Patterns

- **Proven precedent (primary pattern — same parent Dialog):** [`account-action-menu.tsx`](apps/extension/src/app/features/dialogs/switch-account-sheet/components/account-action-menu.tsx) and `wallet-action-menu.tsx` — Radix `DropdownMenu`s **already rendered inside this switcher Sheet today**, working with **default `modal` behavior**. Each item is wired with `onClick={e => { e.stopPropagation(); handler(); }}`. Mirror these for the nesting + item-handler pattern; they are the authoritative reference for how a menu coexists with the Sheet.
- **Secondary reference (menu shape):** [`settings.tsx`](apps/extension/src/app/features/settings/settings.tsx) — the overall `DropdownMenu.Root` → `Trigger`/`IconButton` → `Portal` → `Content` (`align`, `side`, `sideOffset`) → `DropdownMenu.Item` composition. Note settings is **not** inside a Dialog, so defer to the in-Sheet precedent above for nesting behavior.
- **Current surface being replaced:** [`add-wallet-sheet.tsx`](apps/extension/src/app/features/dialogs/add-wallet-sheet/add-wallet-sheet.tsx) — defines the three rows, their icons (`PlusIcon`, `ArrowRotateClockwiseIcon`, `LedgerIcon`), titles, and captions. Reuse these strings/icons in the menu items.
- **Integration point:** [`switch-account-sheet.tsx`](apps/extension/src/app/features/dialogs/switch-account-sheet/switch-account-sheet.tsx) — the "Add wallet" `Button` (lines 283–290), the `isAddWalletSheetOpen` state + `onAddWallet`/`onCloseAddWalletSheet` handlers (lines 56, 112–123), the `closeSheets` callback (line 120), and the `<AddWalletSheet/>` render (line 322). `useAddWalletNavigation` supplies `onCreateNewWallet`/`onRestoreWallet`/`onConnectLedger` (line 125).
- **Parent Sheet dismissal behavior:** [`sheet.web.tsx`](packages/ui/src/components/sheet/sheet.web.tsx) — the switcher Sheet's `RadixDialog.Content` sets `onPointerDownOutside={onClose}` and `onEscapeKeyDown={onClose}` (lines 87–88). This is why the precedent's `stopPropagation` on item clicks matters.
- **Primitive:** [`dropdown-menu.web.tsx`](packages/ui/src/components/dropdown-menu/dropdown-menu.web.tsx) — exposes `Root`, `Trigger` (use `asChild` to wrap the existing Button), `Portal`, `Content` (animated, `zIndex: 999`), `Item` (already pressable-styled), `Separator`, `Label`. Built on `radix-ui`.
- **Outer container:** [`sheet.web.tsx`](packages/ui/src/components/sheet/sheet.web.tsx) — the switcher Sheet is a Radix Dialog at `zIndex: 999` (line 83). The menu portals into the same stacking context, so ordering and interactivity inside the open Dialog must be verified.

### Institutional Learnings

- No `docs/solutions/` learning covers Radix `DropdownMenu`/`Popover` nesting inside a Dialog/Sheet — undocumented territory; solve from primitives and verify against source.
- One tangential web-app plan note records the team convention "Sheet for full-screen-ish flows, Popover for smaller overlays" — directionally supports this Sheet→compact-menu move.

### External References

- None. The settings menu is an exact in-repo template; external research was intentionally skipped.

---

## Key Technical Decisions

- **Use `@leather.io/ui` `DropdownMenu`, not `Popover`.** The ticket names the settings menu as the model, which is a `DropdownMenu`. It gives correct menu semantics (`role="menu"`/`menuitem`), ready-made trigger/content primitives, and built-in open/close animations.
- **Open upward (`side="top"`).** The trigger lives at the *bottom* of the switcher Sheet; a default downward menu would render past the sheet's lower edge. `side="top"` with `align="start"` opens it into the sheet body above the button.
- **Self-contained component swap.** Introduce `add-wallet-menu.tsx` that renders both the trigger Button and the menu, receiving the three navigation handlers as props; delete `add-wallet-sheet.tsx`. This keeps the switcher integration to a single element swap and removes the now-redundant open-state plumbing.
- **Follow the proven in-Sheet precedent for nesting — it is not an unknown.** `account-action-menu.tsx` and `wallet-action-menu.tsx` are already Radix `DropdownMenu`s rendered inside this same switcher Sheet and work today with **default `modal` behavior**. Base `add-wallet-menu.tsx` on them: wire each item with `onClick={e => { e.stopPropagation(); handler(); }}` (not `onSelect`). The `e.stopPropagation()` keeps the Sheet's `onPointerDownOutside={onClose}` from tearing down the switcher when an item is clicked. `modal={false}` is **not** the fix — its "items non-interactive" precondition never holds here (every item navigates), and it would not suppress the Dialog-side dismissal anyway; the precedent's `stopPropagation` is the mechanism.
- **Escape closes the menu, not the switcher.** The Sheet also has `onEscapeKeyDown={onClose}`, but Radix `DropdownMenu` intercepts Escape to close itself first while open. Confirm it does not fall through to the Sheet (the precedent menus rely on this).
- **Labels stay verbatim.** Keep item text "Create new wallet" / "Restore wallet" / "Connect hardware wallet" — the E2E page-object clicks these exact strings ([switch-account.page.ts:144, 222](apps/extension/tests/page-object-models/switch-account.page.ts)). Relabeling (e.g. "Connect Ledger") would break those helpers.
- **Role-based E2E locators.** Removing the `SheetHeader` removes the "Add wallet" heading the page-object waits on. Retarget the open helper to a menu item (e.g. `getByRole('menuitem', { name: 'Create new wallet' })`) rather than re-introducing a heading.

---

## Open Questions

### Resolved During Planning

- Options count → keep all three (Create / Restore / Connect Ledger).
- Surface type → `DropdownMenu` anchored to the "Add wallet" button inside the switcher.
- Illustration → removed from this surface.
- Shared illustration asset → kept (still used by the feature-introducer).
- Platform scope → extension only.
- Nested menu-in-Sheet pattern → follow the existing in-Sheet precedent (`account-action-menu.tsx`): default `modal`, items use `onClick` + `e.stopPropagation()`. (Resolved by review against the codebase — it is not a novel risk.)

### Deferred to Implementation

- Exact menu width and `align` polish (match button width vs. compact fixed width).
- Confirm Escape closes only the menu (leaving the switcher open) and that focus returns sensibly after selection — both expected from the precedent; verify in E2E/manual.
- Whether to add explicit `data-testid`s or rely on role/text locators — decide while updating E2E.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
BEFORE (Sheet)                          AFTER (DropdownMenu, side="top")

switcher Sheet                          switcher Sheet
 footer: [ Add wallet ][ Manage ]        footer: [ Add wallet ▴ ][ Manage ]
        │ onClick → setOpen(true)               │ DropdownMenu.Trigger asChild
        ▼                                        ▼  (opens upward, attached)
 ┌──────────────────────────┐            ┌──────────────────────┐
 │  Add wallet (SheetHeader) │            │ ⊕ Create new wallet  │
 │  [ large illustration ]   │            │ ↻ Restore wallet     │
 │  ⊕ Create new wallet      │            │ ▣ Connect Ledger     │
 │  ↻ Restore wallet         │            └──────────────────────┘
 │  ▣ Connect hardware wallet │           (no header, no illustration,
 └──────────────────────────┘             menu self-manages open state)
```

Handlers (`onCreateNewWallet` / `onRestoreWallet` / `onConnectLedger` from `useAddWalletNavigation`) move from `SheetRow.onClick` to `DropdownMenu.Item` `onClick` (with `e.stopPropagation()`, mirroring `account-action-menu.tsx`) — same destinations.

---

## Implementation Units

### U1. Build the compact Add Wallet `DropdownMenu` component

**Goal:** Create the new menu surface that replaces the Sheet — a `DropdownMenu` with the three options and no illustration.

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**
- Create: `apps/extension/src/app/features/dialogs/add-wallet-menu/add-wallet-menu.tsx`
- Delete: `apps/extension/src/app/features/dialogs/add-wallet-sheet/add-wallet-sheet.tsx` (and its now-empty folder)
- Test: behavior exercised by E2E updated in U3 — `apps/extension/tests/specs/switch-account/switch-account.spec.ts`

**Approach:**
- `DropdownMenu.Root` → `DropdownMenu.Trigger asChild` wrapping the "Add wallet" outline `Button` (`WalletPlusIcon`, `flex={1}` so it keeps its footer slot) → `DropdownMenu.Portal` → `DropdownMenu.Content` (`side="top"`, `align="start"`, compact width) → three `DropdownMenu.Item`s.
- Each item carries its icon (`PlusIcon`, `ArrowRotateClockwiseIcon`, `LedgerIcon`) and label reused **verbatim** from the old sheet ("Create new wallet" / "Restore wallet" / "Connect hardware wallet"), wired to the corresponding handler via `onClick={e => { e.stopPropagation(); handler(); }}` (mirroring `account-action-menu.tsx`, not `onSelect`) so clicking an item does not dismiss the parent Sheet.
- Props: `{ onCreateNewWallet(); onRestoreWallet(); onConnectLedger(); }`. Drop `isShowing`/`onClose` — the menu self-manages open state.
- Do **not** render `MultiWalletIllustration`. Mirror the precedent's `DropdownMenu.Group`/`Item` structure rather than inventing a new one.

**Technical design:** *(directional)* Mirror the `Trigger`/`Portal`/`Content`/`Item` structure of [`settings.tsx`](apps/extension/src/app/features/settings/settings.tsx); item content (icon + title/caption) mirrors the `SheetRow`s in the old [`add-wallet-sheet.tsx`](apps/extension/src/app/features/dialogs/add-wallet-sheet/add-wallet-sheet.tsx).

**Patterns to follow:**
- [`account-action-menu.tsx`](apps/extension/src/app/features/dialogs/switch-account-sheet/components/account-action-menu.tsx) — the proven in-Sheet `DropdownMenu` (default `modal`, `onClick` + `stopPropagation` items). Primary pattern for nesting and handlers.
- [`settings.tsx`](apps/extension/src/app/features/settings/settings.tsx) — overall `DropdownMenu` composition and `Content` positioning props (secondary; not inside a Dialog).
- Old [`add-wallet-sheet.tsx`](apps/extension/src/app/features/dialogs/add-wallet-sheet/add-wallet-sheet.tsx) — exact option titles, captions, and icons to preserve.

**Test scenarios:** *(implemented as E2E in U3)*
- Covers AE1. Happy path: clicking "Add wallet" opens a compact menu attached to the button (no full sheet, no `SheetHeader`).
- Covers AE2 / R2: the menu shows exactly three items — "Create new wallet", "Restore wallet", "Connect hardware wallet".
- R3: no illustration image is present in the open surface.
- Integration: selecting an item triggers its navigation and does **not** prematurely dismiss the switcher Sheet before navigation fires (validates `stopPropagation`).
- Edge case: the menu opens upward and stays within the popup viewport; Escape closes the menu while leaving the switcher open.

**Verification:**
- The Add Wallet surface renders as an attached menu, opening upward, with three options and no graphic; visually consistent with the settings menu.

---

### U2. Rewire the wallet switcher to use the menu

**Goal:** Swap the Sheet integration for the new menu and remove the redundant open-state plumbing, preserving navigation behavior.

**Requirements:** R1, R4

**Dependencies:** U1

**Files:**
- Modify: `apps/extension/src/app/features/dialogs/switch-account-sheet/switch-account-sheet.tsx`

**Approach:**
- Replace the footer `<Button onClick={onAddWallet} … >Add wallet</Button>` and the separate `<AddWalletSheet … />` render (line 322) with `<AddWalletMenu onCreateNewWallet={…} onRestoreWallet={…} onConnectLedger={…} />` occupying the same `flex={1}` footer slot beside "Manage".
- Remove `isAddWalletSheetOpen` state, `onAddWallet`, and `onCloseAddWalletSheet`; simplify `closeSheets` to call `onClose()` only (it no longer needs to reset sheet state).
- Keep `useAddWalletNavigation` and pass its handlers straight through.
- Update the `AddWalletSheet` import to the new `AddWalletMenu`.

**Patterns to follow:**
- The way [`settings.tsx`](apps/extension/src/app/features/settings/settings.tsx) is dropped into header components as a self-contained menu — `AddWalletMenu` slots into the footer the same way.

**Test scenarios:** *(implemented as E2E in U3)*
- Covers R4: selecting "Create new wallet" / "Restore wallet" / "Connect hardware wallet" routes to the same destinations as before (create-wallet, restore page, Ledger connect).
- Integration: the menu is interactive *inside* the open switcher Sheet (validates the nested-overlay handling — focus/pointer-events/stacking).

**Verification:**
- No dangling references to `AddWalletSheet` or the removed state remain (`knip` and `lint:unused-exports` clean); all three flows navigate correctly from within the switcher.

---

### U3. Update E2E page-object and specs

**Goal:** Adapt the Playwright coverage to the menu surface so existing add-wallet specs pass and the new behavior is asserted.

**Requirements:** R1, R2, R4

**Dependencies:** U1, U2

**Files:**
- Modify: `apps/extension/tests/page-object-models/switch-account.page.ts` — `openAddWalletSheet()` (lines 137–140) waits for `getByRole('heading', { name: 'Add wallet' })`, which no longer exists; change the wait to a menu item (e.g. `getByRole('menuitem', { name: 'Create new wallet' })`). This helper is the shared chokepoint: `createNewWallet()` (line 143), `restoreWallet()` (line 221), and `addNewWallet()` (line 212) all call it, and they additionally click `getByText('Create new wallet')` / `getByText('Restore wallet')` (lines 144, 222) — which keep working only if labels stay verbatim. Consider renaming to `openAddWalletMenu()`.
- Modify/verify the **four** specs that exercise this chain (the plan originally named only two): `apps/extension/tests/specs/switch-account/switch-account.spec.ts` (test at line 31, call at 36), `apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts` (lines 82, 186), `apps/extension/tests/specs/switch-account/multiwallet.spec.ts` (via `restoreWallet`), and `apps/extension/tests/specs/settings/sign-out-multiwallet.spec.ts` (via `addNewWallet`). Fixing the page-object helper covers them transitively — run all four.
- Verify (no change expected): `apps/extension/tests/specs/settings/settings.spec.ts:93` (asserts the "Add wallet" button visible — still true).

**Approach:**
- Point the page-object's open/assert helpers at menu-item roles instead of the sheet heading.
- Confirm the three options are reachable as `menuitem`s and that downstream flows (create/restore/ledger) still resolve.

**Test scenarios:**
- Covers AE1: after clicking "Add wallet", a menu (not a sheet) is visible with the three options.
- Covers AE2 / R2: all three options assert visible by role/name.
- Covers R4: each option triggers its existing navigation (reuse the assertions already in `switch-account.spec.ts` / `multiwallet-integrity.spec.ts`).
- Regression: `multiwallet-integrity.spec.ts` flows that open Add Wallet continue to pass end-to-end.

**Verification:**
- `pnpm --filter @leather.io/extension test:e2e` (or the relevant switch-account spec subset) passes; no spec references the removed "Add wallet" heading.

---

## System-Wide Impact

- **Interaction graph:** Only the switcher footer changes. `useAddWalletNavigation` and the create/restore/ledger destinations are untouched; the `use-add-wallet-navigation.spec.ts` unit test should stay green as a regression guard.
- **State lifecycle risks:** Removing `isAddWalletSheetOpen` is safe — the DropdownMenu owns its open state. Ensure `closeSheets` still closes the parent switcher correctly after navigation.
- **Integration coverage:** The nested Radix menu-in-Dialog interactivity (item click not dismissing the Sheet, Escape scoping) is the one thing unit tests won't prove — covered by the U3 E2E and manual check. Note the `openAddWalletSheet` page-object helper fans out to four specs, so the E2E change reaches wider than the two specs that call it directly.
- **Unchanged invariants:** The shared `DropdownMenu` and `Sheet` primitives are not modified; `MultiWalletIllustration` and its SVG remain available to the feature-introducer; the `/add-wallet` restore page and its route are unchanged.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Clicking a menu item closes the parent switcher Sheet (its `onPointerDownOutside={onClose}` fires on the portaled item) | Use the precedent's `onClick={e => { e.stopPropagation(); … }}` item pattern from `account-action-menu.tsx`; verify the switcher stays open until navigation. |
| Escape closes the whole switcher instead of just the menu (Sheet has `onEscapeKeyDown={onClose}`) | Radix `DropdownMenu` intercepts Escape to close itself first while open; confirm it does not fall through (the precedent menus rely on this). |
| Menu renders behind the Sheet (both `zIndex: 999`) | The in-Sheet precedent already renders above the Sheet — mirror it; bump `Content` z-index only if ordering doesn't win. |
| Menu opens downward and clips past the popup's bottom edge | Use `side="top"`; rely on Radix collision handling as backstop. |
| Renaming the visible labels breaks E2E (page-object clicks `getByText('Create new wallet'/'Restore wallet')`, lines 144/222) | Keep item labels verbatim: "Create new wallet", "Restore wallet", "Connect hardware wallet". |
| E2E silently passes against stale heading wait | U3 retargets the open helper to a `menuitem` role; settings spec re-verified. |

---

## Sources & References

- Linear: [LEA-3590](https://linear.app/stackslabs/issue/LEA-3590/redesign-add-wallet-as-a-compact-popover-flow) · GitHub mirror [leather-io/mono#2406](https://github.com/leather-io/mono/issues/2406)
- Related code: [`add-wallet-sheet.tsx`](apps/extension/src/app/features/dialogs/add-wallet-sheet/add-wallet-sheet.tsx), [`switch-account-sheet.tsx`](apps/extension/src/app/features/dialogs/switch-account-sheet/switch-account-sheet.tsx), [`settings.tsx`](apps/extension/src/app/features/settings/settings.tsx), [`dropdown-menu.web.tsx`](packages/ui/src/components/dropdown-menu/dropdown-menu.web.tsx)
- Verification (per CLAUDE.md): `pnpm format` · `pnpm lint` · `pnpm typecheck` · `pnpm knip` · `pnpm --filter @leather.io/extension lint:unused-exports`
