import { useSelector } from 'react-redux';

import { describe, expect, it, vi } from 'vitest';

import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
  useStacksSigners,
} from './stacks-keychains.read';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

const mockSignerStub = {
  network: 'mainnet',
  publicKey: new Uint8Array(33),
  sign: vi.fn(),
};

const mockSigner1 = {
  ...mockSignerStub,
  address: 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
  descriptor: "[efd01538/44'/5757'/0'/0/0]",
  keyOrigin: "efd01538/44'/5757'/0'/0/0",
  accountIndex: 0,
};

const mockSigner2 = {
  ...mockSignerStub,
  address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
  descriptor: "[efd01538/44'/5757'/0'/0/1]",
  keyOrigin: "efd01538/44'/5757'/0'/0/1",
  accountIndex: 0,
};

describe('Stacks Keychains Read', () => {
  describe(useStacksSigners.name, () => {
    it('returns list of signers and helper functions', () => {
      vi.mocked(useSelector).mockReturnValue([mockSigner1, mockSigner2]);

      const result = useStacksSigners();

      expect(result.list).toEqual([mockSigner1, mockSigner2]);
      expect(typeof result.fromAccountIndex).toBe('function');
      expect(typeof result.fromFingerprint).toBe('function');
    });
  });

  describe(useStacksSignerAddresses.name, () => {
    it('returns list of addresses from signers', () => {
      vi.mocked(useSelector).mockReturnValue([mockSigner1, mockSigner2]);

      const addresses = useStacksSignerAddresses();

      expect(addresses).toEqual([
        'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
        'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
      ]);
    });
  });

  describe(useStacksSignerAddressFromAccountIndex.name, () => {
    it('returns address for specific fingerprint and account index', () => {
      vi.mocked(useSelector).mockReturnValue([mockSigner1, mockSigner2]);

      const address = useStacksSignerAddressFromAccountIndex('efd01538', 0);

      expect(address).toBe('SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW');
    });

    it('returns undefined if no matching signer found', () => {
      vi.mocked(useSelector).mockReturnValue([mockSigner1, mockSigner2]);

      const address = useStacksSignerAddressFromAccountIndex('nonexistent', 99);

      expect(address).toBeUndefined();
    });
  });
});
