import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

export enum AppRoutes {
  Home = '/',
  DeveloperConsole = '/developer-console',
  DeveloperConsoleWalletManager = '/developer-console/wallet-manager',
  DeveloperBitcoinScratchPad = '/developer-console/bitcoin-scratch-pad',
  Balances = '/balances',
  Collectibles = '/collectibles',
  CreateNewWallet = '/create-new-wallet',
  RecoverWallet = '/recover-wallet',
  SecureYourWallet = '/secure-your-wallet',
  GeneratingWallet = '/generating-wallet',
  MpcWallets = '/mpc-wallets',
  HardwareWallets = '/hardware-wallets',

  // Account
  Account = '/account/[account]',
  Activity = '/activity',
  AccountActivity = '/account/[account]/activity',
  AccountBalances = '/account/[account]/balances',
  AccountCollectibles = '/account/[account]/collectibles',
  // Settings
  Settings = '/settings',
  SettingsDisplay = '/settings/display',
  SettingsSecurity = '/settings/security',
  SettingsNetworks = '/settings/networks',
  SettingsNotifications = '/settings/notifications',
  SettingsNotificationsEmail = '/settings/notifications/email',
  SettingsHelp = '/settings/help',
  SettingsWallet = '/settings/wallet',
  SettingsWalletHiddenAccounts = '/settings/wallet/hidden-accounts',
  SettingsWalletConfigureWallet = '/settings/wallet/configure/[wallet]',
  SettingsWalletConfigureAccount = '/settings/wallet/configure/[wallet]/[account]',
  SettingsWalletConfigureAccountAvatar = '/settings/wallet/configure/[wallet]/[account]/choose-avatar',
  SettingsWalletConfigureViewSecretKey = '/settings/wallet/configure/[wallet]/view-secret-key',
}

export enum AppRouteNames {
  'index' = 'index',
  'generating-wallet' = 'generating-wallet',
  'swap' = 'swap',
  'account/[account]/index' = 'account/[account]/index',
  'account/[account]/activity' = 'account/[account]/activity',
  'account/[account]/collectibles' = 'account/[account]/collectibles',
  'account/[account]/balances' = 'account/[account]/balances',
  'balances/index' = 'balances/index',
  'activity/index' = 'activity/index',
  'collectibles/index' = 'collectibles/index',
  'developer-console/index' = 'developer-console/index',
  'developer-console/wallet-manager' = 'developer-console/wallet-manager',
  'developer-console/bitcoin-scratch-pad' = 'developer-console/bitcoin-scratch-pad',
  'settings/index' = 'settings/index',
  'settings/display/index' = 'settings/display/index',
  'settings/security/index' = 'settings/security/index',
  'settings/networks/index' = 'settings/networks/index',
  'settings/notifications' = 'settings/notifications',
  'settings/help/index' = 'settings/help/index',
  'settings/wallet/index' = 'settings/wallet/index',
  'settings/wallet/hidden-accounts' = 'settings/wallet/hidden-accounts',
  'settings/wallet/configure/[wallet]/[account]/index' = 'settings/wallet/configure/[wallet]/[account]/index',
  'settings/wallet/configure/[wallet]/[account]/choose-avatar' = 'settings/wallet/configure/[wallet]/[account]/choose-avatar',
  'settings/wallet/configure/[wallet]/index' = 'settings/wallet/configure/[wallet]/index',
  'settings/wallet/configure/[wallet]/view-secret-key' = 'settings/wallet/configure/[wallet]/view-secret-key',
  'create-new-wallet' = 'create-new-wallet',
  'hardware-wallets' = 'hardware-wallets',
  'mpc-wallets' = 'mpc-wallets',
  'recover-wallet' = 'recover-wallet',
  'secure-your-wallet' = 'secure-your-wallet',
}

export type AppParamList = Record<AppRouteNames, undefined>;

type ReceiveSheetRouteKeys = keyof AppParamList;

export function useAppNavigation<RouteKey extends ReceiveSheetRouteKeys>() {
  return useNavigation<NavigationProp<AppParamList, RouteKey>>();
}
