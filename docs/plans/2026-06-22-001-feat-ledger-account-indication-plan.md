---
date: 2026-06-22
title: "feat: Refine Ledger account/wallet indication in multi-wallet UI"
type: feat
origin: docs/brainstorms/2026-06-22-ledger-account-indication-requirements.md
---

# feat: Refine Ledger account/wallet indication in multi-wallet UI

## Summary

Replace the current left-of-row Ledger icon with the existing `Avatar` corner `indicator` badge, shown by context across every surface that displays an account. In grouped lists (switch-account picker/manage sheet and the send recipient dialog) the shared wallet header carries an inline Ledger marker beside the name and account rows stay bare; on single-account surfaces (home/popup header, RPC/connect/signing approval) the account avatar carries the corner badge. Software accounts stay unmarked everywhere.

---

## Problem Frame

Ledger indication today is inconsistent. The switch-account sheet stamps a small icon to the left of *every* account row under a Ledger wallet while the wallet header itself shows nothing — repetition that clutters dense lists. The home/popup header and the RPC/approval/signing dialogs show no Ledger indication at all, despite already having the wallet type in scope. That last gap matters most in signing flows, where a user needs to know a Ledger account requires the physical device to proceed.

The behavior, treatment, and per-surface rule were settled in the origin brainstorm (see origin: `docs/brainstorms/2026-06-22-ledger-account-indication-requirements.md`). This plan defines how to land it.

---

## Requirements

Carried from the origin requirements doc; R-IDs map to the origin's.

- R1. Ledger indication renders as the `@leather.io/ui` `Avatar` corner `indicator` badge (bottom-right) containing `LedgerIcon` at `small` size, replacing the current left-of-row `Flag`+icon in `account-list-item.layout.tsx`.
- R2. The badge keeps the opaque-background / ring treatment the `Avatar` indicator slot already provides.
- R3. In grouped multi-account lists, the wallet header shows a Ledger marker inline beside the wallet name; account rows under a Ledger wallet show no badge.
- R4. On single-account surfaces — home/popup header, RPC transaction/message/PSBT signing approval, and connection/authentication approval — the account avatar carries the Ledger badge, even when the wallet name is also shown.
- R5. Software-backed wallets and accounts show no indicator on any surface.
- R6. The indicator behaves identically in the sheet's default (select) and manage modes.
- R7. The indicator carries a non-visual accessible label (e.g. "Ledger hardware wallet account") at each site it renders.

---

## Surface Treatment Matrix

The single most load-bearing fact for this plan: the badge decision is **caller-driven**, because the shared components below serve both grouped and flat surfaces.

| Surface | Component | Grouped? | Treatment |
|---|---|---|---|
| Switch-account picker / manage sheet | `switch-account-list-item.tsx` → `account-list-item.layout.tsx`; `wallet-header.tsx` | Yes | Marker on wallet header; rows bare |
| Send recipient dialog | `recipient-accounts-dialog/account-list-item.tsx` → shared layout; shared `wallet-header.tsx` | Yes | Marker on wallet header; rows bare |
| Home / popup header (also PSBT, message-signing, tx-request pages via `PopupHeader`) | `popup.header.tsx` → `current-account-avatar.tsx` | No | Badge on account avatar |
| RPC Stacks signing card | `signing-account-card.tsx` → `AccountAvatarItem` | No | Badge on account avatar |
| Connection / auth approval | `current-account-displayer.tsx` → shared layout / `AccountAvatarItem` | No | Badge on account avatar |

The recipient dialog is **not enumerated in the origin doc** but is in scope by necessity: it reuses both `wallet-header.tsx` and `account-list-item.layout.tsx`, so the Flag removal in U2 would otherwise silently drop its current Ledger indication.

---

## Key Technical Decisions

- **Reuse the `Avatar` `indicator` slot, not a new primitive.** It already renders a 20×20 opaque bottom-right badge. Existing consumers pass the indicator through the UI-package avatar-icon *wrappers* (`AssetAvatarIcon`/`BtcAvatarIcon`/`StxAvatarIcon` in `token-list.tsx`, `asset-selector-list.tsx`), not the bare `Avatar`. The extension's `AccountAvatar` is the first account-side consumer of the slot, so the prop must be threaded explicitly into the inner `<Avatar>` (see U1). A Ledger badge is `indicator={<LedgerIcon variant="small" />}` (see origin Key Decisions).
- **The badge decision is caller-driven, not derived inside `AccountListItemLayout`.** That layout is shared by grouped surfaces (picker, recipient dialog) and a flat one (connection displayer), so it cannot both show and suppress. Grouped callers construct the avatar element without an indicator (rows stay bare); flat callers construct it with one. The old left-of-row `Flag` branch is removed in the same change so no row ever shows both.
- **Suppression in grouped lists needs no new state.** "Rows bare" is simply the grouped callers not passing an indicator; the shared `WalletHeader` carries the inline marker instead. No `suppressLedgerIndicator` flag is introduced.
- **`indicator` is threaded as a raw `ReactElement` through the avatar chain.** `AccountAvatar` → `AccountAvatarItem` → `CurrentAccountAvatar` do not forward it today; add an optional `indicator?: ReactElement` and pass it into the inner `<Avatar indicator={...} />`, mirroring how swap/activity pass their icons. The Ledger-specific element (icon + aria-label + testid) comes from one shared helper so all call sites stay consistent.
- **Undefined wallet type → no badge.** The runtime value of `walletEntities[fingerprint]?.type` is `WalletType | undefined`; treat undefined as "not Ledger" (safe default, avoids flicker before hydration). Caveat to verify (see Open Questions): a legacy Stacks-only Ledger stored under the assumed-zero fingerprint (`00000000`, per `wallet.selectors.ts`) could leave a genuine Ledger account looking up an undefined type under its real fingerprint and render unmarked — exactly on the approval screens that matter most. U4 must confirm which fingerprint the current-account hooks return for an unmigrated legacy Ledger.
- **Accessibility lands at two distinct DOM sites.** The avatar badge (flat surfaces) and the inline wallet-header marker (grouped) are different elements; each needs its own `aria-label`. `LedgerIcon` is a bare SVG with no built-in label, so the label is added explicitly at both sites. The `data-testid` is applied to the passed icon element, keeping `@leather.io/ui` untouched.

---

## Implementation Units

### U1. Thread `indicator` through the account avatar chain + add shared Ledger-indicator helper

- **Goal:** Make the account avatar components capable of rendering a corner badge, and centralize the Ledger indicator element (icon + aria-label + testid) in one helper reused by every flat surface.
- **Requirements:** R1, R2, R7 (foundation for R4).
- **Dependencies:** none.
- **Files:**
  - `apps/extension/src/app/ui/components/account/account-avatar/account-avatar.tsx` — add `indicator?: ReactElement`; pass into inner `<Avatar indicator={...} />` (currently `...props` spreads onto the wrapping `Box`, so the prop must be passed explicitly to `Avatar`).
  - `apps/extension/src/app/ui/components/account/account-avatar/account-avatar-item.tsx` — re-expose `indicator?` and pass down.
  - `apps/extension/src/app/features/current-account/current-account-avatar.tsx` — accept an `indicator?` (the dead `CurrentAccountAvatar` props interface is currently unused) and pass to `AccountAvatar`.
  - New: `apps/extension/src/app/components/account/ledger-account-indicator.tsx` — helper returning the indicator element (`<LedgerIcon variant="small" />` with `aria-label` + `data-testid`) given a `WalletType | undefined`; returns `undefined` when not `'ledger'`.
  - Selectors enum (e.g. `apps/extension/tests/selectors/...`) — add a Ledger-indicator `data-testid` value.
- **Approach:** Keep the avatar prop generic (`indicator: ReactElement`); the Ledger semantics live in the helper. Destructure `indicator` explicitly before the `...props` spread (which targets the outer `Box`, not `Avatar`). **Resolve the stacking, don't defer it:** the account-number overlay `Box` (`account-avatar.tsx`, full-size `position:absolute`, rendered as a later sibling of `<Avatar>`) sits above the badge by paint order. Give that overlay `pointerEvents="none"` and `zIndex={0}` so the badge (rendered at `zIndex` 1 inside `Avatar`) is never occluded — verify visually on a real gradient. Accessibility: the indicator element carries `role="img"` + `aria-label="Ledger hardware wallet account"` (the helper bakes both in); the outer `AccountAvatar` needs no separate label.
- **Patterns to follow:** indicator forwarding in the UI-package `*AvatarIcon` wrappers (`asset-avatar-icon`, `sip10-avatar-icon.web.tsx`); `Avatar` indicator slot in `packages/ui/src/components/avatar/avatar.web.tsx`.
- **Test scenarios:**
  - Happy path: `AccountAvatar` / `AccountAvatarItem` given an `indicator` renders the badge element; given none, renders no badge. (No avatar-component spec exists yet — either stand up the first render spec for these `memo`'d presentational components, or assert badge presence through the existing feature specs that already exercise them: `popup.header.spec.tsx`, `signing-account-card.spec.tsx`, `current-account-displayer.spec.tsx`.)
  - Helper: `ledger-account-indicator` returns an element with the correct `role`, `aria-label`, and testid for `'ledger'`; returns `undefined` for `'software'` and for `undefined`.
- **Verification:** Avatar components accept and render `indicator`; helper unit test passes; no visual regression in existing avatar usages.

### U2. Remove the left-of-row Flag from `AccountListItemLayout` (grouped rows go bare)

- **Goal:** Stop the shared row layout from stamping a per-row Ledger Flag, so grouped account rows are bare and the badge becomes purely a property of the avatar element the caller supplies.
- **Requirements:** R1, R3, R5.
- **Dependencies:** U1.
- **Files:**
  - `apps/extension/src/app/components/account/account-list-item.layout.tsx` — delete the `walletType === 'ledger'` `Flag`+`LedgerIcon` branch (lines ~55–62); render `itemContent` directly. **Remove the `walletType` prop entirely** — after the Flag goes, nothing reads it (a passed-but-unread prop won't be caught by `knip`/`lint:unused-exports`, so it must be removed deliberately).
  - Grouped callers — remove the now-dead `walletType={...}` they pass and confirm they construct a plain avatar (no indicator): `switch-account-sheet/components/switch-account-list-item.tsx`; `pages/send/send-crypto-asset-form/components/recipient-accounts-dialog/account-list-item.tsx`.
  - `apps/extension/src/app/features/current-account/current-account-displayer.spec.tsx` — existing spec renders the real layout; update assertions for the removed Flag.
- **Approach:** Because the `avatar` prop is an opaque `ReactNode`, the grouped callers already construct `AccountAvatarItem` without an indicator — removing the Flag is sufficient to make rows bare. No suppression flag needed.
- **Patterns to follow:** existing `AccountListItemLayout` composition; `ItemLayout` `img` slot.
- **Test scenarios:**
  - Covers R3. A Ledger account row rendered via `AccountListItemLayout` shows **no** Ledger icon (neither left-of-row Flag nor avatar badge) when the caller passes a plain avatar.
  - Covers R5. A software account row shows no indicator (unchanged).
  - Regression: the row still renders avatar, name, addresses, balance, and remains interactive/selectable.
- **Verification:** Old Flag no longer renders anywhere; grouped picker and recipient rows are bare; no double-indicator.

### U3. Inline Ledger marker on the shared `WalletHeader`

- **Goal:** Give grouped surfaces their single Ledger signal: an inline marker beside the wallet name in the shared header (used by both the switch-account sheet and the recipient dialog).
- **Requirements:** R3, R6, R7.
- **Dependencies:** U1 (helper, selectors).
- **Files:**
  - `apps/extension/src/app/features/dialogs/switch-account-sheet/components/wallet-header.tsx` — when `walletType === 'ledger'`, render an inline `LedgerIcon variant="small"` beside the name span. Wrap name + icon in an inner `Flex`/`HStack`; the name span uses `minWidth={0}` + ellipsis, so the icon needs `flexShrink={0}`. Add `aria-label` and a `data-testid` (e.g. `WalletHeaderLedgerIndicator`).
- **Approach:** `walletType` is already a prop on `WalletHeader`; no new data wiring. Reuse the U1 helper's icon element (with its `aria-label`/testid) so labelling matches the avatar badge. Place the icon immediately after the name span, both inside an inner left-group `Flex` that itself carries `flex={1} minWidth={0} overflow="hidden"`, with the icon `flexShrink={0}` — otherwise the wrapping flex takes full width and the name's ellipsis stops firing (the name truncates, never the icon). This holds identically in select mode (right column = inert placeholder) and manage mode (right column = `WalletActionMenu`, same trigger width); the left group's geometry doesn't change between modes, satisfying R6. Note the header marker is a **bare 16px `LedgerIcon`** without the `Avatar` opaque-ring treatment — R2's ring applies only to the avatar badge; the two surfaces are intentionally not pixel-identical.
- **Patterns to follow:** existing `WalletHeader` `Flex` layout; the "Add account" row's `Flex alignItems="center" gap` idiom in `switch-account-sheet.tsx`.
- **Test scenarios:**
  - Covers R3. A Ledger wallet header renders the inline marker beside the name; a software wallet header renders no marker.
  - Covers R6. Marker renders identically in select and manage modes.
  - Covers R7. Marker exposes the accessible label.
- **Verification:** Ledger wallet headers show the marker in both the picker and the recipient dialog; software headers do not.

### U4. Flat single-account surfaces carry the avatar badge

- **Goal:** Add the avatar corner badge to the three flat surfaces that show one account, wiring wallet type where it isn't already passed.
- **Requirements:** R4, R5, R7.
- **Dependencies:** U1.
- **Files:**
  - `apps/extension/src/app/features/container/headers/popup.header.tsx` — derive `walletType` from `walletEntities[current.fingerprint]?.type` and pass the U1 helper's indicator into `CurrentAccountAvatar`. (Covers home view plus PSBT/message-signing/tx-request pages that reuse `PopupHeader`.)
  - `apps/extension/src/app/features/current-account/current-account-displayer.tsx` — wire `walletEntities[current.fingerprint]?.type` (not passed today). Construct `<AccountAvatarItem ... indicator={ledgerIndicator} />` and pass it as the `avatar` prop to `AccountListItemLayout`. Do **not** pass `walletType` to the layout — that prop is removed in U2.
  - `apps/extension/src/app/features/rpc-stacks-transaction-request/signing-account-card/signing-account-card.tsx` — pass the indicator into its `AccountAvatarItem` from `walletEntities[account?.fingerprint]?.type`.
  - `signing-account-card.spec.tsx` and `current-account-displayer.spec.tsx` — both already mock `useWalletEntities`; update them to assert badge presence for a Ledger account and absence for software.
- **Approach:** Each surface already calls `useWalletEntities()`. Compute the indicator via the U1 helper and pass it to the avatar element. Undefined type → no badge. Before wiring, confirm which fingerprint the current-account hooks return for an unmigrated legacy `00000000` Ledger so the lookup doesn't miss a genuine Ledger account (see Open Questions / KTD).
- **Patterns to follow:** existing `useWalletEntities()` usage in each file; U1 helper.
- **Test scenarios:**
  - Covers R4. Home/popup header for a Ledger account renders the avatar badge with the wallet name still shown.
  - Covers R4. RPC signing card and connection displayer render the avatar badge for a Ledger account.
  - Covers R5. Each surface renders no badge for a software account.
  - Edge: `walletType` undefined → no badge (no crash, no flicker tie to public-key readiness).
  - Edge: a legacy `00000000`-fingerprint Ledger account still resolves to a Ledger badge (guards against the unmarked-Ledger-on-approval failure mode).
- **Verification:** All three flat surfaces show the badge for Ledger accounts and nothing for software accounts.

### U5. End-to-end coverage for the context rule

- **Goal:** Lock the most regression-prone behavior — grouped rows bare + header marked, and a flat surface showing the avatar badge — with Playwright E2E.
- **Requirements:** R3, R4, R5.
- **Dependencies:** U2, U3, U4.
- **Files:** extension Playwright E2E specs under `apps/extension/tests/` (co-locate with existing switch-account / connection specs).
- **Approach:** Drive the switch-account sheet with a Ledger wallet present; assert the wallet-header Ledger testid is visible and the account rows under it expose no Ledger-indicator testid. Assert a software wallet header has no marker. For a flat surface (connection approval or home header), assert the avatar badge testid is present for a Ledger account.
- **Patterns to follow:** existing switch-account-sheet E2E; Radix `DropdownMenu` items clicked via `getByRole('menuitem')` (not text); nested-in-Sheet menus use `onClick`+`stopPropagation` per the account-action-menu pattern.
- **Test scenarios:**
  - Covers R3. Picker: Ledger wallet header shows the marker; its account rows show no Ledger indicator.
  - Covers R5. Software wallet header and rows show no indicator.
  - Covers R4. A flat surface shows the avatar badge for a Ledger account.
  - Covers R3 (recipient dialog). The send recipient dialog's wallet header stays pinned while scrolling a multi-account Ledger group, and its rows show no per-row indicator — the recipient dialog was never covered by the origin's sticky-scroll example, so verify it rather than inheriting the picker's guarantee.
- **Verification:** E2E specs pass in CI; assertions key off the U1/U3 testids.

---

## System-Wide Impact

Shared components ripple by design: `AccountListItemLayout` (U2) and `WalletHeader` (U3) are used by both the switch-account sheet and the send recipient dialog; the `AccountAvatar` chain (U1) backs every account avatar. Changes are intended to land consistently across the picker, manage mode, recipient dialog, connection approval, signing card, and the home/popup header (plus PSBT/message/tx-request pages via `PopupHeader`). No `@leather.io/ui` package change is required — the work consumes the existing `Avatar` `indicator` prop.

---

## Assumptions

- **The send recipient dialog is in scope as a regression-prevention necessity** (not a consistency nicety). It already shows the Ledger Flag today via the shared `AccountListItemLayout`, so the U2 Flag removal would silently drop its only Ledger signal unless its shared `WalletHeader` picks up the marker.
- **Grouped lists rely on sticky `GroupedVirtuoso` headers** (picker and recipient dialog) to keep Ledger context visible while scrolling. Brief transition moments where a row is bare with its header off-screen are acceptable. The recipient dialog's stickiness is verified in U5, not assumed.
- **Flat single-account surfaces render inside the fixed-width extension popup (≥360px)**, so the sub-320px path where `AccountListItemLayout` hides the avatar (`ItemLayout` `img`) is not reachable on the R4 surfaces and needs no fallback. Confirm during U4 if any R4 surface can render narrower.
- **No `@leather.io/ui` change needed** — the `indicator` prop already exists on the web `Avatar`; the testid is applied to the passed icon element.

---

## Open Questions (Deferred to Implementation)

- **Legacy `00000000` Ledger fingerprint (highest-value to resolve, see KTD/U4):** confirm which fingerprint the current-account hooks return for an unmigrated Stacks-only legacy Ledger, and whether badge derivation must consult the assumed-zero entry (as `wallet.selectors.ts` error helpers do). A miss here leaves a real Ledger account unmarked on approval screens.
- Confirm `getWalletGroupCounts` behavior for an all-hidden Ledger wallet group in `switch-account-sheet.utils.ts`: whether a marked header can render with zero rows, or the group is dropped. Ensure the wallet marker does not render orphaned.
- (Resolved in U1: the account-number overlay stacking is handled with `pointerEvents="none"` + `zIndex` on the overlay; the visual check remains a U1 verification step, not an open design question.)

---

## Sources & Research

- Origin requirements: `docs/brainstorms/2026-06-22-ledger-account-indication-requirements.md` (treatment, per-surface rule, external design principles, and code grounding).
- Avatar `indicator` slot: `packages/ui/src/components/avatar/avatar.web.tsx`. Existing consumers pass the indicator through the `*AvatarIcon` wrappers (`asset-avatar-icon`, `sip10-avatar-icon.web.tsx`) used by `token-list.tsx` and the swap asset selector (`asset-selector-list.tsx`) — `AccountAvatar` is the first account-side consumer.
- `LedgerIcon`: `packages/ui/src/icons/ledger-icon.web.tsx` (`small` 16px, `medium` 24px).
- Wallet type: `apps/extension/src/app/store/common/wallet-type.selectors.ts` (`WalletType = 'ledger' | 'software'`); runtime via `useWalletEntities()[fingerprint]?.type`.
- E2E conventions: Radix `DropdownMenu` via `getByRole('menuitem')`; nested-in-Sheet menus use `onClick`+`stopPropagation` (account-action-menu pattern).
- `docs/solutions/` has no applicable learnings (knowledge base currently empty).
