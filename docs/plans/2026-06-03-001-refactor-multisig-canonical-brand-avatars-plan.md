---
date: 2026-06-03
status: active
type: refactor
title: Multisig — canonical BTC/STX brand avatars + punch-out indicators
plan_depth: standard
related:
  - apps/web/app/pages/multisig/README.md
  - docs/plans/2026-05-26-001-feat-multisig-prototype-import-plan.md
---

# Multisig — canonical BTC/STX brand avatars + punch-out indicators

## Summary

The multisig web app renders BTC/STX brand marks with a bespoke `ChainGlyph` that colors the monochrome `BitcoinIcon`/`StacksIcon` — and because there is no `bitcoin` color token, it falls back to a **raw hex** (`#F7931A`, a documented gap). Indicator badges (the chain badge on vault/account avatars, the transaction-row icon) are hand-rolled. Portfolio already renders the same concepts with the canonical `@leather.io/ui` avatar system — `BtcAvatarIcon` / `StxAvatarIcon` / `AssetAvatarIcon` (brand color baked into the art) and the base `Avatar` `indicator` slot (the "punch-out" badge), composed into `ActivityAvatarIcon`.

This plan moves multisig's BTC/STX brand rendering and its indicator avatars onto those canonical components, eliminating the raw-hex bitcoin gap and bringing the prototype's punch-out treatment to vaults, vault accounts, and transaction icons. Scope is the **web** multisig app only.

Two scoping decisions are already settled (user-confirmed):
- **Bitcoin color** → adopt the canonical brand-art avatar icons (correct color baked in); do **not** add an upstream `bitcoin` color token.
- **Punch-out reach** → transaction icons **and** re-skinned vault/account avatar badges. The textured squircle tile (`AvatarSq`) itself stays — the shared `Avatar` cannot reproduce its theme-texture background + masked, recolorable account glyph.

---

## Problem Frame

`apps/web/app/pages/multisig/` was ported from a standalone prototype and built its own brand/indicator primitives before reconciling against the canonical design system:

- **Brand marks** go through `components/chain-glyph.tsx`, which renders `BitcoinIcon` with an inline `style={{ color: bitcoinColor }}` (raw hex from `multisig-tokens.ts`) and `StacksIcon` with `color="stacks"`. The README's token-reconciliation section explicitly logs `bitcoinColor` as a `TOKEN-GAP` and `ChainGlyph` as a net-new local primitive.
- **Indicator badges** are hand-rolled: `components/avatar-sq.tsx` draws a corner chain badge with a `bg="ink.background-primary"` ring; `components/tx-row.tsx` shows only a chain glyph inside a plain `Circle` — no directional/status punch-out at all.

Portfolio is the reference for "correct": `apps/web/app/pages/portfolio/portfolio-table/portfolio-table-cells.tsx` uses `BtcAvatarIcon` / `StxAvatarIcon` / `Sip10AvatarIcon`, and `apps/web/app/pages/portfolio/components/activity-list/activity-item.tsx` uses `ActivityAvatarIcon` (asset avatar + a punched-out status indicator, plus a swap dual-avatar). The canonical punch-out is the base `Avatar`'s `indicator` slot (`packages/ui/src/components/avatar/avatar.web.tsx`): a 20×20 round badge inset at bottom-right with a `bg="ink.background-primary"` ring + the avatar's `outlineColor`, so the badge reads as "punched out" of the tile.

**The thing that must be true at the end:** every BTC/STX brand mark in the multisig web app comes from the canonical avatar art (no raw hex), and the vault / vault-account / transaction indicators use the canonical punch-out badge — matching Portfolio and restoring the prototype's punch-out treatment.

### Requirements

- **R1** — Every BTC/STX brand mark in multisig renders via the canonical `@leather.io/ui` avatar art (correct brand color baked in); the `bitcoinColor` raw-hex and the monochrome-icon coloring path are removed.
- **R2** — Vault, vault-account, and transaction indicators use the canonical punch-out badge treatment (the `Avatar` `indicator` pattern), consistent with Portfolio and the prototype.
- **R3** — The change is scoped to `apps/web` multisig; no changes to `@leather.io/ui`, `@leather.io/tokens`, mobile, or extension, and no real-data wiring.

---

## Scope Boundaries

### In scope

- Replacing multisig's BTC/STX brand-mark rendering (`ChainGlyph`, `ChainPill`, and their consumers) with the canonical avatar art.
- Re-skinning the `AvatarSq` chain badge to the canonical punch-out treatment, keeping the squircle texture tile.
- Adding a punched-out status/direction indicator to the transaction row, reusing the exported activity status icons.
- Auditing where chain-badge indicators appear (vault / account avatars) so placement matches the prototype.
- Removing the now-dead bespoke brand code and updating the multisig README's token-reconciliation/gaps notes.

### Deferred to Follow-Up Work

- **Directional / swap / contract-call tx indicators** (`ReceivedIcon` / `SwapIcon` / `FunctionActivityIcon`). The dummy data is send-only (`kind` is `'send'` everywhere and unread), so these branches have no input today. Exercising them requires net-new fixtures and a typed `kind` discriminator — out of scope here, natural at real-data extraction.
- Capturing the "missing bitcoin brand color token" gap and the punch-out adoption as `docs/solutions/` learnings (suggested via `/ce-compound` after this lands).
- Any mobile/extension multisig parity for these components.

### Outside this product's identity / Non-goals

- Adding a `bitcoin` color token to `@leather.io/tokens` (explicitly rejected in favor of brand-art avatars).
- Replacing `AvatarSq` wholesale with the shared `Avatar` (loses the theme-texture + masked-glyph combination — see README `@leather.io/ui` gaps).
- Changing Portfolio, or any non-multisig surface.
- Real data wiring or changes to the multisig session store / dummy data shapes. (The U5 status indicator maps on the existing `TxStatus` and needs **no** dummy-data change; directional indicators that *would* need new fixtures are deferred — see above.)

---

## Key Technical Decisions

1. **Single brand seam: a `chainToAvatarAsset(chain)` mapper + thin avatar usage.** Map `Chain` → `AssetForAvatar` (`'btc' → { protocol: 'nativeBtc' }`, `'stx' → { protocol: 'nativeStx' }`) and render via `AssetAvatarIcon` (or `BtcAvatarIcon`/`StxAvatarIcon`). This routes every multisig brand mark through one place that mirrors `portfolio-table-cells.tsx`, and deletes the raw-hex path. (R1)

2. **Reuse the canonical punch-out as a visual reference, not a fixed-geometry copy.** The badge treatment is the base `Avatar` `indicator` slot, but that slot is hardcoded to a **20×20px** chip tuned for the 48px `xl` avatar (`avatar.web.tsx:57-73`) and does **not** scale with avatar size. Mirror its *look* (round, `bg` = surrounding surface, `overflow:hidden`, bottom-right inset) but set badge dimensions explicitly per consumer size so it stays proportionate on small tiles. For tx rows, compose `AssetAvatarIcon asset={…} indicator={<StatusIcon/>}` using the **exported** activity status icons (`SentIcon`, `PendingIcon`, `FailedIcon` — confirmed public via `packages/ui/src/icons/index.web.ts`). This avoids constructing a full `ActivityView`; `ActivityAvatarIcon` (which needs `ActivityView`) is only necessary if multisig later shows swap dual-avatars, which it does not today.

3. **Two indicator content models, one shared punch-out mechanism.** The corner punch-out's ring/cutout *look* is consistent across all three indicators; the *content* differs by subject (user-confirmed):
   - **Vault & vault-account icons** → the themed squircle glyph tile stays the main icon and the punch-out carries the **chain** (BTC/STX) — the prototype's `chain-dot` (an ~18px round corner badge at `right/bottom: -2px`, a ring separating it from the tile, a small chain mark inside). Vault/account *state* (pending / invited / cancelled) stays as the existing pills, **not** the punch-out.
   - **Transaction icons** → the canonical Portfolio model: the BTC/STX brand asset avatar is the main tile and the punch-out carries **status** (sent / pending / failed).
   Shared mechanism = the badge chrome (round, ring matching the surrounding surface, `overflow:hidden`, bottom-right inset): for tx it is the `Avatar` `indicator` slot; for `AvatarSq` it is hand-rolled to match (KTD-2). Keep them visually identical though the implementations differ. (R2)

4. **Keep `AvatarSq`; re-skin only its badge.** The squircle keeps its theme-texture background + masked account glyph (the shared `Avatar` can't reproduce these). Only the corner chain badge is realigned to the canonical punch-out look (round, ring matching the surrounding surface, inset offsets, brand chain mark inside).

5. **Status-only tx indicators (the data is send-only today).** `MultisigTransaction.kind` is typed `string`, every dummy transaction is `kind: 'send'`, and `kind` is never read in the UI. So the tx indicator maps on `TxStatus` alone and treats all transactions as sends; `ReceivedIcon` / `SwapIcon` / `FunctionActivityIcon` are **out of scope** here (unreachable dead branches; require net-new fixtures) — see Deferred to Follow-Up Work.

6. **Adopt the established brand-avatar treatment (which shifts STX from purple to coral).** The canonical art fills are baked-in: `bitcoin.svg` = `#F59300`, `stacks.svg` = `#FC6432` (a coral tile + white glyph). The justification is **not** "Portfolio is correct" (circular) — it is that the coral `StxAvatarIcon`/`AssetAvatarIcon` art is the *established brand-avatar treatment across the live app* (~22 surfaces), whereas the purple `stacks` token (`#5546FF`) is used only for non-avatar glyph tinting (post-conditions, fee labels — ~3 surfaces). Multisig adopts the avatar treatment for consistency with the rest of the app. This is a visible purple→coral shift for STX marks; it remains flagged in Open Questions for explicit brand confirmation before merge, with a per-surface revert escape hatch.

7. **Drop redundant wrapping circles.** Several consumers wrap the old bare glyph in a themed `Circle` (`chain-picker`, `onboarding-connect-row`, `tx-row`). The canonical avatar is already a rounded tile, so those wrapping circles are removed to avoid tile-in-circle nesting.

---

## High-Level Technical Design

This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.

```
Chain ('btc' | 'stx')
        │  chainToAvatarAsset()
        ▼
AssetForAvatar ({ protocol: 'nativeBtc' | 'nativeStx' })
        │
        ├── inline brand mark   → brand mark, icon-only      (ChainPill, pickers, onboarding)        [U2]
        │
        ├── VAULT / ACCOUNT icon → AvatarSq (theme tile + glyph)  ── main icon                        [U3/U4]
        │                          └─ punch-out badge = CHAIN (BTC/STX)   ← prototype chain-dot
        │
        └── TRANSACTION icon     → AssetAvatarIcon (BTC/STX brand)  ── main tile                       [U5]
                                   └─ punch-out badge = STATUS
                                        TxStatus → Pending (pending/queued/signed/broadcast)
                                                 | Sent (confirmed)
                                                 | Failed (failed/dropped/cancelled)
```

Shared punch-out mechanism (KTD-3): a round chip inset at the bottom-right corner, separated from the tile by a ring matching the surrounding surface, `overflow:hidden`, holding a small mark — the ring "punches" it out. Content differs: vault/account → chain; transaction → status.

---

## Implementation Units

### U1. Chain → canonical avatar seam

**Goal:** One pure mapper + thin component so every multisig BTC/STX brand mark resolves to the canonical avatar art.
**Requirements:** R1
**Dependencies:** none
**Files:**
- Create `apps/web/app/pages/multisig/components/chain-avatar.tsx` (exports `chainToAvatarAsset(chain): AssetForAvatar` and a `ChainAvatar` component wrapping `AssetAvatarIcon`).
- Create `apps/web/app/pages/multisig/components/chain-avatar.spec.ts`.
**Approach:** `chainToAvatarAsset('btc') → { protocol: 'nativeBtc' }`, `('stx') → { protocol: 'nativeStx' }`. `ChainAvatar({ chain, size })` renders `<AssetAvatarIcon asset={chainToAvatarAsset(chain)} size={size} />`. Default to a small size appropriate for inline marks; let callers override. Mirror `portfolio-table-cells.tsx`'s `AssetIcon`.
**Patterns to follow:** `apps/web/app/pages/portfolio/portfolio-table/portfolio-table-cells.tsx` (`AssetIcon`), `packages/ui/src/components/avatar/asset-avatar-icon.web.tsx`.
**Test scenarios:**
- Happy path: `chainToAvatarAsset('btc')` returns `{ protocol: 'nativeBtc' }`; `chainToAvatarAsset('stx')` returns `{ protocol: 'nativeStx' }`.
- Exhaustiveness: both members of `Chain` are handled (the mapping is total — a new chain would surface as a type error, not a silent fallthrough).
**Verification:** The component renders the brand BTC/STX avatar at the requested size; the mapper test passes.

---

### U2. Replace ChainGlyph / ChainPill brand marks; remove the bitcoin hex

**Goal:** Inline brand marks (pills, pickers, onboarding, preview) render the canonical avatar; the raw-hex `bitcoinColor` and monochrome-coloring path are gone.
**Requirements:** R1
**Dependencies:** U1
**Files:**
- `apps/web/app/pages/multisig/components/chain-pill.tsx`
- `apps/web/app/pages/multisig/components/chain-glyph.tsx` (repurpose to delegate to `ChainAvatar`, or delete if no longer needed — see U6)
- `apps/web/app/pages/multisig/create-vault/components/chain-picker.tsx`
- `apps/web/app/pages/multisig/create-vault/components/vault-preview-card.tsx`
- `apps/web/app/pages/multisig/onboarding/components/onboarding-connect-row.tsx`
- `apps/web/app/pages/multisig/multisig-tokens.ts` (remove `bitcoinColor`, `chainColor`)
**Approach:** Swap each `ChainGlyph`/colored-icon usage for `ChainAvatar` at an appropriate small `size`. Two caveats surfaced in review:
- **ChainPill is tight.** The canonical avatar carries a `bg="ink.background-secondary"` tile + a solid `outline` ring, which the current bare `ChainGlyph` does not. At `xs` (16px) inside a `py="2px"` pill this breaks proportions. Render the pill's brand mark **icon-only** (transparent background/outline, or the bare brand SVG) rather than the full tile — decide this explicitly, don't leave it to ad-hoc style suppression.
- **Before deleting `bitcoinColor`, audit for a monochrome need.** All current BTC consumers render a brand-colored mark that the avatar art replaces cleanly, so deletion is safe today. Add a verification step confirming no surface needs a *monochrome / `currentColor`* bitcoin mark (which would have no color source after deletion) before removing the constant — re-deriving the gap later costs rediscovery.
- Where a bare glyph sat inside a themed `Circle` (chain-picker, onboarding-connect-row), removing the `Circle` is correct, but note the replacement is a *branded* tile, not a neutral grey circle — a deliberate visual delta to review in U-Verify, not just "remove nesting."
Keep all text labels ("Bitcoin"/"Stacks"). Delete `bitcoinColor`/`chainColor` from `multisig-tokens.ts` (`chainColor` is already dead; `bitcoinColor`'s only consumer is `ChainGlyph`).
**Patterns to follow:** U1 component; existing pill/picker layout.
**Test scenarios:** `Test expectation: none — pure presentational swap. Typecheck confirms no dangling token references after deletion; the visual gate (U-Verify) is the correctness check for size/tile/layout (typecheck cannot catch an oversized default-size avatar).`
**Verification:** No references to `bitcoinColor`/`chainColor` remain; no remaining BTC surface needs a monochrome bitcoin mark; BTC and STX marks render as appropriately-sized brand marks in the pill, chain picker, onboarding rows, and vault preview; no raw hex in the multisig brand path.

---

### U3. Vault & account icon punch-out — chain indicator on `AvatarSq`

**Goal:** The vault and vault-account icons (`AvatarSq`) carry a first-class chain punch-out indicator: a corner badge matching the canonical `Avatar` `indicator` look (round ring against the surrounding surface, inset offsets, brand chain mark inside) — the canonical realization of the prototype's `chain-dot`. The squircle texture tile + masked account glyph stay; vault/account *state* remains on the existing pills (KTD-3). This is the same punch-out *mechanism* used by the tx indicator (U5), with chain (not status) as the content.
**Requirements:** R2
**Dependencies:** U1
**Files:** `apps/web/app/pages/multisig/components/avatar-sq.tsx`
**Approach:** Replace the hand-rolled badge (currently `bottom/right -3px`, `bg ink.background-primary`, `p 2px`, holding `ChainGlyph`) with one that takes the canonical indicator's *look* as a visual reference — **not** a 1:1 geometry copy. The canonical slot is a fixed 20px chip tuned for the 48px avatar and does not scale; specify badge dimensions per `AvatarSq` size (e.g. ~16px for `sm`/32px tile, ~18px for `md`/40px, ~20px for `lg`/56px) with the inner brand mark sized to fill. Two decisions to make here, not defer:
- **Ring color.** `AvatarSq` tiles are an opaque theme texture (all four `vaultThemes` are `dark: true`), so the badge ring must match the *surrounding UI surface* it sits on (card/list-row background = `ink.background-primary` in light mode), not the tile. Confirm the ring reads as "punched out" against a textured tile in U-Verify.
- **Badge size per variant** as above.
Keep the `withChainBadge` prop and the squircle texture tile + masked glyph unchanged.
**Patterns to follow:** `packages/ui/src/components/avatar/avatar.web.tsx` (indicator slot — visual reference only, do not copy the fixed 20px geometry).
**Test scenarios:** `Test expectation: none — presentational; verified visually (U-Verify), explicitly at AvatarSq size="sm".`
**Verification:** The vault/account squircle shows a crisp, proportionate punched-out brand chain badge at every size variant (checked at `sm`); the ring reads cleanly against the textured tile; the texture background and masked account glyph are unchanged.

---

### U4. Chain-badge placement across vault & account surfaces

**Goal:** Vault and vault-account indicators show the punch-out chain badge where the prototype did, consistently.
**Requirements:** R2
**Dependencies:** U3
**Files (audit + adjust `withChainBadge`):**
- `apps/web/app/pages/multisig/dashboard/components/vault-card.tsx` (already badged — confirm)
- `apps/web/app/pages/multisig/vault/components/accounts-list.tsx`
- `apps/web/app/pages/multisig/account/components/account-details-card.tsx`
- `apps/web/app/pages/multisig/vault/components/vault-status-card.tsx`
- `apps/web/app/pages/multisig/vault/vault.page.tsx` and `apps/web/app/pages/multisig/account/account.page.tsx` (header avatars)
**Approach:** "Match the prototype" is **not executable as a verification criterion** — the prototype lives at an external local path (`/Users/.../Leather Multisig App/`), not in the repo, so no reviewer or CI agent can check it. Instead, this plan states the per-surface badge decision explicitly (proposed default below; the designer confirms before implementation — see Open Questions):

| Surface | `withChainBadge` | Rationale |
| --- | --- | --- |
| `dashboard/components/vault-card.tsx` | **true** | List tile — chain at a glance (already badged today) |
| `vault/components/accounts-list.tsx` (account tiles) | **true** | List tile — chain at a glance |
| `account/components/account-details-card.tsx` (header tile) | **true** | Primary account identity |
| `vault/components/vault-status-card.tsx` (header tile) | **true** | Primary vault identity |
| `vault/vault.page.tsx` / `account/account.page.tsx` page-header avatars | **false** | Chain already stated by the page/hero context |
| `create-vault/.../vault-preview-card.tsx`, `modals/*` (create-account, invite-accept) | **false** | Chain is the active form/modal context |

Currently only `vault-card.tsx` is badged; this unit enables the badge on the three identity tiles above and leaves the rest unchanged.
**Patterns to follow:** the table above; current `vault-card.tsx` (the one place already badged).
**Test scenarios:** `Test expectation: none — presentational placement; verified visually (U-Verify) against the table.`
**Verification:** Chain badges appear exactly on the surfaces marked `true` above; no avatar shows a doubled or misaligned badge; badge-off surfaces are unchanged.

---

### U5. Transaction-row punch-out indicator

**Goal:** The transaction row shows a canonical brand asset avatar with a punched-out **status** indicator, replacing the plain chain-glyph-in-circle.
**Requirements:** R1, R2
**Dependencies:** U1
**Files:**
- `apps/web/app/pages/multisig/components/tx-row.tsx`
- Create `apps/web/app/pages/multisig/components/tx-status-indicator.tsx` (pure mapper `txStatusToIndicator(status): ReactElement` over the full `TxStatus` union + a small renderer).
- Create `apps/web/app/pages/multisig/components/tx-status-indicator.spec.ts`
- (No change to `data/multisig-types.ts` — see Approach.)
**Approach:** Render `<AssetAvatarIcon asset={chainToAvatarAsset(vault.chain)} size={...} indicator={<StatusIcon/>} />`, removing the wrapping `Circle`, keeping the title/amount/StatusPill layout to the right. Size the avatar to `lg`/`xl` (Portfolio-like) so the fixed 20px badge stays proportionate (per KTD-2).

**Status-only, send-only mapping.** The mapping is driven entirely by `TxStatus` — it does **not** read `kind`. (`kind` is typed `string`, is `'send'` in every fixture, and is never read in the UI; a Sent-vs-Received distinction has no input today and would be dead code — see Deferred to Follow-Up Work.) All transactions are sends, so terminal/in-flight states use `SentIcon`/`PendingIcon`. Full, explicit table over all 8 members (no "invent a fallback"):

| `TxStatus` | Indicator | Note |
| --- | --- | --- |
| `pending` | `PendingIcon` | collecting signatures |
| `queued` | `PendingIcon` | in-flight |
| `signed` | `PendingIcon` | ready to broadcast — still in-flight |
| `broadcast` | `PendingIcon` | broadcasting |
| `confirmed` | `SentIcon` | completed send |
| `failed` | `FailedIcon` | |
| `dropped` | `FailedIcon` | |
| `cancelled` | `FailedIcon` | discarded (use `FailedIcon`; confirm with design) |

Use only the **exported** icons `PendingIcon` / `SentIcon` / `FailedIcon` (`@leather.io/ui`). The mapper is a total switch over `TxStatus` (exhaustiveness enforced by the type, not a runtime fallback).
**Patterns to follow:** `packages/ui/src/components/avatar/activity-avatar-icon.web.tsx` (`StatusIndicator` switch), `apps/web/app/pages/portfolio/components/activity-list/activity-item.tsx`.
**Test scenarios:**
- Happy path: `pending`/`queued`/`signed`/`broadcast` → pending indicator; `confirmed` → sent indicator; `failed`/`dropped`/`cancelled` → failed indicator.
- Exhaustiveness: the mapper is a total function over `TxStatus` — a new status member is a compile error, not a silent gap (assert each of the 8 current members returns a defined element).
**Verification:** Each transaction row shows the brand BTC/STX avatar (proportionately sized) with a punched-out status indicator matching the tx state; the mapper test passes; no row renders a bare/empty badge.

---

### U6. Remove dead bespoke code + update README; verify

**Goal:** Leave the brand/indicator path clean and the docs accurate.
**Requirements:** R1, R3
**Dependencies:** U2, U3, U5
**Files:**
- `apps/web/app/pages/multisig/components/chain-glyph.tsx` (delete if fully replaced)
- `apps/web/app/pages/multisig/multisig-tokens.ts` (confirm `bitcoinColor`/`chainColor` removed)
- `apps/web/app/pages/multisig/README.md` (update the token-reconciliation `TOKEN-GAP` bitcoin note and the `@leather.io/ui` gaps list entry for `ChainGlyph`)
**Approach:** Delete `ChainGlyph` if no consumers remain (knip will flag otherwise). Update the README so the bitcoin TOKEN-GAP note reflects that multisig now uses the canonical brand-art avatars (gap sidestepped, not via a new token), and adjust/remove the `ChainGlyph` gaps bullet.
**Patterns to follow:** prior multisig README edits.
**Test scenarios:** `Test expectation: none — deletion + docs.`
**Verification:** `pnpm knip` reports no new unused exports from this work (and ideally fewer); README accurately describes the canonical adoption.

---

### U-Verify. Verification gate (cross-cutting)

**Goal:** All checks green and the visuals confirmed.
**Dependencies:** U2, U3, U4, U5, U6
**Approach:** Run `pnpm format`, `pnpm --filter @leather.io/web typecheck`, `pnpm --filter @leather.io/web lint`, `pnpm knip` (compare against the known pre-existing baseline). Then screenshot the dashboard (vault cards), a vault detail (account tiles + tx rows), an account detail, the create-vault chain picker, and onboarding — confirm brand avatars and punch-out badges render correctly and STX shows Portfolio's brand art.
**Verification:** All commands pass (knip neutral-or-better vs baseline); screenshots show correct, consistent brand avatars and punch-out indicators.

---

## System-Wide Impact

- **Scope:** `apps/web/app/pages/multisig/` only. No edits to `@leather.io/ui`, `@leather.io/tokens`, mobile, or extension — only consumption of already-exported components/icons.
- **Visual change beyond the gap fix:** STX marks move from the purple `stacks` token to Portfolio's brand art (coral `#FC6432`). This is intentional (matching Portfolio) but is a visible brand shift — see Open Questions.
- **`knip`:** removing `bitcoinColor`/`chainColor`/`ChainGlyph` should reduce (not increase) findings; the multisig area already carries a known set of pre-existing knip findings unrelated to this work.
- **Data shapes:** `MultisigTransaction` may gain/clarify a direction discriminator if needed for sent-vs-received; this is additive to dummy data and aligns with eventual real-data extraction.

---

## Risks & Mitigations

- **STX brand-color shift surprises reviewers.** Mitigation: grounded in usage evidence (coral is the established avatar treatment, ~22 vs ~3 surfaces), flagged as an Open Question for explicit brand confirmation, per-surface revert available.
- **Oversized / mis-proportioned marks.** `AssetAvatarIcon` defaults to `size="xl"` (48px) and the canonical badge is a non-scaling fixed 20px. Mitigation: every usage passes an explicit `size`; tx-row avatar sized `lg`/`xl` so the 20px badge stays proportionate; `AvatarSq` badge dimensions specified per size variant (U3); visual gate at `sm` in U-Verify.
- **ChainPill tile/outline breaks the pill.** The canonical avatar adds a background tile + outline the bare glyph lacked. Mitigation: U2 renders the pill mark icon-only (no tile) as an explicit decision.
- **Redundant tile-in-circle nesting + brand-tile delta.** Mitigation: U2/U5 remove wrapping `Circle`s; the neutral-circle→brand-tile visual change is called out for deliberate review in U-Verify.
- **Badge placement noise.** Mitigation: resolved by the explicit per-surface table in U4 (not "match the prototype"); visual gate in U-Verify.
- **Tx indicator mapping gaps.** Mitigation: the mapper is a *total switch* over `TxStatus` (compile-time exhaustiveness), every one of the 8 members explicitly mapped in U5 — no runtime fallback, no empty badge.

---

## Open Questions (non-blocking)

- **STX brand color (worth an explicit nod before merge)** — adopting `StxAvatarIcon` shifts STX marks from the purple `stacks` token (`#5546FF`) to the coral brand art (`#FC6432`). This is grounded (coral is the established avatar treatment across ~22 surfaces vs. ~3 non-avatar purple-tint uses), but it is the one *visible brand change* in this work. Confirm the coral STX brand is intended (or that purple should be revisited app-wide as separate work). Per-surface revert is the escape hatch.
- **U4 badge-placement table** — confirm the proposed per-surface `withChainBadge` table in U4 (default enables badges on vault-card, account-list tiles, and the two identity header tiles; off elsewhere).
- **`cancelled` indicator** — defaulted to `FailedIcon`; confirm that reads correctly vs. a more neutral treatment.

---

## Implementation-Time Notes (deferred)

- Final `size` values for inline marks (ChainPill, pickers) and the per-variant `AvatarSq` badge dimensions (tune visually in U-Verify).
- Whether `ChainGlyph` is deleted outright or kept as a one-line delegator to `ChainAvatar` (decide once U2 consumers are migrated).
