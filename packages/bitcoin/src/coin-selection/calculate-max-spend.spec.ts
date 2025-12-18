import { createBitcoinAddress } from '../validation/bitcoin-address';
import { calculateMaxSpend } from './calculate-max-spend';
import { mockUtxos } from './coin-selection.mocks';

const recipient = createBitcoinAddress('');
describe(calculateMaxSpend.name, () => {
  test('with 1 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 1,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50087948);
  });

  test('with 5 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 5,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50085342);
  });

  test('with 30 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 30,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50073585);
  });

  test('with 100 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 100,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50046950);
  });

  test('with 400 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 400,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(49969100);
  });
});
