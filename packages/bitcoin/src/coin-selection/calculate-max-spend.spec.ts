import { createMoney } from '@leather.io/utils';

import { recipientAddress, taprootAddress } from '../mocks/mocks';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import { calculateMaxSpend } from './calculate-max-spend';
import { mockTaprootUtxos, mockUtxos } from './coin-selection.mocks';
import { getSizeInfo } from './coin-selection.utils';

const recipient = createBitcoinAddress('');
describe(calculateMaxSpend.name, () => {
  test('that empty utxos returns zero', () => {
    const result = calculateMaxSpend({ recipient: recipientAddress, utxos: [], feeRate: 1 });
    expect(result.spendAllFee).toEqual(0);
    expect(result.amount.amount.toNumber()).toEqual(0);
    expect(result.spendableBitcoin.toNumber()).toEqual(0);
  });

  test('with 1 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 1,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50087977);
    expect(maxBitcoinSpend.spendAllFee).toEqual(623);
  });

  test('with 5 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 5,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50085487);
    expect(maxBitcoinSpend.spendAllFee).toEqual(3113);
  });

  test('with 30 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 30,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50074485);
    expect(maxBitcoinSpend.spendAllFee).toEqual(10515);
  });

  test('with 100 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 100,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50049950);
    expect(maxBitcoinSpend.spendAllFee).toEqual(35050);
  });

  test('with 400 sat/vb fee', () => {
    const maxBitcoinSpend = calculateMaxSpend({
      recipient,
      utxos: mockUtxos,
      feeRate: 400,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(49981400);
    expect(maxBitcoinSpend.spendAllFee).toEqual(58600);
  });

  describe('with taproot UTXOs', () => {
    const taprootRecipient = recipientAddress;

    test('with 1 sat/vb fee', () => {
      const result = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockTaprootUtxos,
        feeRate: 1,
      });
      expect(result.amount.amount.toNumber()).toEqual(50088041);
      expect(result.spendAllFee).toEqual(559);
      expect(result.spendableBitcoin.toNumber()).toEqual(0.50088041);
    });

    test('with 5 sat/vb fee', () => {
      const result = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockTaprootUtxos,
        feeRate: 5,
      });
      expect(result.amount.amount.toNumber()).toEqual(50085805);
      expect(result.spendAllFee).toEqual(2795);
    });

    test('with 30 sat/vb fee', () => {
      const result = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockTaprootUtxos,
        feeRate: 30,
      });
      expect(result.amount.amount.toNumber()).toEqual(50075130);
      expect(result.spendAllFee).toEqual(9870);
    });

    test('with 100 sat/vb fee', () => {
      const result = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockTaprootUtxos,
        feeRate: 100,
      });
      expect(result.amount.amount.toNumber()).toEqual(50052100);
      expect(result.spendAllFee).toEqual(32900);
    });

    test('with 400 sat/vb fee', () => {
      const result = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockTaprootUtxos,
        feeRate: 400,
      });
      expect(result.amount.amount.toNumber()).toEqual(49979400);
      expect(result.spendAllFee).toEqual(85600);
    });

    test('taproot inputs have lower fees than native segwit at same fee rate', () => {
      const segwitResult = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockUtxos,
        feeRate: 30,
      });
      const taprootResult = calculateMaxSpend({
        recipient: taprootRecipient,
        utxos: mockTaprootUtxos,
        feeRate: 30,
      });
      expect(taprootResult.spendAllFee).toBeLessThan(segwitResult.spendAllFee);
    });
  });

  test('send-max fee should not include a change output', () => {
    const feeRate = 10;
    const utxos = mockTaprootUtxos;

    const result = calculateMaxSpend({ recipient: recipientAddress, utxos, feeRate });

    const correctSize = getSizeInfo({
      utxos,
      recipients: [{ address: recipientAddress, amount: createMoney(0, 'BTC') }],
      isSendMax: true,
    });
    const correctFee = Math.ceil(correctSize.txVBytes * feeRate);

    expect(result.spendAllFee).toEqual(correctFee);
  });

  describe('with taproot recipient', () => {
    test('P2TR output costs more than P2WPKH output', () => {
      const segwitRecipientResult = calculateMaxSpend({
        recipient: recipientAddress,
        utxos: mockUtxos,
        feeRate: 30,
      });
      const taprootRecipientResult = calculateMaxSpend({
        recipient: taprootAddress,
        utxos: mockUtxos,
        feeRate: 30,
      });
      expect(segwitRecipientResult.amount.amount.toNumber()).toEqual(50073555);
      expect(taprootRecipientResult.amount.amount.toNumber()).toEqual(50073195);
      expect(taprootRecipientResult.spendAllFee).toBeGreaterThan(segwitRecipientResult.spendAllFee);
    });
  });
});
