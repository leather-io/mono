# E2E network mocks

The app's network calls are answered in-process by MSW (`msw/native`) when Metro runs with `EXPO_PUBLIC_E2E_MOCKS=true`. Nothing reaches mainnet. The mocks load only in a development build with that flag. A release build still contains the `register.ts` module, because `index.js` and `src/app/_layout.tsx` import it: its `e2eOverlay` slot, which stays `null`, and the shim code, which never runs. Everything that loads the mocks sits behind the same `__DEV__` check and is stripped, so MSW, the handlers, the scenarios and the wallet seeder are not in the bundle.

## How mocks load

`index.js` imports `register.ts`, which installs a few globals MSW needs and then requires `server.ts`. The server starts with `baselineHandlers` (`handlers/baseline.ts`) followed by a catch-all that logs and 404s anything left over.

`src/app/_layout.tsx` requires `wallet-seeder.ts` under the same check; the seeder puts its `WalletSeeder` component in `e2eOverlay`, which the layout renders. It renders two invisible text elements, `e2eActiveScenario`, whose text is the active scenario list, and `e2eBroadcasts` (see Broadcasts), creates wallets on request, and tells the handlers which wallet and account an address belongs to.

## Baseline data

The baseline is a funded mainnet wallet, the same numbers as the extension tests: BTC 0.01 at $45,000, STX 13.568037 at $0.85, sBTC 0.5, USDCx 250 (aeUSDC 100, LONG and LTT are held but hidden by the default token preset). It also has three Stacks transactions (receive STX, send STX, receive sBTC), two owned Bitcoin transactions, one NFT and no BNS name.

Those numbers belong to Account 1 of the first wallet. Every other account gets different BTC and STX balances, so a flow can tell whose data is on screen. With `w` the wallet's position (0 for the first wallet added) and `a` the account index (0 for Account 1), the rank is `10w + a`:

- BTC: the Native SegWit UTXO holds `600000 + rank × 100000` sats; Taproot holds 400000 sats on every account. Account 2 of the first wallet has 0.011 BTC.
- STX: `13.568037 + rank` STX. Account 2 of the first wallet has 14.568037 STX.
- `bns-name` gives the name only to Account 1 of the first wallet.
- An address of no wallet in the app gets a rank from 100 to 199 derived from the address.

Removing the first wallet makes the next one the first.

Tests create a random wallet, so handlers never match a fixed address. They match by path and, where a response must mention the wallet (UTXO addresses, Stacks sender and recipient), read the address or descriptor from the request URL. Bitcoin UTXOs sit at the wallet's real receive address at index 0, so sends can be signed.

## Broadcasts

`POST /api/tx` (mempool) and `POST /v2/transactions` (Hiro) check what they are sent, like the real nodes:

- A body that does not parse as a transaction gets a 400.
- A Bitcoin transaction with an input that has no signature (no witness and no scriptSig) gets a 400.
- A Bitcoin transaction that spends an output the mocks never served gets a 400. The mocks remember every UTXO they answer with (outpoint, script and value). They also accept the test dApp's PSBT outpoint (`fixtures/rpc-bitcoin-psbt.ts`) at 100000 sats on any script they served.
- A Bitcoin input whose signature does not verify against that prevout's script and value gets a 400: p2wpkh by its BIP-143 digest, p2tr key path by its BIP-341 digest.
- A Stacks transaction whose origin signature does not verify, which includes an unsigned one, gets a 400.
- Otherwise the answer is the txid of the transaction that was sent.

The `broadcast-fail` scenario rejects every broadcast.

The `e2eBroadcasts` element counts the broadcasts these two handlers accepted, that is answered with a txid, since scenarios were last applied. Its text is `0`, or the count, the chain (`bitcoin` or `stacks`) and the txid of the latest one, for example `1 stacks 4f…`. A rejected broadcast, including every broadcast under `broadcast-fail`, leaves it unchanged, and applying scenarios resets it to `0`. Flows check it with `maestro/e2e/shared/assert-broadcasts.yaml`, passing a regular expression such as `1 stacks [0-9a-f]{64}` as `BROADCASTS`. Assert it rather than a success overlay that is on screen for a second.

## Scenarios

`set-scenario.yaml` opens `leather://?e2e=name1,name2`. The server puts those scenarios' handlers in front of the baseline (when two scenarios mock the same request, the later name wins; inside one scenario, handlers keep their order) and clears the React Query cache. An empty list resets to the baseline. Then the `e2eActiveScenario` element shows the list, or `baseline`, and `set-scenario.yaml` fails unless it shows exactly what was asked for. An unknown name shows `UNKNOWN SCENARIO <names>` instead, and Metro logs the same line, which fails the CI job.

Adding `&wallet=new` to the link also creates a new wallet without device security, after the scenarios are applied, through the same code the onboarding screens call. `shared/start.yaml` uses it.

Scenarios live in `scenarios/<area>.ts` and are merged in `scenarios/index.ts`. `scenarios/core.ts` has the shared ones: `empty-wallet`, `empty-balances`, `empty-activity`, `no-nfts`, `bns-name` (leather.btc), `stacks-pending-tx`, `compliance-non-compliant`, `compliance-down` (the compliance request fails at the network level) and `broadcast-fail`.

## Adding a handler

- Data goes in `fixtures/`, handlers in the `handlers/` file named after the upstream (`leather-api.ts`, `hiro.ts`, `bns.ts`, `mempool.ts`, `cms.ts`, `telemetry.ts`, `launchdarkly.ts`).
- Build URLs with the helpers in `handlers/urls.ts`, for example `hiroUrl('/extended/v3/principals/:segment/balances/stx')`. They match staging and production hosts and any query string. Put more specific paths before shorter ones.
- For a variant, prefer calling an exported factory (`stxBalanceHandler('0')`, `complianceHandler('non_compliant')`, `launchDarklyHandlers({ swap: false })`) from a scenario over editing the baseline.

## Finding unmocked requests

Every unmatched request logs `[e2e <device name>] UNHANDLED <method> <url>` to Metro. Grep the Metro output for `UNHANDLED`. CI fails on any such line that no regular expression in `maestro/e2e/unhandled-allowlist.txt` matches, and also when the log lacks the `mocks started` line the server prints at start. The WebView's own page loads, images and fonts don't go through MSW.
