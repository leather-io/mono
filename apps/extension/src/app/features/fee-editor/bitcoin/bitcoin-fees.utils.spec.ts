import { describe, expect, it, vi } from 'vitest';

import type { OwnedUtxo } from '@leather.io/models';
import { createMoney, noop } from '@leather.io/utils';

import { getBitcoinFee, getBitcoinSendMaxFee } from './bitcoin-fees.utils';

const mockOwnedUtxos: OwnedUtxo[] = [
  {
    txid: '0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105ca',
    vout: 0,
    value: 546,
    address: 'bc1qtest1',
    path: "m/84'/0'/0'/0/0",
    keyOrigin: 'test',
  },
  {
    txid: '1fab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105cb',
    vout: 0,
    value: 10000,
    address: 'bc1qtest2',
    path: "m/84'/0'/0'/0/1",
    keyOrigin: 'test',
  },
];

describe('bitcoin-fees.utils', () => {
  const mockRecipients = [
    {
      address: 'bc1qps90ws94pvk548y9jg03gn5lwjqnyud4lg6y56',
      amount: createMoney(300, 'BTC'),
    },
  ];

  describe('getBitcoinFee', () => {
    it('returns fee when calculation succeeds', () => {
      const result = getBitcoinFee({
        recipients: mockRecipients,
        utxos: mockOwnedUtxos,
        feeRate: 1,
      });
      expect(result).toStrictEqual(createMoney(141, 'BTC'));
    });

    it('returns null when calculation fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(noop);
      const result = getBitcoinFee({
        recipients: [],
        utxos: [],
        feeRate: 0,
      });
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('getBitcoinSendMaxFee', () => {
    it('returns fee when calculation succeeds', () => {
      const result = getBitcoinSendMaxFee({
        recipients: mockRecipients,
        utxos: mockOwnedUtxos,
        feeRate: 1,
      });
      expect(result).toStrictEqual(createMoney(178, 'BTC'));
    });

    it('returns null when calculation fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(noop);
      const result = getBitcoinSendMaxFee({
        recipients: mockRecipients,
        utxos: [],
        feeRate: 1,
      });
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
