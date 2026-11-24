import { AccountSelectors } from '@tests/selectors/account.selectors';
import {
  ConnectAccountSelectors,
  PsbtSelectors,
  RequestSelectors,
} from '@tests/selectors/requests.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;
const signPsbtSpec = 'apps/extension/tests/specs/rpc-sign-psbt/sign-psbt.spec.ts';
const rpcCatalogSpec = 'apps/extension/tests/specs/rpc-catalog/rpc-catalog.spec.ts';
const popupStep =
  'Wait for the approver with context.waitForEvent("page"): the test build opens it as a full-page tab instead of a popup window (triggerRequestPopupWindowOpen in rpc-request-utils.ts); the request resolves when it approves or closes';
const connectedOriginNote =
  'An origin that is not connected gets 16 "Wallet no longer available. Reconnect the app to an available wallet." with no popup (methods-requiring-connected-wallet.ts); the specs seed the connection with getConnectedTestAppPermissionsState.';
const rawParamsNote =
  'LeatherProvider.request always sends params ?? {} (init-inpage-provider.ts), so a dApp that omits params gets -32602; -32600 "Parameters undefined" only reaches a raw request event dispatched without params.';
const ledgerIndicatorNote =
  'AccountSelectors.LedgerIndicator renders only when the account shown belongs to a Ledger wallet.';
const addModeStep =
  'From localhost:3000 in a test build this is always verify mode: add mode needs both the origin and the top origin whitelisted (policy-match.ts), and loopback counts as whitelisted only in a development build (isWhitelistedOrigin in shared/constants.ts). The add-mode spec stubs https://app.leather.io with stubWhitelistedOriginPage (an inline context.route in rpc-add-account.spec.ts) and calls from there';

export const rpcBitcoinFeatures = [
  {
    id: 'rpc-get-addresses',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcGetAddresses],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'getAddresses',
        steps: [
          'From the test app at localhost:3000 call window.LeatherProvider.request("getAddresses", { chains?, allowPolicyAccounts?, network? })',
          'The background opens /get-addresses?requestId=…',
          popupStep,
        ],
      },
      {
        kind: 'rpc',
        method: 'stx_getAddresses',
        steps: [
          'Same popup for window.LeatherProvider.request("stx_getAddresses", { network?, allowPolicyAccounts? }); it has no chains param, so the popup requests both chains and returns the same { addresses } payload with the BTC and STX entries (use-get-addresses.ts), not the bare array its result schema declares',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: ConnectAccountSelectors.ApproveBtn,
      others: [
        AccountSelectors.LedgerIndicator,
        ConnectAccountSelectors.MissingAccountCallout,
        RequestSelectors.CrossOriginFrameCallout,
      ],
    },
    actions: ['OnboardingPage.signInWithTestAccount', 'OnboardingPage.signInWithLedgerAccount'],
    specs: [
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses-chains.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses-policy.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/rpc-cross-origin-frame.spec.ts',
      'apps/extension/tests/specs/rpc-open/open.spec.ts',
      'apps/extension/tests/specs/rpc-policy-propose/per-origin-policy.spec.ts',
      rpcCatalogSpec,
    ],
    description:
      'The connect approver: "Connect app" with the requesting origin, the current account (switchable in the sheet; policy accounts are offered when allowPolicyAccounts is not false), the permissions list and the "Deny" / "Confirm" buttons (Confirm is ConnectAccountSelectors.ApproveBtn). "Confirm" records the origin binding used by later requests and returns { addresses } with the BTC native segwit and taproot keys and the STX key for the chains requested; when a policy account is active and allowPolicyAccounts is not false it returns only that policy\'s address (a p2wsh BTC address with its descriptor, or a multisig STX address with its public keys and threshold) and none of the single-sig keys (use-get-addresses.ts). "Deny" or closing the popup returns 4001 "User rejected request"; params that fail the schema (for example chains: []) return -32602 before any popup (get-addresses.ts). A Ledger wallet missing a requested chain shows the "<Chain> account not found" or "Connecting with <Chain> only" callout (ConnectAccountSelectors.MissingAccountCallout); a request from a cross-origin iframe shows the "Be careful with this embedded app" callout (RequestSelectors.CrossOriginFrameCallout). The rpc-catalog spec reaches this popup through the signPsbt builder card, which asks for addresses first. ' +
      ledgerIndicatorNote,
  },
  {
    id: 'rpc-btc-add-account',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcBtcAddAccount],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'btc_addAccount',
        steps: [
          'Call window.LeatherProvider.request("btc_addAccount", { descriptor, name, network? }) with a multisig wsh(multi(...)) or wsh(sortedmulti(...)) descriptor',
          addModeStep,
          'The background opens /btc-add-account?requestId=…',
          popupStep,
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: ConnectAccountSelectors.BtcAddAccountApproveBtn,
      others: [],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-add-account/rpc-add-account.spec.ts'],
    description:
      'Approver that registers (add mode, title "Add multisig account") or only verifies (verify mode, title "Verify multisig address") a Bitcoin multisig policy from a wsh descriptor: it shows the multisig address, the signing account, the account name and the descriptor. The confirm button (ConnectAccountSelectors.BtcAddAccountApproveBtn) reads "Verify" in verify mode or "Confirm" otherwise, with " on Ledger" appended for a Ledger wallet, and is enabled only when the active account is one of the co-signers and the address could be derived (use-btc-add-account.ts canApprove). Add mode returns { added: true, accountId, address, descriptor, role } and persists the policy; verify mode returns { added: false, address, descriptor, role }. In add mode a failed registration sends -32603 "Failed to register policy" (use-btc-add-account.ts). On Ledger, approving first confirms the multisig address on the device (the confirm-btc-policy-address Ledger flow) and only then responds. "Deny" or closing the popup returns 4001. Before any popup the background answers -32602 for params that fail the schema and -32602 "Only multisig wsh() descriptors are supported" for any other descriptor (btc-add-account.ts). The origin needs no prior connection.',
  },
  {
    id: 'rpc-sign-psbt',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcSignPsbt],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'signPsbt',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("signPsbt", { hex, signAtIndex?, allowedSighash?, broadcast?, account?, network?, descriptor? })',
          'The background validates the PSBT and opens /sign-psbt?hex=…&requestId=…',
          popupStep,
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: PsbtSelectors.PsbtSignerCard,
      others: [],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: [signPsbtSpec, rpcCatalogSpec],
    description:
      'The PSBT signer: a card with the transaction summary ("You\'ll transfer" / "You\'ll receive" totals per address), the fee, expandable inputs and outputs, the raw hex and a "Certain" / "Uncertain" badge for mutable sighash types, plus the descriptor policy section for multisig or bond PSBTs, with "Cancel" and "Confirm" buttons. "Confirm" signs the requested inputs (all, or signAtIndex) and returns { hex }; with broadcast: true it also broadcasts, returns { hex, txid } and goes to /sign-psbt/summary. "Cancel" or closing the popup returns 4001 "User rejected signing PSBT request". Before any popup the background answers -32602 for schema errors, -32602 "Invalid PSBT hex", -32602 "Only wsh() descriptors are supported", and -32602 "Proposing a transaction requires a descriptor" when the origin is bound to a policy, the request has no account param and no descriptor is passed (sign-psbt.ts; an account param skips the bound policy, rpc-request-utils.ts). ' +
      rawParamsNote +
      ' ' +
      connectedOriginNote +
      ' A sighash outside allowedSighash is rejected as soon as the popup opens: the page renders nothing, sends -32602 and navigates to /request-error "Signing not permitted", so the ready selector never appears. When the origin is bound to a Bitcoin policy and the descriptor matches a bond template, the button reads "Propose transaction" (psbt-signer.tsx) and returns { hex, proposalId, status: "proposed" }; a failed bond proposal sends -32603 "Failed to propose transaction" and navigates to /request-error "Unable to propose transaction"; any other descriptor on a policy-bound origin is rejected on mount (for example -32602 "Descriptor is not a supported bond template") and navigates to /request-error "Unable to propose transaction". Single-sig signing failures ("Failed to sign", including an invalid signAtIndex) and finalize failures ("Failed to finalize tx") navigate to /request-error with no RPC error, so the app gets the 4001 when the window closes; a descriptor-signing failure sends -32600 "Error signing transaction" first, and a broadcast failure sends 4002 "Failed to broadcast transaction" with the signed hex in data (use-rpc-sign-psbt.tsx). sign-psbt.spec.ts registers its network mocks inline: it routes **/api/tx on the popup page after waitForEvent("page") for broadcasts, and for the bond case seeds policyStateOverrides plus getConnectedTestAppPermissionsState({ policyId }) and routes **/v1/multisig-ext/propose on the context.',
  },
  {
    id: 'rpc-sign-psbt-summary',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.RpcSignPsbtSummary],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Approve a signPsbt request sent with broadcast: true; after the broadcast succeeds the popup navigates to /sign-psbt/summary with the totals in route state',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.InfoCardAssetValue,
      others: [SharedComponentsSelectors.InfoCardRowValue],
    },
    actions: [],
    specs: [signPsbtSpec],
    description:
      'Post-broadcast summary for a signed-and-broadcast PSBT: the transferred value with its fiat amount, total spend, sending and fee rows, a "View details" explorer link and a "Copy ID" button that toasts "ID copied!". The values come from route state, so the route is only meaningful right after a broadcast. The sign-psbt spec reaches this route after a broadcast it mocks inline (a **/api/tx route registered on the popup page after waitForEvent("page")) but asserts only on the RPC result, not on the page.',
  },
  {
    id: 'rpc-send-transfer',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcSendTransfer, RouteUrls.FeeEditor],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'sendTransfer',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("sendTransfer", { recipients: [{ address, amount }], account?, network?, broadcast? }); the legacy { address, amount, account?, network?, broadcast? } form is converted to one recipient (compliance-checks.spec.ts uses it)',
          'The background opens /send-transfer?requestId=… with the connected account and network (mainnet when network is omitted); the spec\'s basic tests send network: "testnet4" with testnet recipients, its spend-source and propose tests send "mainnet"',
          popupStep,
          'Tapping the fee row opens the nested edit-fee sheet',
        ],
      },
    ],
    gate: 'ledgerBitcoin',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'testnet4',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [
        SendCryptoAssetSelectors.SpendSourcesTaprootCallout,
        SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow,
        SendCryptoAssetSelectors.SpendSourcesTaprootRow,
        SendCryptoAssetSelectors.TaprootUtxoWarningDialog,
        AccountSelectors.LedgerIndicator,
      ],
    },
    actions: [
      'OnboardingPage.signInWithTestAccount',
      'OnboardingPage.signInWithMixedSoftwareAndLedgerWallets',
    ],
    specs: [
      'apps/extension/tests/specs/rpc-send-transfer/rpc-send-transfer.spec.ts',
      'apps/extension/tests/specs/compliance-checks/compliance-checks.spec.ts',
    ],
    description:
      'Approver for a dApp-initiated BTC send: title "Send token", the signing account with its combined native segwit and taproot balance, the recipients, a fee row that opens the edit-fee sheet, and per-address-type spend source rows plus the taproot callout when taproot UTXOs are spent. "Approve" broadcasts and returns { txid, transaction }; with broadcast: false the title and the button both read "Sign transaction", a no-broadcast warning shows and it returns { transaction }. When the transaction spends taproot inputs, "Approve" first opens the TaprootUtxoWarningDialog ("I understand, continue"). A Bitcoin multisig policy account shows both the multisig and the signer, the button reads "Propose transaction" and it returns { proposalId, status: "proposed", transaction }. Any build, sign or broadcast failure navigates to /send/btc/error with no RPC error, so the app receives 4001 "User rejected request" when the window closes (use-rpc-send-transfer-actions.tsx); "Cancel" also just closes the window. A recipient flagged by the compliance check replaces the screen with "Unable to handle request, errorCode: 1398" (useBreakOnNonCompliantEntity; compliance-checks.spec.ts routes **/v1/compliance/addresses/** inline on the context). Before any popup the background answers -32602 for non-digit (non-sat) amounts, recipients on mixed networks or recipients that do not match network (send-transfer.ts). ' +
      rawParamsNote +
      ' ' +
      connectedOriginNote +
      ' The LedgerBitcoinGate asks a Ledger wallet without Bitcoin keys to connect first. rpc-send-transfer.spec.ts registers mockTestAccountBtcBroadcastTransaction on the popup page after waitForEvent("page"), records broadcasts for the broadcast: false tests with an inline popup.route on the testnet4 /tx endpoint, registers mockMixedUtxosForSend for the spend-source and taproot tests (the native segwit and taproot spend source rows render for any generated transaction; taproot UTXOs bring up the callout), mockNativeSegwitOnlyUtxosForSend for the native-segwit-only tests, and mockFundedBitcoinAddressUtxos(context, bitcoinPolicy.address) to fund the multisig for the propose test. ' +
      ledgerIndicatorNote +
      ' The mixed-wallets test connects the software wallet, so the indicator does not render there.',
  },
  {
    id: 'rpc-sign-bip322-message',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcSignBip322Message],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'signMessage',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("signMessage", { message, type?: "bip322", paymentType?: "p2wpkh" | "p2tr", network?, account? })',
          'The background opens /sign-bip322-message?message=…&requestId=…',
          popupStep,
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SettingsSelectors.CurrentAccountDisplayName,
      others: [ConnectAccountSelectors.WalletName, SharedComponentsSelectors.GenericErrorTitle],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: [
      'apps/extension/tests/specs/rpc-message-signing/bip322-message-signing.spec.ts',
      rpcCatalogSpec,
    ],
    description:
      'BIP-322 message signing approver: the popup header with the current account and wallet name, the origin, a "Sign message" heading, a preview of the message, a no-fees row and the "Cancel" and "Sign" buttons ("Sign on Ledger" for a Ledger wallet; stacks-sign-message-action.tsx). "Sign" returns { signature, address, message } and toasts "Message signed successfully"; "Cancel" returns 4001 "User rejected request" (use-sign-bip322-message.ts). When the account has no address of the requested payment type the page renders the generic "Unable to sign message" error (SharedComponentsSelectors.GenericErrorTitle) instead: its "Close window" link sends -32600 "The current account cannot sign <paymentType> messages", while closing the window itself returns 4001 "User rejected request". Before any popup the background answers -32602 for schema errors or an unsupported paymentType, and 7 "This is a Leather sign-in message and its Domain line does not match the requesting origin." for a sign-in message whose Domain line does not match the origin (sign-message.ts). ' +
      rawParamsNote +
      ' ' +
      connectedOriginNote +
      ' The rpc-catalog spec signs through its signMessage-p2wpkh card. The route is lazy-loaded with no gate in the router; the page component wraps itself in AccountGate (rpc-sign-bip322-message.tsx), which the checker reads from the lazy import.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
