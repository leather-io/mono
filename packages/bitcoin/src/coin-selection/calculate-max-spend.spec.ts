import { calculateMaxBitcoinSpend } from './calculate-max-spend';
import { generateMockAverageFee, mockUtxos } from './coin-selection.mocks';

describe(calculateMaxBitcoinSpend.name, () => {
  test('with 1 sat/vb fee', () => {
    const fee = 1;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos: mockUtxos,
      fetchedFeeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50087948);
  });

  test('with 5 sat/vb fee', () => {
    const fee = 5;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos: mockUtxos,
      fetchedFeeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50085342);
  });

  test('with 30 sat/vb fee', () => {
    const fee = 30;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos: mockUtxos,
      fetchedFeeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50073585);
  });

  test('with 100 sat/vb fee', () => {
    const fee = 100;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos: mockUtxos,
      fetchedFeeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50046950);
  });

  test('with 400 sat/vb fee', () => {
    const fee = 400;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos: mockUtxos,
      fetchedFeeRates: generateMockAverageFee(fee),
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(49969100);
  });
});
