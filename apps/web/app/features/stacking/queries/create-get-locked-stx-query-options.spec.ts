import { createGetLockedStxQueryOptions } from './create-get-locked-stx-query-options';

const address = 'SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST';
const apiUrl = 'https://api.mainnet.hiro.so';

interface PrincipalStxBalance {
  balance: string;
  available: string;
  locked: { amount: string } | null;
}

function makeContext() {
  return { signal: new AbortController().signal };
}

function makeClient(response: PrincipalStxBalance) {
  return {
    getPrincipalStxBalance: vi.fn(() => Promise.resolve(response)),
  };
}

describe(createGetLockedStxQueryOptions.name, () => {
  test('keys the query by address and api url', () => {
    const options = createGetLockedStxQueryOptions({
      address,
      apiUrl,
      client: makeClient({ balance: '0', available: '0', locked: null }),
    });
    expect(options.queryKey).toEqual(['get-locked-stx', address, apiUrl]);
  });

  test('returns the locked amount of the principal', async () => {
    const client = makeClient({
      balance: '1500000',
      available: '500000',
      locked: { amount: '1000000' },
    });
    const options = createGetLockedStxQueryOptions({ address, apiUrl, client });

    await expect(options.queryFn(makeContext())).resolves.toBe(1000000n);
    expect(client.getPrincipalStxBalance).toHaveBeenCalledWith(address, expect.any(AbortSignal));
  });

  test('returns zero when nothing is locked', async () => {
    const options = createGetLockedStxQueryOptions({
      address,
      apiUrl,
      client: makeClient({ balance: '1500000', available: '1500000', locked: null }),
    });

    await expect(options.queryFn(makeContext())).resolves.toBe(0n);
  });
});
