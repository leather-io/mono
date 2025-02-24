import { createBitcoinAddress } from '../validation/bitcoin-address';
import { calculateMaxSpend } from './calculate-max-spend';
import { generateMockAverageFee, mockUtxos } from './coin-selection.mocks';

const recipient = createBitcoinAddress('');
describe(calculateMaxSpend.name, () => {
  test('with 1 sat/vb fee', () => {
    const fee = 1;
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50087948);
  });

  test('with 5 sat/vb fee', () => {
    const fee = 5;
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50085342);
  });

  test('with 30 sat/vb fee', () => {
    const fee = 30;
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50073585);
  });

  test('with 100 sat/vb fee', () => {
    const fee = 100;
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50046950);
  });

  test('with 400 sat/vb fee', () => {
    const fee = 400;
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(49969100);
  });
});
