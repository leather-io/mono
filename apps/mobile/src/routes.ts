export const TWITTER_LINK = 'https://twitter.com/LeatherBTC';
export const BROWSER_EXTENSION_LINK = 'https://leather.io/install-extension';

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
  WalletSettingsDisplayTheme = '/wallet/settings/display/theme',
  WalletSettingsDisplayBitcoinUnit = '/wallet/settings/display/bitcoin-unit',
  WalletSettingsDisplayConversionUnit = '/wallet/settings/display/conversion-unit',
  WalletSettingsDisplayAccountIdentifier = '/wallet/settings/display/account-identifier',
  WalletSettingsSecurity = '/wallet/settings/security',
  WalletSettingsNetworks = '/wallet/settings/networks',
  WalletSettingsNotifications = '/wallet/settings/notifications',
  WalletSettingsHelp = '/wallet/settings/help',

  // TODO: Refactor these routes to be nested in settings
  WalletWalletsSettings = '/wallet/wallet-settings',
  WalletWalletsSettingsHiddenAccounts = '/wallet/wallet-settings/hidden-accounts',
  WalletWalletsSettingsConfigureWallet = '/wallet/wallet-settings/configure/[wallet]',
  WalletWalletsSettingsConfigureAccount = '/wallet/wallet-settings/configure/[wallet]/[account]',
  WalletWalletsSettingsConfigureViewSecretKey = '/wallet/wallet-settings/configure/[wallet]/view-secret-key',
  WalletGeneratingWallet = '/wallet/generating-wallet',
  WaitingList = '/waiting-list',
}
