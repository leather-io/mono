import { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  generateMockTaprootTransactions,
  generateMockTransactions,
  mockTaprootUtxos,
  mockUtxos,
} from './coin-selection.mocks';
import { breakDownSpendBySource, summarizeSpendSources } from './spend-sources';

function createOwnedUtxo(address: string, value: number): OwnedUtxo {
  return { address, value, txid: 'txid', vout: 0, path: '', keyOrigin: '' };
}

describe(summarizeSpendSources.name, () => {
  test('sums native segwit inputs only', () => {
    const result = summarizeSpendSources(mockUtxos);

    expect(result.nativeSegwit.amount.toString()).toEqual('50088600');
    expect(result.nativeSegwit.symbol).toEqual('BTC');
    expect(result.taproot.amount.toString()).toEqual('0');
    expect(result.nativeSegwitInputCount).toEqual(9);
    expect(result.taprootInputCount).toEqual(0);
    expect(result.inputCount).toEqual(9);
  });

  test('sums taproot inputs only', () => {
    const result = summarizeSpendSources(mockTaprootUtxos);

    expect(result.nativeSegwit.amount.toString()).toEqual('0');
    expect(result.taproot.amount.toString()).toEqual('50088600');
    expect(result.nativeSegwitInputCount).toEqual(0);
    expect(result.taprootInputCount).toEqual(9);
    expect(result.inputCount).toEqual(9);
  });

  test('splits mixed inputs by address type', () => {
    const result = summarizeSpendSources([
      ...generateMockTransactions([10000]),
      ...generateMockTaprootTransactions([25000, 40000]),
    ]);

    expect(result.nativeSegwit.amount.toString()).toEqual('10000');
    expect(result.taproot.amount.toString()).toEqual('65000');
    expect(result.nativeSegwitInputCount).toEqual(1);
    expect(result.taprootInputCount).toEqual(2);
    expect(result.inputCount).toEqual(3);
  });

  test('returns zero totals for no inputs', () => {
    const result = summarizeSpendSources([]);

    expect(result.nativeSegwit.amount.toString()).toEqual('0');
    expect(result.taproot.amount.toString()).toEqual('0');
    expect(result.nativeSegwitInputCount).toEqual(0);
    expect(result.taprootInputCount).toEqual(0);
    expect(result.inputCount).toEqual(0);
  });

  test('classifies mainnet addresses', () => {
    const result = summarizeSpendSources([
      createOwnedUtxo('bc1q253fdeyzuwx58xxssd3a2xw2gq7khhpmr6vgnh', 1000),
      createOwnedUtxo('bc1p0svqqvsaxtu5te5nxpq8qa9xg89rrenfg4xxvkhlqcu7hhrwzl9qgr0dya', 2000),
    ]);

    expect(result.nativeSegwit.amount.toString()).toEqual('1000');
    expect(result.taproot.amount.toString()).toEqual('2000');
  });

  test('classifies regtest addresses', () => {
    const result = summarizeSpendSources([
      createOwnedUtxo('bcrt1q6z64a43mjgkcq0ul2znwneq3spghrlau9slefp', 1000),
      createOwnedUtxo('bcrt1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqc8gma6', 2000),
    ]);

    expect(result.nativeSegwit.amount.toString()).toEqual('1000');
    expect(result.taproot.amount.toString()).toEqual('2000');
    expect(result.taprootInputCount).toEqual(1);
  });

  test('counts unsupported address types without assigning them to a source', () => {
    const result = summarizeSpendSources([
      createOwnedUtxo('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 5000),
      createOwnedUtxo('not-an-address', 7000),
      createOwnedUtxo('bc1q253fdeyzuwx58xxssd3a2xw2gq7khhpmr6vgnh', 1000),
    ]);

    expect(result.nativeSegwit.amount.toString()).toEqual('1000');
    expect(result.taproot.amount.toString()).toEqual('0');
    expect(result.nativeSegwitInputCount).toEqual(1);
    expect(result.taprootInputCount).toEqual(0);
    expect(result.inputCount).toEqual(3);
  });
});

describe(breakDownSpendBySource.name, () => {
  test('takes change from native segwit for a native segwit only spend', () => {
    const summary = summarizeSpendSources(generateMockTransactions([504404]));

    const result = breakDownSpendBySource(summary, createMoney(300444, 'BTC'));

    expect(result.nativeSegwit.amount.toString()).toEqual('300444');
    expect(result.taproot.amount.toString()).toEqual('0');
  });

  test('takes change from native segwit before taproot for a mixed spend', () => {
    const summary = summarizeSpendSources([
      ...generateMockTransactions([200000]),
      ...generateMockTaprootTransactions([300000]),
    ]);

    const result = breakDownSpendBySource(summary, createMoney(400500, 'BTC'));

    expect(result.nativeSegwit.amount.toString()).toEqual('100500');
    expect(result.taproot.amount.toString()).toEqual('300000');
  });

  test('takes change from taproot once native segwit is used up', () => {
    const summary = summarizeSpendSources([
      ...generateMockTransactions([10000]),
      ...generateMockTaprootTransactions([300000]),
    ]);

    const result = breakDownSpendBySource(summary, createMoney(100500, 'BTC'));

    expect(result.nativeSegwit.amount.toString()).toEqual('0');
    expect(result.taproot.amount.toString()).toEqual('100500');
  });

  test('assigns a taproot only spend to taproot', () => {
    const summary = summarizeSpendSources(generateMockTaprootTransactions([300000]));

    const result = breakDownSpendBySource(summary, createMoney(100500, 'BTC'));

    expect(result.nativeSegwit.amount.toString()).toEqual('0');
    expect(result.taproot.amount.toString()).toEqual('100500');
  });

  test('sums to the total spend when inputs cover it', () => {
    const summary = summarizeSpendSources([
      ...generateMockTransactions([200000]),
      ...generateMockTaprootTransactions([300000]),
    ]);
    const totalSpend = createMoney(450000, 'BTC');

    const result = breakDownSpendBySource(summary, totalSpend);

    expect(result.nativeSegwit.amount.plus(result.taproot.amount).toString()).toEqual('450000');
  });

  test('never exceeds the gross value of each source', () => {
    const summary = summarizeSpendSources([
      ...generateMockTransactions([1000]),
      ...generateMockTaprootTransactions([2000]),
    ]);

    const result = breakDownSpendBySource(summary, createMoney(10000, 'BTC'));

    expect(result.nativeSegwit.amount.toString()).toEqual('1000');
    expect(result.taproot.amount.toString()).toEqual('2000');
  });

  test('returns zero for no inputs', () => {
    const result = breakDownSpendBySource(summarizeSpendSources([]), createMoney(0, 'BTC'));

    expect(result.nativeSegwit.amount.toString()).toEqual('0');
    expect(result.taproot.amount.toString()).toEqual('0');
  });
});
