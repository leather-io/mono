import BigNumber from 'bignumber.js';

import { AverageBitcoinFeeRates } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { CoinSelectionRecipient } from '../coin-selection/coin-selection';
import { recipientAddress, taprootAddress } from '../mocks/mocks';
import { getBitcoinFees, getBitcoinTransactionFee } from './bitcoin-fees';

describe('getBitcoinTransactionFee', () => {
  it('should return the fee for a normal transaction', () => {
    const args = {
      recipients: [{ address: recipientAddress, amount: createMoney(1000, 'BTC') }],
      utxos: [
        {
          address: recipientAddress,
          txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
          vout: 0,
          value: 2000,
        },
      ],
      feeRate: 1,
    };
    const fee = getBitcoinTransactionFee(args);
    const expectedFee = createMoney(141, 'BTC');
    expect(fee).toEqual(expectedFee);
  });

  it('should return the fee for a max send transaction', () => {
    const args = {
      isSendingMax: true,
      recipients: [{ address: recipientAddress, amount: createMoney(2000, 'BTC') }],
      utxos: [
        {
          address: recipientAddress,
          txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
          vout: 0,
          value: 2000,
        },
      ],
      feeRate: 2,
    };
    const fee = getBitcoinTransactionFee(args);
    const expectedFee = createMoney(219, 'BTC');
    expect(fee).toEqual(expectedFee);
  });

  it('should return null if an error occurs', () => {
    const args = {
      recipients: [],
      utxos: [],
      feeRate: 1,
    };
    const fee = getBitcoinTransactionFee(args);
    expect(fee).toBeNull();
  });
});

describe('getBitcoinTransactionFee with taproot', () => {
  const mockTxid = '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6';
  const defaultRecipients = [{ address: recipientAddress, amount: createMoney(1000, 'BTC') }];

  it('should return a lower fee for a taproot UTXO than native segwit', () => {
    const segwitFee = getBitcoinTransactionFee({
      recipients: defaultRecipients,
      utxos: [{ address: recipientAddress, txid: mockTxid, value: 2000 }],
      feeRate: 1,
    });
    const taprootFee = getBitcoinTransactionFee({
      recipients: defaultRecipients,
      utxos: [{ address: taprootAddress, txid: mockTxid, value: 2000 }],
      feeRate: 1,
    });

    expect(segwitFee).not.toBeNull();
    expect(taprootFee).not.toBeNull();
    expect(taprootFee!.amount.toNumber()).toBeLessThan(segwitFee!.amount.toNumber());
  });

  it('should return a lower fee for taproot max send than native segwit', () => {
    const maxSendRecipients = [{ address: recipientAddress, amount: createMoney(2000, 'BTC') }];

    const segwitFee = getBitcoinTransactionFee({
      isSendingMax: true,
      recipients: maxSendRecipients,
      utxos: [{ address: recipientAddress, txid: mockTxid, value: 2000 }],
      feeRate: 2,
    });
    const taprootFee = getBitcoinTransactionFee({
      isSendingMax: true,
      recipients: maxSendRecipients,
      utxos: [{ address: taprootAddress, txid: mockTxid, value: 2000 }],
      feeRate: 2,
    });

    expect(segwitFee).not.toBeNull();
    expect(taprootFee).not.toBeNull();
    expect(taprootFee!.amount.toNumber()).toBeLessThan(segwitFee!.amount.toNumber());
  });

  it('should return a lower fee for mixed UTXOs than all native segwit', () => {
    const mixedRecipients = [{ address: recipientAddress, amount: createMoney(15000, 'BTC') }];

    const allSegwitFee = getBitcoinTransactionFee({
      recipients: mixedRecipients,
      utxos: [
        { address: recipientAddress, txid: mockTxid, value: 10000 },
        { address: recipientAddress, txid: mockTxid, value: 10000 },
      ],
      feeRate: 1,
    });
    const mixedFee = getBitcoinTransactionFee({
      recipients: mixedRecipients,
      utxos: [
        { address: recipientAddress, txid: mockTxid, value: 10000 },
        { address: taprootAddress, txid: mockTxid, value: 10000 },
      ],
      feeRate: 1,
    });

    expect(allSegwitFee).not.toBeNull();
    expect(mixedFee).not.toBeNull();
    expect(mixedFee!.amount.toNumber()).toBeLessThan(allSegwitFee!.amount.toNumber());
  });
});

describe('getBitcoinFees', () => {
  it('should return the fees for different fee rates', () => {
    const feeRates: AverageBitcoinFeeRates = {
      fastestFee: new BigNumber(3),
      halfHourFee: new BigNumber(2),
      hourFee: new BigNumber(1),
    };
    const recipients: CoinSelectionRecipient[] = [
      { address: recipientAddress, amount: createMoney(1000, 'BTC') },
    ];
    const utxos = [
      {
        address: recipientAddress,
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        value: 2000,
      } as const,
    ];

    const fees = getBitcoinFees({ feeRates, recipients, utxos });
    const expectedFees = {
      high: { feeRate: 3, fee: createMoney(422, 'BTC') },
      standard: { feeRate: 2, fee: createMoney(281, 'BTC') },
      low: { feeRate: 1, fee: createMoney(141, 'BTC') },
    };

    expect(fees).toEqual(expectedFees);
  });
});
