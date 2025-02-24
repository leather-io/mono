import BigNumber from 'bignumber.js';

import { AverageBitcoinFeeRates } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { CoinSelectionRecipient, CoinSelectionUtxo } from '../coin-selection/coin-selection';
import { recipientAddress, taprootAddress } from '../mocks/mocks';
import { getBitcoinFees, getBitcoinTransactionFee } from './bitcoin-fees';

describe('getBitcoinTransactionFee', () => {
  it('should return the fee for a normal transaction', () => {
    const args = {
      recipients: [{ address: recipientAddress, amount: createMoney(1000, 'BTC') }],
      utxos: [
        {
          address: taprootAddress,
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
          address: taprootAddress,
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
    const utxos: CoinSelectionUtxo[] = [
      {
        address: taprootAddress,
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        value: 2000,
      },
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
