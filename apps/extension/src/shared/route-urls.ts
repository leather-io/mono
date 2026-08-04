export enum RouteUrls {
  // Onboarding routes
  Onboarding = '/get-started',
  BackUpSecretKey = '/back-up-secret-key',
  SignIn = '/sign-in',

  // Ledger routes
  ConnectLedger = 'connect-your-ledger',
  ConnectLedgerError = 'ledger-connection-error',
  ConnectLedgerSuccess = 'successfully-connected-your-ledger',
  LedgerCheckingAppVersion = 'checking-app-version',
  DeviceBusy = 'please-wait',
  AwaitingDeviceUserAction = 'awaiting-approval',
  LedgerDisconnected = 'your-ledger-disconnected',
  LedgerOperationRejected = 'action-rejected',
  LedgerPublicKeyMismatch = 'wrong-ledger-device',
  LedgerDevicePayloadInvalid = 'ledger-payload-invalid',
  LedgerUnsupportedBrowser = 'unsupported-browser',
  LedgerOutdatedAppWarning = 'outdated-app-warning',
  LedgerUnexpectedFingerprint = 'unexpected-device-fingerprint',
  LedgerBroadcastError = 'transaction-broadcast-error',
  LedgerSignStacksProposal = 'sign-stacks-proposal',
  ConnectLedgerStart = 'connect-ledger',
  OutdatedStacksAppWarning = 'outdated-stacks-app-warning',
  LedgerStacksAddressStandard = 'choose-address-standard',

  // Active wallet routes
  Home = '/',
  TokenDetails = '/token/*',
  AddNetwork = '/add-network',
  EditNetwork = '/edit-network',
  SelectNetwork = '/select-network',
  SelectTheme = '/select-theme',
  ManageTokens = '/manage-tokens',
  Fund = '/fund/:chain?',
  Sell = '/sell',
  IncreaseStacksFee = '/increase-fee/stacks/:txid',
  IncreaseBtcFee = '/increase-fee/btc',
  CancelStacksTransaction = '/cancel-transaction/stacks/:txid',
  Send = '/send-transaction',
  ViewSecretKey = '/view-secret-key',
  Settings = '/settings',
  AllBalances = '/all-balances',
  AllBalancesDetail = '/all-balances/:category',
  AddWallet = '/add-wallet',
  CreateWallet = '/create-wallet',
  AddLedgerWallet = '/add-ledger-wallet',

  // nested routes must have relative paths
  Activity = '/activity',
  Collectibles = '/collectibles',

  // Locked wallet route
  Unlock = '/unlock',

  // Modal routes
  EditNonce = 'edit-tx-nonce',
  SignOutConfirm = 'sign-out',
  // Send crypto asset routes
  SendCryptoAsset = '/send',
  SendCryptoAssetForm = '/send/:symbol',
  SendSip10Form = '/send/:symbol/:contractId',
  SendCryptoAssetFormRecipientAccounts = 'recipient-accounts',
  SendCryptoAssetFormRecipientBns = 'recipient-bns',
  SendBtcChooseFee = '/send/btc/choose-fee',
  SendBtcError = '/send/btc/error',
  SendBtcConfirmation = '/send/btc/confirm',
  SendBtcDisabled = '/send/btc/disabled',
  SendStxConfirmation = '/send/stx/confirm',
  SendStacksSip10Confirmation = '/send/:symbol/confirm',
  SentBtcTxSummary = '/sent/btc/:txId',
  SentStxTxSummary = '/sent/:symbol/:txid',
  SentProposalSummary = '/sent/proposal',

  // Swap routes
  Swap = '/swap/{chain}/:base/:quote?',
  SwapReview = '/swap/{chain}/:base/:quote/review',

  // Request routes bitcoin
  RpcGetAddresses = '/get-addresses',
  RpcBtcAddAccount = '/btc-add-account',
  RpcSignPsbt = '/sign-psbt',
  RpcSignPsbtSummary = '/sign-psbt/summary',
  RpcSendTransfer = '/send-transfer',
  RpcSendTransferConfirmation = '/send-transfer/confirm',
  RpcSendTransferSummary = '/send-transfer/summary',
  RpcSignBip322Message = '/sign-bip322-message',
  RpcStacksSignature = '/sign-stacks-message',

  // Shared rpc request routes
  RequestError = '/request-error',

  // Request routes stacks
  RpcStxAddAccount = '/stx-add-account',
  RpcStxSignTransaction = '/stx-sign-transaction',
  RpcStxCallContract = '/stx-call-contract',
  RpcStxDeployContract = '/stx-deploy-contract',
  RpcStxTransferStx = '/stx-transfer-stx',
  RpcStxTransferSip9Nft = '/stx-transfer-sip9-nft',
  RpcStxTransferSip10Ft = '/stx-transfer-sip10-ft',

  // New rpc routes for Approver UX
  FeeEditor = 'edit-fee',
  NonceEditor = 'edit-nonce',
  BroadcastError = 'broadcast-error',
}
