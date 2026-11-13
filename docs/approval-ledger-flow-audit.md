# Ledger approval flow audit

Reviewed against the local overhaul branch on 7 October 2026. This is a code inventory and product assessment, not a claim that every Ledger model, firmware version, browser, or mobile transport has been tested.

## Recommendation

Keep the approval review independent of signing method. A Ledger account uses the same requester, account, network, effects, fee and payload review as a software account. Pressing the normal Sign/Approve action opens a Ledger sheet for connection, signer/app checks, optional policy confirmation and device review. Carry a compact summary of the already-reviewed request into that sheet; do not insert an inline Ledger preparation stage before the approval action. After signing, close the sheet and show the shared result outside it. Network submission and submission failure also remain outside the device sheet.

The screenshots show a real weakness: the message review changes into a large, generic device sheet that drops the context of the request. Retain a focused Ledger sheet while making its request summary, compact guidance and one next action clear. The same device presentation can serve wallet setup and address verification, but those remain separate journeys with different titles, outcomes and navigation. Browser device selection remains owned by the browser; Leather should explain it before the chooser appears and recover gracefully after dismissal. The 13 interactive approval journeys remain the prototype coverage; the inventory below also documents adjacent setup/verification journeys and capability limits.

## Code-supported coverage

Paths below are relative to the repository root.

| Journey | Entry point | Ledger operation | Correct completion | Important distinction |
| --- | --- | --- | --- | --- |
| Bitcoin sign-in or ownership message | External `signMessage` request | BIP-322 message signing for native Segwit or Taproot, implemented through a synthetic PSBT and the Bitcoin device transaction flow | Message signature returned to requester | No fee, funds transfer, or broadcast. Do not call this a legacy Bitcoin message signature. |
| Stacks plain message | External Stacks signature request | UTF-8 message signing in the Stacks app | Message signature returned | Device stage can present the message itself. |
| Stacks structured message | External Stacks signature request | SIP-018 structured message signing | Structured-data signature returned | Current comparison screen shows domain chain ID, name, version, and two halves of the message hash. Do not pretend the device necessarily displays human-readable business effects. |
| Bitcoin transfer | Internal send or external transfer request | Sign selected PSBT inputs in Bitcoin app | Signed transaction, then broadcast result when caller broadcasts | Device signature and broadcast are separate events. |
| Bitcoin PSBT | External `signPsbt` | Sign selected inputs, potentially return partial signatures | Signed PSBT returned; broadcast only if requested by the calling flow | Signing a PSBT does not inherently mean sending funds. |
| Bitcoin vault or descriptor PSBT | External `signPsbt` with WSH descriptor, including the web vault client | Register non-standard wallet policy, then sign controlled inputs | Partial signatures returned and submitted to coordinator | Wallet policy registration is an extra on-device approval before the transaction signature. |
| Stacks transfer, token transfer, contract call, deployment | Internal send/swap and external RPC requests | Stacks transaction signing | Signed transaction, followed by broadcast where requested | Contract arguments, post-conditions, and user-visible effects remain review content. Device comparison is a narrower set of concrete transaction fields. |
| Stacks signed transaction request | External `stx_signTransaction` | Sign transaction without broadcasting | Serialized signed transaction returned | Multisig fee and nonce are preserved; they are not editable in this RPC review. |
| Bitcoin vault proposal | Internal vault send or applicable request routed to proposal | BIP-322 signature of proposal commitment using parent account key | Proposal submitted | This authorizes the proposal, not an on-chain spending signature. |
| Stacks vault proposal | Internal vault send or RPC proposal | SIP-018 signature of proposal commitment using parent account key | Proposal submitted, status `proposed` | Proposal contains placeholder nonce; later promotion assigns the transaction nonce. |
| Stacks vault transaction co-sign | Web vault transaction signing through `stx_signTransaction` | Stacks transaction signature after a nonce has been assigned | Signature added; wait for remaining signatures or subsequent broadcast | Separate from proposal commitment. The web client refuses signing without an assigned nonce. |
| Fee increase | Internal Bitcoin or Stacks activity actions | Chain-specific transaction signing | Replacement transaction signed, then submitted | Uses the same Ledger device stage. |
| Stacks cancellation | Internal activity action | Replacement Stacks transaction signing | Cancellation replacement signed, then submitted | Cancellation here is a new transaction, distinct from cancelling the approval UI. |
| BTC → sBTC / other swaps | Internal swap | Bitcoin or Stacks transaction signing according to leg | Caller-specific submitted result | Existing Bitcoin-to-sBTC flow warns that Ledger cannot recover a failed bridge without software access to the key. Preserve that product-specific warning. |
| Bitcoin vault account registration / verification | External `btc_addAccount`; verification mode shares that route | Register wallet policy when needed, show address, confirm exact match | Account registered or verified | Address confirmation is neither a message signature nor a spend. |
| Bitcoin receive-address verification | Internal receive verification | Display native Segwit, Taproot, or WSH vault address | Address verified | WSH requires wallet policy registration and all other keys expressible as xpubs. |
| Stacks receive-address verification | Internal receive verification | Display singlesig address | Address verified | This audited implementation uses the current singlesig account; do not invent a Stacks multisig display flow. |
| Add Ledger wallet / connect another chain | Onboarding, add-wallet menu, missing-chain key gate | Choose chain, connect, discover public keys; Stacks offers derivation-standard choice | Wallet or chain accounts available | Separate setup journey. No requester, approval fee, or transaction outcome. |

## Evidence map

### Bitcoin messages and transaction signing

- `apps/extension/src/background/messaging/rpc-methods/sign-message.ts`: validates payment type, rejects sign-in origin mismatch, opens the BIP-322 request popup.
- `apps/extension/src/app/pages/rpc-sign-bip322-message/use-sign-bip322-message.ts`: BIP-322 native Segwit and Taproot factories invoke `useSignBitcoinTx`; success returns signature, address, and message.
- `apps/extension/src/app/routes/rpc-routes.tsx`: Bitcoin message and PSBT request routes both nest `ledgerBitcoinTxSigningRoutes`.
- `apps/extension/src/app/store/accounts/blockchain/bitcoin/bitcoin.hooks.ts`: software and Ledger share signing entry point; Ledger connects through a route and resolves the matching signed-PSBT event. Native Segwit previous-transaction enrichment is best effort; BIP-322 can lack ordinary previous-transaction data and produce a device warning.
- `apps/extension/src/app/features/ledger/flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container.tsx`: connects the Bitcoin app, checks readiness, signs standard or descriptor inputs, publishes the signed PSBT, handles cancellation/rejection.

### Stacks messages and transactions

- `apps/extension/src/app/features/stacks-message-signer/use-sign-stacks-message.ts`: Ledger message routing is distinct from software signing.
- `apps/extension/src/app/features/ledger/flows/stacks-message-signing/ledger-stacks-sign-msg-container.tsx`: supports UTF-8 and structured messages; version gate; invalid-payload and rejected-operation responses; signature returned through event.
- `apps/extension/src/app/features/ledger/flows/stacks-message-signing/steps/sign-stacks-ledger-message.tsx`: exact device-comparison labels for structured data and plain messages.
- `apps/extension/src/app/features/ledger/flows/stacks-tx-signing/steps/approve-sign-stacks-ledger-tx.tsx`: origin, nonce, fee in µSTX, then transfer amount/recipient/memo or contract address/name/function/arguments/code.
- `apps/extension/src/app/pages/rpc-stx-sign-transaction/rpc-stx-sign-transaction.tsx`: sign-only serialized result; multisig fee/nonce editing disabled.
- `apps/extension/src/app/store/transactions/transaction.hooks.ts`: common Stacks signer routes Ledger requests through the device transaction stage.
- `apps/extension/src/app/features/rpc-stacks-transaction-request/stacks/stacks-rpc-transaction-request.routes.tsx`: transaction and proposal-message device routes coexist under the request shell.

### Vaults and policy confirmation

- `apps/extension/src/app/features/multisig/use-sign-proposal-commitment.ts`: parent key signs Bitcoin BIP-322 or Stacks SIP-018 proposal commitment.
- `apps/extension/src/app/features/rpc-stacks-transaction-request/stacks/use-propose-stacks-transaction.ts`: placeholder nonce and RPC result `status: proposed`.
- `apps/web/app/features/multisig/transactions/signing/sign-stx-transaction.ts`: requires assigned nonce, calls extension `stxSignTransaction`, extracts multisig signature.
- `apps/web/app/features/multisig/transactions/signing/sign-btc-transaction.ts`: passes resolved WSH descriptor to extension `signPsbt`, then extracts input signatures.
- `apps/web/app/features/multisig/transactions/signing/pre-sign-verification.ts`: verifies network, signer-set/address derivation, proposer key binding, and proposal commitment before invoking the wallet.
- `apps/extension/src/app/pages/rpc-sign-psbt/descriptor-psbt.hooks.ts`: resolves raw co-signer public keys to Ledger-compatible xpubs from PSBT metadata; rejects unresolved descriptors.
- `apps/extension/src/app/features/ledger/flows/bitcoin-tx-signing/use-sign-ledger-descriptor-tx.ts`: registers wallet policy per request, then signs and merges partial signatures. Policy HMAC is not persisted by this implementation.
- `apps/extension/src/app/pages/rpc-btc-add-account/ledger/ledger-confirm-btc-policy-address.tsx`: on-device confirmation must match the locally reviewed account address.
- `apps/extension/src/app/features/ledger/hooks/use-display-ledger-descriptor-address.ts`: address verification rejects another signer supplied only as a raw public key, since that address-display path has no PSBT xpub metadata to resolve it.

### Internal entry points and setup

- `apps/extension/src/app/pages/send/send-crypto-asset-form/send-crypto-asset-form.routes.tsx`: internal Bitcoin/Stacks sends and Stacks proposal commitment routes.
- `apps/extension/src/app/pages/swap/swap.routes.tsx`: Bitcoin and Stacks swap device routes.
- `apps/extension/src/app/pages/swap/components/review/sbtc-ledger-recovery-warning.tsx`: current bridge recovery limitation.
- `apps/extension/src/app/routes/app-routes.tsx`: home, fee-increase, cancellation, receive verification, and onboarding Ledger routes.
- `apps/extension/src/app/features/ledger/generic-steps/connect-device/connect-ledger-start.tsx`: chain selection, browser support gate, and popup-to-full-tab setup routing.
- `apps/extension/src/app/features/ledger/flows/request-bitcoin-keys/ledger-request-bitcoin-keys.tsx`: public-key discovery and wallet addition.
- `apps/extension/src/app/features/ledger/flows/request-stacks-keys/steps/choose-address-standard.tsx`: legacy Stacks versus Ledger desktop derivation choices.

## Device-state coverage

The design should represent progress without requiring users to understand route changes.

| Stage or condition | Current evidence | Proposed behavior |
| --- | --- | --- |
| Connect / browser device chooser | `dmk/ledger-device-connection.ts` reuses granted device or discovers device | One purposeful Connect Ledger action, explain chooser, retain request summary. |
| Locked device | `components/ledger-inline-warnings.tsx`, DMK connection interaction | Ask user to unlock; never ask for device PIN in Leather. |
| Open correct app | DMK `OpenAppDeviceAction`; Bitcoin / Bitcoin Test / Stacks app map | App-specific prompt, reflect actual device interaction. Avoid a manual checklist that claims readiness before it is detected. |
| App cannot open / missing app | `dmk/ledger-dmk-errors.ts` and `ledger-device-connection.ts` | Explain installing/opening the required app and retry. |
| Version check / outdated Stacks app | `utils/stacks-version-gate.ts` | Current local minimum is 0.26.19. Show the detected and required versions from runtime. |
| Verify device/account | `LedgerPublicKeyMismatch` route and layout | Wrong-device recovery; do not offer an override. A defined route does not prove every signing path performs proactive key verification. |
| Register wallet policy | Descriptor signing and descriptor address hooks | Explain why a vault has an extra on-device policy approval; retain threshold and signer identities in review context. |
| Review and approve on device | Operation layouts | Clear statement that action is on the device, plus matching fields; never a Leather button claiming to provide real device approval. |
| Device rejected | Transaction/message container and `OperationRejected` route | Distinguish rejection from hardware failure, preserve review for deliberate retry. |
| Disconnected / transport error | DMK error mapping | Reconnect and resume same reviewed request only if still valid. |
| No device selected | DMK error mapping | Retry opens chooser; dismissal does not become a signature. |
| Device in use | DMK error mapping | Ask to close Ledger desktop software or another wallet window before retrying. |
| Invalid payload | Dedicated generic step and Stacks return code | Explain request cannot be signed; return to review or close. |
| Signature received | Signed-event / message-event completion | Caller-specific completion: signed, submitted proposal, signature added, or broadcasting. |
| Broadcast failed after signature | Broadcast error route and caller-specific errors | Show submission failure separately from device signing; do not ask for another device signature unless required. |

Evidence paths for generic stages are under `apps/extension/src/app/features/ledger/`, including `generic-flows/tx-signing/ledger-sign-tx-route-generator.tsx`, `flows/stacks-message-signing/ledger-stacks-sign-msg.routes.tsx`, `dmk/ledger-dmk-errors.ts`, and `utils/generic-ledger-utils.ts`. Cancellation is currently restricted during some connection interactions; a production redesign must preserve action cancellation, session cleanup, and request settlement rather than merely hiding the sheet.

## Mobile and web applicability

The local extension constructs its device manager using only `webHidTransportFactory` in `apps/extension/src/app/features/ledger/dmk/ledger-dmk.ts`. A search of `apps/mobile/src` found no Ledger implementation. The web sign-in component explains using the extension with a Ledger account; the web vault signer calls the extension RPC client.

Phone and small-phone layouts can demonstrate the same shared review → Sign/Approve → Ledger sheet → shared result hierarchy. They are visual form-factor concepts, not evidence that USB, Bluetooth, an operating-system pairing picker, or any specific Ledger model works in Leather mobile. Choose and validate native transport, operating-system permissions, model/chain capabilities, and cancellation/resume behavior before promising native mobile support. A web panel likewise demonstrates layout; direct web Ledger transport is not implemented by these audited web flows.

## Scope and next steps

1. Use the common Handshake review for every signing method. Open one reusable Ledger sheet on Sign/Approve and exercise it with Bitcoin message, Stacks transfer/contract, Bitcoin PSBT, and a vault transaction co-sign. Close it on successful signing and present the shared result outside it. Those requests reveal meaningful differences without maintaining separate visual concepts.
2. Add structured-message / proposal-commitment and wallet-policy confirmation states so vault signing does not hide a second hardware approval or imply a proposal sends funds.
3. Reuse device status, connection recovery, and comparison primitives in separate Add Ledger wallet and Verify address previews. Their successful outcomes remain wallet connected and address verified.
4. Verify message device display, synthetic PSBT warnings, structured-data hash readability, vault policy prompts, device identity checks, and rejection/cancellation with actual supported hardware before production copy is finalized.
5. Treat native mobile Ledger support as a capability investigation. Keep small-screen design exploration useful while separating it from claims about device connectivity.

No vendor capability claims were inferred beyond local implementation. No production code was edited for this audit.
