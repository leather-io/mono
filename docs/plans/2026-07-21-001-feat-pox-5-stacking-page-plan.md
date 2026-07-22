---
title: 'feat: Update apps/web stacking pages for PoX-5 (Bitcoin Staking)'
type: feat
status: draft
date: 2026-07-21
---

# feat: Update apps/web stacking pages for PoX-5 (Bitcoin Staking)

## Summary

PoX-5 ("Bitcoin Staking") is a consensus hard fork that **replaces pox-4 entirely** — different contract, different function set, different reward model. At activation, all STX locked in pox-4 unlocks and every stacker must re-enroll through pox-5. For our stacking pages this means: the pooled flow becomes a single `stake` call against a pool's signer-manager contract, positions are read from new contract state, rewards become sBTC that accrues and must be claimed, and new manage actions (unstake, extend/increase/switch pool) become possible.

Caveat: the SIP is a **v1 draft** (June 2026). Activation height is TBD, a "SIP V2" with wallet migration specifics is promised before the vote, and some parameters conflict between the SIP text and the reference implementation (`stacks-network/stacks-core` branch `pox-wf-integration`). Revalidate this plan when the SIP finalizes.

## Pages and how they change

### Stacking landing page

- Copy rewrite: the protocol renames "stacking" → "staking". Explainer/FAQ content describing reward slots, dynamic minimum thresholds, and BTC streamed to a reward address is stale. STX-only yield is now **variable** (the residual of a three-tranche waterfall after fixed-rate BTC bonds are paid) and denominated in **sBTC**.
- Provider table: every pool integrates via its own **signer-manager contract** in pox-5. We need new contract IDs from each pool partner (Fast Pool, PlanBetter, Xverse, Restake, Stacking DAO); pools that haven't migrated by activation must be hidden or disabled.
- Promo/education blocks referencing the current Dual Stacking program need review — that is a separate pox-4-era rewards program, not pox-5.

### Start pooled staking flow

- The two-transaction delegate flow (`delegate-stx` + `allow-contract-caller`) becomes a **single `stake` call** carrying the pool's signer-manager, amount, and number of cycles. The allowance step disappears, and pool membership persists across cycles automatically.
- Form changes: lock duration becomes a real user choice (1–96 cycles); the amount is locked directly (no "delegate more than balance" semantics); the BTC reward-address field becomes an **optional payout preference** (`{pox-addr, max-fee}`) honored only by pools whose signer-manager supports L1 payout — the default reward asset is sBTC on Stacks.
- Submission must be blocked or warned during the **prepare phase** (the last 100 blocks, ~17h, of every cycle) — all pox-5 staking mutations are rejected then. Locks take effect from the next cycle.
- Displayed minimum changes: a fixed 50,000 STX **per signer** (pool aggregate, not per staker) replaces the dynamic slot threshold.

### Active position page (pooled)

- Position and status are read from pox-5 staker state; the delegation-status model (parsing delegate/revoke transactions) no longer exists.
- New actions to expose:
  - **Claim rewards** — rewards accrue as sBTC per cycle and are claimed through the pool's signer-manager (callable by anyone). Needs a claimable balance aggregated across unclaimed cycles, a claim action, and ideally reward history.
  - **Unstake** — STX unlocks at the end of the current cycle (impossible in pox-4). All-or-nothing for the position.
  - **Update stake** — one action covers extending, increasing, and switching pools, with no cooldown cycle.
- Pending-activity detection must retarget from pox-4 function names to `stake` / `stake-update` / `unstake`; pox-5 also emits structured topic-tagged events, a cleaner parse target than function names.

### Liquid staking pages (stSTX / LiSTX)

- Entry flows call the protocols' own contracts, so they likely survive — but Stacking DAO and LISA must migrate their protocols to pox-5 themselves; confirm their plans and any contract changes.
- The increase flow breaks outright: it collects signer key/signature fields that have no pox-5 equivalent (staker-side signer signatures are removed from the protocol).

### Signer key generation tool (advanced)

- Staker-side signer signatures no longer exist, so the tool loses its purpose. Remove it, or repurpose it for signer operators' one-time grant flow (SIP-018 domain `pox-5-signer`).

### Migration / transition UX (new)

- Around activation: detect STX unlocked from pox-4 and prompt re-staking. Handle the transition cycle where pox-4 positions still display and pay out — stackers keep receiving rewards during the activation cycle, and pox-5 becomes the active contract the following cycle.

### Cross-cutting

- Library: `@stacks/stacking` (we're on 7.0.5) is pox-4-semantics throughout — client methods, signature helpers, and response types. Track stacks.js for a pox-5-aware release; if it lags activation, hand-roll the contract calls.
- Data displays: the pox-info shape changes (fixed minimum, no slot threshold); add claimable-rewards and distribution-cycle (weekly payout) clocks alongside the existing reward-cycle countdown.
- Test fixtures and E2E flows are pinned to pox-4 contract IDs and response shapes; rebuild them against pox-5.
- Test environment: the private-testnet docs page currently 404s; until it's published, test on a local devnet built from the `pox-wf-integration` branch.

## Out of scope (v1)

- **BTC protocol bonds**: allowlist-gated during PoX-5, and the native path needs P2WSH CLTV script construction, SPV proof submission, renewal txs, and an Early Exit co-sign flow — the L1 script format is explicitly not final. Deferred, not ignored: SIP §5.2 explicitly expects wallet integrators to support constructing the timelocked P2WSH UTXO and the renewal transaction, so plan this as a follow-up phase once the script format stabilizes; at most an educational/promo section for v1.
- Signer-operator tooling beyond the signer-key tool note above.

## Open questions / external dependencies

- Activation height, SIP finalization + vote outcome, and the promised SIP V2 wallet-migration guidance.
- stacks.js pox-5 support timeline.
- Signer-manager contract IDs from each pool partner, and which of them support the `{pox-addr, max-fee}` L1-BTC payout calldata.
- Stacking DAO / LISA pox-5 migration plans (affects both liquid flows and the Stacking DAO pool entry).
- SIP-text vs reference-code conflicts — immaterial to v1 scope but a signal that parameters are unstable: L1 unlock lead time (SIP says ~1,400 blocks, code implements 1,050), and L1↔L2 matching (SIP §3.1.1 describes the Stacks node indexing Bitcoin and matching UTXOs to registered commitments; the reference contract instead takes SPV proofs in `register-for-bond`).
- SIP §5 says authors are engaging wallet providers through the finalization phase, with wallet migration requirements due in SIP V2 — worth plugging into that outreach channel now to influence/confirm interface details.

## Sources

- Bitcoin Staking whitepaper: https://stx.is/bitcoin-staking-whitepaper
- SIP v1 draft: https://assets.stacks.co/DRAFT%20-%20Bitcoin%20Staking%20SIP.pdf (forum: https://forum.stacks.org/t/introducing-the-bitcoin-staking-sip-v1-draft/18862)
- Reference implementation: `stacks-network/stacks-core` branch `pox-wf-integration` (`pox-5.clar`, `signer-manager.clar`)
- Private testnet docs (currently 404): https://docs.stacks.co/learn/bitcoin-staking-private-testnet
