# Leather RPC test app — guide for AI agents

This app is a button catalog of Leather wallet RPC requests; `README.md` documents it. When a
developer asks you to run, drive or extend it, follow this.

## Before firing requests

1. Check whether `apps/test-app/.env` exists. If it does not, ask the developer — in one message —
   for what the wallet cannot tell you, then write the answers to `apps/test-app/.env` using
   `.env.example` as the template (restart the dev server afterwards; Vite reads it at startup):
   - Which network they are testing on (mainnet, testnet4 or private/regtest) and whether the
     wallet has regtest funds.
   - For the token buttons: a SIP-10 token and a SIP-9 NFT (asset + token id) their wallet actually
     holds. The defaults are mainnet assets the wallet almost certainly does not own, so those
     transfers fail after approval.
   - For the multisig buttons: co-signer public keys (compressed secp256k1 hex) from the other
     wallets, if they want a real 2-of-3 rather than dummy co-signers.
   - Optionally a recipient other than their own wallet. BTC defaults to self-send; STX uses a
     fixture address because Stacks rejects transfers to self.
2. Never ask for a mnemonic, private key or seed phrase. Do not ask the developer to paste their
   own addresses or public keys either: builders read them through `getAddresses` at click time
   (`src/wallet.ts`).
3. Mainnet transfer buttons move real funds if the developer approves them. Say so before clicking
   one on a funded wallet.

## Driving the app

- `pnpm --filter @leather.io/test-app dev` serves http://localhost:3000; open it in a browser with
  the Leather extension loaded. `[data-testid="provider-status"]` has `data-installed="true"` once
  `LeatherProvider` is injected.
- Every card is `button[data-testid="<id>"]`; the ids are listed in `README.md`. The outcome is in
  `[data-testid="rpc-result"]` (`data-status` idle / pending / success / error, `data-method`,
  `data-id`); the params sent and the response are the `rpc-result-params` / `rpc-result-payload`
  `<pre>` blocks.
- Builder buttons prompt `getAddresses` first and then send the real request — expect two wallet
  popups. Errors thrown while building (e.g. no policy account selected) land in the result panel
  as `error` without a wallet prompt.
- From Playwright, import payloads through `@leather.io/test-app/catalog` instead of scraping the
  UI; `apps/extension/tests/specs/rpc-catalog/rpc-catalog.spec.ts` is the reference.

## Extending the catalog

- Follow "Adding a request" in `README.md`. Never hard-code a key, address, PSBT or descriptor that
  matches only one wallet — derive it through `ctx` and the helpers in `src/wallet.ts`.
- Anything the wallet cannot supply goes in `src/constants.ts` with a `VITE_TEST_APP_*` override
  read through `src/env.ts`, documented in `.env.example`.
- Verify from the repo root: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm knip`.
