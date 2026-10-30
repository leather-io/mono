import { AppRoutes } from '@/shared/app-routes';
import { ApproverSelectors } from '@/shared/selectors/approver.selectors';
import { RpcBitcoinSelectors } from '@/shared/selectors/rpc-bitcoin.selectors';
import { RpcStacksSelectors } from '@/shared/selectors/rpc-stacks.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const stxRequestParamsSpec = 'apps/mobile/src/features/browser/approver-sheet/stx/utils.spec.ts';

const connectFirstStep =
  'Connect the dApp first with stx_getAddresses (rpc-stx-get-addresses) or getAddresses (rpc-get-addresses): BrowserApprover reads the account with getAccountIdFromConnectedApp, which throws "App is not connected" for an app that is only "recently_visited"';
const nonceLoaderNote =
  'nonce-loader.tsx wraps the approver: it renders nothing while the next nonce of the account loads on the settings network, and on failure shows the error toast "Failed to load latest nonce" and falls back to 0.';
const broadcastNote =
  'Approve signs with the account signer; a sponsored auth type posts { transaction } without broadcasting, otherwise it broadcasts and posts { transaction, txid }, and a broadcast error is shown as an error toast and swaps Approve for Retry.';
const dismissNote =
  'Browser.sendResult dismisses the sheet as soon as the result is posted, so the status row and the "Copy ID", "View details" and "Close window" buttons are not reached from the browser.';

export const rpcStacksFeatures = [
  {
    id: 'rpc-stx-get-addresses',
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
        method: 'stx_getAddresses',
        steps: [
          'Open the Browser tab (browser) and let the dApp page finish loading: BrowserApprover renders nothing for an origin missing from the apps store, and the page is added as "recently_visited" on navigation',
          'The dApp calls window.LeatherProvider.request("stx_getAddresses") (optional { network, allowPolicyAccounts }) through the injected @leather.io/provider/mobile; the approver sheet (browser-approver-sheet) slides up with the "Connect" header, the large site favicon and "Requested by <hostname>"',
          'A first-time origin shows "Choose an account" and a disabled Approve (ApproverSelectors.ApproveButton); tapping the account section (RpcBitcoinSelectors.GetAddressesAccountSection) opens the account selector sheet; a connected origin preselects its stored account',
          'Approve resolves [{ address, publicKey, derivationPath }] for the Stacks account and stores the app as connected; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"',
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
      'Approver for stx_getAddresses (stx/get-addresses/get-addresses.tsx on the get-addresses.layout.tsx it shares with getAddresses): the "Connect" header, the account section (RpcBitcoinSelectors.GetAddressesAccountSection) with the account card or a "Choose an account" cell, both opening the account-selector-sheet, and the permissions list ("This app would like to", "Request approval for transactions", "View your wallet balance & activity"). The initial selection is the app\'s account when it is connected, else none, and Approve is disabled until one is selected. Approve posts a one-item array { address, publicKey, derivationPath } for the Stacks signer of the selected account and dispatches userConnectsApp, which marks the origin "connected" with the accountId every other stx_* approver uses. After sendResult it also calls closeApprover, which posts a 4001 error for the same request id; the provider resolves on the first response for an id and removes its listener, so the dApp sees the success. The params network and allowPolicyAccounts are not read.',
  },
  {
    id: 'rpc-stx-sign-transaction',
    anchor: {
      kind: 'selectors',
      objects: ['RpcStacksSelectors.StxTxAccountSection', 'RpcStacksSelectors.StacksFeeSection'],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_signTransaction',
        steps: [
          connectFirstStep,
          'The dApp calls window.LeatherProvider.request("stx_signTransaction", { transaction: "<unsigned tx hex>" }) (SIP-30) or the legacy { txHex }; the tx should spend from the connected account',
          'The sheet shows the "Sign Transaction" header, "Requested by <hostname>", the account section (RpcStacksSelectors.StxTxAccountSection) and the sections for the payload type, the fee card (RpcStacksSelectors.StacksFeeSection, or RpcStacksSelectors.SponsoredFeeSection for a sponsored tx) and "Show advanced options"',
          'Approve (ApproverSelectors.ApproveButton) signs without broadcasting and resolves { txHex, transaction } (both the signed hex); Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a signing error swaps Approve for Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.StxTxAccountSection,
        RpcStacksSelectors.StacksFeeSection,
        RpcStacksSelectors.SponsoredFeeSection,
        RpcStacksSelectors.StxTxOutcomeSection,
        RpcStacksSelectors.ContractCallSummarySection,
        RpcStacksSelectors.ContractDeploySummarySection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver for stx_signTransaction (stx/sign-transaction/sign-transaction.tsx): it takes params.txHex when present, else params.transaction, and base-stx-tx-approver.layout.tsx deserializes the hex during render, so a malformed hex throws. The layout picks sections by payload type: a token transfer shows "You’ll send" (RpcStacksSelectors.StxTxOutcomeSection, amount plus fee with fiat), "To address" (RpcStacksSelectors.StxTxRecipientSection) and the memo card (RpcStacksSelectors.MemoSection, always disabled); a contract call shows the "Allow Mode" callout when the tx is in allow mode, the post-condition cards (RpcStacksSelectors.ContractCallPostConditionsSection), a SIP-9 or SIP-10 "To address" (RpcStacksSelectors.SipRecipientSection), the function and contract id (RpcStacksSelectors.ContractCallSummarySection) and "Contract arguments" under "Show advanced options" (RpcStacksSelectors.ContractCallArgsSection), as rpc-stx-call-contract describes; a deploy shows the contract name (RpcStacksSelectors.ContractDeploySummarySection) and the "Code" card under advanced options. Every payload gets the fee section (RpcStacksSelectors.StacksFeeSection opening the approver-stacks-fee-sheet, or RpcStacksSelectors.SponsoredFeeSection with "Sponsored fee" and a "FREE" badge for a sponsored auth type) and the nonce card under advanced options (RpcStacksSelectors.NonceSection, approver-nonce-sheet); changing the fee or nonce rewrites the dApp\'s tx before signing, and a tx in allow mode presents the approver-allow-mode-warning-sheet on mount. The account is the connected app\'s; params.stxAddress, accountIndex, attachment and network are not read, and there is no broadcast param: Approve only signs and posts { txHex, transaction } with the signed serialization, never a txid. Live data: the fee estimates, STX market data, the account balance, and for contract calls the contract interface and SIP-10 metadata.',
  },
  {
    id: 'rpc-stx-transfer-stx',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcStacksSelectors.StxTxOutcomeSection',
        'RpcStacksSelectors.StxTxRecipientSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferStx',
        steps: [
          connectFirstStep,
          'The dApp calls window.LeatherProvider.request("stx_transferStx", { recipient, amount: "<µSTX integer>", memo?, sponsored? })',
          'Once the next nonce loads and the unsigned tx is built, the sheet shows "Sign Transaction", the account, "You’ll send" (RpcStacksSelectors.StxTxOutcomeSection), "To address" (RpcStacksSelectors.StxTxRecipientSection), the fee card (RpcStacksSelectors.StacksFeeSection), the memo card (RpcStacksSelectors.MemoSection) and the nonce under "Show advanced options"',
          'Approve (ApproverSelectors.ApproveButton) signs and broadcasts, resolving { transaction, txid }; a sponsored request resolves { transaction } without broadcasting; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a broadcast failure shows the error message as a toast and Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.StxTxOutcomeSection,
        RpcStacksSelectors.StxTxRecipientSection,
        RpcStacksSelectors.StxTxAccountSection,
        RpcStacksSelectors.StacksFeeSection,
        RpcStacksSelectors.MemoSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver for stx_transferStx (stx/transfer-stx/transfer-stx.tsx). ' +
      nonceLoaderNote +
      ' useTransferStxTxHex (transfer-stx/hooks.ts) builds an unsigned token transfer once on mount from params.recipient, params.amount (µSTX; the schema rejects non-integers with "Amount must be an integer describing µSTX"), params.memo and params.sponsored, with the loader nonce and getApproverFee (0 when sponsored, else the middle default Stacks fee with a 2500 µSTX fallback) on the settings network; params.fee, nonce, address, network, postConditions and postConditionMode are not read. Nothing renders until the hex exists, then base-stx-tx-approver.layout.tsx shows "You’ll send" (RpcStacksSelectors.StxTxOutcomeSection, amount plus fee), "To address" (RpcStacksSelectors.StxTxRecipientSection), the fee card (approver-stacks-fee-sheet; "Sponsored fee" "FREE" via RpcStacksSelectors.SponsoredFeeSection when sponsored), the "Memo" card (RpcStacksSelectors.MemoSection, disabled, so it only displays params.memo) and the "Nonce" card under "Show advanced options" (approver-nonce-sheet). ' +
      broadcastNote +
      ' The broadcast goes to the settings network and "Something went wrong" is the error when no txid comes back. ' +
      dismissNote +
      ' Live data: next nonce, fee estimates, STX market data and balance; a non-sponsored reproduction needs a funded account on the settings network.',
  },
  {
    id: 'rpc-stx-transfer-sip9-nft',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcStacksSelectors.ContractCallPostConditionsSection',
        'RpcStacksSelectors.ContractCallSummarySection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferSip9Nft',
        steps: [
          connectFirstStep,
          'The dApp calls window.LeatherProvider.request("stx_transferSip9Nft", { recipient, asset: "<contractAddress>.<contractName>::<assetName>", assetId: "<hex-serialized Clarity token id>", sponsored? })',
          'Once the nonce loads, the sheet shows "Sign Transaction", the account, the post-condition card "You will transfer" with the NFT (RpcStacksSelectors.ContractCallPostConditionsSection), "To address" (RpcStacksSelectors.SipRecipientSection) when the contract interface resolves, the "transfer" call summary (RpcStacksSelectors.ContractCallSummarySection) and the fee card (RpcStacksSelectors.StacksFeeSection)',
          'Approve (ApproverSelectors.ApproveButton) signs and broadcasts, resolving { transaction, txid } ({ transaction } only when sponsored); Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a broadcast failure shows the error toast and Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.ContractCallPostConditionsSection,
        RpcStacksSelectors.SipRecipientSection,
        RpcStacksSelectors.ContractCallSummarySection,
        RpcStacksSelectors.StacksFeeSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver for stx_transferSip9Nft (stx/transfer-sip9-nft/transfer-sip9-nft.tsx). ' +
      nonceLoaderNote +
      ' useTransferSip9NftTxHex (transfer-sip9-nft/hooks.ts) splits params.asset and builds an unsigned call to <contract>.transfer with the token id, the account address as sender and params.recipient, the loader nonce, getApproverFee (default fee, 0 when sponsored) and one post-condition that the account will send the NFT; the settings network is used and params.fee, nonce, postConditions and postConditionMode are ignored. The layout renders the contract-call sections: the post-condition card (RpcStacksSelectors.ContractCallPostConditionsSection, "You will transfer" above the asset name and "<truncated address>.<contractName>::<assetName>"), "To address" (RpcStacksSelectors.SipRecipientSection) once the contract interface resolves and the recipient argument is found, the call summary with the function name and contract id (RpcStacksSelectors.ContractCallSummarySection), the fee card, and "Contract arguments" (named by the contract interface, else "Argument <n>") and the nonce under "Show advanced options". ' +
      broadcastNote +
      ' ' +
      dismissNote +
      ' Live data: next nonce, fee estimates, the contract interface, STX market data.',
  },
  {
    id: 'rpc-stx-transfer-sip10-ft',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcStacksSelectors.ContractCallPostConditionsSection',
        'RpcStacksSelectors.SipRecipientSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferSip10Ft',
        steps: [
          connectFirstStep,
          'The dApp calls window.LeatherProvider.request("stx_transferSip10Ft", { recipient, asset: "<contractAddress>.<contractName>::<assetName>", amount: "<base units>", sponsored? })',
          'Once the nonce loads, the sheet shows "Sign Transaction", the account, the post-condition card "You will transfer exactly" with the token amount (RpcStacksSelectors.ContractCallPostConditionsSection), "To address" (RpcStacksSelectors.SipRecipientSection) when the contract interface resolves, the "transfer" call summary and the fee card (RpcStacksSelectors.StacksFeeSection)',
          'Approve (ApproverSelectors.ApproveButton) signs and broadcasts, resolving { transaction, txid } ({ transaction } only when sponsored); Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a broadcast failure shows the error toast and Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.ContractCallPostConditionsSection,
        RpcStacksSelectors.SipRecipientSection,
        RpcStacksSelectors.ContractCallSummarySection,
        RpcStacksSelectors.StacksFeeSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver for stx_transferSip10Ft (stx/transfer-sip10-ft/transfer-sip10-ft.tsx). ' +
      nonceLoaderNote +
      ' useTransferSip10FtTxHex (transfer-sip10-ft/hooks.ts) calls getTransferSip10TxHex (features/approver/utils.tsx), which builds an unsigned call to <contract>.transfer with params.amount, the account as sender, params.recipient and no memo, plus one post-condition that the account will send exactly params.amount of the token; createTransferSip10TxHex (packages/stacks) does not forward the network it receives, and params.fee, nonce, postConditions and postConditionMode are ignored. The layout renders the contract-call sections as in rpc-stx-transfer-sip9-nft, with the FT post-condition card "You will transfer exactly" above the amount from the SIP-10 metadata (a loader while it fetches; without metadata a token cell with the contract name, contract id and the raw amount) and "To address" (RpcStacksSelectors.SipRecipientSection) once the contract interface loads. ' +
      broadcastNote +
      ' ' +
      dismissNote +
      ' Live data: next nonce, fee estimates, SIP-10 metadata, the contract interface.',
  },
  {
    id: 'rpc-stx-sign-message',
    anchor: { kind: 'selectors', objects: ['RpcStacksSelectors.StxMessageSection'] },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_signMessage',
        steps: [
          connectFirstStep,
          'The dApp calls window.LeatherProvider.request("stx_signMessage", { message }) (messageType defaults to "utf8"), or { messageType: "structured", domain: "<hex Clarity tuple>", message: "<hex Clarity value>" }',
          'The sheet shows "Sign Message", "Requested by <hostname>", the account (RpcStacksSelectors.StxMessageAccountSection) and "Message" with the text (RpcStacksSelectors.StxMessageSection) or the structured domain and value (RpcStacksSelectors.StxStructuredMessageSection)',
          'Approve (ApproverSelectors.ApproveButton) resolves { signature, publicKey }; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a signing error swaps Approve for Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.StxMessageAccountSection,
        RpcStacksSelectors.StxMessageSection,
        RpcStacksSelectors.StxStructuredMessageSection,
        ApproverSelectors.CancelButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver for stx_signMessage (stx/sign-message/sign-message.tsx on base-stx-message-approver.layout.tsx): the "Sign Message" header, the connected account card (RpcStacksSelectors.StxMessageAccountSection, not pressable: the account is always the connected app\'s) and, for messageType "utf8", "Message" above the raw text (RpcStacksSelectors.StxMessageSection); messageType "structured" renders the structured message section instead (RpcStacksSelectors.StxStructuredMessageSection, see rpc-stx-sign-structured-message). Approve signs with the account\'s Stacks signer, signMessage for utf8 and signStructuredMessage for structured, and posts { signature, publicKey }; params.network is not read. No live data beyond the account balance.',
  },
  {
    id: 'rpc-stx-sign-structured-message',
    anchor: { kind: 'selectors', objects: ['RpcStacksSelectors.StxStructuredMessageSection'] },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_signStructuredMessage',
        steps: [
          connectFirstStep,
          'The dApp calls window.LeatherProvider.request("stx_signStructuredMessage", { domain: "<hex Clarity tuple { name, version, chain-id }>", message: "<hex Clarity value>" })',
          'The sheet shows "Sign Message", the account (RpcStacksSelectors.StxMessageAccountSection) and "Message" with the domain name, version and chain, a divider and the decoded value (RpcStacksSelectors.StxStructuredMessageSection)',
          'Approve (ApproverSelectors.ApproveButton) resolves { signature, publicKey }; Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a signing error swaps Approve for Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.StxStructuredMessageSection,
        RpcStacksSelectors.StxMessageAccountSection,
        ApproverSelectors.CancelButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'Approver for stx_signStructuredMessage (stx/sign-structured-message/sign-structured-message.tsx), which passes the params to base-stx-message-approver.layout.tsx as messageType "structured" (same header and account section as rpc-stx-sign-message). structured-message.section.tsx (RpcStacksSelectors.StxStructuredMessageSection) deserializes the domain during render and shows "Message", the domain name on the left and "<version> <chain>" on the right (the chain id mapped to a capitalised network mode, empty for an unknown id), a divider and the message value (clarity-value.section.tsx): tuples as nested "key:" rows, uints as u<n>, ASCII strings quoted, UTF-8 strings as u"...", non-empty buffers as their hex string in JSON quotes (the printable-character test runs on the hex string, not the bytes), an empty buffer as 0x, optionals and responses as some/none/ok/err, lists in brackets. Approve calls signStructuredMessage with the deserialized message and domain and posts { signature, publicKey }.',
  },
  {
    id: 'rpc-stx-call-contract',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcStacksSelectors.ContractCallSummarySection',
        'RpcStacksSelectors.ContractCallArgsSection',
        'RpcStacksSelectors.ContractCallPostConditionsSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_callContract',
        steps: [
          'Connect the dApp first (rpc-stx-get-addresses or rpc-get-addresses), or pass params.address of an account in the wallet: getAccountIdFromRequestParams uses the signer with that address ("No signer found" otherwise) and falls back to the connected app\'s account ("App is not connected" for a recently visited app)',
          'The dApp calls window.LeatherProvider.request("stx_callContract", { contract: "<address>.<name>", functionName, functionArgs: ["<hex Clarity value>", ...], fee?, nonce?, postConditions?: ["<hex>"], postConditionMode?: "allow" | "deny" | "originator", sponsored?, network? })',
          'Once the nonce loads, the sheet shows "Sign Transaction", the "Allow Mode" callout and the allow-mode warning sheet when postConditionMode is "allow", the account, the post-condition cards (RpcStacksSelectors.ContractCallPostConditionsSection), the function and contract (RpcStacksSelectors.ContractCallSummarySection), the fee card (RpcStacksSelectors.StacksFeeSection) and "Show advanced options" with "Contract arguments" (RpcStacksSelectors.ContractCallArgsSection) and the nonce (RpcStacksSelectors.NonceSection)',
          'Approve (ApproverSelectors.ApproveButton) signs and broadcasts, resolving { transaction, txid } ({ transaction } only when sponsored); Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a broadcast failure shows the error message as a toast and Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.ContractCallSummarySection,
        RpcStacksSelectors.ContractCallArgsSection,
        RpcStacksSelectors.ContractCallPostConditionsSection,
        RpcStacksSelectors.SipRecipientSection,
        RpcStacksSelectors.StxTxAccountSection,
        RpcStacksSelectors.StacksFeeSection,
        RpcStacksSelectors.SponsoredFeeSection,
        RpcStacksSelectors.NonceSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [stxRequestParamsSpec],
    description:
      'Approver for stx_callContract (stx/call-contract/call-contract.tsx). ' +
      nonceLoaderNote +
      ' The network is params.network when it names a known Stacks network (else "Wrong network supplied in the rpc request params: <name>" is thrown), default the settings network. getStxRequestParams (stx/utils.ts) sets the fee (0 when sponsored, params.fee as whole µSTX, else the default fee), the nonce (params.nonce when truthy, else the loader nonce), sponsored, postConditions and postConditionMode, and useCallContractTxHex builds the unsigned call once on mount; nothing renders until it exists. base-stx-tx-approver.layout.tsx then shows the warning callout "This is an “Allow Mode” transaction" / "By approving, this app can move your assets anytime, without asking again. Only proceed if you fully trust it." when the tx is in allow mode (the same condition presents the approver-allow-mode-warning-sheet) and the account card (RpcStacksSelectors.StxTxAccountSection). The post-condition cards (RpcStacksSelectors.ContractCallPostConditionsSection) are titled relative to the connected app\'s account, or the settings current account when the app is not connected, not the params.address account: "You will transfer exactly" / "more than" / "less than" ..., "The contract will ...", "Another address <truncated> will ...", staking wording, and "<sender> must not perform any PoX actions" / "may perform PoX actions" / "must perform a PoX action". Then come "To address" (RpcStacksSelectors.SipRecipientSection) when the contract interface marks the call as a SIP-9 or SIP-10 transfer, the function name and "<address>.<contractName>" (RpcStacksSelectors.ContractCallSummarySection), the fee section (RpcStacksSelectors.StacksFeeSection, approver-stacks-fee-sheet, or "Sponsored fee" "FREE"), and under "Show advanced options" "Contract arguments" (RpcStacksSelectors.ContractCallArgsSection, each arg as cvToString, labelled by the contract interface or "Argument <n>") and the nonce card (RpcStacksSelectors.NonceSection, approver-nonce-sheet). Fee and nonce edits toast "Fee updated" / "Nonce updated" or "Failed to change fee" / "Failed to change nonce" (stx/hooks.ts). ' +
      broadcastNote +
      ' The broadcast goes to the request network. ' +
      dismissNote +
      ' Live data: next nonce, fee estimates, contract interface, SIP-10 metadata for FT post-conditions, STX market data. stx/utils.spec.ts covers getStxRequestParams only (the account resolution is mocked): the dApp fee as µSTX, fractional fees rounded, the default fee when the fee is absent or 0, a zero fee for any sponsored request, and params.nonce preferred over the loader nonce.',
  },
  {
    id: 'rpc-stx-deploy-contract',
    anchor: {
      kind: 'selectors',
      objects: [
        'RpcStacksSelectors.ContractDeploySummarySection',
        'RpcStacksSelectors.ContractDeployCodeSection',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_deployContract',
        steps: [
          'Connect the dApp first (rpc-stx-get-addresses or rpc-get-addresses), or pass params.address of an account in the wallet (getAccountIdFromRequestParams, as in rpc-stx-call-contract)',
          'The dApp calls window.LeatherProvider.request("stx_deployContract", { name, clarityCode, clarityVersion?, fee?, nonce?, postConditions?, postConditionMode?, sponsored?, network? })',
          'Once the nonce loads, the sheet shows "Sign Transaction", the account, the contract name (RpcStacksSelectors.ContractDeploySummarySection), the fee card (RpcStacksSelectors.StacksFeeSection) and under "Show advanced options" the "Code" card (RpcStacksSelectors.ContractDeployCodeSection) and the nonce',
          'Approve (ApproverSelectors.ApproveButton) signs and broadcasts, resolving { transaction, txid } ({ transaction } only when sponsored); Cancel (ApproverSelectors.CancelButton) rejects with code 4001 "User rejected request"; a broadcast failure shows the error toast and Retry (ApproverSelectors.RetryButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [
        RpcStacksSelectors.ContractDeploySummarySection,
        RpcStacksSelectors.ContractDeployCodeSection,
        RpcStacksSelectors.StxTxAccountSection,
        RpcStacksSelectors.StacksFeeSection,
        RpcStacksSelectors.NonceSection,
        ApproverSelectors.CancelButton,
        ApproverSelectors.RetryButton,
      ],
    },
    actions: [],
    specs: [stxRequestParamsSpec],
    description:
      'Approver for stx_deployContract (stx/deploy-contract/deploy-contract.tsx), with the same loader, account, network and getStxRequestParams handling as rpc-stx-call-contract. useDeployContractTxHex builds an unsigned deploy with params.name, params.clarityCode and params.clarityVersion; nothing renders until it exists. The layout shows the account card, the contract name (RpcStacksSelectors.ContractDeploySummarySection), the fee section (approver-stacks-fee-sheet) and under "Show advanced options" the "Code" card (RpcStacksSelectors.ContractDeployCodeSection, the source highlighted as Clarity in a horizontal scroll view) and the nonce card (approver-nonce-sheet). Deploys get neither the allow-mode callout nor the post-condition section, but a postConditionMode "allow" request still presents the approver-allow-mode-warning-sheet on mount. ' +
      broadcastNote +
      ' ' +
      dismissNote +
      ' Live data: next nonce, fee estimates, STX market data; a reproduction needs a funded account. stx/utils.spec.ts covers the fee and nonce rules listed in rpc-stx-call-contract.',
  },
  {
    id: 'approver-stacks-fee-sheet',
    anchor: { kind: 'selectors', objects: ['RpcStacksSelectors.StacksFeeSheet'] },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_callContract',
        steps: [
          'Open any non-sponsored Stacks transaction approver from a connected dApp: rpc-stx-call-contract, rpc-stx-deploy-contract, rpc-stx-transfer-stx, rpc-stx-transfer-sip9-nft, rpc-stx-transfer-sip10-ft or rpc-stx-sign-transaction',
          'Tap the fee card (RpcStacksSelectors.StacksFeeSection); the fee sheet (RpcStacksSelectors.StacksFeeSheet) slides up over the approver',
          'Tap "Slow", "Standard" or "Fast": the sheet closes, the tx fee is replaced, the card updates and the toast "Fee updated" shows; "Custom" is disabled',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.StacksFeeSheet,
      others: [RpcStacksSelectors.StacksFeeSection],
    },
    actions: [],
    specs: [],
    description:
      'The Stacks fee sheet (fees/stacks-fee-sheet.tsx, RpcStacksSelectors.StacksFeeSheet), mounted by stacks-fees.section.tsx in base-stx-tx-approver.layout.tsx, so it opens from every Stacks transaction approver in the browser and from the in-app send-approver for STX and SIP-10. The card (stacks-fee-card.tsx) shows the fee type and time, the fee in STX and fiat and a chevron; it is disabled once a txid is set, and a sponsored tx shows the "Sponsored fee" "FREE" card instead, with no sheet. The sheet lists "Slow" "1–2 minutes", "Standard" "20–30 seconds" and "Fast" "10 seconds" from estimates 0, 1 and 2 of useCalculateStacksTxFees, plus a disabled "Custom" row with the tx\'s current fee, each with the STX amount and its fiat value, the selected type outlined. The selected type is computed once when the section mounts by matching the tx fee to the estimates, so it reads "Custom" when the estimates have not loaded yet; while they are missing every option is 0 STX, and choosing one sets a zero fee. Choosing a row closes the sheet and sets the fee on the re-serialized tx, toasting "Fee updated" or "Failed to change fee" (stx/hooks.ts).',
  },
  {
    id: 'approver-nonce-sheet',
    anchor: {
      kind: 'selectors',
      objects: ['RpcStacksSelectors.NonceSheetInput', 'RpcStacksSelectors.NonceSheetConfirmButton'],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_callContract',
        steps: [
          'Open any Stacks transaction approver from a connected dApp (rpc-stx-call-contract, rpc-stx-deploy-contract, rpc-stx-transfer-stx, rpc-stx-transfer-sip9-nft, rpc-stx-transfer-sip10-ft, rpc-stx-sign-transaction)',
          'Tap "Show advanced options", then the "Nonce" card (RpcStacksSelectors.NonceSection); the input sheet slides up with the current nonce in the focused input (RpcStacksSelectors.NonceSheetInput)',
          'Edit the value and tap "Confirm" (RpcStacksSelectors.NonceSheetConfirmButton): the sheet closes, the tx nonce is replaced and the toast "Nonce updated" shows',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.NonceSheetInput,
      others: [RpcStacksSelectors.NonceSheetConfirmButton, RpcStacksSelectors.NonceSection],
    },
    actions: [],
    specs: [],
    description:
      'The nonce input sheet (nonce-sheet.tsx on input-sheet.layout.tsx; input RpcStacksSelectors.NonceSheetInput, button RpcStacksSelectors.NonceSheetConfirmButton), mounted by nonce.section.tsx inside the "Show advanced options" block of base-stx-tx-approver.layout.tsx, so every browser Stacks transaction approver and the in-app send-approver reach it. The card (RpcStacksSelectors.NonceSection) shows "Nonce" and the tx nonce and is disabled once a txid is set. The sheet reuses the memo copy: its title is "Add memo", the placeholder "Memo" and the button "Confirm". The input is initialised once with the nonce when the sheet mounts; Confirm sets Number(value) as the nonce on the re-serialized tx, toasting "Nonce updated" or "Failed to change nonce" (stx/hooks.ts). The starting nonce comes from params.nonce (call and deploy only) or the nonce loader, and from the dApp\'s tx for stx_signTransaction.',
  },
  {
    id: 'approver-memo-sheet',
    anchor: {
      kind: 'selectors',
      objects: ['RpcStacksSelectors.MemoSheetInput', 'RpcStacksSelectors.MemoSheetConfirmButton'],
    },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_transferStx',
        steps: [
          'Open a token-transfer approver (rpc-stx-transfer-stx, or rpc-stx-sign-transaction with a token-transfer tx)',
          'The "Memo" card (RpcStacksSelectors.MemoSection) shows the memo but is rendered disabled, so tapping it does not open the sheet; no current path presents it',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.MemoSheetInput,
      others: [RpcStacksSelectors.MemoSheetConfirmButton, RpcStacksSelectors.MemoSection],
    },
    actions: [],
    specs: [],
    description:
      'The memo input sheet (memo-sheet.tsx on input-sheet.layout.tsx: title "Add memo", placeholder "Memo", button "Confirm"; RpcStacksSelectors.MemoSheetInput and MemoSheetConfirmButton). memo.section.tsx mounts it only for token-transfer payloads in base-stx-tx-approver.layout.tsx (browser stx_transferStx and stx_signTransaction, and the in-app send-approver for STX), but the layout always passes disabled, so the "Memo" card (RpcStacksSelectors.MemoSection) renders a non-pressable row with the memo text and no chevron, and the sheet cannot be opened from the UI. Its onChangeMemo would rebuild the transfer with the same amount, fee, nonce, recipient and sponsored auth and the new memo, toasting "Memo updated" or "Failed to change memo". The two sheet selectors therefore never render today.',
  },
  {
    id: 'approver-allow-mode-warning-sheet',
    anchor: { kind: 'selectors', objects: ['RpcStacksSelectors.AllowModeWarningSheet'] },
    routes: [],
    startRoute: AppRoutes.Browser,
    open: [],
    params: [],
    entry: [
      {
        kind: 'rpc',
        method: 'stx_callContract',
        steps: [
          'From a connected dApp call window.LeatherProvider.request("stx_callContract", { contract, functionName, functionArgs, postConditionMode: "allow" }) (or stx_deployContract with postConditionMode "allow", or stx_signTransaction with an allow-mode tx)',
          'When the approver mounts, the warning sheet (RpcStacksSelectors.AllowModeWarningSheet) is presented over it; it cannot be closed by panning down or tapping the backdrop',
          'Toggle "I’m aware of the risks" (RpcStacksSelectors.AllowModeRisksSwitch) to enable "Proceed to transaction" (RpcStacksSelectors.AllowModeProceedButton), which closes the sheet and leaves the approver open; "Do not proceed" (RpcStacksSelectors.AllowModeDoNotProceedButton) closes it and rejects the request with code 4001 "User rejected request"',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.AllowModeWarningSheet,
      others: [
        RpcStacksSelectors.AllowModeRisksSwitch,
        RpcStacksSelectors.AllowModeProceedButton,
        RpcStacksSelectors.AllowModeDoNotProceedButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The allow-mode warning sheet (allow-mode-warning-sheet/allow-mode-warning-sheet.tsx), mounted only by base-stx-tx-approver.layout.tsx, which presents it from a mount effect when the deserialized tx has PostConditionMode.Allow: stx_callContract and stx_deployContract with params.postConditionMode "allow" and stx_signTransaction with a dApp tx in allow mode; the transfer approvers build their txs without a post-condition mode. It shows "Careful. This transaction could drain your wallet.", "By signing, this app can move your assets anytime.", the bullets "No confirmations will appear." and "If unsafe, your wallet could be drained.", the switch row "I’m aware of the risks" (RpcStacksSelectors.AllowModeRisksSwitch), "Proceed to transaction" (RpcStacksSelectors.AllowModeProceedButton, disabled until the switch is on; it only dismisses the sheet) and the ghost "Do not proceed" (RpcStacksSelectors.AllowModeDoNotProceedButton), which dismisses the sheet and closes the approver with the 4001 rejection. Pan-down closing is disabled and the backdrop ignores presses. For contract calls the approver also shows the inline "Allow Mode" callout (rpc-stx-call-contract); getAddresses does not present it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
