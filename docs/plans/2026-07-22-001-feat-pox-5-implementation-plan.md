---
title: 'feat: PoX-5 implementation plan — parallel /staking tree in apps/web'
type: feat
status: draft
date: 2026-07-22
---

# feat: PoX-5 implementation plan — parallel /staking tree in apps/web

Execution companion to the analysis docs (2026-07-21-001 overview, 2026-07-21-002 pooled-page spec). Those describe *what* changes; this describes *where and how* in the codebase.

## Approach

- **Parallel tree, dark launch.** New URL tree `/staking`, `/staking/pool/:slug`, `/staking/pool/:slug/active`, `/staking/pool/:slug/update` under `apps/web/app/pages/bitcoin-staking/` + `apps/web/app/features/bitcoin-staking/`. The pox-4 `/stacking` tree stays live and untouched; both are visible on staging; the mainnet activation becomes a route flip. Directory name deliberately `bitcoin-staking` (not `staking`) to avoid the one-letter `stacking`/`staking` grep hazard; protocol modules keep a `pox5-` file prefix.
- **Gate** copies the multisig pattern: `bitcoinStakingEnabled = import.meta.env.CLOUDFLARE_ENV !== 'production'` (see rationale in `pages/multisig/multisig.constants.ts` — `whenEnvTarget` cannot distinguish preview from production), hard-404 layout, hidden nav. A second data-driven axis (`getPox5Status` reading `/v2/pox` `contract_versions` + per-network config override) means mainnet enablement later requires no code change.
- **pox-4 files change only additively**: `Pox5` boot-contract IDs in `stackingContractMap`, one step-id union member in `confirmation-steps.tsx`, a pox-5 entry in the MSW `/v2/pox` mock, route spread + nav item.
- **Hand-rolled contract calls.** `@stacks/stacking@7.0.5` is pox-4-only. Pure `getXOptions → StxCallContractParams` builders + `leather.stxCallContract` mutations for `stake` / `stake-update` / `unstake` / signer-manager `claim-staker-rewards`. `poxAddressToTuple` is still reused for the payout-preference tuple.
- **Queries app-level first** (`features/bitcoin-staking/queries/`), promoted to `packages/query` after SIP V2 stabilizes shapes.
- **Pool config** in new `app/data/bitcoin-staking-data.ts`: per-provider signer-manager contract per network (`Partial` both ways — absent = unavailable/disabled), `supportsBtcPayout`, pool minimum. Devnet placeholder only until partners deliver IDs.

## Verified contract interface (stacks-core `pox-wf-integration`)

- `stake(signer-manager <trait>, amount-ustx, num-cycles, start-burn-ht, signer-calldata (optional (buff 500)))`
- `stake-update(signer-manager, old-signer-manager, cycles-to-extend, amount-increase, signer-calldata)` — covers extend/increase/switch
- `unstake(old-signer-manager)`; `get-staker-info(staker)` → `(optional {amount-ustx, first-reward-cycle, num-cycles, signer})`
- signer-manager: `claim-staker-rewards(staker, cycle, bond-index?)` — **per-cycle only; no aggregate claimable read** → client-side fan-out, capped window
- calldata = serialized `{pox-addr: {version, hashbytes}, max-fee: uint}` in an optional buff
- `MAX_NUM_CYCLES u96`; `SIGNER_SET_MIN_USTX` 50k STX; prepare-phase length is per-network (u100 mainnet / u50 testnet) — read from pox-info, never hard-coded

## Build order

1. **Scaffolding + gate** — constants/paths, 404 layout, routes, nav, `bitcoin-staking-data.ts`, `Pox5` map entries.
2. **Data layer** — cycle clock (prepare-phase blackout math), activation status, transition state machine, signer-calldata codec, call builders + mutations, staker-info/earned-rewards/payout-preference queries, pending-tx detection (`stake|stake-update|unstake` predicate reusing `getHasPendingTransaction`), `use-pox5-position` aggregator, MSW mocks. Unit specs for all pure modules.
3. **Start-staking flow** — fresh orchestrator (no allowance machinery), schema (lock-exactly amount, cycles 1–96 default 12, optional payout preference gated by `supportsBtcPayout`), duration presets, terms → single `stake` confirmation, prepare-phase callout, already-staked guard, pool-health warning.
4. **Active/manage** — position grid from staker-info (no delegation-status archaeology), claimable sBTC card + per-cycle history, unstake with confirm, update-stake page (extend/increase; switch = stretch).
5. **Landing** — provider table over pox-5 config (disabled rows rendered disabled), variable-yield framing, new content/FAQ files, no Dual Stacking promo.
6. **E2E** — `bitcoin-staking.spec.ts` (happy path, already-staked redirect, blackout, claim, validation); `pooled-stacking.spec.ts` kept as pox-4 regression guard.

## Deferred / blocked

- Partner signer-manager IDs + per-partner BTC-payout support (pools ship disabled until then).
- Activation flip: heights, un-gating, `/stacking`→`/staking` redirect decision, liquid-increase gate-off, signer-key-tool deletion, refined re-stake prompt — all post-SIP-V2/vote.
- BTC protocol bonds (`bond-index` always `none` in v1).
- APR/TVL source for pox-5 pools (stacking-tracker has no pox-5 data).

## Risks

- `get-staker-info().signer` = signer-manager *contract principal* is unverified; position→pool mapping depends on it. First devnet check.
- `max-fee` units (sats vs micro-sBTC) unconfirmed — isolated in the calldata codec.
- SIP draft churn — contained by the isolated tree and `pox5-` modules.
- Product decisions flagged: default duration (12), max-fee default, hero copy.
