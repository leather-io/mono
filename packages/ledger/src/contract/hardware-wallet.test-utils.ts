import { vi } from 'vitest';

import type {
  HardwareBitcoinSigner,
  HardwareStacksSigner,
  HardwareWallet,
  HardwareWalletCapabilities,
} from './hardware-wallet';
import type {
  DiscoveredHardwareDevice,
  HardwareWalletConnector,
  HardwareWalletSession,
} from './hardware-wallet-connector';

export const fakeHardwareWalletCapabilities: HardwareWalletCapabilities = {
  bitcoin: { taproot: true, descriptorPolicies: true },
  stacks: { structuredMessages: true },
  addressVerification: true,
};

export const fakeHardwareDevice: DiscoveredHardwareDevice = {
  id: 'device-1',
  name: 'Fake device',
  model: null,
};

export function makeFakeHardwareBitcoinSigner(
  overrides: Partial<HardwareBitcoinSigner> = {}
): HardwareBitcoinSigner {
  return {
    requestAccountKeys: vi.fn(),
    signPsbt: vi.fn(),
    showAddress: vi.fn(),
    ...overrides,
  };
}

export function makeFakeHardwareStacksSigner(
  overrides: Partial<HardwareStacksSigner> = {}
): HardwareStacksSigner {
  return {
    requestAccountKeys: vi.fn(),
    signTransaction: vi.fn(),
    signMessage: vi.fn(),
    signStructuredMessage: vi.fn(),
    showAddress: vi.fn(),
    ...overrides,
  };
}

export function makeFakeHardwareWallet(overrides: Partial<HardwareWallet> = {}): HardwareWallet {
  return {
    vendor: 'ledger',
    capabilities: fakeHardwareWalletCapabilities,
    bitcoin: null,
    stacks: null,
    getMasterFingerprint: vi.fn(),
    ...overrides,
  };
}

export function makeFakeHardwareWalletSession(
  overrides: Partial<HardwareWalletSession> = {}
): HardwareWalletSession {
  return {
    wallet: makeFakeHardwareWallet(),
    device: fakeHardwareDevice,
    app: null,
    close: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function makeFakeHardwareWalletConnector(
  overrides: Partial<HardwareWalletConnector> = {}
): HardwareWalletConnector {
  return {
    vendor: 'ledger',
    capabilities: fakeHardwareWalletCapabilities,
    pair: vi.fn(),
    connect: vi.fn(),
    ...overrides,
  };
}
