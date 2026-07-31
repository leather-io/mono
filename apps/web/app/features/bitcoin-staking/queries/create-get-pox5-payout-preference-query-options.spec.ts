import { poxAddressToTuple } from '@stacks/stacking';
import { noneCV, serializeCV, someCV, tupleCV, uintCV } from '@stacks/transactions';

import { createGetPox5PayoutPreferenceQueryOptions } from './create-get-pox5-payout-preference-query-options';

const address = 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP';
const signerManagerContractId = 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom-signer-manager';
const btcRewardAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

function makeClient(result: { okay: boolean; result?: string; cause?: string }) {
  return {
    callReadOnlyFunction() {
      return Promise.resolve(result);
    },
  };
}

function undefinedFunctionResult(functionName: string) {
  return { okay: false, cause: `RuntimeCheck(UndefinedFunction("${functionName}"))` };
}

function makeVersionedClient(
  resultsByFunction: Record<string, { okay: boolean; result?: string; cause?: string }>
) {
  const calledFunctions: string[] = [];
  return {
    calledFunctions,
    client: {
      callReadOnlyFunction({ functionName }: { functionName: string }) {
        calledFunctions.push(functionName);
        return Promise.resolve(
          resultsByFunction[functionName] ?? undefinedFunctionResult(functionName)
        );
      },
    },
  };
}

function serializePreference() {
  return `0x${serializeCV(
    someCV(
      tupleCV({
        'pox-addr': poxAddressToTuple(btcRewardAddress),
        'max-fee': uintCV(2500),
      })
    )
  )}`;
}

function serializePayoutConfig() {
  return `0x${serializeCV(
    someCV(
      tupleCV({
        'pox-addr': poxAddressToTuple(btcRewardAddress),
        'max-fee': uintCV(2500),
        'min-claim': uintCV(3047),
      })
    )
  )}`;
}

describe(createGetPox5PayoutPreferenceQueryOptions.name, () => {
  test('keys the query and disables it without an address or contract', () => {
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client: makeClient({ okay: true, result: `0x${serializeCV(noneCV())}` }),
    });
    expect(options.queryKey).toEqual([
      'pox5-payout-preference',
      address,
      signerManagerContractId,
      'mainnet',
    ]);
    expect(options.enabled).toBe(true);

    const disabled = createGetPox5PayoutPreferenceQueryOptions({
      address: undefined,
      signerManagerContractId,
      networkName: 'mainnet',
      client: makeClient({ okay: true }),
    });
    expect(disabled.enabled).toBe(false);
  });

  test('returns null when no preference is stored', async () => {
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client: makeClient({ okay: true, result: `0x${serializeCV(noneCV())}` }),
    });
    await expect(options.queryFn()).resolves.toBeNull();
  });

  test('decodes a stored preference', async () => {
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client: makeClient({ okay: true, result: serializePreference() }),
    });
    await expect(options.queryFn()).resolves.toEqual({
      btcRewardAddress,
      maxFeeSats: 2500n,
    });
  });

  test('reads get-pox-addr first and never calls the v2 function on a v1 contract', async () => {
    const { client, calledFunctions } = makeVersionedClient({
      'get-pox-addr': { okay: true, result: serializePreference() },
    });
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client,
    });
    await expect(options.queryFn()).resolves.toEqual({
      btcRewardAddress,
      maxFeeSats: 2500n,
    });
    expect(calledFunctions).toEqual(['get-pox-addr']);
  });

  test('falls back to get-payout-config and decodes its min-claim tuple on a v2 contract', async () => {
    const { client, calledFunctions } = makeVersionedClient({
      'get-payout-config': { okay: true, result: serializePayoutConfig() },
    });
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client,
    });
    await expect(options.queryFn()).resolves.toEqual({
      btcRewardAddress,
      maxFeeSats: 2500n,
    });
    expect(calledFunctions).toEqual(['get-pox-addr', 'get-payout-config']);
  });

  test('throws when the contract exposes neither payout read', async () => {
    const { client } = makeVersionedClient({});
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client,
    });
    await expect(options.queryFn()).rejects.toThrowError(
      `${signerManagerContractId} exposes none of: get-pox-addr, get-payout-config`
    );
  });

  test('throws when the read fails so a failed read is never mistaken for no preference', async () => {
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client: makeClient({ okay: false, cause: 'Unchecked(NoSuchContract)' }),
    });
    await expect(options.queryFn()).rejects.toThrowError('Unchecked(NoSuchContract)');
  });

  test('throws when the read succeeds without a result', async () => {
    const options = createGetPox5PayoutPreferenceQueryOptions({
      address,
      signerManagerContractId,
      networkName: 'mainnet',
      client: makeClient({ okay: true }),
    });
    await expect(options.queryFn()).rejects.toThrowError();
  });
});
