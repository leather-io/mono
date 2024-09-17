export enum APP_ROUTES {
  Home = '/',
  WalletAllAssets = '/wallet/all-assets',
  WalletHome = '/wallet/home',
  WalletDeveloperConsole = '/wallet/developer-console',
  WalletDeveloperConsoleWalletManager = '/wallet/developer-console/wallet-manager',
  WalletSend = '/wallet/send',
  WalletReceive = '/wallet/receive',
  WalletSwap = '/wallet/swap',
  WalletTokens = '/wallet/tokens',
  WalletCollectibles = '/wallet/collectibles',
  WalletBrowser = '/wallet/browser',
  WalletCreateNewWallet = '/wallet/create-new-wallet',
  WalletRecoverWallet = '/wallet/recover-wallet',
  WalletSecureYourWallet = '/wallet/secure-your-wallet',

  // Settings
  WalletSettings = '/wallet/settings',
  WalletSettingsDisplay = '/wallet/settings/display',
  WalletSettingsSecurity = '/wallet/settings/security',
  WalletSettingsNetworks = '/wallet/settings/networks',
  WalletSettingsNotifications = '/wallet/settings/notifications',
  WalletSettingsHelp = '/wallet/settings/help',

  // TODO: Refactor these routes to be nested in settings
  WalletWalletsSettings = '/wallet/wallet-settings',
  WalletWalletsSettingsHiddenAccounts = '/wallet/wallet-settings/hidden-accounts',
  WalletWalletsSettingsConfigureWallet = '/wallet/wallet-settings/configure/[wallet]',
  WalletWalletsSettingsConfigureAccount = '/wallet/wallet-settings/configure/[wallet]/[account]',
  WalletWalletsSettingsConfigureAccountAvatar = '/wallet/wallet-settings/configure/[wallet]/[account]/choose-avatar',
  WalletWalletsSettingsConfigureViewSecretKey = '/wallet/wallet-settings/configure/[wallet]/view-secret-key',
  WalletGeneratingWallet = '/wallet/generating-wallet',
  WaitingList = '/waiting-list',
}
