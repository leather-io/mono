import type { Observable } from 'rxjs';

import type { BitcoinNetworkModes } from '@leather.io/models';

import type {
  HardwareWallet,
  HardwareWalletCapabilities,
  HardwareWalletVendor,
} from './hardware-wallet';
import type { OperationContext } from './hardware-wallet-interaction';

export type ConnectRequest =
  | { chain: 'bitcoin'; network: BitcoinNetworkModes }
  | { chain: 'stacks' };

export interface DiscoveredHardwareDevice {
  id: string;
  name: string;
  model: string | null;
}

export interface HardwareWalletAppInfo {
  name: string;
  version: string;
}

export interface DeviceChooser {
  choose(
    candidates: Observable<DiscoveredHardwareDevice>,
    signal?: AbortSignal
  ): Promise<DiscoveredHardwareDevice>;
}

export interface HardwareWalletSession {
  wallet: HardwareWallet;
  device: DiscoveredHardwareDevice;
  app: HardwareWalletAppInfo | null;
  close(): Promise<void>;
}

export interface HardwareWalletConnector {
  vendor: HardwareWalletVendor;
  capabilities: HardwareWalletCapabilities;
  pair(ctx: OperationContext): Promise<DiscoveredHardwareDevice>;
  connect(request: ConnectRequest, ctx: OperationContext): Promise<HardwareWalletSession>;
}
