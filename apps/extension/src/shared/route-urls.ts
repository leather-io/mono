export enum RouteUrls {
  // Onboarding routes
  Onboarding = '/get-started',
  BackUpSecretKey = '/back-up-secret-key',
  SetPassword = '/set-password',
  SignIn = '/sign-in',
  ForgotPassword = '/forgot-password',

  // Ledger routes
  ConnectLedger = 'connect-your-ledger',
  ConnectLedgerError = 'ledger-connection-error',
  ConnectLedgerSuccess = 'successfully-connected-your-ledger',
  DeviceBusy = 'please-wait',
  AwaitingDeviceUserAction = 'awaiting-approval',
  LedgerDisconnected = 'your-ledger-disconnected',
  LedgerOperationRejected = 'action-rejected',
  LedgerPublicKeyMismatch = 'wrong-ledger-device',
  LedgerDevicePayloadInvalid = 'ledger-payload-invalid',
  LedgerUnsupportedBrowser = 'unsupported-browser',
  LedgerOutdatedAppWarning = 'outdated-app-warning',
  LedgerBroadcastError = 'transaction-broadcast-error',
  ConnectLedgerStart = 'connect-ledger',

  // Active wallet routes
  Home = '/',
  TokenDetails = '/token/*',
  MultiWalletTest = '/multi-wallet-test',
  AddNetwork = '/add-network',
  EditNetwork = '/edit-network',
  SelectNetwork = '/select-network',
  SelectTheme = '/select-theme',
  ManageTokens = '/manage-tokens',
  Fund = '/fund',
  Sell = '/sell',
  IncreaseStacksFee = '/increase-fee/stacks/:txid',
  IncreaseBtcFee = '/increase-fee/btc',
  CancelStacksTransaction = '/cancel-transaction/stacks/:txid',
  Send = '/send-transaction',
  ViewSecretKey = '/view-secret-key',
  Settings = '/settings',

  // nested routes must have relative paths
  Activity = '/activity',
  Collectibles = '/collectibles',
  Receive = 'receive',
  ReceiveStx = 'receive/stx',
  ReceiveBtc = 'receive/btc',
  ReceiveBtcStamp = 'receive/btc-stamp',
  ReceiveCollectible = 'receive/collectible',
  ReceiveCollectibleOrdinal = 'receive/collectible/ordinal',

  // Locked wallet route
  Unlock = '/unlock',

  // Modal routes
  EditNonce = 'edit-tx-nonce',
  SignOutConfirm = 'sign-out',
  RetrieveTaprootFunds = 'retrieve-taproot-funds',

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

  // Send ordinal inscriptions
  SendOrdinalInscription = 'send/ordinal-inscription',
  SendOrdinalInscriptionChooseFee = 'choose-fee',
  SendOrdinalInscriptionReview = 'review',
  SendOrdinalInscriptionSent = 'sent',
  SendOrdinalInscriptionError = 'error',

  // Swap routes
  Swap = '/swap/{chain}/:base/:quote?',
  SwapAssetSelectBase = 'select-base',
  SwapAssetSelectQuote = 'select-quote',
  SwapReview = '/swap/{chain}/:base/:quote/review',
  SwapError = '/swap/error',

  // Legacy request routes
  PsbtRequest = '/psbt',
  SignatureRequest = '/signature',
  TransactionRequest = '/transaction',

  // Request routes bitcoin
  RpcGetAddresses = '/get-addresses',
  RpcSignPsbt = '/sign-psbt',
  RpcSignPsbtSummary = '/sign-psbt/summary',
  RpcSendTransfer = '/send-transfer',
  RpcSendTransferConfirmation = '/send-transfer/confirm',
  RpcSendTransferSummary = '/send-transfer/summary',
  RpcSignBip322Message = '/sign-bip322-message',
  RpcStacksSignature = '/sign-stacks-message',

  // Popup routes
  ChooseAccount = '/choose-account',

  // Shared legacy and rpc request routes
  RequestError = '/request-error',
  UnauthorizedRequest = '/unauthorized-request',

  // Request routes stacks
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
