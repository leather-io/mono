import { responseOkCV, serializeCV, uintCV } from '@stacks/transactions';

import { createGetPox5DelegatedAmountQueryOptions } from './create-get-pox5-delegated-amount-query-options';

const signerManagerContractId = 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom-signer-manager';
const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const cycle = 113;

function makeContext() {
  return { signal: new AbortController().signal };
}

function makeClient(result: { okay: boolean; result?: string }) {
  const calls: { functionName: string; arguments: string[] }[] = [];
  return {
    calls,
    callReadOnlyFunction(args: {
      functionName: string;
      readOnlyFunctionArgs: { arguments: string[] };
    }) {
      calls.push({
        functionName: args.functionName,
        arguments: args.readOnlyFunctionArgs.arguments,
      });
      return Promise.resolve(result);
    },
  };
}

describe(createGetPox5DelegatedAmountQueryOptions.name, () => {
  test('keys the query by contract ids and cycle, and disables it without them', () => {
    const options = createGetPox5DelegatedAmountQueryOptions({
      signerManagerContractId,
      cycle,
      pox5ContractId,
      client: makeClient({ okay: true, result: `0x${serializeCV(uintCV(0))}` }),
    });
    expect(options.queryKey).toEqual([
      'pox5-delegated-amount',
      pox5ContractId,
      signerManagerContractId,
      cycle,
    ]);
    expect(options.enabled).toBe(true);

    const withoutContract = createGetPox5DelegatedAmountQueryOptions({
      signerManagerContractId: undefined,
      cycle,
      pox5ContractId,
      client: makeClient({ okay: true }),
    });
    expect(withoutContract.enabled).toBe(false);

    const withoutCycle = createGetPox5DelegatedAmountQueryOptions({
      signerManagerContractId,
      cycle: undefined,
      pox5ContractId,
      client: makeClient({ okay: true }),
    });
    expect(withoutCycle.enabled).toBe(false);
  });

  test('parses the delegated amount and passes signer + cycle args', async () => {
    const client = makeClient({
      okay: true,
      result: `0x${serializeCV(uintCV(75_000_000_000n))}`,
    });
    const options = createGetPox5DelegatedAmountQueryOptions({
      signerManagerContractId,
      cycle,
      pox5ContractId,
      client,
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual(75_000_000_000n);
    expect(client.calls).toEqual([
      {
        functionName: 'get-amount-delegated-for-signer',
        arguments: [expect.stringMatching(/^0x0616/), `0x${serializeCV(uintCV(cycle))}`],
      },
    ]);
  });

  test('resolves to null when the read fails or returns a non-uint', async () => {
    const failed = createGetPox5DelegatedAmountQueryOptions({
      signerManagerContractId,
      cycle,
      pox5ContractId,
      client: makeClient({ okay: false }),
    });
    await expect(failed.queryFn(makeContext())).resolves.toBeNull();

    const nonUint = createGetPox5DelegatedAmountQueryOptions({
      signerManagerContractId,
      cycle,
      pox5ContractId,
      client: makeClient({ okay: true, result: `0x${serializeCV(responseOkCV(uintCV(1)))}` }),
    });
    await expect(nonUint.queryFn(makeContext())).resolves.toBeNull();
  });
});
