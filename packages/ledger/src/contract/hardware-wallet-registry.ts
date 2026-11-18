import type { HardwareWalletVendor } from './hardware-wallet';
import type { HardwareWalletConnector } from './hardware-wallet-connector';

export interface HardwareWalletRegistry {
  get(vendor: HardwareWalletVendor): HardwareWalletConnector;
  has(vendor: HardwareWalletVendor): boolean;
  vendors(): HardwareWalletVendor[];
}

export function createHardwareWalletRegistry(
  connectors: HardwareWalletConnector[]
): HardwareWalletRegistry {
  const byVendor = new Map(connectors.map(connector => [connector.vendor, connector]));
  return {
    get(vendor) {
      const connector = byVendor.get(vendor);
      if (!connector) throw new Error(`No hardware wallet connector registered for ${vendor}`);
      return connector;
    },
    has(vendor) {
      return byVendor.has(vendor);
    },
    vendors() {
      return [...byVendor.keys()];
    },
  };
}
