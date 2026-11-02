import { AccountSelectors } from '@tests/selectors/account.selectors';
import {
  ConnectAccountSelectors,
  PostConditionSelectors,
} from '@tests/selectors/requests.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;
const stacksRpcSheets = [
  RouteUrls.FeeEditor,
  RouteUrls.NonceEditor,
  RouteUrls.BroadcastError,
] as const;
const stacksRpcSelectors = [PostConditionSelectors.PostConditionItem] as const;
const popupStep =
  'Wait for the approver with context.waitForEvent("page"): the test build opens it as a full-page tab instead of a popup window (triggerRequestPopupWindowOpen in rpc-request-utils.ts); the request resolves when it approves or closes';
const sheetsStep =
  'The fee and nonce rows open the nested edit-fee and edit-nonce sheets; a failed broadcast opens the nested broadcast-error sheet';
const connectedOriginNote =
  'Before any popup the background answers 16 "Wallet no longer available. Reconnect the app to an available wallet." for an origin that is not connected (methods-requiring-connected-wallet.ts; the specs seed the connection with getConnectedTestAppPermissionsState), -32602 for params that fail the schema (validateRequestParams in rpc-request-utils.ts); LeatherProvider.request always sends params ?? {} (init-inpage-provider.ts), so -32600 "Undefined parameters" only reaches a raw request event dispatched without params. Closing the popup returns 4001 "User rejected request". The LedgerStacksGate asks a Ledger wallet without Stacks keys to connect first.';
const broadcastNote =
  '"Approve" signs and broadcasts and returns { txid, transaction }; a failed broadcast opens the broadcast-error sheet. With sponsored: true the signed transaction is returned as { transaction } with no txid and the window closes, but the hook does not return there, so a broadcast is still attempted (use-sign-and-broadcast-stacks-transaction.ts).';
const cancelOnlySpecNote =
  "The rpc-sip30 spec covers display and close only: every test passes 'Cancel' to its helper, which closes the popup page and asserts 4001 \"User rejected request\"; the helper's 'Confirm' branch is dead code and would not find the button, which reads \"Approve\" (get-transaction-actions.tsx).";
const ledgerIndicatorNote =
  'AccountSelectors.LedgerIndicator renders only when the account shown belongs to a Ledger wallet.';

export const rpcStacksFeatures = [
  {
    id: 'rpc-stx-add-account',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxAddAccount],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_addAccount',
        steps: [
          'Call window.LeatherProvider.request("stx_addAccount", { publicKeys, threshold, name, network? }) with 2 or more compressed public keys and 1 ≤ threshold ≤ publicKeys.length',
          'From localhost:3000 in a test build this is always verify mode: add mode needs both the origin and the top origin whitelisted (policy-match.ts), and loopback counts as whitelisted only in a development build (isWhitelistedOrigin in shared/constants.ts). No spec covers the Stacks add mode',
          'The background opens /stx-add-account?requestId=…',
          popupStep,
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: ConnectAccountSelectors.StxAddAccountApproveBtn,
      others: [],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-add-account/rpc-add-account.spec.ts'],
    description:
      'Approver that registers (add mode, title "Add multisig account") or only verifies (verify mode, title "Verify multisig address") a Stacks multisig policy: it shows the multisig address, the signing account, the account name, the M-of-N signing policy and the public keys. The confirm button (ConnectAccountSelectors.StxAddAccountApproveBtn) reads "Verify" in verify mode or "Confirm" otherwise and is enabled only when the active account is one of the co-signers and the address could be derived (use-stx-add-account.ts canApprove). Add mode returns { added: true, accountId, address, publicKeys, threshold, role }; verify mode returns { added: false, address, publicKeys, threshold, role }. In add mode a failed registration sends -32603 "Failed to register policy" (use-stx-add-account.ts). "Deny" or closing the popup returns 4001. Params that fail the schema return -32602 before any popup (stx-add-account.ts). The origin needs no prior connection.',
  },
  {
    id: 'rpc-stx-sign-transaction',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxSignTransaction, ...stacksRpcSheets],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_signTransaction',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_signTransaction", { transaction, network? }) with a serialized unsigned transaction, or the legacy { txHex, stxAddress?, attachment?, accountIndex?, network? }',
          'The background opens /stx-sign-transaction?requestId=…',
          popupStep,
          'Single-sig requests show fee and nonce rows that open the nested edit-fee and edit-nonce sheets; broadcast-error is mounted under this route but never reached, because this screen does not broadcast',
        ],
      },
    ],
    gate: 'ledgerStacks',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [...stacksRpcSelectors],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-sign-transaction.spec.ts'],
    description:
      'Approver titled "Sign transaction" for a pre-built Stacks transaction: a token transfer shows the recipient and amount, a contract call shows the contract and arguments, a deploy shows the code, and post conditions are listed for non-transfer payloads. For a single-sig transaction the fee and nonce rows render and "Approve" overwrites the request\'s fee and nonce with the selected values before signing; a multisig transaction hides both rows and keeps what the request carries, and a sponsored transaction has its fee set to 0 before signing (rpc-stx-sign-transaction.tsx). "Approve" signs (single-sig or one multisig signature) without broadcasting and returns the same signed hex under both { transaction, txHex }; a signer failure sends -32600 "Error signing transaction". The spec sends the legacy txHex params in most tests and the SIP-30 transaction param only in "it works with SIP-30 formatted transactions". ' +
      connectedOriginNote,
  },
  {
    id: 'rpc-stx-call-contract',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxCallContract, ...stacksRpcSheets],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_callContract',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_callContract", { contract, functionName, functionArgs?, postConditions?, postConditionMode?, sponsored?, network? })',
          'The background opens /stx-call-contract?requestId=…',
          popupStep,
          sheetsStep,
        ],
      },
    ],
    gate: 'ledgerStacks',
    flags: [],
    preconditions: {
      session: 'signed-in',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [...stacksRpcSelectors, AccountSelectors.LedgerIndicator],
    },
    actions: ['OnboardingPage.signInWithTestAccount', 'OnboardingPage.signInWithLedgerAccount'],
    specs: [
      'apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-call-contract.spec.ts',
      'apps/extension/tests/specs/rpc-policy-propose/stx-propose.spec.ts',
      'apps/extension/tests/specs/rpc-policy-propose/per-origin-policy.spec.ts',
      'apps/extension/tests/specs/rpc-policy-propose/stx-propose-ledger.spec.ts',
      'apps/extension/tests/specs/rpc-policy-propose/debug-ledger.spec.ts',
    ],
    description:
      'Approver for a contract call: the contract address and name, the function and its arguments (each hex Clarity value decoded with deserializeCV and shown through cvToString; function-argument-list.tsx), the post conditions (or the allow-mode warning "This transaction can transfer any of your assets"), the signing account, and fee and nonce rows. The title is "Sign transaction" when post conditions are present, otherwise "Sign contract". The ready selector (the contract AddressDisplayer) renders only once the contract ABI loads, which setupMockApis supplies through mockStacksContractInterfaceRequests only for SP000000000000000000002Q6VF78.bns, living-leather and leo-token; any other contract renders "Not a valid contract" and the ready selector never appears, as in the two dull-sapphire-bird tests of rpc-stx-call-contract.spec.ts. An unknown function "Function not found" (contract-call-details.layout.tsx). ' +
      broadcastNote +
      ' When the origin is bound to a Stacks multisig policy the screen shows both the multisig and the signer and "Propose transaction" posts the proposal to the coordinator and returns { transaction, proposalId, status: "proposed" }; it is blocked with "Available balance insufficient" when the multisig cannot pay, and a failed proposal opens the broadcast-error sheet titled "Unable to propose transaction". ' +
      cancelOnlySpecNote +
      ' Approval is covered only by the propose specs: stx-propose.spec.ts, stx-propose-ledger.spec.ts and debug-ledger.spec.ts seed policyStateOverrides plus getConnectedTestAppPermissionsState({ policyId }); per-origin-policy.spec.ts creates the binding by approving getAddresses with allowPolicyAccounts first. They register mockFundedStacksAddress(context, stacksPolicy.address) to fund the multisig, stx-propose.spec.ts and per-origin-policy.spec.ts register mockProposeMultisigTransaction(context) for the coordinator, and stx-propose.spec.ts registers mockUnfundedStacksAddress(context, address) for the insufficient-balance and unfunded-cosigner cases. debug-ledger.spec.ts clicks "Propose transaction" on a Ledger wallet and checks the Ledger prompt. ' +
      ledgerIndicatorNote +
      ' ' +
      connectedOriginNote,
  },
  {
    id: 'rpc-stx-deploy-contract',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxDeployContract, ...stacksRpcSheets],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_deployContract',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_deployContract", { name, clarityCode, clarityVersion?, sponsored?, network? })',
          'The background opens /stx-deploy-contract?requestId=…',
          popupStep,
          sheetsStep,
        ],
      },
    ],
    gate: 'ledgerStacks',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [...stacksRpcSelectors],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-deploy-contract.spec.ts'],
    description:
      'Approver titled "Deploy contract": a post-conditions section ("Only fees will be transferred from your account or the transaction will abort." when there are none), then the signing account, the deploying address with the contract name and the Clarity code body, and fee and nonce rows. ' +
      broadcastNote +
      ' ' +
      cancelOnlySpecNote +
      ' ' +
      connectedOriginNote,
  },
  {
    id: 'rpc-stx-transfer-stx',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxTransferStx, ...stacksRpcSheets],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferStx',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_transferStx", { recipient, amount, memo?, sponsored?, network? })',
          'The background opens /stx-transfer-stx?requestId=…',
          popupStep,
          sheetsStep,
        ],
      },
    ],
    gate: 'ledgerStacks',
    flags: [],
    preconditions: {
      session: 'signed-in',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [AccountSelectors.LedgerIndicator],
    },
    actions: ['OnboardingPage.signInWithTestAccount', 'OnboardingPage.signInWithLedgerAccount'],
    specs: [
      'apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-transfer-stx.spec.tsx',
      'apps/extension/tests/specs/ledger/ledger-rpc-pairing.spec.ts',
    ],
    description:
      'Approver titled "Send token" for a dApp-initiated STX transfer: the signing account, the recipient and amount, the memo ("No memo" when empty) and fee and nonce rows. The fee editor lists the slow, standard and fast estimates plus a custom item (default-fees-list.tsx) and the chosen fee is what gets broadcast. ' +
      broadcastNote +
      ' The spec registers mockStacksBroadcastTransaction on the context in its approve tests; its insufficient-balance test registers mockEmptyStacksBalancesRequest plus mockEmptyStacksBalancesV2Request, which show "Available balance insufficient" in place of the "Cancel" and "Approve" buttons (get-transaction-actions.tsx). On a Ledger wallet whose device is not connected, "Approve" opens the Ledger flow: "Connect Stacks" then "Open Leather in full screen" opens a full-screen tab (#/?ledgerHandoff=…), the popup closes and the request ends with 4001 (ledger-rpc-pairing.spec.ts). ' +
      ledgerIndicatorNote +
      ' ' +
      connectedOriginNote,
  },
  {
    id: 'rpc-stx-transfer-sip9-nft',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxTransferSip9Nft, ...stacksRpcSheets],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferSip9Nft',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_transferSip9Nft", { asset, assetId, recipient, sponsored?, network? })',
          'The background opens /stx-transfer-sip9-nft?requestId=…',
          popupStep,
          sheetsStep,
        ],
      },
    ],
    gate: 'ledgerStacks',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [...stacksRpcSelectors],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-transfer-sip9-nft.spec.ts'],
    description:
      'Approver titled "Sign transaction" for a SIP-9 NFT transfer built by the wallet: it renders the generated post condition ("You will transfer <asset> or the transaction will abort."), the contract details with the recipient argument, the signing account and fee and nonce rows. ' +
      broadcastNote +
      ' ' +
      cancelOnlySpecNote +
      ' ' +
      connectedOriginNote,
  },
  {
    id: 'rpc-stx-transfer-sip10-ft',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStxTransferSip10Ft, ...stacksRpcSheets],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferSip10Ft',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_transferSip10Ft", { asset, amount, recipient, sponsored?, network? })',
          'The background opens /stx-transfer-sip10-ft?requestId=…',
          popupStep,
          sheetsStep,
        ],
      },
    ],
    gate: 'ledgerStacks',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.AddressDisplayer,
      others: [...stacksRpcSelectors],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-transfer-sip10-ft.spec.ts'],
    description:
      'Approver titled "Sign transaction" for a SIP-10 token transfer built by the wallet: it renders the exact-amount post condition ("You will transfer exactly <amount> <symbol> or the transaction will abort."), the transfer contract call details, the signing account and fee and nonce rows. ' +
      broadcastNote +
      ' ' +
      cancelOnlySpecNote +
      ' ' +
      connectedOriginNote,
  },
  {
    id: 'rpc-stacks-message-signing',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RpcStacksSignature],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_signMessage',
        steps: [
          'From localhost:3000 call window.LeatherProvider.request("stx_signMessage", { message, messageType?: "utf8" | "structured", domain?, network? })',
          'The background opens /sign-stacks-message?message=…&messageType=…&requestId=…',
          popupStep,
        ],
      },
      {
        kind: 'rpc',
        method: 'stx_signStructuredMessage',
        steps: [
          'Same popup for window.LeatherProvider.request("stx_signStructuredMessage", { message, domain })',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SettingsSelectors.CurrentAccountDisplayName,
      others: [ConnectAccountSelectors.WalletName],
    },
    actions: ['OnboardingPage.signInWithTestAccount'],
    specs: ['apps/extension/tests/specs/rpc-sip30-requests/rpc-stx-message-signing.spec.ts'],
    description:
      'Stacks message signing approver: the popup header with the current account, the origin, a "Sign message" heading, a preview of the utf8 message or of the structured message and its domain (with a hash toggle), and the "Cancel" and "Sign" buttons; on Ledger the button reads "Sign on Ledger" (stacks-sign-message-action.tsx). "Sign" returns { signature, publicKey }; "Cancel" returns 4001 "User denied signing" and closing the window returns 4001 "User rejected request" (use-rpc-sign-stacks-message.ts). Before any popup the background answers 16 "Wallet no longer available. Reconnect the app to an available wallet." for an origin that is not connected (methods-requiring-connected-wallet.ts; the spec seeds the connection with getConnectedTestAppPermissionsState), -32602 for schema errors, and, for stx_signMessage with messageType utf8 only, 7 "This is a Leather sign-in message and its Domain line does not match the requesting origin." (sign-stacks-message.ts). The spec covers utf8 and structured messages through stx_signMessage; stx_signStructuredMessage itself has no spec.',
  },
  {
    id: 'request-error',
    anchor: { kind: 'route' },
    routes: [RouteUrls.RequestError],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Only the signPsbt flow navigates here, with { title, message } in route state (use-rpc-sign-psbt.tsx; psbt-signer.tsx for "Failed request", an unparseable PSBT): a disallowed sighash ("Signing not permitted"), a bond descriptor that fails the bond-template check when the popup mounts or a proposal the coordinator rejects ("Unable to propose transaction"), a signing failure ("Failed to sign"), a finalize failure ("Failed to finalize tx"), a broadcast failure ("Failed to broadcast") or a PSBT that cannot be parsed ("Failed request")',
          'A failed Stacks proposal (coordinator error or Ledger cancel) renders the nested broadcast-error sheet instead, as does a failed Stacks broadcast, and sendTransfer uses /send/btc/error',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.GenericErrorTitle,
      others: [],
    },
    actions: [],
    specs: ['apps/extension/tests/specs/rpc-sign-psbt/sign-psbt.spec.ts'],
    description:
      'Generic error page reached from the PSBT signer: an error image, the title and message passed in route state, a help list ("Please report issue to requesting app", a support link) and a "Close window" link that closes the popup. The route itself has no title or message of its own, so opening #/request-error directly shows an empty error.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
