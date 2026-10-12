import { noneCV, principalCV, serializeCV, tupleCV, uintCV } from '@stacks/transactions';

import { createGetPox5EarnedRewardsQueryOptions } from './create-get-pox5-earned-rewards-query-options';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const signerManagerContractId = 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom-signer-manager';
const stackingDaoSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager';
const stackingDaoPartnerSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.signer-manager-foundry-v1';
const address = 'SP3RY185H0R8TNX4PGRYFZ07AV001N23N1FJX9MEE';
const cycle = 141;

const tupleResult = `0x${serializeCV(tupleCV({ earned: uintCV(12_500n), fees: uintCV(625n) }))}`;
const uintResult = `0x${serializeCV(uintCV(379n))}`;

function toHex(value: Parameters<typeof serializeCV>[0]) {
  return `0x${serializeCV(value)}`;
}

function makeClient(result: { okay: boolean; result?: string }) {
  const calls: {
    contractAddress: string;
    contractName: string;
    functionName: string;
    arguments: string[];
    sender: string;
  }[] = [];
  return {
    calls,
    callReadOnlyFunction(args: {
      contractAddress: string;
      contractName: string;
      functionName: string;
      readOnlyFunctionArgs: { arguments: string[]; sender: string };
    }) {
      calls.push({
        contractAddress: args.contractAddress,
        contractName: args.contractName,
        functionName: args.functionName,
        arguments: args.readOnlyFunctionArgs.arguments,
        sender: args.readOnlyFunctionArgs.sender,
      });
      return Promise.resolve(result);
    },
  };
}

function makeOptions(managerContractId: string | undefined, client: ReturnType<typeof makeClient>) {
  return createGetPox5EarnedRewardsQueryOptions({
    address,
    signerManagerContractId: managerContractId,
    cycle,
    pox5ContractId,
    client,
  });
}

describe(createGetPox5EarnedRewardsQueryOptions.name, () => {
  test('keys the query by staker, contract ids and cycle, and disables it without them', () => {
    const options = makeOptions(signerManagerContractId, makeClient({ okay: true }));
    expect(options.queryKey).toEqual([
      'pox5-earned-rewards',
      address,
      pox5ContractId,
      signerManagerContractId,
      cycle,
    ]);
    expect(options.enabled).toBe(true);

    expect(makeOptions(undefined, makeClient({ okay: true })).enabled).toBe(false);

    const withoutAddress = createGetPox5EarnedRewardsQueryOptions({
      address: undefined,
      signerManagerContractId,
      cycle,
      pox5ContractId,
      client: makeClient({ okay: true }),
    });
    expect(withoutAddress.enabled).toBe(false);
  });

  test('reads a standard pool from its signer-manager and parses the tuple', async () => {
    const client = makeClient({ okay: true, result: tupleResult });

    await expect(makeOptions(signerManagerContractId, client).queryFn()).resolves.toEqual({
      cycle,
      earned: 12_500n,
      fees: 625n,
    });
    expect(client.calls).toEqual([
      {
        contractAddress: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP',
        contractName: 'custom-signer-manager',
        functionName: 'get-earned-staker-rewards',
        arguments: [toHex(principalCV(address)), toHex(uintCV(cycle)), toHex(noneCV())],
        sender: address,
      },
    ]);
  });

  test('reads the Stacking DAO native pool from pox-5 and parses the bare uint', async () => {
    const client = makeClient({ okay: true, result: uintResult });

    await expect(
      makeOptions(stackingDaoSignerManagerContractId, client).queryFn()
    ).resolves.toEqual({ cycle, earned: 379n, fees: 0n });
    expect(client.calls).toEqual([
      {
        contractAddress: 'SP000000000000000000002Q6VF78',
        contractName: 'pox-5',
        functionName: 'get-earned-staker-rewards',
        arguments: [
          toHex(principalCV(stackingDaoSignerManagerContractId)),
          toHex(uintCV(cycle)),
          toHex(noneCV()),
          toHex(principalCV(address)),
        ],
        sender: address,
      },
    ]);
  });

  test('never reads a Stacking DAO partner signer-manager from pox-5', async () => {
    const client = makeClient({ okay: false });

    await expect(
      makeOptions(stackingDaoPartnerSignerManagerContractId, client).queryFn()
    ).resolves.toBeNull();
    expect(client.calls).toHaveLength(1);
    expect(client.calls[0]).toMatchObject({
      contractAddress: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG',
      contractName: 'signer-manager-foundry-v1',
    });
  });

  test('resolves to null when the read fails or returns the other shape', async () => {
    await expect(
      makeOptions(stackingDaoSignerManagerContractId, makeClient({ okay: false })).queryFn()
    ).resolves.toBeNull();
    await expect(
      makeOptions(
        stackingDaoSignerManagerContractId,
        makeClient({ okay: true, result: tupleResult })
      ).queryFn()
    ).resolves.toBeNull();
    await expect(
      makeOptions(signerManagerContractId, makeClient({ okay: true, result: uintResult })).queryFn()
    ).resolves.toBeNull();
  });
});
