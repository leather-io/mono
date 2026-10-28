import { AppRoutes } from '@/shared/app-routes';
import { ApproverSelectors } from '@/shared/selectors/approver.selectors';
import { RpcBitcoinSelectors } from '@/shared/selectors/rpc-bitcoin.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const signerSpec = 'apps/mobile/src/features/psbt-signer/signer.spec.ts';
const sendTransferUtilsSpec =
  'apps/mobile/src/features/browser/approver-sheet/send-transfer.utils.spec.ts';

export const rpcBitcoinFeatures = [
  {
    id: 'rpc-get-addresses',
    anchor: {
      kind: 'selectors',
      objects: ['RpcBitcoinSelectors.GetAddressesAccountSection'],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'getAddresses',
        steps: [
          'Open the Browser tab and load the dApp; the page must finish loading first, because Browser dispatches userAddsApp({ origin, status: "recently_visited" }) on navigation and BrowserApprover renders nothing for an origin missing from the apps store',
          'The dApp calls window.LeatherProvider.request("getAddresses") through the injected @leather.io/provider/mobile; the full-height approver sheet slides up over the browser with the "Connect" header, the large site favicon and "Requested by <hostname>"',
          'A first-time origin shows a "Choose an account" cell and a disabled Approve (ApproverSelectors.ApproveButton); tapping the cell opens the account selector sheet; an origin that already connected preselects its stored account',
          'Approve stores the app as connected with the chosen account and resolves { addresses: [p2wpkh, p2tr, STX single-sig] }; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [RpcBitcoinSelectors.GetAddressesAccountSection, ApproverSelectors.CancelButton],
    },
    actions: [],
    specs: [],
    description:
      'Approver features/browser/approver-sheet/get-addresses/get-addresses.tsx on the layout features/approver/layouts/get-addresses.layout.tsx (shared with stx_getAddresses, so RpcBitcoinSelectors.GetAddressesAccountSection also renders there). The account section (RpcBitcoinSelectors.GetAddressesAccountSection) shows the selected account through features/approver/components/approver-account-card.tsx (name, wallet name, address and balance, pressable to change it) or, with no account yet, a "Choose an account" cell; both open features/account/account-selector/account-selector-sheet.tsx (hidden accounts are filtered out). Below, features/approver/components/approver-permissions.tsx lists "This app would like to" with "Request approval for transactions" and "View your wallet balance & activity". Approve is disabled until useGetAddressesAccount (get-addresses.hooks.ts) resolves the account; the allow-mode warning sheet is not presented here (only base-stx-tx-approver.layout.tsx mounts it). Approve dispatches userConnectsApp (store/apps/apps.write.ts), which sets the app status to "connected" and its accountId to "<fingerprint>/<accountIndex>", the account that signPsbt, sendTransfer and signMessage later use; the result is built by formatAddressesForGetAddresses (get-addresses/utils.ts) from address index 0 of the account: a p2wpkh and a p2tr entry (symbol BTC, address, publicKey, derivationPath, descriptor, fingerprint, plus tweakedPublicKey for p2tr) and an STX single-sig entry (address, publicKey). The request params (network, chains, allowPolicyAccounts in packages/rpc/src/methods/get-addresses.ts) are not read. Browser.sendResult posts the response into the WebView and dismisses the sheet. No Maestro flow or unit spec covers it; a reproduction needs any dApp page that calls the provider.',
  },
  {
    id: 'rpc-sign-psbt',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcBitcoinSelectors.PsbtSignerRecipientsSection',
        'RpcBitcoinSelectors.PsbtSignerAccountSection',
        'RpcBitcoinSelectors.PsbtSignerFeeSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'signPsbt',
        steps: [
          'Connect the dApp first with getAddresses (rpc-get-addresses): SignPsbtApprover renders nothing for an app whose status is not "connected", so the request never resolves',
          'The dApp calls window.LeatherProvider.request("signPsbt", { hex, signAtIndex?, allowedSighash?, broadcast?, network? }) with a PSBT spending inputs of the connected account; the approver sheet slides up over the browser titled "Send token"',
          'Approve (ApproverSelectors.ApproveButton) signs and resolves { hex } (signed and finalized), or { hex, txid } after broadcasting when broadcast is true; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"',
          'A signing or broadcast failure shows the error toast "Failed to broadcast transaction" and swaps Approve for Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcBitcoinSelectors.PsbtSignerRecipientsSection,
        RpcBitcoinSelectors.PsbtSignerAccountSection,
        RpcBitcoinSelectors.PsbtSignerFeeSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [signerSpec],
    description:
      'Approver features/browser/approver-sheet/sign-psbt.tsx. Before rendering, addBip32DerivationFieldToInputs (approver-sheet/utils.ts) adds a bip32 (p2wpkh) or tap-bip32 (p2tr) derivation to each input that has none and pays to address index 0 of the connected account; inputs at any other address are left unchanged, and an input whose address cannot be decoded throws "Unsupported bitcoin address"; PsbtSigner then throws "No psbt accounts" when no input carries a derivation of a known account; the network comes from params.network ("testnet" maps to testnet4, otherwise a default network whose bitcoinNetwork matches, else the settings network preference; an unknown name throws "Wrong network supplied in the rpc request params"). It renders features/psbt-signer/psbt-signer.tsx with feeEditorEnabled false, no origin and no signOnly, so the header is always "Send token" without "Requested by", the Approve label stays "Approve" even when broadcast is false, and the fee card is not pressable. The sheet shows "Be careful with this transaction" when the PSBT is mutable (sighash), "Unverified recipient" for outputs without an address, "You’ll send" (features/approver/components/bitcoin-outcome.tsx: the PSBT totals of the account native segwit and taproot addresses minus the fee), "To address" (RpcBitcoinSelectors.PsbtSignerRecipientsSection, features/approver/components/outcome-addresses-card.tsx with outputs not owned by the account, plus unrecognized outputs), the account card (RpcBitcoinSelectors.PsbtSignerAccountSection), the fee card (RpcBitcoinSelectors.PsbtSignerFeeSection, features/approver/components/fees/bitcoin-fee-card.tsx: "Slow", "Standard", "Fast" or "Custom" by matching the PSBT fee to the estimates in getFeeType, psbt-signer/utils.ts), "Show advanced options" revealing "Inputs and outputs" (features/approver/components/inputs-outputs-card.tsx with utxo-row.tsx rows: truncated address and txid, BTC and fiat amounts), and a "Total spend" fiat footer. Approve runs signTx (features/psbt-signer/signer.ts): it reads the mnemonic from the secure store, signs only the inputs in signAtIndex (every input when absent; an input without a derivation throws "Unimplemented: Multisig transactions") with the allowedSighash list, then finalizes; broadcast true posts it through useBitcoinBroadcastTransaction. ApproverSelectors.RetryButton renders only after a failed Approve. Live data: useAverageBitcoinFeeRates (PsbtSigner renders nothing until it resolves), the account UTXOs (useAccountUtxos) and BTC market data for fiat. Browser.sendResult dismisses the sheet as soon as the result is posted, so the broadcast status row and the "Close window" state are not seen here. signer.spec.ts covers signTx with signAtIndex (unrequested inputs stay unsigned, all inputs when absent, non-zero indexes); no Maestro flow covers the sheet.',
  },
  {
    id: 'rpc-send-transfer',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcBitcoinSelectors.PsbtSignerRecipientsSection',
        'RpcBitcoinSelectors.PsbtSignerFeeSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'sendTransfer',
        steps: [
          'Connect the dApp first with getAddresses (rpc-get-addresses): BrowserApprover reads the account with getAccountIdFromConnectedApp, which throws "App is not connected" for a recently visited app',
          'The dApp calls window.LeatherProvider.request("sendTransfer", { recipients: [{ address, amount }], network, broadcast? }) or the legacy { address, amount, network }; amounts are integer sat strings',
          'Once the fee rates and the account UTXOs load, the approver sheet shows "Send token" with "Requested by <hostname>", or "Sign transaction" with the "Leather won\'t broadcast this transaction" warning when broadcast is false',
          'Approve (ApproverSelectors.ApproveButton, labelled "Sign transaction" when broadcast is false) resolves { txid, transaction } (txid only when broadcast); Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a failure shows the toast "Failed to broadcast transaction" and Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcBitcoinSelectors.PsbtSignerRecipientsSection,
        RpcBitcoinSelectors.PsbtSignerFeeSection,
        RpcBitcoinSelectors.PsbtSignerAccountSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [sendTransferUtilsSpec],
    description:
      'Approver features/browser/approver-sheet/send-transfer.tsx. It renders nothing until useAverageBitcoinFeeRates and useAccountUtxos (the connected account) have data, then builds an unsigned native-segwit transaction at the halfHourFee rate from the available UTXOs with change to address index 0, using getSendTransferRecipients (send-transfer.utils.ts: new recipients[] or legacy address/amount params, amounts as sats, "Send transfer amounts must be sat-denominated integers" for fractions, "Send transfer params don\'t pass zod validation" otherwise). params.network picks the address encoding through useGetBtcNetworkFromRequestParams ("testnet" maps to testnet4; an unknown name throws "Wrong network supplied in the rpc request params"), while the UTXOs and fee rates come from the settings network preference; params.account is not read. The PSBT goes to features/psbt-signer/psbt-signer.tsx with the app origin and feeEditorEnabled, so the sheet is the one rpc-sign-psbt describes (recipients in RpcBitcoinSelectors.PsbtSignerRecipientsSection, account in RpcBitcoinSelectors.PsbtSignerAccountSection) except that the fee card (RpcBitcoinSelectors.PsbtSignerFeeSection, features/approver/components/fees/bitcoin-fee-card.tsx) is pressable and opens the fee sheet (approver-bitcoin-fee-sheet); broadcast defaults to true, and broadcast false sets signOnly (labels "Sign transaction", "Signing...", "Signed"). ApproverSelectors.RetryButton renders only after a failed Approve. A successful broadcast resolves { txid, transaction: <signed hex> }; Browser.sendResult then dismisses the sheet, so features/approver/components/status-row/btc-status-row.tsx and the "Copy ID", "View details" and "Close window" buttons are not reached from the browser (status-row/utils.spec.ts covers only getStxTxStatus). Reproducing needs a funded account on the network preference. send-transfer.utils.spec.ts covers getSendTransferRecipients: new-params and legacy amounts kept as sats, and fractional amounts rejected in both shapes; no Maestro flow covers the sheet.',
  },
  {
    id: 'rpc-sign-message',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcBitcoinSelectors.SignMessageAccountSection',
        'RpcBitcoinSelectors.SignMessageMessageSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'signMessage',
        steps: [
          'Load the dApp in the Browser tab; connecting first with getAddresses preselects the connected account',
          'The dApp calls window.LeatherProvider.request("signMessage", { message, paymentType: "p2wpkh" | "p2tr", account?, network? }); paymentType is required by the schema',
          'The approver sheet slides up with the "Sign Message" header, the account section and the "Message" text',
          'Approve (ApproverSelectors.ApproveButton) resolves { signature, address, message }; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a signing error swaps Approve for Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcBitcoinSelectors.SignMessageAccountSection,
        RpcBitcoinSelectors.SignMessageMessageSection,
        ApproverSelectors.CancelButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver features/browser/approver-sheet/sign-message/sign-message.tsx with the layout sign-message.layout.tsx. The account section (RpcBitcoinSelectors.SignMessageAccountSection) shows the account card or "Choose an account" and opens features/account/account-selector/account-selector-sheet.tsx; the default account is the connected app\'s, or, when params.account is set, the account at index account - 1 in the connected wallet (when that index is below the account count); a recently visited app starts with no account. The message section (RpcBitcoinSelectors.SignMessageMessageSection) shows "Message" and the raw params.message. Approve calls signBip322Message (bip322-signer.ts): paymentType "p2tr" signs a BIP-322 simple signature with the taproot address at index 0, "p2wpkh" with the native segwit address at index 0, both through signTx (features/psbt-signer/signer.ts, mnemonic from the secure store); any other value throws "Only supports p2tr and p2wpkh bip322 message signing". params.type ("legacy" or "bip322") is not read, and the network comes from params.network or the settings network preference. The result is { signature, address, message } and Browser.sendResult dismisses the sheet. Approve has no disabled state: with no account selected it returns without sending a result and the buttons still move to "Submitted". No Maestro flow or unit spec covers it.',
  },
  {
    id: 'approver-bitcoin-fee-sheet',
    anchor: { kind: 'selectors', objects: ['RpcBitcoinSelectors.BitcoinFeeSheet'] },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'sendTransfer',
        steps: [
          'Open the sendTransfer approver sheet from a connected dApp (rpc-send-transfer)',
          'Tap the fee card (RpcBitcoinSelectors.PsbtSignerFeeSection); the fee sheet slides up over the approver',
          'Tap "Slow", "Standard" or "Fast": the transaction is rebuilt at that rate, the toast "Fee updated" shows and the sheet closes; "Custom" is disabled',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: { ready: RpcBitcoinSelectors.BitcoinFeeSheet, others: [] },
    actions: [],
    specs: [],
    description:
      'Sheet features/approver/components/fees/bitcoin-fee-sheet.tsx in fee-sheet.layout.tsx (RpcBitcoinSelectors.BitcoinFeeSheet on its Sheet.View), mounted by features/psbt-signer/psbt-signer.tsx. It opens only where PsbtSigner gets feeEditorEnabled: the sendTransfer approver and the in-app send approver (features/send/screens/approver.tsx); the signPsbt approver disables the fee card. It lists four bitcoin-fee-option.tsx rows: "Slow" "~1 hour+" (hourFee), "Standard" "~30 min" (halfHourFee), "Fast" "~10 – 20min" (fastestFee) and a disabled "Custom" at the PSBT\'s current rate, each with the fee for the transaction size and the caption "<rate> sats/vB · <fiat fee>", the selected type outlined. Choosing a rate runs onChangeFee in psbt-signer.tsx, which regenerates the PSBT from the account\'s available UTXOs with the same recipients (useGenerateBtcUnsignedTransactionNativeSegwit), updates the fee card and shows the success toast "Fee updated". The rates come from useAverageBitcoinFeeRates, which falls back to 15/10/5 sats/vB when every estimate request fails, and fiat from BTC market data. No Maestro flow or unit spec covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
