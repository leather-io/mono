# Leather RPC test app — guide for AI agents

A button catalog of Leather wallet RPC requests, plus verifiers that check what the wallet actually
signed. `README.md` documents it for humans; this file is what you need to drive or extend it.

## Before firing requests

1. Check whether `apps/test-app/.env` exists. If it does not, ask the developer — in one message —
   for what the wallet cannot tell you, then write the answers to `apps/test-app/.env` using
   `.env.example` as the template (restart the dev server afterwards; Vite reads it at startup):
   - Which network they are testing on, and — if `private` — whether it is a regtest node or a
     testnet-flavoured chain.
   - For the token buttons: a SIP-10 token and a SIP-9 NFT (asset + token id) their wallet holds.
   - For multisig: co-signer **xpubs** (not raw pubkeys) if they want a real vault.
   - For staking: which pool signer-manager contract to call.
   - For bonds and real-UTXO scenarios: an Esplora URL.
2. Never ask for a mnemonic, private key or seed phrase. Do not ask for their addresses, public keys
   or xpubs either — those come from `getAddresses` (`src/wallet.ts`).
3. Anything tagged `funds` moves real value if approved on a funded mainnet wallet. Say so before
   clicking one.

## Driving the app

`pnpm --filter @leather.io/test-app dev` serves http://localhost:3000. Open it in a browser with the
Leather extension loaded.

Prefer the programmatic API over the DOM:

```js
await window.__leatherTestApp.setNetwork('testnet4');
await window.__leatherTestApp.run('signPsbt'); // → SpecRun with a verdict
await window.__leatherTestApp.runTag('ci'); // → SpecRun[]
window.__leatherTestApp.list(); // every spec + metadata
window.__leatherTestApp.tags();
window.__leatherTestApp.refresh(); // after switching account in the wallet
await window.__leatherTestApp.runScenarioStep('multisig-roundtrip', 'collect-account-0');
```

A `SpecRun` carries `verdict` (`pass` / `fail` / `unjudged`), `reason`, `verify.checks[]`, the params
sent and the raw payload. `unjudged` means the spec's outcome depends on wallet state, not that it
failed.

If you must use the DOM: cards are `[data-testid="card-<id>"]` and the send button is
`[data-testid="<id>"]`. **Only per-spec send buttons carry `data-testid`** — every other control
uses `data-control` (`edit-<id>`, `send-edited-<id>`, `load-account`, `refresh-account`, `run-tag`,
`run-<scenario>-<step>`), because `apps/extension`'s rpc-catalog spec counts `button[data-testid]`
against the catalog length. Keep it that way when adding controls.

The result panel is `[data-testid="rpc-result"]` with `data-status`, `data-verdict`, `data-method`
and `data-id`; `rpc-result-params` / `rpc-result-payload` hold the JSON, `rpc-checks` the verifier
output, `rpc-signatures` the per-input signature table, `rpc-history` the earlier runs. The header
has `network-select`, `filter-input` and `account-bar` (`data-kind` is `singlesig` or `policy`);
the tag runner reports `tag-summary` and `tag-results`.

Expect **two** wallet prompts for builder-backed specs: `getAddresses` first, then the real request.
Responses to `getAddresses` are cached per network for the session — call `refresh()` after the
developer switches account.

## Offline work — no wallet needed

```bash
pnpm --filter @leather.io/test-app catalog list                  # every spec + metadata
pnpm --filter @leather.io/test-app catalog scenarios
pnpm --filter @leather.io/test-app catalog verify-psbt <hex>     # signatures + sighash semantics
pnpm --filter @leather.io/test-app catalog decode-psbt <hex> --mode regtest
pnpm --filter @leather.io/test-app catalog decode-stx <hex>
```

## Extending the catalog

A test is **one object appended to an array**. Template:

```ts
{
  id: 'signPsbt-something',           // also the button's data-testid
  method: 'signPsbt',
  label: 'signPsbt (something)',
  category: 'Bitcoin',
  description: 'What it sends and what should come back.',
  async params(ctx) {                  // or a static object for fixed payloads
    const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
    const { psbtHex } = buildPsbtScenario({ inputs: [{ kind: 'p2wpkh' }] }, keys);
    return { hex: psbtHex, broadcast: false } satisfies ParamsOf<'signPsbt'>;
  },
  expect: 'success',                   // or { error: 4001 } / 'manual' / { extension, mobile }
  requires: ['singlesig'],
  tags: ['ci', 'psbt'],
  verify: verifySignedPsbt({ signedIndexes: [0] }),
}
```

Rules:

- **Never hard-code a key, address, xpub, PSBT or descriptor that matches only one wallet.** Derive
  it through `ctx` and `src/wallet.ts`. Anything the wallet cannot supply goes in `src/constants.ts`
  behind a `VITE_TEST_APP_*` override (`src/env.ts`) and is documented in `.env.example`.
- Keep `builders/` and `verifiers/` **pure** — no React, no `window`. They are unit-tested, and the
  Playwright-facing `./catalog` export depends on that.
- `satisfies ParamsOf<'method'>` catches wrong fields before a wallet is involved. Drop it only when
  the workspace schema does not know a field the wallet accepts, and say so in the description.
- Use `expect: { extension, mobile }` when the platforms genuinely differ, and explain why in a
  comment. `getInfo` is the one case in the catalog: mobile answers it, the extension does not.
- **The catalog is deliberately one happy-path entry per RPC method.** It is not a matrix, and it is
  not where negatives, param variants or sighash sweeps belong. If you are exploring a space — every
  sighash flag, every input kind, malformed params — do it in `src/methods/local.ts` or in a
  Playwright spec built on `./catalog`, and leave the button list alone.
- Scratch work goes in `src/methods/local.ts` (committed empty). Keep your edits out of commits with
  `git update-index --skip-worktree apps/test-app/src/methods/local.ts`.

## Where things live

| Need                                   | File                                              |
| -------------------------------------- | ------------------------------------------------- |
| Wallet reads (addresses, keys, xpubs)  | `src/wallet.ts`                                   |
| Build a PSBT from input/output kinds   | `src/builders/psbt.ts`                            |
| Multisig + bond descriptors            | `src/builders/descriptors.ts`                     |
| Unsigned Stacks transactions           | `src/builders/stx-tx.ts`                          |
| pox-5 payloads and post conditions     | `src/builders/pox5.ts`, `src/builders/staking.ts` |
| Check a signature and its sighash flag | `src/verifiers/psbt-signatures.ts`                |
| Prove a flag commits to what it claims | `src/verifiers/sighash-semantics.ts`              |
| Reusable `verify` hooks for specs      | `src/verifiers/spec-verifiers.ts`                 |
| Multi-step flows                       | `src/scenarios/`                                  |
| Network ids and address flavours       | `src/networks.ts`                                 |

## Verifying a change

From the repo root — `knip` gives a bogus report from a package directory:

```bash
pnpm --filter @leather.io/test-app test
pnpm --filter @leather.io/test-app typecheck
pnpm --filter @leather.io/test-app lint
pnpm format && pnpm knip
```

Do not change files outside `apps/test-app` for a catalog change. `src/builders/pox5.ts` deliberately
duplicates the shapes `apps/web` ships in `app/features/bitcoin-staking/transactions/`; if those
change, update this copy — `src/builders/pox5.spec.ts` is what pins the post conditions.
