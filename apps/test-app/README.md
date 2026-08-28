# Leather RPC test app

A Vite + React catalog of Leather wallet RPC requests (`window.LeatherProvider.request(...)`).
Every entry is a button with a pre-filled payload — click it, approve (or reject) in the wallet, and
the right-hand panel shows the params sent, the response, and **what the wallet actually signed**:
which key signed each input, under which sighash flag, and whether that signature verifies.

It is also the host page the extension's Playwright suite opens on port 3000.

## Run

```bash
pnpm --filter @leather.io/test-app dev
```

Open http://localhost:3000 in a browser with the Leather extension loaded. The header shows whether
`LeatherProvider` was detected, which network requests are pinned to, and which account this origin
is bound to.

## What's covered

| Section      |     Entries | What it exercises                                                                                                                                                                                                                                                      |
| ------------ | ----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**  |           9 | `getInfo`, `supportedMethods`, `getAddresses` (all chains / bitcoin only / stacks only), `open`, `openSwap`, unknown method, invalid params                                                                                                                            |
| **Bitcoin**  |          19 | `sendTransfer` (self-send, batch, legacy params, no-broadcast), `signPsbt` (native segwit, taproot key-path, mixed, foreign input, `signAtIndex`, `account`, change + OP_RETURN, descriptor, broadcast), BIP-322 `signMessage`, wrong-network and bogus-flag negatives |
| **Sighash**  | 3 + builder | Pick an input kind, a flag and how the request whitelists it; the request is built from the selection. "Run every combination" sweeps all 57. Named cases: no flag set, mixed flags across inputs, mixed flags with `signAtIndex`                                      |
| **Stacks**   |          16 | Transfers, SIP-10 / SIP-9, `stx_callContract` (deny / allow / originator, explicit fee + nonce, sponsored), deploy, message signing, `stx_signTransaction` (transfer, contract call, legacy `txHex`)                                                                   |
| **Staking**  |          10 | pox-5 stake / stake-update (extend, increase) / unstake / claim-staker-rewards, PoX-4 delegate / revoke / allow-contract-caller, sBTC enroll                                                                                                                           |
| **Multisig** |          13 | `btc_addAccount` (xpub and legacy raw-pubkey shapes), `stx_addAccount`, proposal commitments (BTC + STX), spending from a policy → proposal, PSBT and Stacks co-signing                                                                                                |
| **Bonds**    |           6 | Bond descriptor preview, propose from a policy account, co-sign, timelock and hashlock exits, disallowed-sighash negative                                                                                                                                              |

Plus three **scenarios** — flows a single request cannot express:

- **Wallet sign-in handshake** — `getAddresses({ chains })` → `signMessage` → assert the signature
  came back for the same address.
- **2-of-2 round trip (one wallet, two accounts)** — collect a key from account 0 and account 1,
  build a vault, co-sign with each in turn, combine and finalize. No teammates, no funds.
- **Bond lifecycle** — vault → bond template → register → timelock check → sign the exit.

## Verdicts, not vibes

Each entry declares what should happen (`expect`) and what wallet state it needs (`requires`), and
most carry a `verify` hook. After a request the panel shows a **verdict** (`pass` / `fail` /
`unjudged`) and the individual checks behind it.

For PSBTs the verifier recomputes the BIP-143 / BIP-341 digest for the flag each signature carries
and verifies the signature against it, then **mutates the transaction** to prove the flag means what
it claims: an ANYONECANPAY signature must survive a new input, a SINGLE signature must survive a
change to somebody else's output and break on its own, an ALL signature must break on any change.
A signature stamped with one flag but computed over another is caught — the unit tests forge exactly
that case.

For Stacks responses it decodes the returned transaction and checks the post conditions and the
post-condition **mode** survived the round trip, which is the whole point of the staking entries.

Where a family of requests is a **product** of independent options — a PSBT is an input set × a
count × a sighash flag × outputs × request flags — it is declared as choices rather than as dozens
of near-identical entries: the panel renders the fields and builds the request from your selection.
Each panel has a "Run N combinations" button for its curated sweep, and "Run tag" runs every entry
carrying a tag, builder combinations included.

Distinct methods and distinct flows stay listed. A dropdown would hide `invalid-params` or
`stx_getNetworks`, not simplify them.

## Personalised to the connected wallet

Everything that belongs to the _connected_ wallet is read from it at click time through
`getAddresses` (`src/wallet.ts`), so every entry works on any Leather install:

- BTC transfers send the wallet's own funds back to its own address; approving one on mainnet costs
  only the fee.
- `stx_callContract` names your address as the SIP-10 `sender`, and `stx_signTransaction` builds its
  unsigned transaction from your STX public key, so the signature is valid for the signer.
- PSBTs spend fictitious outpoints at your own scripts (`src/builders/psbt.ts`): signing succeeds,
  broadcasting cannot — unless you configure an Esplora API, in which case scenarios can spend real
  coins.
- Multisig vaults are `wsh(sortedmulti(k, yourXpub/0/0, …))` — the same **extended-key** shape the
  multisig dApp registers, and the only shape bonds accept.

What the wallet cannot tell us — the tokens you hold, who your co-signers are, which pool contract
to call, a Stacks recipient (Stacks rejects transfers to self) — lives in `src/constants.ts` with a
default that produces a realistic approval screen and a failing transaction. Override it in
`apps/test-app/.env` (gitignored; copy `.env.example`, restart the dev server after editing).

## For AI agents

`AGENTS.md` (loaded as `CLAUDE.md`) covers what to ask the developer before driving the catalog,
what never to ask for (seeds, keys, addresses), the `window.__leatherTestApp` API and the template
for adding an entry.

```js
await window.__leatherTestApp.setNetwork('testnet4');
await window.__leatherTestApp.run('signPsbt');
await window.__leatherTestApp.buildAndRun('psbt', { inputs: 'p2tr', sighash: 3 });
await window.__leatherTestApp.runBuilderMatrix('psbt');
```

Offline, without a wallet:

```bash
pnpm --filter @leather.io/test-app catalog builder psbt
pnpm --filter @leather.io/test-app catalog verify-psbt <hex>
pnpm --filter @leather.io/test-app catalog decode-stx <hex>
```

## Methods the extension does not implement

- `stx_getNetworks` and `stx_updateProfile` — removed from the extension; they answer
  `"<method>" is not supported`.
- `getInfo` — mobile only. Kept as a negative test for the extension.

## Adding a request

See "Extending the catalog" in `AGENTS.md`. In short: append one `RpcMethodSpec` to
`src/methods/<section>.ts`, derive anything wallet-specific through `ctx`, and add
`satisfies ParamsOf<'method'>`. Scratch experiments go in `src/methods/local.ts`.

## e2e

The app serves on port 3000, which `apps/extension/playwright.config.ts` starts through
`pnpm dev:test-app`.

Only per-spec send buttons carry `data-testid` (it is the spec's `id`); every other control uses
`data-control`, because the extension's rpc-catalog spec counts `button[data-testid]` against the
catalog length. The result panel is `data-testid="rpc-result"` with `data-status`, `data-verdict`,
`data-method` and `data-id`.

For payloads without the UI, import the React-free catalog (the extension lists
`@leather.io/test-app` as a dev dependency):

```ts
import { type RequestContext, resolveParams, rpcMethods } from '@leather.io/test-app/catalog';

const spec = rpcMethods.find(m => m.id === 'signPsbt-descriptor');
const ctx: RequestContext = {
  request(method, params) {
    return page.evaluate(/* call window.LeatherProvider.request and return .result */);
  },
};
const params = await resolveParams(spec, ctx);
```

`./catalog` also exports the builders, the verifiers and `runSpec`, so a spec can judge a response
the same way the app does. See `apps/extension/tests/specs/rpc-catalog/rpc-catalog.spec.ts`.

## Layout

```
.env.example         Every VITE_TEST_APP_* override, with its default
AGENTS.md            Guide for AI agents (CLAUDE.md imports it)
src/
├── app.tsx          UI shell
├── ui/              Header, cards, result panel, tag runner, scenario runner
├── leather.ts       LeatherProvider typings + callRpc()
├── session.ts       Selected network, cached getAddresses, bound account
├── networks.ts      Network ids → address flavours
├── types.ts         RpcMethodSpec / Scenario / expectations / verifiers
├── run-spec.ts      Resolve → send → verify → judge
├── test-api.ts      window.__leatherTestApp
├── cli.ts           Offline catalog + verifier CLI
├── rpc-methods.ts   Aggregates methods/* ; catalog.ts is the React-free export
├── constants.ts     Fixtures the wallet cannot supply
├── env.ts           VITE_TEST_APP_* overrides
├── wallet.ts        getAddresses reads: addresses, keys, xpubs, bound account
├── builders/        spec-builder · psbt · descriptors · keys · stx-tx · pox5 · staking
├── verifiers/       psbt-signatures · sighash-semantics · psbt-decode · stx-decode · spec-verifiers
├── utxo/esplora.ts  Optional real-UTXO mode
├── scenarios/       sign-in · multisig-roundtrip · bond-lifecycle
└── methods/         general · bitcoin · sighash · stacks · staking · multisig · bonds · local
                     builders (registry) · psbt-builder · stx-options-builder
```

`src/builders/pox5.ts` deliberately duplicates the payload shapes `apps/web` ships in
`app/features/bitcoin-staking/transactions/`, so this app stays self-contained. If those change,
update the copy — `src/builders/pox5.spec.ts` pins the post conditions.
