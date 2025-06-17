import type { DefaultWalletPolicy } from 'ledger-bitcoin';

import type { BitcoinNetworkModes } from '@leather.io/models';

export interface BitcoinLedgerAccountDetails {
  id: string;
  path: string;
  policy: string;
  targetId: string;
}

export interface WalletPolicyDetails {
  fingerprint: string;
  network: BitcoinNetworkModes;
  xpub: string;
  accountIndex: number;
}

export enum LedgerConnectionErrors {
  FailedToConnect = 'FailedToConnect',
  AppNotOpen = 'AppNotOpen',
  AppVersionOutdated = 'AppVersionOutdated',
  DeviceNotConnected = 'DeviceNotConnected',
  DeviceLocked = 'DeviceLocked',
  IncorrectAppOpened = 'INCORRECT_APP_OPENED',
}

export interface LedgerAppVersion {
  name: string;
  version: string;
}

export interface LedgerDeviceResponse {
  deviceLocked: boolean;
  error?: Error;
}

export interface UseLedgerSignTxArgs<App> {
  chain: 'bitcoin' | 'stacks';
  isAppOpen: (version: LedgerAppVersion) => boolean;
  getAppVersion: (app: App) => Promise<LedgerAppVersion>;
  connectApp: () => Promise<App>;
  onSuccess?: () => void;
  signTransactionWithDevice: (app: App) => Promise<void>;
  passesAdditionalVersionCheck?: (version: LedgerAppVersion) => Promise<boolean>;
}

export interface UseRequestLedgerKeysArgs<App> {
  chain: 'bitcoin' | 'stacks';
  connectApp: () => Promise<App>;
  getAppVersion: (app: App) => Promise<LedgerAppVersion>;
  pullKeysFromDevice: (app: App) => Promise<void>;
  isAppOpen: (version: LedgerAppVersion) => boolean;
  onSuccess?: () => void;
}
