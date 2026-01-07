import { createBitcoinTransactionsByAddressListQueries } from './transactions-by-address.query';

describe(createBitcoinTransactionsByAddressListQueries.name, () => {
  test('preserves positional mapping even when addresses are empty/duplicate to protect Ledger/Stacks-only scenarios', () => {
    const client = {
      networkName: 'testnet',
      addressApi: { getTransactionsByAddress: () => void 0 },
    };

    const queries = createBitcoinTransactionsByAddressListQueries(['', ''], client as any);
    expect(queries).toHaveLength(2);
    expect(queries[0].enabled).toBe(false);
    expect(queries[1].enabled).toBe(false);
  });

  test('preserves positional mapping when addresses are distinct', () => {
    const client = {
      networkName: 'testnet',
      addressApi: { getTransactionsByAddress: () => void 0 },
    };

    const queries = createBitcoinTransactionsByAddressListQueries(['a', 'b'], client as any);
    expect(queries).toHaveLength(2);
    expect(queries[0].enabled).toBe(true);
    expect(queries[1].enabled).toBe(true);
  });
});
