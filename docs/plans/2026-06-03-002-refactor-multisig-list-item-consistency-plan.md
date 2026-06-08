---
date: 2026-06-03
status: active
type: refactor
title: Multisig — unify list items onto a shared ItemLayout building block
plan_depth: standard
related:
  - apps/web/app/pages/multisig/README.md
  - docs/plans/2026-06-02-001-feat-multisig-ui-web-app-plan.md
  - docs/plans/2026-06-03-001-refactor-multisig-canonical-brand-avatars-plan.md
---

# Multisig — unify list items onto a shared ItemLayout building block

## Summary

The multisig web app renders the same conceptual row — leading avatar → title → subheadline → trailing content — on nearly every page (the vault list, vault accounts, vault members, transaction/activity rows, signer rollcall, onboarding connect rows, the invite-accept and share-invite member rows in modals, and the avatar header rows that open the vault-details and account-details cards). Each was hand-rolled separately, so they drift: the avatar↔text gap is `space.03` in some places and `space.04` in others, leading avatars range from 24px (members) to 40px (cards/tx) to 32px (detail headers), and titles are `label.01` (17px) on the vault cards and detail headers but `label.02` (15px) everywhere else.

This plan consolidates all of those rows onto **one shared multisig-local building block** that composes `@leather.io/ui`'s canonical `ItemLayout`, aligned to the **Portfolio** scale (15px medium titles, `caption.01` subheadlines, a unified **40px** leading avatar, `space.04` avatar gap, and a right-aligned trailing column). Each row keeps its own leading avatar (`AvatarSq` squircle tile, `AvatarCircle` member initial, `ChainAvatar` BTC/STX mark) and its existing indicators/badges — only layout, spacing, typography are standardized. Scope is the **web** multisig app only; design-only, no behavior or data changes.

Two scoping decisions are settled (user-confirmed):
- **Base building block** → adopt `@leather.io/ui`'s `ItemLayout` (this app becomes the first `apps/web` consumer).
- **Type & icon scale** → match Portfolio exactly, accepting that the "My vaults" cards and the vault/account detail header rows shrink from a 17px title to the unified 15px and the detail headers grow 32px→40px avatar.

> **Review-informed correction (2026-06-03):** an initial draft routed the button/pill rows through `ItemLayoutWithButtons` and set the row `gap` to `space.00`. Document review verified against the source that `ItemLayoutWithButtons.caption` is typed `string` (it cannot carry the `<AddressText>` ReactNode caption the member/signer rows need), and that `ItemLayout`'s single `gap` prop governs *both* the left title/caption stack and the right trailing column. The design below was corrected: `VaultListItem` composes **plain `ItemLayout` only** (whose `titleLeft`/`captionLeft`/`titleRight` slots all accept a `ReactNode`), and uses `gap="space.01"` (4px — matching today's title↔caption spacing and Portfolio's 4px trailing-column gap). `ItemLayoutWithButtons` is not used.

---

## Problem Frame

`apps/web/app/pages/multisig/` was ported from a standalone prototype. Every list-shaped surface re-implemented the "icon + title + subheadline + trailing" row with its own `Flex`/`styled` markup, so the spacing, avatar sizing, and title typography are inconsistent across pages even though the rows are conceptually identical. The user perceives this as "custom in places because the spacings are just all over the place," specifically calling out (a) inconsistent spacing to the first/last item, (b) the undersized vault-members icon, and (c) the vault-details and account-details header rows ("the first item") as occurrences that must match.

Portfolio is the established web reference for "correct": `apps/web/app/pages/portfolio/components/activity-list/activity-item.tsx` and `apps/web/app/pages/portfolio/portfolio-table/portfolio-table-cells.tsx` render the same row shape with `Flex alignItems="center" gap="space.04"`, title `body.02` + `fontWeight="medium"` (15px/500), caption `caption.01` `ink.text-subdued`, and a trailing right-aligned column at `gap="space.01"`.

The design system already ships the canonical primitive for this row — `ItemLayout` in `@leather.io/ui` — which the extension uses pervasively, but which is currently **unused anywhere in `apps/web`**. The earlier multisig UI plan recorded the intent to back web rows with `ItemLayout` / `Pressable` (see origin: `docs/plans/2026-06-02-001-feat-multisig-ui-web-app-plan.md`); this plan executes that direction for the row family.

**The thing that must be true at the end:** every multisig list row is composed from the same shared building block (built on `ItemLayout`), so the leading-avatar size, avatar gap, title/subheadline typography, trailing-content column, and first/last spacing are identical across the dashboard, vault, account, transaction, members, signer, onboarding, and modal-member surfaces — matching the Portfolio scale — while each row keeps its specific avatar variant and indicators.

### Requirements

- **R1** — A single shared multisig list-item component exists and is the only source of the "leading avatar → title → subheadline → trailing" layout; it composes `@leather.io/ui` `ItemLayout` rather than re-implementing the row.
- **R2** — Every occurrence of the row is migrated onto the shared component, including the vault-details and account-details header rows ("first item") and the member rows inside the invite-accept and share-invite modals.
- **R3** — All migrated rows use the unified scale: leading avatar **40px**, avatar↔text gap **`space.04`**, title **15px medium** (`label.02`; equivalent to Portfolio `body.02`+medium), subheadline **`caption.01`** `ink.text-subdued`, trailing column **right-aligned** at **`gap="space.01"`**. The trailing *value weight* stays `label.02` (15px/500), consistent with today's multisig amounts — a deliberate divergence from Portfolio's regular-weight (`body.02`) amount, see KTD-5.
- **R4** — Each row keeps its existing leading avatar variant (`AvatarSq` for vault/account tiles, `AvatarCircle` for members/signers, `ChainAvatar` for chain rows) and its existing indicators/badges (chain badge, tx status indicator, status pills, action buttons).
- **R5** — The change is scoped to `apps/web` multisig; no changes to `@leather.io/ui`, `@leather.io/tokens`, mobile, or extension, and no behavior, routing, copy, or data changes.

---

## Scope Boundaries

### In scope

The recurring **icon-left row** at these occurrences (all under `apps/web/app/pages/multisig/`):

- **Vault list** — `dashboard/components/vault-card.tsx` (balance / invite-badge / pending-badge trailing).
- **Vault accounts** — `vault/components/accounts-list.tsx` (balance trailing).
- **Activity / transactions** — `components/tx-row.tsx` (used by dashboard recent-activity, vault detail, account detail; inline status badge + balance trailing) and the **create-transaction action row** in `account/account.page.tsx`.
- **Vault members** — `vault/components/members-section.tsx` (status pill + share-invite button trailing).
- **Signer rollcall** — `tx/components/signer-rollcall.tsx` (sign button / signed-status text trailing).
- **Onboarding connect rows** — `onboarding/components/onboarding-connect-row.tsx` (connected badge / connect button trailing).
- **Modal member rows** — the member row in `modals/invite-accept-modal.tsx` and `modals/share-invite-card.tsx` (same `AvatarCircle` + name + address pattern as `members-section.tsx`, currently at `gap="space.03"` / `AvatarCircle size="sm"`).
- **Detail header rows ("first item")** — the avatar+name+subhead header of `vault/components/vault-status-card.tsx` and `account/components/account-details-card.tsx`.

Plus: the shared component itself (new), and the multisig README `@leather.io/ui` gaps/reused-atoms log.

### Deferred to Follow-Up Work

- **Settings rows** (`settings/components/settings-row.tsx`) — title + subhead + trailing toggle, but **no leading avatar**, so not the icon-left row family. Already uses `label.02` / `caption.01`; aligning it to the shared component (with an empty leading slot) is a reasonable follow-up but out of this pass.
- **Create-vault preview mini-member chips** — the create-vault preview rail renders members as small `AvatarCircle size="xs"` chips at `gap="space.02"`; these are summary chips, not full icon-left rows, and bumping them to 40px would be wrong. Left as-is.
- **Container-chrome unification** — the three container families (separately-bordered selectable cards, grouped divider boxes, borderless feed inside a bordered box) stay as distinct contexts. This plan normalizes the **inner row** and its first/last padding, not the surrounding container shells.
- **Upstreaming the shared row to `@leather.io/ui`** — only if multisig graduates from design-only; tracked in the README gaps log as a candidate.
- Capturing the "first `apps/web` consumer of `ItemLayout`" decision and the scale-reconciliation as a `docs/solutions/` learning (suggested via `/ce-compound` after this lands).

### Out of scope

- Any `@leather.io/ui`, `@leather.io/tokens`, mobile (React Native), or extension changes. In particular: **no upstream change to `ItemLayout` / `ItemLayoutWithButtons`** (which is why the design below works within their current type signatures rather than extending them).
- Real-data wiring, `@leather.io/services` calls, routing, copy, or store/reducer logic.
- The centered "+ Create new vault" / "+ Create new account" dashed CTA buttons (`dashboard/components/create-vault-tile.tsx` and the CTA in `accounts-list.tsx`) — intentionally a centered call-to-action, not an icon-left row.
- The member-input **form** rows (`create-vault/components/member-rows.tsx`) — text inputs, not a display row.

---

## High-Level Technical Design

*This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

The shared component reconciles the two confirmed decisions — **adopt `ItemLayout`** + **match the Portfolio scale** — by composing Portfolio's leading `Flex` (which sets the 16px avatar gap and 40px leading slot) around an `img`-less `ItemLayout` (which provides the title/caption/trailing structure). It uses **plain `ItemLayout` only**: its `titleLeft`, `captionLeft`, and `titleRight` slots all accept a `ReactNode` (a non-element value falls back to a default-styled span), so the same component handles text captions, `<AddressText>` mono captions, inline title badges, balance trailing, and button/pill/status trailing — without `ItemLayoutWithButtons` (whose `caption` is `string`-typed and cannot carry `<AddressText>`).

```
VaultListItem (new, components/vault-list-item.tsx)
└─ <Flex alignItems="center" gap="space.04">        ← Portfolio avatar gap (16px)
   ├─ leading slot (flexShrink 0, 40px box)          ← AvatarSq md | AvatarCircle lg | ChainAvatar lg | 40px Circle
   └─ ItemLayout (flex 1, minWidth 0, img-less, gap="space.01")
      ├─ titleLeft   → 15px medium  (plain string → default label.02; OR a composed node when an inline badge sits beside the title)
      ├─ captionLeft → caption.01 ink.text-subdued  (plain text OR <AddressText/> ReactNode)
      └─ titleRight / captionRight (right-aligned column):
         • balance rows → titleRight = value (string→label.02), captionRight = sub (string→caption.01)
         • button/pill/status rows → titleRight = composed trailing ReactNode (pill + button, or status text); captionRight omitted
         • header rows → no titleRight/captionRight
```

Why this shape (the reconciliation):

| Concern | `ItemLayout` native | Portfolio target | Resolution |
|---|---|---|---|
| Avatar gap | `img` → `Flag` `space.03` (12px) | `space.04` (16px) | Wrap an **`img`-less** `ItemLayout` in our own `Flex gap="space.04"`; do not use `ItemLayout`'s `img` slot |
| Title | `label.02` (15px/500) | `body.02`+medium (15px/500) | Identical rendered size/weight — use `ItemLayout`'s string default; node override only when an inline badge is present |
| Caption | `caption.01` subdued | `caption.01` subdued | `captionLeft` accepts a `ReactNode`, so plain text *and* `<AddressText>` both flow through |
| Trailing structure | `titleRight`/`captionRight` (both `ReactNode`) | value/sub column, or buttons/pills | Balance → string `titleRight`+`captionRight`; buttons/status → composed node as `titleRight`. No `ItemLayoutWithButtons`. |
| Row gap | single `gap` governs **both** columns | left flush-ish (line-height), trailing 4px | `gap="space.01"` (4px) — matches today's title↔caption `mt="space.01"` *and* Portfolio's 4px trailing gap; `space.00` would have removed today's left-column spacing |
| Interactivity | `Pressable` (hover via `_before` inset −12px) | element-level `_hover bg` | **Do not adopt `Pressable`** — its −12px hover halo bleeds past bordered cards / `overflow:hidden` boxes; keep each container's existing element-level `_hover bg` (per-family map in KTD-4) |

The leading avatar variants and their indicators are unchanged components — only the **size** is unified to 40px. `VaultListItem` owns the leading-box dimensions (a fixed 40px `flexShrink={0}` slot); callers pass the avatar variant pre-sized to 40px (or, where the avatar API allows, the wrapper sizes it) so a call site cannot reintroduce a mismatched size:

| Variant | Used by | Today | Unified |
|---|---|---|---|
| `AvatarSq` (squircle tile + chain badge) | vault cards, accounts, detail headers | `md`(40) cards, `sm`(32) headers | `md` (40) everywhere |
| `AvatarCircle` (member initial) | members, signers, modal member rows | `sm` (24) | `lg` (40) |
| `ChainAvatar` (BTC/STX brand + indicator) | tx rows, onboarding | `lg` (40) | `lg` (40), unchanged |
| neutral `Circle` + `PlusIcon` | create-transaction row | `32px` | 40px |

Token reference (from `@leather.io/tokens`): `space.01`=4, `.02`=8, `.03`=12, `.04`=16, `.05`=24px. Text: `label.01`=17/500, `label.02`=15/500, `body.02`=15/400, `caption.01`=13/400. Avatar sizes: `xs`16 / `sm`24 / `md`32 / `lg`40 / `xl`48px; `AvatarSq` tile `sm`32 / `md`40 / `lg`56px. The `Avatar` `indicator` badge is a fixed 20px chip that does **not** scale with avatar size — proportionate at 40px; no per-call-site indicator change is needed.

---

## Key Technical Decisions

- **KTD-1 — Shared building block built on plain `ItemLayout`.** A new multisig-local `VaultListItem` wraps `@leather.io/ui` `ItemLayout` rather than re-implementing the row. This clears the repo's documented "extract a wrapper only when reused in 3+ places" bar (≈11 occurrences) and makes the scale a single-knob decision. Becomes the **first `apps/web` consumer** of `ItemLayout` — accepted per the earlier plan's stated direction (see origin: `docs/plans/2026-06-02-001-feat-multisig-ui-web-app-plan.md`). `ItemLayoutWithButtons` was considered for the button-trailing rows but rejected: its `caption` prop is typed `string` and cannot carry the `<AddressText>` ReactNode caption members/signers need. `ItemLayout`'s `titleRight` already accepts a `ReactNode`, so a composed pill+button node covers the button-trailing case within one primitive.
- **KTD-2 — Match Portfolio scale, supplied by the wrapper's own leading `Flex`; `gap="space.01"`.** Because `ItemLayout`'s built-in `img` slot hardcodes `Flag` at `space.03` (12px), the wrapper composes the 16px gap and 40px leading slot via its own `Flex gap="space.04"` around an `img`-less `ItemLayout`. The `ItemLayout` `gap` is set to `space.01` (4px), not `space.00`: a single `gap` governs both the left title↔caption stack and the right value↔sub column, and `space.01` matches both today's title↔caption spacing (`mt="space.01"`) and Portfolio's 4px trailing-column gap. (If a reviewer later prefers the design-system's native 12px `Flag` gap, switching to `ItemLayout`'s `img` slot is a one-line change.)
- **KTD-3 — Keep avatar variants and indicators; unify only size to 40px, owned by the wrapper.** `AvatarSq`, `AvatarCircle`, `ChainAvatar` are unchanged components; the member/signer/modal circle bumps `sm`(24)→`lg`(40) — the specific "icons are different" complaint — and the detail headers bump `AvatarSq` `sm`(32)→`md`(40). `VaultListItem` fixes the leading box at 40px so a call site cannot pass a mismatched size, making the size-consistency invariant structural rather than per-call-site discipline. The `Avatar` `indicator` badge is a fixed 20px chip that does **not** scale with avatar size (carry-forward from the brand-avatars refactor) — proportionate at 40px, no change needed.
- **KTD-4 — Do not adopt `Pressable`; preserve existing container shells with a precise per-family hover map.** Adopting `ItemLayout` for the body does **not** require `Pressable`. Its hover model (`_before` pseudo inset −space.03) extends 12px beyond the element and would bleed past the bordered cards and `overflow:hidden` grouped boxes multisig uses. Per family: (a) **bordered selectable cards** (vault-card, accounts-list) keep `_hover bg` on their `styled.button` container — unchanged; (b) **feed rows** (tx-row, create-tx) keep `_hover bg` on their `styled.button` container — unchanged; (c) **grouped-divider rows** (members, signers) and **detail header rows** are non-interactive display rows with **no hover today** — they stay non-hoverable (confirmed intentional, not a regression); (d) **modal member rows** match (c). `VaultListItem` renders inert markup and leaves container + hover + click handling to the call site.
- **KTD-5 — Title weight matches Portfolio; trailing value weight intentionally does not.** `label.02` (the `ItemLayout` default title) and Portfolio's `body.02`+`fontWeight="medium"` both render 15px/500 — so titles match Portfolio once the 17px `label.01` headers/cards come down. The trailing *value* is left at `ItemLayout`'s `titleRight` default (`label.02`, 15px/**500**), which matches today's multisig amount weight but differs from Portfolio's `body.02` (15px/**400**) `BalanceCell`. This is a deliberate, documented divergence (the amount reads fine at medium weight and avoids a per-row node override); R3 reflects it so "match Portfolio" is not overclaimed for the trailing value.
- **KTD-6 — Caption and trailing are `ReactNode` slots on plain `ItemLayout`.** `ItemLayout` renders `captionLeft` and `titleRight` verbatim when passed a React element (its `componentWithFallback` returns the node as-is, applying default typography only to plain strings). So: member/signer/modal rows pass `<AddressText>` (mono `code` style) as `captionLeft`; balance/activity rows pass plain text (gets the `caption.01` default); button/pill/status rows pass a composed node (pill + button, or status text) as `titleRight`. No special-casing and no `ItemLayoutWithButtons`.
- **KTD-7 — "Match Portfolio" is a point-in-time alignment, not automatic parity.** Multisig rows will be built on `ItemLayout` while the Portfolio rows they match remain hand-built `Flex`/`styled`. The scale is reconciled to be identical *now*; it does not auto-inherit future Portfolio scale changes (multisig tracks `ItemLayout`'s defaults plus the wrapper's tokens). Accepted consequence: if Portfolio's scale shifts materially, `VaultListItem` must be re-reconciled. (The longer-term resolution — Portfolio migrating onto the same wrapper, or upstreaming to `@leather.io/ui` — is deferred to multisig graduation.)

---

## Implementation Units

### U1. Shared `VaultListItem` building block

**Goal:** Introduce the single shared row component that composes `@leather.io/ui` `ItemLayout` (plain, img-less) at the Portfolio scale, with a 40px leading slot, `space.04` avatar gap, and `space.01` inner gap. This is the foundation every other unit migrates onto.

**Requirements:** R1, R3, R4 (layout/scale contract), R5.

**Dependencies:** none.

**Files:**
- `apps/web/app/pages/multisig/components/vault-list-item.tsx` (new)
- `apps/web/app/pages/multisig/components/vault-list-item.spec.tsx` (new)

**Approach:**
- Compose per the High-Level Technical Design: a `Flex alignItems="center" gap="space.04"` with a `flexShrink={0}` 40px leading slot (the avatar) and an `img`-less `ItemLayout` at `flex={1} minWidth={0}`, with `ItemLayout` `gap="space.01"`.
- Expose slots covering all occurrences: `leading` (the avatar variant, rendered in the fixed 40px box), `title` (string for the common case), optional `titleAccessory` (an inline badge/pill — when present, the wrapper composes `titleLeft` as a node pairing an explicitly-styled `label.02` title with the accessory, since a node `titleLeft` bypasses the default styling), `caption` (ReactNode — text or `<AddressText>`, passed to `captionLeft`), and trailing as either a balance pair (`trailingTitle` / `trailingSubtitle` → `titleRight`/`captionRight`) or a single composed trailing node (buttons/pills/status → `titleRight`). Do **not** use `ItemLayoutWithButtons`.
- Title relies on `ItemLayout`'s default `label.02` for the string case; caption on its default `caption.01` for the string case; `<AddressText>` and composed trailing nodes render verbatim.
- Do **not** wrap in `Pressable` (KTD-4); the component renders inert markup and leaves container/click handling to call sites. Follow code style: `interface VaultListItemProps`, `function` declaration, destructure props, no `as`/`!`/`any`, no enums.

**Patterns to follow:**
- Portfolio leading + trailing recipe: `apps/web/app/pages/portfolio/components/activity-list/activity-item.tsx`, `apps/web/app/pages/portfolio/portfolio-table/portfolio-table-cells.tsx` (`AssetCell`, `BalanceCell`).
- Canonical primitive and its `ReactNode` slot handling: `packages/ui/src/components/item-layout/item-layout.web.tsx` (note `componentWithFallback`, the `titleRight`/`captionRight` right Stack at `alignItems="end"`, and that the `gap` prop feeds both columns).
- Extension consumer pattern (wrap-ItemLayout-with-nodes, bump title via a styled node): `apps/extension/src/app/components/crypto-asset-item/crypto-asset-item.layout.tsx`.

**Test scenarios** (`vault-list-item.spec.tsx`):
- Happy path — given `leading`, `title` string, and `caption` text, the row renders the leading element, the title text, and the caption text, in that order. (Assert on rendered text content and DOM structure / a `data-testid` on the leading slot — not on Panda's hashed class names, which are build-time atomic and not a stable token string.)
- Balance trailing — given `trailingTitle` and `trailingSubtitle`, both render in the right-aligned column and both text values are present in the trailing region.
- Composed-node trailing — given a trailing node (e.g., a button) instead of a balance pair, it renders in the trailing region and no `captionRight` text is emitted.
- Inline title accessory — given `titleAccessory`, it renders on the same line as (adjacent to) the title, not in the trailing region.
- Caption node passthrough — given a `<AddressText>` caption node, it renders verbatim (mono address text present), confirming the ReactNode caption is not coerced to a plain string. This is the regression guard for the `string`-vs-`ReactNode` issue that motivated dropping `ItemLayoutWithButtons`.
- No trailing — given neither a balance pair nor a trailing node, the trailing region contains no text content (the leading + title + caption are the only content).
- Edge — empty/whitespace title renders the row without throwing; a long title truncates (ellipsis) rather than pushing the trailing content off-row.

**Verification:** Component renders all slot combinations; unit tests pass; `pnpm --filter @leather.io/web typecheck` and `lint` clean on the new files. The caption-node test in particular must pass.

---

### U2. Migrate vault list + vault accounts (balance rows)

**Goal:** Move the "My vaults" cards and the vault-accounts list onto `VaultListItem`, keeping their bordered selectable-card containers and `AvatarSq` tiles (with chain badge), at the unified scale, while preserving the vault-card's conditional trailing states.

**Requirements:** R2, R3, R4.

**Dependencies:** U1.

**Files:**
- `apps/web/app/pages/multisig/dashboard/components/vault-card.tsx` (modify)
- `apps/web/app/pages/multisig/vault/components/accounts-list.tsx` (modify)

**Approach:**
- Keep each item's `styled.button` bordered-card container, its `onClick`, and its element-level `_hover bg` (KTD-4). Replace the hand-rolled inner `Box`/`Flex` with `VaultListItem`.
- Leading: `AvatarSq … size="md"` (40px — unchanged tile, chain badge preserved).
- Title comes down from `label.01` (17px) to the shared 15px — expected visual delta (user-confirmed).
- **Vault-card trailing is conditional — preserve all three current states exactly (do not show a USD value during invite/pending, and do not drop "Awaiting members"):**
  - **Active** (`!isInvite && !hasPending`): `trailingTitle` = `formatUsd(balanceUsd)`, `trailingSubtitle` = `balanceSub`.
  - **Pending** (`hasPending`): `titleAccessory` = the warning "N pending invite(s)" `Badge`; trailing = the "Awaiting members" caption (no USD value).
  - **Invitation** (`isInvite`): `titleAccessory` = the info "Invitation" `Badge`; no trailing value/sub.
- Accounts-list trailing: balance pair (`trailingTitle` = `formatUsd(balanceUsd)`, `trailingSubtitle` = `balanceSub`); caption = `<AddressText>`.
- Preserve the existing `formatUsd` helpers and the "Create new …" dashed CTA buttons (out of scope, untouched). Do not change any of the `isInvite` / `hasPending` / `invitedCount` conditions — only the layout container.

**Patterns to follow:** `VaultListItem` from U1; the current badge/balance conditions already in these files (mirror the three states above 1:1).

**Test scenarios:** `Test expectation: none -- design-only screen migration; U1 covers the slot contract, the manual walk (Verification) covers the active/pending/invitation state-selection.`

**Verification:** In the running app (`/multisig`), the vault list renders with 40px tiles, 15px titles, `space.04` gap. Confirm each state explicitly against the dummy data: an **active** vault shows USD value + sub on the right; a **pending** vault shows the pending-invites badge by the title and "Awaiting members" on the right with **no** USD value; an **invited** vault shows the "Invitation" badge and no trailing value. Accounts render with address caption + balance. No console errors; typecheck/lint/knip clean.

---

### U3. Migrate activity/transaction rows + create-transaction row

**Goal:** Move `TxRow` (dashboard recent activity, vault detail, account detail) and the create-transaction action row onto `VaultListItem`, preserving the `ChainAvatar` brand mark + status indicator and the inline status badge.

**Requirements:** R2, R3, R4.

**Dependencies:** U1.

**Files:**
- `apps/web/app/pages/multisig/components/tx-row.tsx` (modify)
- `apps/web/app/pages/multisig/account/account.page.tsx` (modify — the inline "Create transaction" row)

**Approach:**
- `TxRow`: keep the `styled.button` feed-row container and `onClick`; replace inner markup with `VaultListItem`. Leading: `ChainAvatar … size="lg"` (40px) with its `indicator` (tx status icon) preserved. Title: `tx.title` with the existing "Awaiting your signature" `Badge` / `StatusPill` as the inline `titleAccessory`. Caption: `showVaultName ? vault.name : tx.sub`. Trailing: balance pair (`amount` + `amountUsd`). Normalize gap `space.03`→`space.04`.
- Preserve the existing explanatory comment in `tx-row.tsx` and all signing-state logic (`meSigned`, `awaitingMySig`, the `awaitingMySig ? Badge : (tx.highlight && StatusPill)` branch) unchanged — comments are not modified anywhere in this plan (project rule); noted here only because `tx-row.tsx` carries one.
- Create-transaction row in `account.page.tsx`: replace the bespoke `Circle 32px` + text block with `VaultListItem` using a neutral 40px leading circle + `PlusIcon`, title "Create transaction", caption the existing propose-transfer copy.

**Patterns to follow:** `VaultListItem` from U1; `ChainAvatar` indicator usage already in `tx-row.tsx`; the create-tx row mirrors the activity row's leading/title/caption shape.

**Test scenarios:** `Test expectation: none -- design-only screen migration; U1 covers the slot/indicator contract, the manual walk (Verification) covers the awaiting-signature vs highlight-status badge selection.`

**Verification:** Activity lists on dashboard, vault detail, and account detail render at the unified scale with the status indicator and inline badges intact; confirm in dummy data both branches — an **awaiting-your-signature** tx shows that badge, a **highlighted** tx shows its `StatusPill`. The create-transaction row matches the activity rows' sizing/spacing. No console errors; typecheck/lint/knip clean.

---

### U4. Migrate member, signer, onboarding, and modal-member rows (button/status trailing)

**Goal:** Move the vault-members list, the signer rollcall, the onboarding connect rows, and the two modal member rows onto `VaultListItem`, fixing the undersized member avatar and unifying gap/typography while keeping their trailing status pills, action buttons, and status text.

**Requirements:** R2, R3, R4.

**Dependencies:** U1.

**Files:**
- `apps/web/app/pages/multisig/vault/components/members-section.tsx` (modify)
- `apps/web/app/pages/multisig/tx/components/signer-rollcall.tsx` (modify)
- `apps/web/app/pages/multisig/onboarding/components/onboarding-connect-row.tsx` (modify)
- `apps/web/app/pages/multisig/modals/invite-accept-modal.tsx` (modify — the member row)
- `apps/web/app/pages/multisig/modals/share-invite-card.tsx` (modify — the member row)

**Approach:**
- Keep the grouped-box-with-dividers container for members/signers, the bordered single-row container for onboarding, and the modal layouts; migrate the **inner row** to `VaultListItem`. These rows are non-interactive containers (no row-level `_hover`, no row-level `onClick`) — keep them that way (KTD-4); the action buttons inside remain the only interactive elements, so do not wrap the row in a clickable element (avoids nested interactive elements).
- Members / signers / modal rows leading: `AvatarCircle … size="lg"` (40px) — the **`sm`→`lg` bump** that fixes the "icons are different" complaint.
- Title: member/signer name (+ "(you)"/"(me)" suffix as today). **The "· handle" goes on the caption line, not inline beside the title** — `ItemLayout`'s title HStack is `overflow:hidden` with no wrap, so an inline handle would truncate on narrow widths instead of wrapping as it does today; placing it in the caption (it is already `caption.01`-styled) preserves it. Caption: the handle (when present) and `<AddressText>` composed into a single `captionLeft` node.
- Trailing (composed node passed as `titleRight`): members → `MemberStatusPill` + optional "Share invite" `Button`; signers → "Sign" `Button` when actionable, else the "Signed"/"Not signed yet" status text (plain styled text, not a pill or button — it lives in the composed trailing node); onboarding → connected `Badge` or "Connect" `Button`; modal rows → their existing trailing (status/copy).
- Normalize gap `space.03`→`space.04`. Preserve all status/sign/invite conditions; this is layout-only.

**Patterns to follow:** `VaultListItem` from U1 (composed-node trailing + ReactNode caption paths); existing pill/button/status logic in these files.

**Test scenarios:** `Test expectation: none -- design-only screen migration; U1 covers the composed-node-trailing and caption-node contracts, the manual walk (Verification) covers the per-state trailing.`

**Verification:** Members and signers render with 40px circular avatars (visibly matching the other rows' leading size), `space.04` gap, the handle (where present) on the caption line beside the address, and their status pills / buttons / status text on the right. Confirm the conditional trailing states in dummy data: a **joined**, an **invited** (with Share-invite button), and a **declined** member; a signer in **sign**, **signed**, and **not-signed-yet** states; an onboarding row **connected** and **not connected**. Modal member rows match the section rows. No nested-interactive-element warnings. No console errors; typecheck/lint/knip clean.

---

### U5. Migrate vault-details & account-details header rows ("first item")

**Goal:** Move the avatar+name+subhead header row of the vault-status card and the account-details card onto `VaultListItem`, so the "first item" the user flagged matches every other row.

**Requirements:** R2, R3, R4.

**Dependencies:** U1.

**Files:**
- `apps/web/app/pages/multisig/vault/components/vault-status-card.tsx` (modify — header row only)
- `apps/web/app/pages/multisig/account/components/account-details-card.tsx` (modify — header row only)

**Approach:**
- Replace the bespoke header `Flex` (currently `AvatarSq size="sm"` 32px, `gap="space.03"`, title `label.01` 17px) with `VaultListItem`: leading `AvatarSq … size="md"` (40px, `withChainBadge={false}` preserved), title the vault/account name at the shared 15px, caption the "Bitcoin/Stacks vault" / "Bitcoin/Stacks vault account" subhead, no trailing. These header rows are non-interactive — no hover, no click (KTD-4).
- Leave the rest of each card (the threshold/status/signers/address detail rows, buttons) **unchanged** — only the header row migrates.

**Patterns to follow:** `VaultListItem` from U1 (no-trailing path); the existing header markup these units replace.

**Test scenarios:** `Test expectation: none -- design-only header-row migration; the no-trailing layout contract is covered by U1.`

**Verification:** The vault-details and account-details cards open with a header row whose avatar size (40px), title size (15px), gap (`space.04`), and padding match the list rows on the same pages; the detail rows below are visually unchanged. No console errors; typecheck/lint/knip clean.

---

### U6. Documentation + dead-code cleanup

**Goal:** Record the adopted convention and remove any now-unused inner-layout helpers, leaving the codebase honest about the new shared building block.

**Requirements:** R1 (documented), R5.

**Dependencies:** U2, U3, U4, U5.

**Files:**
- `apps/web/app/pages/multisig/README.md` (modify — `@leather.io/ui` gaps / reused-atoms section)
- Any now-dead local helpers exposed by the migrations (e.g., redundant inline row markup) — remove as found.

**Approach:**
- Add a README entry noting that multisig list rows are now built on `@leather.io/ui` `ItemLayout` via the local `VaultListItem` wrapper (the first `apps/web` consumer of `ItemLayout`), with the Portfolio-scale reconciliation (40px leading, `space.04` gap supplied by the wrapper, `gap="space.01"` inner, `label.02` title, no `Pressable`, no `ItemLayoutWithButtons` — and why: its `string`-typed caption). Note the point-in-time-parity caveat (KTD-7) and `VaultListItem` as an upstream-candidate if multisig graduates.
- Run `pnpm --filter @leather.io/extension lint:unused-exports` and `pnpm knip` to catch any helper left dangling by the migrations; delete confirmed-dead code. Do not modify unrelated comments (project rule).

**Test scenarios:** `Test expectation: none -- documentation and dead-code removal; correctness is enforced by knip/unused-exports and the full verification gate.`

**Verification:** README reflects the new convention; `pnpm knip` and `lint:unused-exports` report no new unused symbols; full verification gate (below) passes.

---

## System-Wide Impact

- **Affected surfaces (all `apps/web` multisig):** dashboard (vault list + recent activity), vault detail (accounts, members, status header, transactions), account detail (header, create-tx, transactions), transaction detail (signer rollcall), onboarding, the invite-accept and share-invite modals, and the shared `TxRow`. All are behind the `multisigEnabled` flag (hidden in production) and render dummy data, so blast radius is the design-only preview only.
- **No cross-package impact:** `@leather.io/ui`, `@leather.io/tokens`, mobile, and extension are untouched. This becomes the first `apps/web` consumer of `ItemLayout`, but consuming an already-exported component within its current type signatures creates no new coupling for those packages.
- **Reviewers should expect intentional visual deltas:** the "My vaults" cards and the two detail header rows lose ~2px of title size (17px→15px) and the detail headers gain 8px of avatar size (32px→40px); member/signer/modal avatars grow 24px→40px. The member "· handle" moves from inline-beside-the-title to the caption line (so it no longer wraps to a second line on narrow widths — it sits beside the address). These are the user-confirmed/derived consequences of matching the Portfolio scale.
- **Parity is point-in-time (KTD-7):** multisig rows are built on `ItemLayout` while Portfolio stays hand-built. The scale matches now but will not auto-track future Portfolio changes; re-reconciliation is a known follow-up cost.
- **Hover/interactivity unchanged per family (KTD-4):** selectable cards and feed rows keep their button hover; grouped-divider, header, and modal rows remain non-interactive (no new hover introduced).
- **Accessibility:** action buttons stay inside non-clickable row containers (members/signers/onboarding/modals) — do not wrap a clickable row around an action button (avoids nested interactive elements, per repo Playwright guidance).

---

## Risks & Mitigations

- **Risk: `ItemLayout`'s single `gap` prop couples the left title/caption spacing to the trailing-column spacing.** Mitigation: set `gap="space.01"` (4px) — matches both today's title↔caption `mt="space.01"` and Portfolio's 4px trailing-column gap, so no column regresses (KTD-2). `space.00` would have flattened the left column and was rejected.
- **Risk: `ItemLayoutWithButtons` cannot carry the `<AddressText>` caption (its `caption` is `string`).** Mitigation: do not use it — `VaultListItem` composes plain `ItemLayout`, whose `captionLeft` and `titleRight` accept `ReactNode` (KTD-1, KTD-6). U1's caption-node test is the regression guard.
- **Risk: vault-card "layout-only" migration silently changes content** (showing a USD value during invite/pending, or dropping "Awaiting members"). Mitigation: U2 enumerates the three trailing states 1:1 with today's conditions; the running-app walk verifies each state explicitly against dummy data.
- **Risk: trailing value weight differs from Portfolio.** `ItemLayout` `titleRight` defaults to `label.02` (medium) while Portfolio's `BalanceCell` value is `body.02` (regular). Mitigation: accept the default (it matches today's multisig amount weight) and reflect it in R3/KTD-5 so "match Portfolio" is not overclaimed for the trailing value. If exact parity is later wanted, pass a `body.02` node — low priority.
- **Risk: U1-only tests don't cover the per-call-site conditional prop-selection** (the vault-card state machine, the tx-row awaiting-signature branch, the member/signer status branches) — where a layout migration most plausibly drops or mis-wires a condition. Mitigation: U1 covers the slot contract; the per-call-site state-selection is covered by the running-app walk, and U2–U4 Verification enumerate the specific dummy-data states the walk must hit. Confirm `data/dummy-multisig-data.ts` actually exercises these states (active/pending/invited, awaiting-signature/highlight, joined/invited/declined, sign/signed/not-signed, connected/disconnected) before relying on the walk; add fixtures if a state is missing.
- **Risk: `Pressable` omission diverges from the extension's canonical interaction.** Mitigation: deliberate (KTD-4) — multisig's bordered/`overflow:hidden` containers are incompatible with `Pressable`'s −12px hover halo; element-level `_hover bg` is the existing, correct behavior here and is preserved.
- **Risk: avatar `indicator` badge looks off at the unified size.** Mitigation: the 20px indicator is fixed (does not scale) and is already used at 40px (`ChainAvatar` `lg`); proportionate — no change.

---

## Verification

Per-unit verification is described above (running-app visual checks for the design-only screens, with explicit conditional states enumerated; unit tests for `VaultListItem`). After the full set of changes, the repo gate must pass:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm knip
pnpm --filter @leather.io/extension lint:unused-exports
```

Faster inner-loop feedback while iterating:

```bash
pnpm --filter @leather.io/web typecheck
pnpm --filter @leather.io/web lint
pnpm --filter @leather.io/web test:unit   # runs vault-list-item.spec.tsx
```

Manual: run `pnpm --filter @leather.io/web dev`, open `/multisig`, and walk the dashboard, a vault, an account, a transaction, onboarding, the invite/share modals, and the create-vault preview — confirming every icon-left row shares the same leading size (40px), avatar gap (`space.04`), title size (15px), subheadline style, and first/last spacing, and exercising the conditional trailing states listed in each unit's Verification.

---

## Deferred / Open Implementation-Time Notes

- **Exact `VaultListItem` prop names** (e.g., `trailingTitle`/`trailingSubtitle` vs a single `trailing` discriminated prop; `titleAccessory` vs `badge`) — the slot *design* is settled in U1/KTD-6 (plain `ItemLayout`, `ReactNode` caption + `titleRight`); only the exact identifiers are an execution-time detail. Resolve while wiring the first two call sites, then hold stable for the rest.
- **Whether the wrapper sizes each avatar variant internally or accepts a pre-sized avatar** — KTD-3 fixes the 40px *box*; whether `VaultListItem` also forces the avatar's own `size` prop (fully type-enforcing the variant-only API) or trusts the caller to pass `size`-40 depends on how cleanly each avatar API takes an injected size. Decide in U1.
- **Settings rows** alignment (empty leading slot) — deferred follow-up.
- **Confirm dummy-data coverage** of every conditional state before relying on the manual walk (see Risks); add fixtures if any state (e.g., a declined member, a zero-balance pending vault) is absent.
