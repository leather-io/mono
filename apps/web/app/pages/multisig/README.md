# Leather Multisig (web) — design-only UI

This directory is a **UI-only** port of the Leather Multisig design prototype into the
web app. It is a real, sidebar-navigable feature surface — but it has **no API, no
wallet connection, and no persistence**. Screens render hand-authored dummy data and a
scoped in-memory session store; flows mutate that store so the preview is walkable.

It exists so developers can review and iterate on the multisig design inside the real
app shell, on a branch preview, before any of it is wired to real data.

## Implemented surface

- **Dashboard** (`/multisig`) — vault grid (invited vaults float to top), recent activity, zero
  state, loading skeleton, and a dev-only "Populated / Empty" session reset.
- **Vault detail** (`/multisig/vault/:vaultId`) — hero, accounts, members (with share-invite),
  vault status/threshold card, cancel-vault, transactions.
- **Account detail** (`.../account/:accountId`) — hero, create-transaction, tx list, account
  details, add-to-wallet.
- **Transaction detail** (`.../tx/:txId`) — hero, status alerts, details table, signer rollcall
  with sign (verify simulation) / broadcast / cancel.
- **Onboarding** (`/multisig/onboarding`) — simulated chain connect (see fidelity note below).
- **Settings** (`/multisig/settings`) — notifications/display + per-chain settings.
- **Create vault** (`/multisig/create-vault`) — single sectioned form (name / chain / theme /
  members) with a live preview rail; **not** a stepper.
- **Modals** — Create account, Send, Share invites, Invite accept (all `@leather.io/ui` `Sheet`
  dialogs); each mutates the session store and shows a success toast.

All flows mutate the in-memory session store, so the preview is fully walkable. Tests cover the
reducer (`store/multisig-session.spec.ts`) and the route table (`multisig.routes.spec.ts`);
screens are design-only and untested until production extraction.

## How to view it

- It is gated behind `multisigEnabled` (`multisig.constants.ts`) — visible on local dev,
  branch previews, and staging; **hidden in production** (`production: false`). The route
  `loader` 404s when the flag is off.
- Run `pnpm --filter @leather.io/web dev`, then open `/multisig` (a **Multisig** entry
  also appears in the sidebar).

## The data seam (extraction point)

- `data/dummy-multisig-data.ts` — hand-authored seed fixtures (ported from the prototype's
  `data.jsx`). SSR-stable: fixed timestamps, no `Date.now()`/random.
- `store/multisig-session.tsx` — a scoped React Context + `useReducer` (NOT jotai — there
  is no scoped-jotai precedent in apps/web, and context+reducer is SSR-stable). Seeded from
  the dummy data; resets on reload.
- `store/use-multisig.ts` — selector hooks + dispatch-mutator hooks.

At production extraction, the selector hooks are the swap point: replace them with real
React Query hooks against the multisig service. The reducer is the only place with real
logic and carries the only behavior tests.

## Token reconciliation (U2 audit)

The prototype's `ds/colors_and_type.css` header says it was derived from
`leather-io/mono · packages/tokens`, but from an **older snapshot** — the semantic names
match the current tokens, while several **values drifted**:

| Token                            | Prototype value        | Current `@leather.io/tokens` |
| -------------------------------- | ---------------------- | ---------------------------- |
| `ink.background-secondary`       | `#F5F1ED` (warm cream) | `#F9F9F8`                    |
| `ink.border-default`             | `#EAE5E0`              | `#E5E3E1`                    |
| `ink.text-subdued`               | `#948677`              | `#7B7572`                    |
| `ink.component-background-hover` | `#B1977B1A`            | `#BEB0A71A`                  |
| `red.background-secondary`       | `#FFABB1`              | `#FF7A70`                    |
| `blue.background-secondary`      | `#9BCAFF`              | `#8FA7FF`                    |
| `ink.background-overlay`         | `#12100F66`            | `#12100F66` (match)          |

**Decision:** use the **current** `@leather.io/tokens` Panda tokens for every name-matched
color. Because this feature lives **inside the live web app** (whose chrome already uses the
current tokens) and the prototype's own intent was to track `packages/tokens`, matching the
current design system is more correct than freezing a stale snapshot. (This is a considered
deviation from the plan's KTD-6 default of freezing prototype values; the default existed to
prevent _silent_ recoloring — here the recolor toward current tokens is the desired outcome
and is documented, not silent.)

### Genuine TOKEN-GAPs (no token equivalent → local constants in `multisig-tokens.ts`)

- ~~`bitcoin` brand orange raw hex~~ **(resolved)** — BTC/STX brand marks now render via
  `@leather.io/ui`'s canonical brand-art avatar icons (`BtcAvatarIcon`/`StxAvatarIcon`, through the
  local `ChainAvatar` seam), matching Portfolio. The former raw-hex bitcoin literal is gone and the
  gap is sidestepped without adding a `bitcoin` color token. (Note: the brand art renders STX as its
  coral mark, not the purple `stacks` token.)
- The four **vault theme** textures (`themes/{blue,bronze,green,orange}.jpg`) — decorative
  hero backgrounds, not design tokens.
- `avatarSquircleRadius` (`14px`) — no token radius matches the squircle avatar tile.

## Fonts

Diatype / Marche / Fira Code are already loaded by the web app (`public/fonts/`) and exposed
via `textStyle` tokens — no `@font-face` was added. Use `textStyle` tokens
(`heading.0x`, `label.0x`, `body.0x`, `caption.01`).

## Assets

Copied from the prototype's `ds/` into `apps/web/public/multisig/`:

- `icons/account/*.svg` — 21 account glyphs + `vault.svg`, rendered via CSS `mask-image`
  so they recolor to the theme/chain color.
- `illustrations/*.png` — empty-state art (`no-funds`, `no-activity`, `generic-error`, …).
- `themes/*.jpg` — vault hero background textures. Downscaled to 1600px + JPEG-compressed
  from the prototype's 2400×1280 PNGs (~5 MB each → ~390 KB) to keep them out of git history at
  full size; the full-res originals live in the prototype if ever needed.

System glyphs (bitcoin, stacks, key, lock, copy, chevrons, …) use `@leather.io/ui` icon
components rather than copied SVGs.

## `@leather.io/ui` gaps

Net-new multisig primitives built locally because no atom fit (logged as they are built):

- **`AvatarSq`** — net-new. `@leather.io/ui` `Avatar` supports `variant="square"` and a round `indicator` slot, but it cannot carry a _texture-image background_ paired with a _mask-image account glyph that recolors to the theme_ — the combination this tile needs. Candidate for an upstream `Avatar` extension if multisig graduates.
- **`ChainPill`** — net-new pill (chain mark + label); no atom equivalent. Renders its chain mark via the `ChainAvatar` seam.
- **`ChainAvatar`** — thin seam mapping a vault/account `chain` to the canonical `@leather.io/ui` `AssetAvatarIcon` (`nativeBtc`/`nativeStx`), so every BTC/STX brand mark + the chain/status punch-out badges use the shared brand art. Replaced the former local `ChainGlyph` + raw-hex bitcoin color.
- **`MultisigErrorState`** — net-new shared not-found/empty surface.
- **`MultisigToast`** — net-new; apps/web has **no** shared toast/notification mechanism (confirmed by grep in U4), so a minimal local one is provided. Strong candidate to standardize upstream.

Reused atoms (no new component, or thin wrapper only):

- **`ListItemBox`** (`@leather.io/ui`) — the shared "leading avatar → title → caption → trailing" row, wrapping the canonical `ItemLayout`. Every multisig list row (the transaction feed, vault/account cards, members, signers, the create-vault chain + member rows, and the vault/account detail header rows) is built from it, so avatar size, gap, and typography stay consistent. `variant='boxed'` owns its chrome (padding, radius, hover, attention wash, click target) for standalone rows like the feed; `variant='plain'` is just the content row, for rows inside a card that already supplies its own per-row padding, dividers and any highlight wash. `density` (`'default'`|`'compact'`) scales the leading gap to the avatar size (40px→16px, 32/24px→12px) and, for boxed rows, the vertical padding; `titleAccessory` carries an inline badge/suffix beside the title. Member/signer/account addresses render via the shared truncated `CopyAddress` in the `caption` slot. `ItemLayout`'s `titleLeft`/`captionLeft`/`titleRight`/`captionRight` all accept a `ReactNode`, so one primitive covers balance, badge/pill, button, and status-text trailing; `ItemLayoutWithButtons` is **not** used (its `caption` is typed `string` and cannot carry the `CopyAddress` `ReactNode`). The former local `VaultListItem` wrapper was folded into `ListItemBox` and removed.
- **`StatusPill`** / **`MemberStatusPill`** — wrap `@leather.io/ui` `Badge` (variant mapping only).
- **`AvatarCircle`** — thin `Avatar` wrapper deriving an initial (extracted only because it recurs in 3+ places).
- Address display + circle avatars otherwise use `AddressDisplayer` / `Avatar` inline.

## Out of scope

No real data wiring, no `@leather.io/services` calls, no i18n, no mobile (React Native), no
extension popup. See `docs/plans/2026-06-02-001-feat-multisig-ui-web-app-plan.md`.
