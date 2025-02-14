import { createBitcoinAddress } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { mockUtxos } from './coin-selection.mocks';
import { filterUneconomicalUtxos } from './coin-selection.utils';

const recipientAddress = createBitcoinAddress('tb1qt28eagxcl9gvhq2rpj5slg7dwgxae2dn2hk93m');

describe(filterUneconomicalUtxos.name, () => {
  const recipients = [
    {
      address: recipientAddress,
      amount: createMoney(0, 'BTC'),
    },
  ];

  test('with 1 sat/vb fee', () => {
    const fee = 1;
    const filteredUtxos = filterUneconomicalUtxos({
      utxos: mockUtxos,
      feeRate: fee,
      recipients,
    });

    expect(filteredUtxos.length).toEqual(9);
  });

  test('with 10 sat/vb fee', () => {
    const fee = 10;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(7);
  });

  test('with 30 sat/vb fee', () => {
    const fee = 30;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(5);
  });

  test('with 200 sat/vb fee', () => {
    const fee = 200;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(3);
  });

  test('with 400 sat/vb fee', () => {
    const fee = 400;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(2);
  });
});
