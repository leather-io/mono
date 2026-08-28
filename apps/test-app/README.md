# Leather RPC test app

A Vite + React catalog of Leather wallet RPC requests (`window.LeatherProvider.request(...)`).
Every method is a button with a pre-filled payload — click it, approve (or reject) in the wallet,
and the right-hand panel shows the exact params sent and the wallet's response or error. It is also
the host page the extension's Playwright suite opens on port 3000.

## Run

```bash
pnpm --filter @leather.io/test-app dev
```

Open http://localhost:3000 in a browser with the Leather extension loaded. The header badge shows
whether `LeatherProvider` was detected.

## What's covered

| Section      | Ids                                                                                                                                                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**  | `getInfo`, `supportedMethods`, `getAddresses`, `getAddresses-private`, `open-popup`, `open-fullpage`, `openSwap`                                                                                                                                                            |
| **Bitcoin**  | `sendTransfer-single`, `sendTransfer-batch`, `sendTransfer-private`, `sendTransfer-no-broadcast`, `signPsbt`, `signPsbt-broadcast`, `signPsbt-signAtIndex`, `signPsbt-descriptor`, `signPsbt-sighash`, `signMessage-p2wpkh`, `signMessage-p2tr`                             |
| **Stacks**   | `stx_getAddresses`, `stx_transferStx`, `stx_transferSip10Ft`, `stx_transferSip9Nft`, `stx_callContract`, `stx_deployContract`, `stx_signMessage-utf8`, `stx_signMessage-structured`, `stx_signStructuredMessage`, `stx_signTransaction-sip30`, `stx_signTransaction-legacy` |
| **Multisig** | `getAddresses-policy-accounts`, `btc_addAccount`, `stx_addAccount`, `sendTransfer-multisig`, `signPsbt-multisig-cosign`                                                                                                                                                     |

## Personalised to the connected wallet

Everything that belongs to the _connected_ wallet is read from it at click time through
`getAddresses` (`src/wallet.ts`), so every button works on any Leather install:

- BTC transfers send the wallet's own funds back to its own address. Approving one on mainnet
  broadcasts a real transaction — only the fee leaves the wallet.
- `stx_callContract` names your address as the SIP-10 `sender`, and `stx_signTransaction` builds
  its unsigned transfer from your STX public key, so the signature is valid for the signer.
- PSBT buttons spend a fictitious outpoint at your own address (`src/wallet-psbt.ts`): signing
  succeeds, broadcasting cannot.
- `btc_addAccount` / `stx_addAccount` register a 2-of-3 built from your key plus two co-signers,
  so the wallet is a real signer of the account it registers, and `signPsbt-multisig-cosign`
  co-signs a PSBT at that same vault.

Buttons that need your keys ask for `getAddresses` first, so expect two wallet prompts.

What the wallet cannot tell us — the tokens and NFTs you hold, who your co-signers are, a Stacks
recipient (Stacks rejects transfers to self) — stays in `src/constants.ts` with a mainnet default
the connected wallet almost certainly does not own: approval screens look real, but the transfer
fails after approval. Override them in `apps/test-app/.env` (gitignored; copy `.env.example`):

| Variable                                 | Default                                |
| ---------------------------------------- | -------------------------------------- |
| `VITE_TEST_APP_BTC_RECIPIENT`            | your own mainnet native-segwit address |
| `VITE_TEST_APP_BTC_RECIPIENT_REGTEST`    | your own regtest address               |
| `VITE_TEST_APP_STX_RECIPIENT`            | a fixture mainnet address              |
| `VITE_TEST_APP_SIP10_ASSET`              | LEO (`<contract>::<token>`)            |
| `VITE_TEST_APP_SIP9_ASSET`               | Living Leather (`<contract>::<asset>`) |
| `VITE_TEST_APP_SIP9_ASSET_ID`            | `647`                                  |
| `VITE_TEST_APP_BTC_COSIGNER_PUBLIC_KEYS` | two dummy keys (comma-separated)       |
| `VITE_TEST_APP_STX_COSIGNER_PUBLIC_KEYS` | two dummy keys (comma-separated)       |

Vite reads `.env` at startup — restart the dev server after editing it. The overrides apply to the
browser app; the catalog imported from Playwright always sees the defaults.

Multisig proposals go through `sendTransfer` from a selected policy account
(`sendTransfer-multisig`). `signPsbt` with a Bitcoin policy account selected only accepts
bond-template descriptors, so the catalog exercises co-signing instead: `signPsbt-multisig-cosign`
sends its PSBT from a singlesig account.

## For AI agents

`AGENTS.md` (also loaded as `CLAUDE.md`) tells an agent what to ask the developer before driving
the catalog — network, assets held, co-signer keys — and what never to ask for (seeds, keys,
addresses: those come from `getAddresses`). Point your agent at this directory and it picks it up.

## Methods the extension does not implement

- `stx_getNetworks` and `stx_updateProfile` — removed from the extension; they answer
  `"<method>" is not supported`.
- `getInfo` — mobile only. The `getInfo` button is kept as a negative test for the extension.

## Adding a request

Each button is one `RpcMethodSpec` in `src/methods/<section>.ts` (`general`, `bitcoin`, `stacks`,
`multisig`). Shared fixtures live in `src/constants.ts`.

- Give it a unique `id` (it becomes the button's `data-testid`), the wallet `method`, a `label`,
  `category` and a `description` that says what to expect.
- Use a static `params` object for fixed payloads, or `async params(ctx) { … }` when the payload
  must be built at click time. `ctx.request(method, params)` calls the wallet and resolves with
  the unwrapped `result`; the helpers in `src/wallet.ts` read the connected wallet's addresses,
  public keys and descriptors through it.
- Add `satisfies ParamsOf<'method'>` to catch misspelled or mistyped fields at typecheck time.
- Never hard-code a key, address, PSBT or descriptor that only matches one wallet — derive it
  through `ctx` instead. Anything the wallet cannot supply goes in `src/constants.ts` with a
  `VITE_TEST_APP_*` override (read through `src/env.ts`) documented in `.env.example`.

## e2e

The app serves on port 3000, which `apps/extension/playwright.config.ts` starts through
`pnpm dev:test-app`. The existing specs only use the page as an origin for `page.evaluate`.

For specs that drive the UI: every card has `data-testid="<spec.id>"`; the result panel is
`data-testid="rpc-result"` with `data-status` (`idle` / `pending` / `success` / `error`),
`data-method` and `data-id`, and its two `<pre>` blocks are `rpc-result-params` /
`rpc-result-payload`.

For specs that want the payloads without the UI, import the React-free catalog (the extension
lists `@leather.io/test-app` as a dev dependency):

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

See `apps/extension/tests/specs/rpc-catalog/rpc-catalog.spec.ts` for a complete example.

## Layout

```
.env.example         Every VITE_TEST_APP_* override, with its default
AGENTS.md            Instructions for AI agents driving or extending the app (CLAUDE.md imports it)
src/
├── app.tsx          UI shell: renders the catalog, fires requests, shows results
├── leather.ts       LeatherProvider typings + callRpc()
├── types.ts         RpcMethodSpec / RequestContext / ParamsOf
├── rpc-methods.ts   Aggregates ./methods/* into the catalog; resolveParams()
├── catalog.ts       React-free entry point for tests (package export "./catalog")
├── constants.ts     Fixtures the wallet cannot supply (assets, co-signers, STX recipient)
├── env.ts           Reads VITE_TEST_APP_* overrides
├── wallet.ts        Reads the connected wallet's addresses / keys via getAddresses
├── wallet-psbt.ts   Builds PSBTs and multisig descriptors from the connected wallet's keys
└── methods/
    ├── general.ts   getInfo, getAddresses, open, …
    ├── bitcoin.ts   sendTransfer, signPsbt, signMessage
    ├── stacks.ts    stx_* methods
    └── multisig.ts  btc_addAccount, stx_addAccount, policy-account flows
```
