import { beforeEach, describe, expect, test, vi } from 'vitest';

import { walletSignIn } from './wallet-sign-in';

const mocks = vi.hoisted(() => ({
  getAddresses: vi.fn(),
  signMessage: vi.fn(),
  stxSignMessage: vi.fn(),
}));

vi.mock('~/features/multisig/extension/multisig-leather-client', () => ({
  multisigLeather: {
    getAddresses: mocks.getAddresses,
    signMessage: mocks.signMessage,
    stxSignMessage: mocks.stxSignMessage,
  },
}));

vi.mock('~/utils/utils', () => ({ isLeatherInstalled: () => true }));

const btcAddress = {
  symbol: 'BTC',
  type: 'p2wpkh',
  address: 'bc1qyf4a3taahvv2sfs0zz0mtq2lxdsthmf3wcjjxq',
  publicKey: '02cc42bfd7a7b0e99f78cc617bcf411f791feaa74e583206da59090ecfa1e7184b',
  derivationPath: "m/84'/0'/0'/0/0",
  descriptor:
    'wpkh(xpub6BuKrNqTrGfsy8VAAdUW2KCxbHywuSKjg7hZuAXERXDv7GfuxUgUWdVRKNsgujcwdjEHCjaXWouPKi1m5gMgdWX8JpRcyMkrSxPe4Da3Lx8)',
  fingerprint: 'e87a850b',
};

const stxAddress = {
  symbol: 'STX',
  kind: 'single-sig',
  address: 'SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST',
  publicKey: '03bb26a318d5b88f493cb648e5b04ebbb363cda8135c2f8e4cd26d22cdaaa2ae42',
};

const message = 'Sign in to Leather Multisig';
const timestamp = 1782000000;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAddresses.mockResolvedValue({ addresses: [btcAddress, stxAddress] });
});

describe('walletSignIn', () => {
  test('requests single-sig addresses for the Bitcoin sign-in', async () => {
    mocks.signMessage.mockResolvedValue({ address: btcAddress.address, signature: 'btc-sig' });

    const payload = await walletSignIn({ network: 'btc:mainnet', message, timestamp });

    expect(mocks.getAddresses).toHaveBeenCalledWith({
      network: 'mainnet',
      chains: ['bitcoin'],
      allowPolicyAccounts: false,
    });
    expect(payload.address).toBe(btcAddress.address);
    expect(payload.signature).toBe('btc-sig');
  });

  test('requests single-sig addresses for the Stacks sign-in', async () => {
    mocks.stxSignMessage.mockResolvedValue({
      publicKey: stxAddress.publicKey,
      signature: 'stx-sig',
    });

    const payload = await walletSignIn({ network: 'stx:mainnet', message, timestamp });

    expect(mocks.getAddresses).toHaveBeenCalledWith({
      network: 'mainnet',
      chains: ['stacks'],
      allowPolicyAccounts: false,
    });
    expect(payload.address).toBe(stxAddress.address);
    expect(payload.signature).toBe('stx-sig');
  });
});
