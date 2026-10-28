import { AppRoutes } from '@/shared/app-routes';
import { ApproverSelectors } from '@/shared/selectors/approver.selectors';
import { RpcBitcoinSelectors } from '@/shared/selectors/rpc-bitcoin.selectors';
import { RpcStacksSelectors } from '@/shared/selectors/rpc-stacks.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const stxRequestParamsSpec = 'apps/mobile/src/features/browser/approver-sheet/stx/utils.spec.ts';

const connectFirstStep =
  'Connect the dApp first with stx_getAddresses (rpc-stx-get-addresses) or getAddresses (rpc-get-addresses): BrowserApprover reads the account with getAccountIdFromConnectedApp, which throws "App is not connected" for an app that is only "recently_visited"';

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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: ApproverSelectors.ApproveButton,
      others: [RpcBitcoinSelectors.GetAddressesAccountSection, ApproverSelectors.CancelButton],
    },
    actions: [],
    specs: [],
    description:
      'Approver features/browser/approver-sheet/stx/get-addresses/get-addresses.tsx on the layout features/approver/layouts/get-addresses.layout.tsx it shares with getAddresses (rpc-get-addresses): the "Connect" header, the account section (RpcBitcoinSelectors.GetAddressesAccountSection) with features/approver/components/approver-account-card.tsx or a "Choose an account" cell, both opening features/account/account-selector/account-selector-sheet.tsx, and features/approver/components/approver-permissions.tsx ("This app would like to", "Request approval for transactions", "View your wallet balance & activity"). The initial selection is the app\'s accountId when the app is connected, else none, and Approve is disabled until an account is selected. Approve looks up the Stacks signer of the selected account and posts createRpcSuccessResponse("stx_getAddresses") with a one-item array { address, publicKey (hex), derivationPath } (packages/rpc/src/methods/stacks/stx-get-addresses.ts), then dispatches userConnectsApp (store/apps/apps.write.ts), which marks the origin "connected" with accountId "<fingerprint>/<accountIndex>", the account every other stx_* approver uses. After sendResult it also calls closeApprover, which posts a 4001 error for the same request id; the provider resolves on the first response for an id and removes its listener (packages/provider/src/init-inpage-provider.ts), so the dApp sees the success. The params network and allowPolicyAccounts are not read. No live data beyond the account balance in the account card. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/sign-transaction/sign-transaction.tsx; getTxHexFromRequest (sign-transaction/utils.ts) takes params.txHex when present, else params.transaction, and the hex is rendered as-is by features/approver/layouts/base-stx-tx-approver.layout.tsx (deserializeTransaction, so a malformed hex throws during render). The layout picks sections by payload type: a token transfer shows "You’ll send" (RpcStacksSelectors.StxTxOutcomeSection, features/approver/components/stacks-outcome.tsx: amount plus fee in STX with fiat), "To address" (RpcStacksSelectors.StxTxRecipientSection) and the memo card (RpcStacksSelectors.MemoSection, always disabled); a contract call shows the "Allow Mode" callout when the tx is in allow mode, the post-condition cards (RpcStacksSelectors.ContractCallPostConditionsSection), a SIP-9/SIP-10 "To address" (RpcStacksSelectors.SipRecipientSection), the function and contract id (RpcStacksSelectors.ContractCallSummarySection) and, under "Show advanced options", "Contract arguments" (RpcStacksSelectors.ContractCallArgsSection), as rpc-stx-call-contract describes; a deploy shows the contract name (RpcStacksSelectors.ContractDeploySummarySection) and the "Code" card under advanced options (rpc-stx-deploy-contract). Every payload gets the fee section (features/approver/stacks-fees.section.tsx: RpcStacksSelectors.StacksFeeSection opening approver-stacks-fee-sheet, or for a sponsored auth type RpcStacksSelectors.SponsoredFeeSection with features/approver/components/fees/sponsored-fee-card.tsx "Sponsored fee" and a "FREE" badge) and, under "Show advanced options", the nonce card (RpcStacksSelectors.NonceSection, approver-nonce-sheet); changing the fee or nonce rewrites the dApp\'s tx before signing. A tx in allow mode presents approver-allow-mode-warning-sheet on mount. The account is the connected app\'s (getAccountIdFromConnectedApp); params.stxAddress, accountIndex, attachment and network are not read, and the schema (packages/rpc/src/methods/stacks/stx-sign-transaction.ts) has no broadcast param: Approve only signs with the account\'s signer and posts { txHex, transaction } with the signed serialization, never a txid, then Browser.sendResult dismisses the sheet. Live data: STX fee estimates for the tx (useCalculateStacksTxFees), STX market data for fiat, the account balance, and for contract calls the contract interface and SIP-10 metadata. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/transfer-stx/transfer-stx.tsx, wrapped by browser-approver.tsx in stx/nonce-loader.tsx (renders nothing while useNextNonce loads the next nonce of the connected account on the current app network, shows the error toast "Failed to load latest nonce" and falls back to 0 on failure) and parsed with stxTransferStx.request.parse. useTransferStxTxHex (transfer-stx/hooks.ts) builds an unsigned StxTokenTransfer once on mount from params.recipient, params.amount (µSTX, the schema rejects non-integers with "Amount must be an integer describing µSTX"), params.memo and params.sponsored, with the loader nonce and getApproverFee (features/approver/utils.tsx: 0 when sponsored, else getDefaultFee, the middle default Stacks fee from @leather.io/query with a 2500 µSTX fallback) on the settings network; params.fee, nonce, address, network, postConditions and postConditionMode are not read. The sheet renders nothing until the tx hex exists, then features/approver/layouts/base-stx-tx-approver.layout.tsx: "You’ll send" (StacksOutcome with amount plus fee, getTotalSpendMoney), "To address" (features/approver/components/outcome-addresses-card.tsx), the fee card (approver-stacks-fee-sheet; "Sponsored fee" "FREE" via RpcStacksSelectors.SponsoredFeeSection when sponsored), the "Memo" card (features/approver/components/memo-card.tsx, passed disabled so it only displays params.memo) and under "Show advanced options" the "Nonce" card (approver-nonce-sheet). Approve signs with the account signer; a sponsored auth type posts { transaction } and skips broadcasting, otherwise useBroadcastStacksTransaction posts it to the settings network and the response is { transaction, txid }; a broadcast error ("Something went wrong" when no txid comes back) is shown as an error toast and rethrown, which swaps Approve for Retry. Browser.sendResult dismisses the sheet right after the result is posted, so features/approver/components/status-row/stx-status-row.tsx and the "Copy ID", "View details" and "Close window" buttons are not reached from the browser. Live data: next nonce, fee estimates, STX market data and balance; a non-sponsored reproduction needs a funded account on the settings network. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/transfer-sip9-nft/transfer-sip9-nft.tsx inside stx/nonce-loader.tsx (see rpc-stx-transfer-stx for the loader). useTransferSip9NftTxHex (transfer-sip9-nft/hooks.ts) splits params.asset with getStacksAssetStringParts and builds an unsigned contract call to <contract>.transfer with createSip9FnArgs (assetId, the account address as sender, params.recipient), the loader nonce, getApproverFee (default fee, 0 when sponsored) and one post-condition: the account will send the NFT identified by hexToCV(params.assetId); the settings network is used and params.fee, nonce, postConditions and postConditionMode are ignored. The layout (features/approver/layouts/base-stx-tx-approver.layout.tsx) renders the contract-call sections: features/approver/contract-call-post-conditions.section.tsx (RpcStacksSelectors.ContractCallPostConditionsSection) with features/approver/components/post-conditions/nft-post-condition.tsx, titled by formatPostConditionMessage (post-conditions.utils.ts) "You will transfer" above the asset name and "<truncated address>.<contractName>::<assetName>"; features/approver/components/sip10-recipient.tsx (RpcStacksSelectors.SipRecipientSection, "To address") once useGetContractInterface returns and getSip9TransferRecipient finds the recipient arg, else nothing; features/approver/contract-call-summary.section.tsx with the function name and contract id; the fee card; and under "Show advanced options" "Contract arguments" (argument names from the contract interface, else "Argument <n>") and the nonce. Approve, the sponsored branch, the broadcast and its errors are as in rpc-stx-transfer-stx. Live data: next nonce, fee estimates, the contract interface, STX market data. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/transfer-sip10-ft/transfer-sip10-ft.tsx inside stx/nonce-loader.tsx (see rpc-stx-transfer-stx). useTransferSip10FtTxHex (transfer-sip10-ft/hooks.ts) calls getTransferSip10TxHex (features/approver/utils.tsx: getApproverFee, default fee or 0 when sponsored), which runs createTransferSip10TxHex (packages/stacks/src/transactions/create-tx-hex.ts): a contract call to <contract>.transfer with createSip10FnArgs (params.amount, the account as sender, params.recipient, no memo) and one post-condition that the account will send exactly params.amount of the token. createTransferSip10TxHex does not forward the network it receives to generateStacksUnsignedTransaction. params.fee, nonce, postConditions and postConditionMode are ignored. The layout renders the contract-call sections (as in rpc-stx-transfer-sip9-nft) with features/approver/components/post-conditions/ft-post-condition.tsx: "You will transfer exactly" above the amount from useSip10FtMetadata (a loader while it fetches; without metadata a token cell with the contract name, contract id and the raw amount), and features/approver/components/sip10-recipient.tsx "To address" from getSip10TransferRecipient once the contract interface loads. Approve, the sponsored branch and broadcast errors are as in rpc-stx-transfer-stx. Live data: next nonce, fee estimates, SIP-10 metadata, the contract interface. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/sign-message/sign-message.tsx on features/approver/layouts/base-stx-message-approver.layout.tsx: header "Sign Message", the connected account in features/approver/components/approver-account-card.tsx (RpcStacksSelectors.StxMessageAccountSection, not pressable: the account is always the connected app\'s, getAccountIdFromConnectedApp) and, for messageType "utf8", "Message" above the raw text (RpcStacksSelectors.StxMessageSection). For messageType "structured" it renders features/approver/structured-message.section.tsx instead (RpcStacksSelectors.StxStructuredMessageSection; see rpc-stx-sign-structured-message). Approve signs with the account\'s Stacks signer: signMessage(message) for utf8, signStructuredMessage(deserializeCV(message), deserializeCV(domain)) for structured, and posts the SignatureData { signature, publicKey } (packages/rpc/src/methods/stacks/stx-sign-message.ts); params.network is not read. Browser.sendResult dismisses the sheet. No live data beyond the account balance. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/sign-structured-message/sign-structured-message.tsx, which passes the params to features/approver/layouts/base-stx-message-approver.layout.tsx as messageType "structured" (same header and account section as rpc-stx-sign-message). features/approver/structured-message.section.tsx (RpcStacksSelectors.StxStructuredMessageSection) deserializes the domain during render and shows "Message", the domain name on the left and "<version> <chain>" on the right (the chain-id mapped through stacksChainIdToCoreNetworkMode and capitalized, empty for an unknown chain id), a divider and the message value through features/approver/clarity-value.section.tsx: tuples as nested "key:" rows, uints as u<n>, ASCII strings quoted, UTF-8 strings as u"...", non-empty buffers as their hex string in JSON quotes (the printable-character test runs on the hex string, not the bytes), an empty buffer as 0x, optionals and responses as some/none/ok/err, lists in brackets. Approve calls signStructuredMessage(deserializeCV(message), deserializeCV(domain)) with the connected account\'s Stacks signer and posts { signature, publicKey }. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/call-contract/call-contract.tsx inside stx/nonce-loader.tsx (next nonce of the resolved account on the current app network, not params.network; "Failed to load latest nonce" toast and 0 on failure). The network is useGetStxNetworkFromRequestParams (shared/utils.ts): a known Stacks network name from params.network, else it throws "Wrong network supplied in the rpc request params: <name>", default the settings network. getStxRequestParams (stx/utils.ts) sets the fee (0 when sponsored, params.fee as whole µSTX, else getDefaultFee), the nonce (params.nonce when truthy, else the loader nonce), sponsored, postConditions and postConditionMode, and useCallContractTxHex (call-contract/hooks.ts) builds the unsigned contract call once on mount; nothing renders until it exists. features/approver/layouts/base-stx-tx-approver.layout.tsx then shows: features/approver/components/post-conditions/post-conditions-warning.tsx, a warning callout "This is an “Allow Mode” transaction" / "By approving, this app can move your assets anytime, without asking again. Only proceed if you fully trust it." when the tx postConditionMode is Allow (the same condition also presents approver-allow-mode-warning-sheet); the account card; features/approver/contract-call-post-conditions.section.tsx with one card per post-condition (ft-, nft-, stx-, staking- and pox-post-condition.tsx), titled by post-conditions.utils.ts relative to the connected app\'s account (or the settings current account when the app is not connected), not the params.address account: "You will transfer exactly" / "more than" / "less than" ..., "The contract will ...", "Another address <truncated> will ...", "... stake ..." for staking conditions and "<sender> must not perform any PoX actions" / "may perform PoX actions" / "must perform a PoX action" for PoX; features/approver/components/sip10-recipient.tsx "To address" when the contract interface marks it as a SIP-9 or SIP-10 transfer; features/approver/contract-call-summary.section.tsx (function name, "<address>.<contractName>"); the fee section (features/approver/stacks-fees.section.tsx, approver-stacks-fee-sheet, or "Sponsored fee" "FREE"); and under "Show advanced options" features/approver/contract-call-args.section.tsx "Contract arguments" (each arg as cvToString, labelled by the contract interface or "Argument <n>") and features/approver/nonce.section.tsx (approver-nonce-sheet). Fee and nonce edits go through features/approver/stx/hooks.ts, which toasts "Fee updated" / "Nonce updated" or "Failed to change fee" / "Failed to change nonce". Approve signs with the resolved account; a sponsored auth type posts { transaction } unbroadcast, otherwise it broadcasts to the request network and posts { transaction, txid }; errors toast the message and show Retry. Browser.sendResult dismisses the sheet right after posting, so features/approver/components/status-row/stx-status-row.tsx ("Pending", "Success", "Failed" from getStxTxStatus, covered by status-row/utils.spec.ts) is not reached from the browser. Live data: next nonce, fee estimates, contract interface, SIP-10 metadata for FT post-conditions, STX market data. stx/utils.spec.ts covers getStxRequestParams only (its account-resolution imports are mocked, so getAccountIdFromRequestParams is untested): the dApp fee as µSTX, fractional fees rounded to whole units, the default fee when the fee is absent or 0, a zero fee for any sponsored request, sponsored passed through, and params.nonce preferred over the loader nonce. No Maestro flow covers the sheet.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Approver features/browser/approver-sheet/stx/deploy-contract/deploy-contract.tsx inside stx/nonce-loader.tsx, with the same account, network (params.network or the settings network) and getStxRequestParams fee/nonce/post-condition handling as rpc-stx-call-contract. useDeployContractTxHex (deploy-contract/hooks.ts) builds an unsigned ContractDeploy with contractName params.name, codeBody params.clarityCode and params.clarityVersion; nothing renders until it exists. features/approver/layouts/base-stx-tx-approver.layout.tsx shows the account card, features/approver/contract-deploy-summary.section.tsx with the contract name, the fee section (approver-stacks-fee-sheet) and under "Show advanced options" features/approver/contract-deploy-code.section.tsx, whose features/approver/components/code-card.tsx shows "Code" above the source highlighted as Clarity in a horizontal scroll view, then the nonce card (approver-nonce-sheet). Deploys get neither the allow-mode callout nor the post-condition section (both are contract-call only), but a postConditionMode "allow" request still presents approver-allow-mode-warning-sheet on mount. Approve, the sponsored branch and broadcast errors are as in rpc-stx-call-contract. Live data: next nonce, fee estimates, STX market data; a reproduction needs a funded account. stx/utils.spec.ts covers the getStxRequestParams fee and nonce rules listed in rpc-stx-call-contract; no Maestro flow covers the sheet.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.StacksFeeSheet,
      others: [RpcStacksSelectors.StacksFeeSection],
    },
    actions: [],
    specs: [],
    description:
      'Sheet features/approver/components/fees/stacks-fee-sheet.tsx in fee-sheet.layout.tsx (RpcStacksSelectors.StacksFeeSheet on its Sheet.View), mounted by features/approver/stacks-fees.section.tsx in features/approver/layouts/base-stx-tx-approver.layout.tsx, so it opens from every Stacks transaction approver in the browser and from the in-app send approver (send-approver: features/send/forms/stx/stx-approver.tsx and sip10-approver.tsx render the same layout). The card (features/approver/components/fees/stacks-fee-card.tsx on base-fee-card.tsx) shows the fee type title and time, the fee in STX and fiat and a chevron; it is disabled once a txid is set, and a sponsored tx shows the "Sponsored fee" "FREE" card instead, with no sheet. The sheet lists four stacks-fee-option.tsx rows (base-fee-option.tsx): "Slow" "1–2 minutes", "Standard" "20–30 seconds", "Fast" "10 seconds" from estimates 0, 1 and 2 of useCalculateStacksTxFees (fee estimation for the tx byte length and payload, parsed with the @leather.io/query default min/max values), and a disabled "Custom" "Custom" row with the tx\'s current fee, each with the STX amount and its fiat value from STX market data, the selected type outlined. The initial selected type is computed once when the section mounts by matching the tx fee to the estimates, so it reads "Custom" when the estimates have not loaded yet (approver defaults come from getDefaultFee or the dApp fee). While the estimates are missing every option is 0 STX, and choosing one sets a zero fee. Choosing a row closes the sheet and calls onChangeFee, which sets the fee on the deserialized tx and re-serializes it, wrapped by features/approver/stx/hooks.ts ("Fee updated", or "Failed to change fee" on error). No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.NonceSheetInput,
      others: [RpcStacksSelectors.NonceSheetConfirmButton, RpcStacksSelectors.NonceSection],
    },
    actions: [],
    specs: [],
    description:
      'Sheet features/approver/components/nonce-sheet.tsx on components/sheets/input-sheet.layout.tsx (input RpcStacksSelectors.NonceSheetInput, button RpcStacksSelectors.NonceSheetConfirmButton), mounted by features/approver/nonce.section.tsx inside the "Show advanced options" block of features/approver/layouts/base-stx-tx-approver.layout.tsx, so every browser Stacks transaction approver and the in-app send approver (send-approver) reach it. The card (features/approver/components/nonce-card.tsx, RpcStacksSelectors.NonceSection) shows "Nonce" and the tx nonce and is disabled once a txid is set. The sheet reuses the memo copy: its title is "Add memo", the placeholder "Memo" and the button "Confirm". The input is initialised once with the nonce when the sheet mounts. Confirm calls onChangeNonce, which sets Number(value) as the tx nonce and re-serializes it, wrapped by features/approver/stx/hooks.ts ("Nonce updated", or "Failed to change nonce" on error). The approver\'s starting nonce comes from params.nonce (call and deploy only) or stx/nonce-loader.tsx (useNextNonce), and from the dApp\'s tx for stx_signTransaction. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: RpcStacksSelectors.MemoSheetInput,
      others: [RpcStacksSelectors.MemoSheetConfirmButton, RpcStacksSelectors.MemoSection],
    },
    actions: [],
    specs: [],
    description:
      'Sheet features/approver/components/memo-sheet.tsx on components/sheets/input-sheet.layout.tsx: title "Add memo", placeholder "Memo", button "Confirm" (input RpcStacksSelectors.MemoSheetInput, button RpcStacksSelectors.MemoSheetConfirmButton). It is mounted by features/approver/memo.section.tsx only for token-transfer payloads in features/approver/layouts/base-stx-tx-approver.layout.tsx (browser stx_transferStx and stx_signTransaction, and the in-app send approver send-approver for STX), but the layout always passes disabled, so features/approver/components/memo-card.tsx renders a non-pressable "Memo" row with the memo text and no chevron, and the sheet cannot be opened from the UI. Its onChangeMemo would rebuild the StxTokenTransfer with the same amount, fee, nonce, recipient and sponsored auth and the new memo, toasting "Memo updated" or "Failed to change memo" (features/approver/stx/hooks.ts). The two selectors therefore never render today; they exist for when the card is enabled. No Maestro flow or unit spec covers it.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
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
      'Sheet features/approver/components/allow-mode-warning-sheet/allow-mode-warning-sheet.tsx (with bullet-point.tsx and switch-check.tsx), mounted only by features/approver/layouts/base-stx-tx-approver.layout.tsx, which presents it from a mount effect when the deserialized tx has PostConditionMode.Allow. In the browser that is stx_callContract and stx_deployContract with params.postConditionMode "allow" (passed through getStxRequestParams) and stx_signTransaction when the dApp tx is in allow mode; the transfer approvers build their txs without a post-condition mode. It shows the title "Careful. This transaction could drain your wallet.", "By signing, this app can move your assets anytime.", the bullets "No confirmations will appear." and "If unsafe, your wallet could be drained.", the switch row "I’m aware of the risks", "Proceed to transaction" (disabled until the switch is on; it only dismisses the sheet) and the ghost button "Do not proceed", which dismisses the sheet and calls the approver\'s onCloseApprover (closeApprover in the browser, posting the 4001 rejection). Pan-down closing is disabled and the backdrop ignores presses. For contract calls the approver also shows the inline callout "This is an “Allow Mode” transaction" (rpc-stx-call-contract). getAddresses (rpc-get-addresses) does not present it. No Maestro flow or unit spec covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
