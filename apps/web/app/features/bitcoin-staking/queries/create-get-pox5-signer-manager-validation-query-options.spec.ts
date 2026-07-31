import { noneCV, serializeCV, someCV, uintCV } from '@stacks/transactions';

import { createGetPox5SignerManagerValidationQueryOptions } from './create-get-pox5-signer-manager-validation-query-options';

const contractId = 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom-signer-manager';
const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';

const conformingAbi = {
  functions: [
    { name: 'get-earned-staker-rewards', access: 'read_only' },
    { name: 'get-pox-addr', access: 'read_only' },
    { name: 'claim-staker-rewards', access: 'public' },
  ],
  variables: [{ name: 'fees-bips' }],
};

function makeContext() {
  return { signal: new AbortController().signal };
}

interface MakeClientArgs {
  abi?: typeof conformingAbi;
  abiError?: Error;
  signerInfoResult?: { okay: boolean; result?: string; cause?: string };
  signerInfoError?: Error;
}

function makeClient({
  abi = conformingAbi,
  abiError,
  signerInfoResult,
  signerInfoError,
}: MakeClientArgs = {}) {
  return {
    getContractInterface() {
      return abiError ? Promise.reject(abiError) : Promise.resolve(abi);
    },
    callReadOnlyFunction() {
      if (signerInfoError) return Promise.reject(signerInfoError);
      return Promise.resolve(
        signerInfoResult ?? { okay: true, result: `0x${serializeCV(someCV(uintCV(1)))}` }
      );
    },
  };
}

describe(createGetPox5SignerManagerValidationQueryOptions.name, () => {
  test('keys the query by contract ids and disables it without a contract', () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient(),
    });
    expect(options.queryKey).toEqual([
      'pox5-signer-manager-validation',
      pox5ContractId,
      contractId,
    ]);
    expect(options.enabled).toBe(true);

    const disabled = createGetPox5SignerManagerValidationQueryOptions({
      contractId: undefined,
      pox5ContractId,
      client: makeClient(),
    });
    expect(disabled.enabled).toBe(false);
  });

  test('reports not-found when the contract interface request returns 404', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({
        abiError: Object.assign(new Error('Request failed with status code 404'), { status: 404 }),
      }),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({
      status: 'invalid',
      reason: 'not-found',
    });
  });

  test('reports not-found when the 404 status is nested in the response', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({
        abiError: Object.assign(new Error('Request failed with status code 404'), {
          response: { status: 404 },
        }),
      }),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({
      status: 'invalid',
      reason: 'not-found',
    });
  });

  test('propagates contract interface transport failures instead of reporting a verdict', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({ abiError: new Error('Network Error') }),
    });
    await expect(options.queryFn(makeContext())).rejects.toThrowError('Network Error');
  });

  test('reports the missing standard interface members', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({
        abi: {
          functions: [
            { name: 'get-earned-staker-rewards', access: 'read_only' },
            { name: 'claim-staker-rewards', access: 'read_only' },
          ],
          variables: [],
        },
      }),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({
      status: 'invalid',
      reason: 'missing-functions',
      missingFunctions: ['get-pox-addr or get-payout-config', 'claim-staker-rewards', 'fees-bips'],
    });
  });

  test('accepts the v2 payout read get-payout-config in place of get-pox-addr', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({
        abi: {
          functions: [
            { name: 'get-earned-staker-rewards', access: 'read_only' },
            { name: 'get-payout-config', access: 'read_only' },
            { name: 'claim-staker-rewards', access: 'public' },
          ],
          variables: [{ name: 'fees-bips' }],
        },
      }),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({ status: 'valid' });
  });

  test('reports not-registered when get-signer-info returns none', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({
        signerInfoResult: { okay: true, result: `0x${serializeCV(noneCV())}` },
      }),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({
      status: 'invalid',
      reason: 'not-registered',
    });
  });

  test('throws when the registration read fails so a failed read is never mistaken for a verdict', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({ signerInfoResult: { okay: false, cause: 'NoSuchContract' } }),
    });
    await expect(options.queryFn(makeContext())).rejects.toThrowError('NoSuchContract');
  });

  test('propagates registration read transport failures instead of reporting a verdict', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient({ signerInfoError: new Error('Network Error') }),
    });
    await expect(options.queryFn(makeContext())).rejects.toThrowError('Network Error');
  });

  test('reports valid for a conforming registered contract', async () => {
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client: makeClient(),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({ status: 'valid' });
  });

  test('serializes the contract principal for the registration read', async () => {
    const seenArgs: string[][] = [];
    const client = {
      getContractInterface() {
        return Promise.resolve(conformingAbi);
      },
      callReadOnlyFunction(args: { readOnlyFunctionArgs: { arguments: string[] } }) {
        seenArgs.push(args.readOnlyFunctionArgs.arguments);
        return Promise.resolve({ okay: true, result: `0x${serializeCV(someCV(uintCV(1)))}` });
      },
    };
    const options = createGetPox5SignerManagerValidationQueryOptions({
      contractId,
      pox5ContractId,
      client,
    });
    await options.queryFn(makeContext());
    expect(seenArgs).toHaveLength(1);
    expect(seenArgs[0]?.[0]).toMatch(/^0x0616/);
  });
});
