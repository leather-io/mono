import { createGetStxAddressBalanceQueryOptions } from './create-get-stx-address-balance-query-options';

const address = 'SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST';
const network = 'https://api.mainnet.hiro.so';

const principalStxBalance = {
  balance: '15000000',
  available: '5000000',
  locked: { amount: '10000000' },
};

function makeClient() {
  return {
    getPrincipalStxBalance: vi.fn(() => Promise.resolve(principalStxBalance)),
  };
}

describe(createGetStxAddressBalanceQueryOptions.name, () => {
  test('keys the query by address and network', () => {
    const options = createGetStxAddressBalanceQueryOptions({
      address,
      client: makeClient(),
      network,
    });
    expect(options.queryKey).toEqual(['get-stx-address-balance', address, network]);
  });

  test('fetches the v3 principal stx balance', async () => {
    const client = makeClient();
    const options = createGetStxAddressBalanceQueryOptions({ address, client, network });

    const result = await options.queryFn({ signal: new AbortController().signal });

    expect(result).toEqual(principalStxBalance);
    expect(client.getPrincipalStxBalance).toHaveBeenCalledWith(address, expect.any(AbortSignal));
  });
});
