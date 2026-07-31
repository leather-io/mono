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
