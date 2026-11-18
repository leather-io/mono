import { AppRoutes } from '@/shared/app-routes';
import { ApproverSelectors } from '@/shared/selectors/approver.selectors';
import { RpcBitcoinSelectors } from '@/shared/selectors/rpc-bitcoin.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const signerSpec = 'apps/mobile/src/features/psbt-signer/signer.spec.ts';
const sendTransferUtilsSpec =
  'apps/mobile/src/features/browser/approver-sheet/send-transfer.utils.spec.ts';
const dismissNote =
  'Browser.sendResult dismisses the sheet as soon as the result is posted, so the broadcast status row and the "Copy ID", "View details" and "Close window" buttons are not reached from the browser.';

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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [RpcBitcoinSelectors.GetAddressesAccountSection, ApproverSelectors.CancelButton],
    },
    actions: [],
    specs: [],
    description:
      'Approver for getAddresses (get-addresses/get-addresses.tsx on get-addresses.layout.tsx, shared with stx_getAddresses, so RpcBitcoinSelectors.GetAddressesAccountSection renders on both). The account section shows the selected account card (name, wallet name, address and balance, pressable to change it) or, with no account yet, a "Choose an account" cell; both open the account-selector-sheet with hidden accounts filtered out. Below, "This app would like to" lists "Request approval for transactions" and "View your wallet balance & activity". Approve is disabled until an account is resolved (get-addresses.hooks.ts); the allow-mode warning sheet is not presented here. Approve dispatches userConnectsApp, which sets the app status to "connected" with the accountId "<fingerprint>/<accountIndex>" that signPsbt, sendTransfer and signMessage later use, and resolves the addresses of address index 0: a p2wpkh and a p2tr entry (symbol BTC, address, publicKey, derivationPath, descriptor, fingerprint, plus tweakedPublicKey for p2tr) and an STX single-sig entry (address, publicKey). The params network, chains and allowPolicyAccounts are not read. A reproduction needs any dApp page that calls the provider.',
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'Approver for signPsbt (sign-psbt.tsx). Before rendering, addBip32DerivationFieldToInputs (approver-sheet/utils.ts) adds a bip32 or tap-bip32 derivation to each input that has none and pays to address index 0 of the connected account; an input whose address cannot be decoded throws "Unsupported bitcoin address", and PsbtSigner throws "No psbt accounts" when no input carries a derivation of a known account. The network comes from params.network ("testnet" maps to testnet4; an unknown name throws "Wrong network supplied in the rpc request params"), else the settings network. It renders psbt-signer.tsx with the fee editor off, no origin and no signOnly, so the header is always "Send token" without "Requested by", Approve reads "Approve" even when broadcast is false, and the fee card is not pressable. The sheet shows "Be careful with this transaction" when the PSBT is mutable, "Unverified recipient" for outputs without an address, "You’ll send" (the PSBT totals of the account addresses minus the fee), "To address" (RpcBitcoinSelectors.PsbtSignerRecipientsSection, the outputs the account does not own), the account card (RpcBitcoinSelectors.PsbtSignerAccountSection), the fee card (RpcBitcoinSelectors.PsbtSignerFeeSection: "Slow", "Standard", "Fast" or "Custom" by matching the PSBT fee to the estimates), "Show advanced options" revealing "Inputs and outputs", and a "Total spend" fiat footer. Approve runs signTx (signer.ts): it reads the mnemonic from the secure store, signs only the inputs in signAtIndex (every input when absent; an input without a derivation throws "Unimplemented: Multisig transactions") with the allowedSighash list, then finalizes; broadcast true posts the transaction. Retry (ApproverSelectors.RetryButton) renders only after a failed Approve. Live data: the fee rates (nothing renders until they resolve), the account UTXOs and BTC market data. ' +
      dismissNote +
      ' signer.spec.ts covers signTx with signAtIndex (unrequested inputs stay unsigned, all inputs when absent, non-zero indexes).',
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'Approver for sendTransfer (send-transfer.tsx). It renders nothing until the fee rates and the connected account UTXOs have loaded, then builds an unsigned native-segwit transaction at the halfHourFee rate with change to address index 0 from getSendTransferRecipients (send-transfer.utils.ts: the recipients array or the legacy address and amount, amounts as sats; a fraction fails with "Send transfer amounts must be sat-denominated integers", anything else with "Send transfer params don\'t pass zod validation"). params.network picks the address encoding ("testnet" maps to testnet4; an unknown name throws "Wrong network supplied in the rpc request params"), while the UTXOs and fee rates come from the settings network; params.account is not read. The PSBT goes to psbt-signer.tsx with the app origin and the fee editor on, so the sheet is the one rpc-sign-psbt describes except that the fee card (RpcBitcoinSelectors.PsbtSignerFeeSection) is pressable and opens the approver-bitcoin-fee-sheet; broadcast defaults to true, and broadcast false sets signOnly (labels "Sign transaction", "Signing...", "Signed"). Retry renders only after a failed Approve. A successful broadcast resolves { txid, transaction }. ' +
      dismissNote +
      ' Reproducing needs a funded account on the settings network. send-transfer.utils.spec.ts covers getSendTransferRecipients for both param shapes and the fractional-amount rejection.',
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'Approver for signMessage (sign-message/sign-message.tsx). The account section (RpcBitcoinSelectors.SignMessageAccountSection) shows the account card or "Choose an account" and opens the account-selector-sheet; the default is the connected app\'s account or, when params.account is set, the account at index account - 1 of the connected wallet, and a recently visited app starts with none. The message section (RpcBitcoinSelectors.SignMessageMessageSection) shows "Message" and the raw params.message. Approve calls signBip322Message (bip322-signer.ts): paymentType "p2tr" signs a BIP-322 simple signature with the taproot address at index 0, "p2wpkh" with the native segwit address at index 0; any other value throws "Only supports p2tr and p2wpkh bip322 message signing". params.type is not read, and the network comes from params.network or the settings network. The result is { signature, address, message }. Approve has no disabled state: with no account selected it returns without sending a result and the buttons still move to "Submitted".',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: { ready: RpcBitcoinSelectors.BitcoinFeeSheet, others: [] },
    actions: [],
    specs: [],
    description:
      'The Bitcoin fee sheet (fees/bitcoin-fee-sheet.tsx, RpcBitcoinSelectors.BitcoinFeeSheet), mounted by psbt-signer.tsx and opened only where it gets the fee editor: the sendTransfer approver and the in-app send-approver; the signPsbt approver disables the fee card. It lists "Slow" "~1 hour+" (hourFee), "Standard" "~30 min" (halfHourFee), "Fast" "~10 – 20min" (fastestFee) and a disabled "Custom" at the PSBT\'s current rate, each with the fee for the transaction size and the caption "<rate> sats/vB · <fiat fee>", the selected type outlined. Choosing a rate regenerates the PSBT from the account\'s available UTXOs with the same recipients, updates the fee card and shows the success toast "Fee updated". The rates come from useAverageBitcoinFeeRates, which falls back to 15/10/5 sats/vB when every estimate request fails, and fiat from BTC market data.',
  },
] as const satisfies readonly MobileFeatureEntry[];
