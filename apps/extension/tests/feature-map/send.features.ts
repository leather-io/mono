import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const sendBtcSpec = 'apps/extension/tests/specs/send/send-btc.spec.ts';
const sendBtcSendMaxSpec = 'apps/extension/tests/specs/send/send-btc-send-max.spec.ts';
const sendBtcMixedUtxosSpec = 'apps/extension/tests/specs/send/send-btc-mixed-utxos.spec.ts';
const sendBtcSpendSourcesSpec = 'apps/extension/tests/specs/send/send-btc-spend-sources.spec.ts';
const sendStxSpec = 'apps/extension/tests/specs/send/send-stx.spec.ts';
const sendSip10Spec = 'apps/extension/tests/specs/send/send-sip10.spec.ts';
const sendRecipientAccountsSpec = 'apps/extension/tests/specs/send/send-recipient-accounts.spec.ts';
const sendStxPolicyProposeSpec = 'apps/extension/tests/specs/send/send-stx-policy-propose.spec.ts';
const rbfBtcSpec = 'apps/extension/tests/specs/manage-transaction/rbf-btc.spec.ts';
const rpcSendTransferSpec =
  'apps/extension/tests/specs/rpc-send-transfer/rpc-send-transfer.spec.ts';

const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

const homeSendSteps = [
  'On home at full-page width click "Send" (HomePageSelectors.SendCryptoAssetBtn); at popup width click "Transfer" (that button carries HomePageSelectors.ReceiveCryptoAssetBtn) and then the "Send" row of the sheet. A Ledger wallet in the popup opens /send in a new full-page tab instead (transfer-buttons.tsx)',
] as const;

export const sendFeatures = [
  {
    id: 'send-choose-asset',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SendCryptoAsset],
    params: [],
    entry: [
      { kind: 'nav', steps: [...homeSendSteps] },
      { kind: 'deepLink', steps: ['Open #/send with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SendCryptoAssetSelectors.ChooseAssetToSendPage,
      others: [
        CoreAssetSelectors.BtcAsset,
        CoreAssetSelectors.StxAsset,
        SharedComponentsSelectors.HeaderBackBtn,
      ],
    },
    actions: [
      'SendPage.selectBtcAndGoToSendForm',
      'SendPage.selectStxAndGoToSendForm',
      'SendPage.selectSip10AndGoToSendForm',
      'SendPage.goBack',
    ],
    specs: [
      sendBtcSpec,
      sendStxSpec,
      sendSip10Spec,
      sendBtcMixedUtxosSpec,
      sendBtcSpendSourcesSpec,
      sendBtcSendMaxSpec,
      sendRecipientAccountsSpec,
      sendStxPolicyProposeSpec,
    ],
    description:
      'The list of enabled tokens under a "choose asset / to send" heading (two lines, choose-crypto-asset.tsx). Picking BTC goes to /send/btc, STX to /send/stx and a SIP-10 token to /send/<assetName>/<contractAddress.contractName> (assetIdToSendPath in packages/features token-types.ts). On a Ledger wallet with no Bitcoin account picking BTC goes to /send/btc/disabled (claimed by send-btc-form) instead of the form (use-navigate-to-send-form.ts). The token-details "Send" pill (TokenDetailsSelectors.TokenDetailsSendButton) calls the same useNavigateToSendForm, so it skips this chooser and lands on the token\'s form or on /send/btc/disabled. The header back button goes to the previous page.',
  },
  {
    id: 'send-btc-form',
    anchor: { kind: 'route' },
    routes: [
      RouteUrls.SendCryptoAssetForm,
      RouteUrls.SendCryptoAssetFormRecipientAccounts,
      RouteUrls.SendBtcDisabled,
    ],
    params: [{ name: 'symbol', example: 'btc' }],
    entry: [
      { kind: 'nav', steps: [...homeSendSteps, 'On /send pick BTC'] },
      {
        kind: 'nav',
        steps: [
          'On the BTC token details page click "Send" (TokenDetailsSelectors.TokenDetailsSendButton); it skips the chooser',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/send/btc with an unlocked wallet'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'testnet4',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SendCryptoAssetSelectors.SendPageReady,
      others: [
        SendCryptoAssetSelectors.SendForm,
        SharedComponentsSelectors.CardAvailableBalance,
        SendCryptoAssetSelectors.AmountFieldInput,
        SendCryptoAssetSelectors.AmountFieldInputErrorLabel,
        SendCryptoAssetSelectors.SendMaxBtn,
        SendCryptoAssetSelectors.RecipientSelectRecipientTypeDropdown,
        SendCryptoAssetSelectors.RecipientSelectFieldBnsName,
        SendCryptoAssetSelectors.RecipientFieldInput,
        SendCryptoAssetSelectors.FormFieldInputErrorLabel,
        SendCryptoAssetSelectors.RecipientChooseAccountButton,
        SendCryptoAssetSelectors.PreviewSendTxBtn,
        SwitchAccountSelectors.WalletHeaderName,
      ],
    },
    actions: [
      'SendPage.selectBtcAndGoToSendForm',
      'SendPage.waitForSendPageReady',
      'SendPage.previewBitcoinTransaction',
      'NetworkPage.selectTestnet',
      'OnboardingPage.signInWithMixedSoftwareAndLedgerWallets',
    ],
    specs: [
      sendBtcSpec,
      sendBtcSendMaxSpec,
      sendBtcMixedUtxosSpec,
      sendBtcSpendSourcesSpec,
      sendRecipientAccountsSpec,
    ],
    description:
      'The BTC send form at /send/btc: amount with "Send max", recipient by address or BNS name (the dropdown switches the field; its recipient-select-field-bnsName item only renders while the dropdown is open after recipient-select-field-dropdown-button is clicked; a BNS name resolves to the name\'s bitcoinPayment address, bitcoin-recipient-field.tsx) with a "Select account" sheet (nested recipient-accounts route, opened by recipient-choose-account-button) listing the wallet\'s own accounts grouped per wallet plus Bitcoin multisig policies; the wallet-header-name headers only render inside that sheet (recipient-accounts-dialog.tsx). Validation needs the UTXO list, so the Send max link only renders once it has loaded and spendable BTC is above zero; send max combines taproot and native segwit UTXOs and recalculates when the recipient address type changes. send-page-ready is an empty hidden marker (wait for it attached, not visible) that only renders when the account has spendable BTC (btc-send-form.tsx), so it never appears for an empty account. On a testnet the form shows a "Funds have no value" callout. "Continue" goes to /send/btc/choose-fee. Networks: send-btc.spec.ts switches to testnet4 (NetworkPage.selectTestnet); the other specs stay on mainnet. send-btc-mixed-utxos.spec.ts and send-btc-spend-sources.spec.ts register mockMixedUtxosForSend (one taproot and one native segwit UTXO, 0.005 BTC available) and spend-sources also mockNativeSegwitOnlyUtxosForSend; send-btc-send-max.spec.ts registers mockMixedUtxoRequests(page, [taproot, native segwit UTXOs]). On a Ledger wallet with no Bitcoin account the chooser lands on /send/btc/disabled, a full-page GenericError titled "Temporarily disabled" whose "Close window" link navigates to /send (send-btc-disabled.tsx). No gate wraps these routes in the router, but AccountGate on the chooser and Home covers normal navigation.',
  },
  {
    id: 'send-btc-choose-fee',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.SendBtcChooseFee],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /send/btc fill amount and recipient, click "Continue"'],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-in', network: 'testnet4', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.FeesListItem,
      others: [
        SharedComponentsSelectors.FeesListItemFeeValue,
        SharedComponentsSelectors.FeeTabRecommended,
        SharedComponentsSelectors.FeeTabCustom,
        ActivitySelectors.TransactionActionFeeInput,
        SendCryptoAssetSelectors.PreviewSendTxBtn,
        SharedComponentsSelectors.HeaderBackBtn,
      ],
    },
    actions: ['SendPage.previewBitcoinTransaction'],
    specs: [sendBtcSpec, sendBtcMixedUtxosSpec, sendBtcSpendSourcesSpec],
    description:
      'Fee picker for a BTC send with two tabs (choose-fee-tabs.tsx). The "Recommended" tab (tab-recommended) lists Low, Standard and High estimates, each row showing its fee value. The "Custom" tab (tab-custom) holds the "sats/vB" input (ActivitySelectors.TransactionActionFeeInput, bitcoin-custom-fee-input.tsx) and its own "Use custom fee" button (preview-send-tx-btn); the custom input only renders after that tab is clicked, unless there are no fee estimates, in which case the page opens on the Custom tab and fee-list-item is absent (btc-choose-fee.tsx). Picking a tier signs the transaction before navigating to /send/btc/confirm (use-btc-choose-fee.tsx), so a Ledger wallet starts the Ledger signing flow here. For a Bitcoin multisig policy account it builds an unsigned multisig PSBT and goes to /send/btc/confirm in propose mode. A non-finite fee, a policy account the current account does not sign for, a failure building the multisig PSBT, or a signing error goes to /send/btc/error. When the balance cannot cover a tier the page shows "Fee is too expensive for available bitcoin balance" (insufficient-balance-error.tsx); "Insufficient funds" is the custom input\'s own error. send-btc.spec.ts reaches it on testnet4; the mixed-utxos and spend-sources specs reach it on mainnet with mockMixedUtxosForSend. Reached only from the form because the amount and recipient live in route state. The header back button goes to the previous page.',
  },
  {
    id: 'send-btc-confirmation',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.SendBtcConfirmation],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /send/btc/choose-fee pick a fee tier (for example Low)'],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SendCryptoAssetSelectors.ConfirmationDetails,
      others: [
        SendCryptoAssetSelectors.ConfirmationDetailsRecipient,
        SendCryptoAssetSelectors.ConfirmationDetailsFee,
        SharedComponentsSelectors.InfoCardAssetValue,
        SharedComponentsSelectors.InfoCardRowValue,
        SharedComponentsSelectors.InfoCardButton,
        SharedComponentsSelectors.AddressDisplayer,
        SendCryptoAssetSelectors.SpendSourcesTaprootCallout,
        SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow,
        SendCryptoAssetSelectors.SpendSourcesTaprootRow,
      ],
    },
    actions: ['SendPage.clickInfoCardButton'],
    specs: [sendBtcSpec, sendBtcSpendSourcesSpec, sendBtcMixedUtxosSpec],
    description:
      'The BTC review screen: amount, recipient, fee and estimated confirmation time, plus per-address-type spend source rows and a callout when taproot UTXOs are spent. The taproot callout needs taproot UTXOs; the Native SegWit and Taproot rows always render in broadcast mode (zero when unused, spend-sources-breakdown-rows.tsx). send-btc-spend-sources.spec.ts and send-btc-mixed-utxos.spec.ts run on mainnet and register mockMixedUtxosForSend(page) (one taproot and one native segwit UTXO) so the callout shows; send-btc.spec.ts reaches this screen on testnet4 without that mock. Its "Confirm and send transaction" button carries SharedComponentsSelectors.InfoCardButton (btc-send-form-confirmation.tsx), which SendPage.clickInfoCardButton clicks; the Stacks-only ConfirmSendTxBtn is not on this screen. Confirming shows the taproot UTXO warning dialog (taproot-utxo-warning-dialog entry) when applicable, then broadcasts; success goes to /sent/btc/:txId and a failed broadcast goes to /send/btc/error (send-btc-error entry). A bare URL redirects to /send/btc. A Bitcoin multisig policy account proposes instead of broadcasting: the button reads "Propose transaction", with no spend-source rows, no taproot callout and no taproot dialog (btc-propose-confirmation.tsx), and the page redirects to /send/btc when the active policy is not a Bitcoin one; a successful proposal goes to /sent/proposal and a failed one to /send/btc/error.',
  },
  {
    id: 'send-btc-error',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SendBtcError],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Reached by navigation from four places: a failed broadcast on /send/btc/confirm, a failed in-app BTC proposal for a Bitcoin multisig policy account (use-propose-btc-send-transaction.ts), any choose-fee error on /send/btc/choose-fee (a non-finite fee, a policy account the current account does not sign for, a failure building the multisig PSBT or a signing error, use-btc-choose-fee.tsx), and a failure in the dApp sendTransfer approver (use-rpc-send-transfer-actions.tsx)',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open #/send/btc/error with an unlocked wallet; with no route state the page renders with the error payload "Unknown error response"',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.BroadcastErrorTitle,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'Full-page BroadcastError layout with no page header (broadcast-error.tsx). The title (broadcast-error-title) reads "There was an error broadcasting your transaction" and the body "Unable to broadcast transaction"; in propose mode (a failed in-app Bitcoin policy proposal; the dApp sendTransfer approver always shows the broadcast copy) they read "There was an error proposing your transaction" and "Unable to propose transaction". Below them the error message is shown, or "Unknown error response" when the route state has none. The route state schema falls back to an empty object, so a bare URL renders the page. No E2E spec reaches it.',
  },
  {
    id: 'sent-btc-summary',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.SentBtcTxSummary],
    params: [
      { name: 'txId', example: 'aa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899' },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Confirm a BTC send on /send/btc/confirm; after the broadcast succeeds the app navigates to /sent/btc/:txId',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'testnet4',
      mocks: [...defaultMocks, 'mockTestAccountBtcBroadcastTransaction'],
    },
    selectors: {
      ready: SharedComponentsSelectors.InfoCardAssetValue,
      others: [
        SharedComponentsSelectors.InfoCardRowValue,
        SharedComponentsSelectors.AddressDisplayer,
      ],
    },
    actions: ['SendPage.clickInfoCardButton'],
    specs: [],
    description:
      'Post-broadcast summary for a BTC send with the amount, recipient, total spend, fee, estimated arrival and a copyable transaction ID. No E2E spec drives a real broadcast yet; the summary values come from route state (btc-sent-summary.tsx), so the route is only meaningful right after a send. mockTestAccountBtcBroadcastTransaction serves the testnet4 broadcast that leads here; on mainnet mockBitcoinMainnetBroadcast does the same.',
  },
  {
    id: 'send-stx-form',
    anchor: { kind: 'route' },
    routes: [
      RouteUrls.SendCryptoAssetForm,
      RouteUrls.EditNonce,
      RouteUrls.SendCryptoAssetFormRecipientAccounts,
    ],
    params: [{ name: 'symbol', example: 'stx' }],
    entry: [
      { kind: 'nav', steps: [...homeSendSteps, 'On /send pick STX'] },
      {
        kind: 'nav',
        steps: [
          'On the STX token details page click "Send" (TokenDetailsSelectors.TokenDetailsSendButton); it skips the chooser',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/send/stx with an unlocked wallet'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'testnet4',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.FeeToBePaidLabel,
      others: [
        SendCryptoAssetSelectors.SendForm,
        SendCryptoAssetSelectors.AmountFieldInput,
        SendCryptoAssetSelectors.AmountFieldInputErrorLabel,
        SendCryptoAssetSelectors.SendMaxBtn,
        SendCryptoAssetSelectors.RecipientFieldInput,
        SendCryptoAssetSelectors.FormFieldInputErrorLabel,
        SendCryptoAssetSelectors.RecipientSelectRecipientTypeDropdown,
        SendCryptoAssetSelectors.RecipientSelectFieldAddress,
        SendCryptoAssetSelectors.RecipientSelectFieldBnsName,
        SendCryptoAssetSelectors.RecipientBnsAddressLabel,
        SendCryptoAssetSelectors.RecipientChooseAccountButton,
        SendCryptoAssetSelectors.MemoFieldInput,
        SharedComponentsSelectors.FeeRow,
        SharedComponentsSelectors.FeeEstimateSelect,
        SharedComponentsSelectors.LowFeeEstimateItem,
        SharedComponentsSelectors.MiddleFeeEstimateItem,
        SharedComponentsSelectors.CustomFeeSelectItem,
        SharedComponentsSelectors.CustomFeeFieldInput,
        SendCryptoAssetSelectors.PreviewSendTxBtn,
      ],
    },
    actions: [
      'SendPage.selectStxAndGoToSendForm',
      'SendPage.waitForFeeRow',
      'SendPage.goBackSelectStx',
      'NetworkPage.selectTestnet',
    ],
    specs: [sendStxSpec, sendRecipientAccountsSpec, sendStxPolicyProposeSpec],
    description:
      'The STX send form at /send/stx: amount with "Send max", recipient by address or BNS name (the type dropdown switches the field; its recipient-select-field-address and recipient-select-field-bnsName items only render while the dropdown is open after recipient-select-field-dropdown-button is clicked; the resolved address is shown under it in recipient-bns-address-label), optional memo, a fee row whose select offers Low, Standard, High and Custom (fee-estimate-item.tsx; the closed row shows the selected tier\'s item (standard-fee by default, low-fee after picking Low), and the fee-estimate-select list with the Low, Standard, High and Custom items only renders after that row is clicked, as send-stx.spec.ts does, so standard-fee then matches two elements; the custom fee input only renders once Custom is picked), and an "Edit nonce" link that opens the nested edit-tx-nonce sheet titled "Edit nonce" (hidden for policy accounts). Neither the link nor the sheet has a test id and no spec opens them; send-stx-policy-propose.spec.ts only asserts the link is absent. A fee above HIGH_FEE_AMOUNT_STX shows the high-fee warning sheet on "Continue" (high-fee-warning-sheet entry); otherwise the app goes to /send/stx/confirm. A broadcast or proposal failure on the confirmation navigates to /send/stx/confirm/broadcast-error, which renders the nested broadcast-error sheet over this form: "Unable to broadcast transaction" (or "Unable to propose transaction") with a Close button (broadcast-error-dialog.tsx). Networks: the "send stx: tests on testnet" block of send-stx.spec.ts switches to testnet4; its mainnet block (BNS lookup, fee defaults), send-recipient-accounts.spec.ts and send-stx-policy-propose.spec.ts stay on mainnet. The BNS test registers mockBnsV2NameLookup(page)({ name, fullName, owner }) so the name resolves to TEST_BNS_RESOLVED_ADDRESS; send-stx-policy-propose.spec.ts registers mockFundedStacksAddress(context, policy.address) so the policy has a balance to validate against.',
  },
  {
    id: 'send-stx-confirmation',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.SendStxConfirmation],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /send/stx (or a SIP-10 form) fill amount and recipient, click "Continue"'],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'testnet4',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SendCryptoAssetSelectors.ConfirmationDetails,
      others: [
        SendCryptoAssetSelectors.ConfirmSendTxBtn,
        SendCryptoAssetSelectors.ConfirmationDetailsRecipient,
        SendCryptoAssetSelectors.ConfirmationDetailsFee,
        SendCryptoAssetSelectors.ConfirmationDetailsMemo,
        SharedComponentsSelectors.InfoCardAssetValue,
        SharedComponentsSelectors.InfoCardRowValue,
      ],
    },
    actions: ['SendPage.confirmSendTransaction'],
    specs: [sendStxSpec, sendSip10Spec, sendStxPolicyProposeSpec],
    description:
      'Review screen for STX and SIP-10 sends: asset value, recipient, total spend, sending, fee, memo ("No memo" when empty) and nonce (not shown for a policy proposal). A "Sending to an exchange?" memo callout shows for standard recipient addresses and "Sending to a smart contract" for contract principals (send-form-confirmation.layout.tsx). The same component is mounted at the literal /send/:symbol/:contractId/confirm route for SIP-10 tokens. "Confirm and send transaction" broadcasts and goes to /sent/:symbol/:txid; for a Stacks multisig policy account the button reads "Propose transaction" and the app goes to /sent/proposal. A failed broadcast or proposal navigates to <form path>/confirm/broadcast-error, the sheet nested under the form route (use-stacks-broadcast-transaction.tsx, use-propose-stacks-send-transaction.ts). send-stx.spec.ts reaches it on testnet4 and never confirms; send-sip10.spec.ts and send-stx-policy-propose.spec.ts run on mainnet. send-sip10.spec.ts registers mockStacksBroadcastTransaction (it routes the mainnet api.hiro.so host) so confirming succeeds; send-stx-policy-propose.spec.ts registers mockProposeMultisigTransaction(context) so the proposal is accepted and mockFundedStacksAddress(context, policy.address) so the policy has a balance and the form validates.',
  },
  {
    id: 'send-sip10-form',
    anchor: { kind: 'route' },
    routes: [
      RouteUrls.SendSip10Form,
      RouteUrls.EditNonce,
      RouteUrls.SendCryptoAssetFormRecipientAccounts,
    ],
    params: [
      { name: 'symbol', example: 'leather-test-token' },
      { name: 'contractId', example: 'SP000000000000000000002Q6VF78.leather-integration-tests' },
    ],
    entry: [
      { kind: 'nav', steps: [...homeSendSteps, 'On /send pick a SIP-10 token row'] },
      {
        kind: 'nav',
        steps: [
          'On the token details page of a SIP-10 token click "Send" (TokenDetailsSelectors.TokenDetailsSendButton); it skips the chooser',
        ],
      },
      {
        kind: 'deepLink',
        steps: ['Open #/send/<assetName>/<contractId> for a token the account holds'],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SharedComponentsSelectors.FeeToBePaidLabel,
      others: [
        SendCryptoAssetSelectors.SendForm,
        SendCryptoAssetSelectors.AmountFieldInput,
        SendCryptoAssetSelectors.RecipientFieldInput,
        SendCryptoAssetSelectors.MemoFieldInput,
        SendCryptoAssetSelectors.PreviewSendTxBtn,
      ],
    },
    actions: ['SendPage.selectSip10AndGoToSendForm'],
    specs: [sendSip10Spec],
    description:
      'Send form for a SIP-10 fungible token at /send/<assetName>/<contractAddress.contractName>. Shares the Stacks form: the recipient-accounts and edit-tx-nonce sheets and the confirm/broadcast-error sheet nest under this route too. SendPage.selectSip10AndGoToSendForm clicks the chooser row whose test id is <contractId>::<assetName>; with no argument it clicks the longcoin row (MockedTokensSelectors.Sip10TokenTestId), while send-sip10.spec.ts passes \'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token\', which matches the params example. When the account does not hold the token the page toasts "Token not found" and navigates back to /send (sip10-token-send-form.tsx). "Continue" goes to the literal /send/:symbol/:contractId/confirm review; send-sip10.spec.ts registers mockStacksBroadcastTransaction so confirming there succeeds.',
  },
  {
    id: 'sent-stx-summary',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SentStxTxSummary],
    params: [
      { name: 'symbol', example: 'stx' },
      {
        name: 'txid',
        example: '0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4',
      },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Confirm an STX or SIP-10 send; after the broadcast succeeds the app navigates to /sent/:symbol/:txid',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open #/sent/stx/0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4 with mockStacksRawTx and mockStacksPendingTransaction registered; with no route state the page fetches the raw transaction by txid, and a fetch error redirects to /',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      mocks: [
        ...defaultMocks,
        'mockStacksBroadcastTransaction',
        'mockStacksRawTx',
        'mockStacksPendingTransaction',
      ],
    },
    selectors: {
      ready: SendCryptoAssetSelectors.SentTransactionSummary,
      others: [
        SharedComponentsSelectors.InfoCardRowValue,
        SharedComponentsSelectors.AddressDisplayer,
      ],
    },
    actions: ['SendPage.confirmSendTransaction'],
    specs: [sendSip10Spec],
    description:
      'Post-broadcast summary titled "Sent" with the amount, recipient and a copyable transaction ID. STX rows: Status, Total spend, Sending, Fee, Memo, Nonce; SIP-10 rows: Status, Fee, Memo, Nonce (stacks-chain-tx-summary.tsx). An empty memo shows "—". The send-sip10 spec asserts the "Sent" title after confirming. mockStacksRawTx and mockStacksPendingTransaction serve the params example txid for the deep link.',
  },
  {
    id: 'sent-proposal-summary',
    anchor: { kind: 'route' },
    deepLinkable: false,
    routes: [RouteUrls.SentProposalSummary],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'From a Stacks multisig policy account confirm an STX send with "Propose transaction", or from a Bitcoin multisig policy account confirm a BTC send; the wallet posts the proposal and navigates to /sent/proposal',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      accountType: 'policy',
      mocks: [...defaultMocks, 'mockProposeMultisigTransaction'],
    },
    selectors: {
      ready: SharedComponentsSelectors.InfoCardRowValue,
      others: [SharedComponentsSelectors.AddressDisplayer],
    },
    actions: ['OnboardingPage.signInWithTestAccount', 'SendPage.confirmSendTransaction'],
    specs: [sendStxPolicyProposeSpec],
    description:
      'Summary titled "Proposal submitted" shown after a multisig proposal is accepted by the coordinator: amount, recipient, fee, memo, proposal ID and the "Awaiting co-signers" status, with a "Done" button that goes home. Both the Stacks send confirmation and the BTC send confirmation (use-propose-btc-send-transaction.ts) navigate here with the summary in route state; a bare URL redirects home. The spec covers the Stacks case, seeds its policy with policyStateOverrides and registers mockFundedStacksAddress(context, policy.address) so the policy has a balance and the send form validates; it asserts "Proposal submitted" and "Awaiting co-signers".',
  },
  {
    id: 'high-fee-warning-sheet',
    anchor: {
      kind: 'selectors',
      objects: ['SendCryptoAssetSelectors.HighFeeWarningSheetSubmit'],
    },
    routes: [],
    startRoute: RouteUrls.SendCryptoAsset,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the STX or SIP-10 send form end up with a fee above HIGH_FEE_AMOUNT_STX (5 STX), from any tier or a custom value, with no other validation errors, and submit the form',
          'The sheet asks to confirm the fee; "Edit fee" returns to the form, "Yes, I\'m sure" records the bypass and submits, which goes on to the confirmation screen',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'testnet4',
      mocks: [...defaultMocks],
    },
    selectors: {
      ready: SendCryptoAssetSelectors.HighFeeWarningSheetSubmit,
      others: [],
    },
    actions: ['SendPage.selectStxAndGoToSendForm', 'SendPage.waitForFeeRow'],
    specs: [sendStxSpec],
    description:
      'Confirmation sheet (apps/extension/src/app/features/stacks-high-fee-warning) shown by the Stacks send forms when the fee exceeds HIGH_FEE_AMOUNT_STX and the form is otherwise valid. It reads "Are you sure you want to pay <fee> <currency> in fees for this transaction?" with "Edit fee" and "Yes, I\'m sure" buttons. The sheet root has no reachable test id: HighFeeSheet passes data-testid to the @leather.io/ui Sheet, which does not forward it, so readiness is the "Yes, I\'m sure" button (high-fee-warning-sheet-submit); send-stx.spec.ts checks the sheet with a non-asserting isVisible() call. StacksHighFeeWarningContainer keeps one boolean bypass flag: once "Yes, I\'m sure" sets it, no fee triggers the sheet again for the life of that form (stacks-high-fee-warning-container.tsx). The covering test runs on testnet4 from the /send chooser. Not reachable through verify: it needs a filled form with a high fee, which no page-object action sets.',
  },
  {
    id: 'taproot-utxo-warning-dialog',
    anchor: { kind: 'selectors', objects: ['SendCryptoAssetSelectors.TaprootUtxoWarningDialog'] },
    routes: [],
    startRoute: RouteUrls.SendCryptoAsset,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Build a BTC send whose coin selection spends taproot (bc1p) UTXOs, preview it and press the confirm button on the review (SendPage.clickInfoCardButton)',
          'TaprootUtxoWarningDialog.Root is mounted once in App; the dialog resolves userAcceptedRisk true on "I understand, continue" and false on "Cancel" or close, and the send only broadcasts when accepted',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: {
      session: 'signed-in',
      network: 'mainnet',
      mocks: [...defaultMocks, 'mockMixedUtxosForSend'],
    },
    selectors: {
      ready: SendCryptoAssetSelectors.TaprootUtxoWarningDialog,
      others: [],
    },
    actions: [
      'SendPage.selectBtcAndGoToSendForm',
      'SendPage.previewBitcoinTransaction',
      'SendPage.clickInfoCardButton',
    ],
    specs: [sendBtcSpendSourcesSpec, rbfBtcSpec, rpcSendTransferSpec],
    description:
      'Callable sheet (apps/extension/src/app/features/dialogs/taproot-utxo-warning-dialog) titled "This transaction includes taproot UTXOs" that interrupts the BTC send confirmation, the RBF fee increase and the dApp sendTransfer approver (before signing, use-rpc-send-transfer-actions.tsx) when the inputs include taproot UTXOs, which may carry inscriptions, runes or BRC-20 balances. The test id sits on the sheet body, not the Sheet root. On the send path the review behind it shows the taproot callout and per-type spend rows (send-btc-confirmation). send-btc-spend-sources.spec.ts asserts the dialog on the send path; rbf-btc.spec.ts and rpc-send-transfer.spec.ts click "I understand, continue"; rpc-send-transfer.spec.ts also asserts taproot-utxo-warning-dialog and clicks "Cancel" (its spend-sources block registers mockMixedUtxosForSend(context)) (for its taproot case rbf-btc.spec.ts registers mockPendingBitcoinTransactions(page, [mockPendingMixedInputBtcTx]), mockLeatherBitcoinTransactions with the same transaction and mockMixedUtxoRequests with one native segwit and one taproot input, so the pending transaction offers "Increase fee" in activity). Not reachable through verify: it needs an amount typed into the form before preview, which no page-object action does without arguments.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
