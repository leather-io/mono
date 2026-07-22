---
title: 'feat: PoX-5 in-depth changes — pooled staking page (/stacking/pool/:slug)'
type: feat
status: draft
date: 2026-07-21
---

# feat: PoX-5 in-depth changes — pooled staking page (/stacking/pool/:slug)

Companion to the overview plan (2026-07-21-001). This doc goes element by element through the start-pooling page (e.g. `app.leather.io/stacking/pool/fast-pool`): what gets removed, what changes, what stays.

## Summary

The page keeps its overall shape — pool overview, form, confirmation-steps panel — but the flow collapses from three confirmations (terms + `allow-contract-caller` tx + `delegate-stx` tx) to two (terms + one `stake` tx). The per-pool transaction differences disappear: today each pool has its own contract and argument shape; under pox-5 every pool is joined with the identical `stake` call, differing only in which signer-manager contract is passed. Duration becomes a real input, the reward-address input becomes an optional payout preference, and amount changes meaning from "delegate up to" to "lock exactly".

## Baseline: the page today

Using fast-pool as the reference; per-pool differences noted where they exist.

- **Pool overview** (top): APR, TVL, minimum commitment, fee, rewards token, next-cycle countdown.
- **Amount** — STX amount input. Validates pool minimum (Fast Pool: 40 STX), max stacking amount, and "must delegate more than current amount" when a delegation already exists.
- **Address to receive rewards** — BTC address input, prefilled with the connected wallet's address. Only shown for pools whose contract takes a reward address (Xverse, PlanBetter, Stacking DAO); editable only where the pool allows it (Xverse). **Not shown on fast-pool.**
- **Duration** — not an input. A static "Indefinite" explainer: the pool commits STX for up to 12 cycles at a time, revocable anytime with delayed effect.
- **Details** — read-only: pool STX address + the pool's pox-4 wrapper contract ID.
- **Pooling conditions** — static informational list.
- **Confirmation steps** (right panel / drawer):
  1. *Terms* — "I have read and accepted the pool's terms and conditions" (local toggle).
  2. *Allow* — "Allow the pool contract to interact with your wallet" → `allow-contract-caller` transaction (skipped if already granted; checked via a read-only call per pool contract).
  3. *Confirm and start pooling* — `delegate-stx` transaction. Arg shape differs per pool: Fast Pool/Restake pass just the amount; Fast Pool v2 adds a token buffer; Xverse/PlanBetter/Stacking DAO pass amount, pool address, optional until-height, and the reward address. Preview reads "You'll pool up to X".

## Element by element

### Removed

| Element | Why |
| --- | --- |
| **"Allow the pool contract..." confirmation step** (and its transaction) | `allow-contract-caller` doesn't exist in pox-5. Joining a pool is one transaction. The allowance pre-check read also goes away. |
| **Pool STX address** (as a transaction argument and "Details" row) | There is no delegate-to principal anymore. The pool's identity is its signer-manager contract. For the custom-pool flow, the "pool address" input becomes a "pool's signer-manager contract" input (contract principal, not a plain address). |
| **"Indefinite" duration** | pox-5 has no open-ended commitment; a lock is always an explicit number of cycles (1–96). The indefinite/limited split disappears. |
| **"Must delegate more than current amount" validation** | Re-delegating a higher amount is not how positions grow in pox-5. If the user already has a stake, this page shouldn't render the form at all — route to the active/manage page, where increase happens via `stake-update`. |

### Changed

| Element | Today | Under pox-5 |
| --- | --- | --- |
| **Amount** | "You'll pool **up to** X" — a delegation allowance; only what the pool later locks is locked, and the amount may exceed what's usable | Locks **exactly X** at the next cycle. Must be ≤ available unlocked balance. Pool minimum still applies (pool-set). Preview copy becomes "You'll lock X" with the unlock date derived from the chosen duration. |
| **Duration** | Static explainer, no input | Required **cycle-count input (1–96)** with a duration/unlock-date preview (~2 weeks per cycle). Needs a sensible default and probably presets (e.g. 1 / 3 / 6 / 12 cycles). Copy about "revoke anytime" changes to: unstake anytime → STX unlocks at the end of the current cycle. |
| **Address to receive rewards** | Required BTC address for some pools; hidden for fast-pool; rewards streamed by the pool each cycle | Optional **payout preference** for any pool whose signer-manager supports it: BTC address **plus a max withdrawal fee** (the L1 payout is an sBTC→BTC withdrawal). Default when empty: rewards accrue as **sBTC on Stacks** and are claimed. Shown per pool capability, not per contract quirk. Helper copy changes accordingly. |
| **Final confirmation step** | "Confirm and start pooling" → `delegate-stx` on the pool's own contract, per-pool arg shapes | "Confirm and start staking" → `stake` on the pox-5 contract, **identical for every pool**: signer-manager principal, amount, cycles, start height (computed, not an input), and the encoded payout preference. |
| **Details section** | Pool address + pox-4 wrapper contract | pox-5 contract + the pool's signer-manager contract. |
| **Pool overview stats** | Fixed est. APR, rewards token "BTC" | Yield is variable (residual after fixed-rate BTC bonds); reward asset is sBTC (BTC via optional withdrawal). Consider showing the weekly distribution cadence alongside the cycle countdown. |

### Stays

- **Amount input** as the primary field (with the semantic changes above).
- **Terms confirmation step** — unchanged mechanically.
- **Pooling conditions section** — stays, but every condition's copy needs review (locked-until semantics, reward asset, claiming).
- **Page structure** — overview → form → confirmation panel/drawer, connect-wallet gating, post-submit navigation to the active view.
- **Pool minimum + fee display** — still pool-defined (the reference signer-manager supports operator fees taken from rewards).

### New

- **Prepare-phase blackout**: `stake` is rejected during the last 100 blocks (~17h) of every cycle. The submit action needs to disable with a "staking opens again in ~N hours" state instead of letting the transaction fail.
- **Already-staked guard**: pox-5 rejects a second `stake` from the same account. Detect an existing position up front and route to manage/active instead of showing the form.
- **Pool health caveat**: a pool whose total stake is below 50,000 STX earns nothing for that cycle (per-signer threshold). Worth a warning state on small/new pools.

## Transaction summary

| | Today | PoX-5 |
| --- | --- | --- |
| Transactions to join | 2 (`allow-contract-caller`, then `delegate-stx`) | 1 (`stake`) |
| Target contract | Pool's own wrapper contract (differs per pool) | pox-5 contract (same for all pools) |
| Arguments | Per-pool shapes (1–6 args) | Uniform: signer-manager, amount, cycles, start height, optional payout calldata |
| Duration | Encoded as optional until-height (or absent = indefinite) | Required cycle count, 1–96 |
| Reward address | Positional arg for some pools | Optional `{pox-addr, max-fee}` encoded into signer-calldata |
| Re-join / increase | New `delegate-stx` with higher amount | Rejected — use `stake-update` from the manage view |

## Per-pool notes

- All six listed pools need a pox-5 signer-manager contract ID from the operator before they can appear on the page; the per-pool arg-shape switch in the submit path collapses to a single code path.
- Pools that pay out in their own style today (Fast Pool's STX payouts, Xverse/PlanBetter's BTC streaming) will define payout behavior in their signer-managers — each pool's reward description and the payout-preference input visibility depend on what their contract supports. This is per-partner information we need to collect.
- The custom pool path survives conceptually but its input changes from "pool STX address" to "signer-manager contract", and validation should verify the contract is a registered pox-5 signer.

## Open questions

- Fast Pool (and each other operator): will they adopt the reference signer-manager, and will they support the L1 BTC payout calldata? This decides whether the payout-preference input appears for them.
- Default duration: pox-5 forces a choice where fast-pool users previously had none. Product call on default cycles and whether to encourage long locks (up to 96) or keep 12 as the familiar ceiling.
- Whether to auto-prompt re-staking near lock expiry (pox-5 has no auto-renewal for the staker's own lock; the pool's commitment persists, but the user's lock still ends after their chosen cycles).
