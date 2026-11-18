import { contractPrincipalCV, noneCV, serializeCV, uintCV } from '@stacks/transactions';

import { convertPox5Transaction, isPox5MutationCall } from './get-pending-pox5-txs';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const signerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';

function toHexArg(value: Parameters<typeof serializeCV>[0]) {
  return { hex: `0x${serializeCV(value)}` };
}

const signerManagerCV = contractPrincipalCV(
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  'signer-manager'
);

const stakeTx = {
  tx_id: '0xstake',
  contract_call: {
    contract_id: pox5ContractId,
    function_name: 'stake',
    function_args: [
      toHexArg(signerManagerCV),
      toHexArg(uintCV(40_000_000n)),
      toHexArg(uintCV(12n)),
      toHexArg(uintCV(900_000n)),
      toHexArg(noneCV()),
    ],
  },
};

const stakeUpdateTx = {
  tx_id: '0xupdate',
  contract_call: {
    contract_id: pox5ContractId,
    function_name: 'stake-update',
    function_args: [
      toHexArg(signerManagerCV),
      toHexArg(signerManagerCV),
      toHexArg(uintCV(6n)),
      toHexArg(uintCV(10_000_000n)),
      toHexArg(noneCV()),
    ],
  },
};

const unstakeTx = {
  tx_id: '0xunstake',
  contract_call: {
    contract_id: pox5ContractId,
    function_name: 'unstake',
    function_args: [toHexArg(signerManagerCV)],
  },
};

const delegateStxTx = {
  tx_id: '0xdelegate',
  contract_call: {
    contract_id: 'SP000000000000000000002Q6VF78.pox-4',
    function_name: 'delegate-stx',
    function_args: [toHexArg(uintCV(40_000_000n))],
  },
};

const stackingDaoWrapperContractId = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-v1';

const wrappedStakeTx = {
  tx_id: '0xwrapped-stake',
  contract_call: {
    contract_id: stackingDaoWrapperContractId,
    function_name: 'delegate',
    function_args: [
      toHexArg(signerManagerCV),
      toHexArg(uintCV(40_000_000n)),
      toHexArg(uintCV(12n)),
    ],
  },
};

const wrappedStakeUpdateTx = {
  tx_id: '0xwrapped-update',
  contract_call: {
    contract_id: stackingDaoWrapperContractId,
    function_name: 'delegate-update',
    function_args: [
      toHexArg(signerManagerCV),
      toHexArg(signerManagerCV),
      toHexArg(uintCV(6n)),
      toHexArg(uintCV(10_000_000n)),
      toHexArg(noneCV()),
    ],
  },
};

const wrappedUnstakeTx = {
  tx_id: '0xwrapped-unstake',
  contract_call: {
    contract_id: stackingDaoWrapperContractId,
    function_name: 'undelegate',
    function_args: [toHexArg(signerManagerCV)],
  },
};

describe(isPox5MutationCall.name, () => {
  const predicate = isPox5MutationCall(pox5ContractId);

  test('matches stake, stake-update, and unstake on the pox-5 contract', () => {
    expect(predicate(stakeTx)).toBe(true);
    expect(predicate(stakeUpdateTx)).toBe(true);
    expect(predicate(unstakeTx)).toBe(true);
  });

  test('matches wrapper delegate, delegate-update, and undelegate calls', () => {
    expect(predicate(wrappedStakeTx)).toBe(true);
    expect(predicate(wrappedStakeUpdateTx)).toBe(true);
    expect(predicate(wrappedUnstakeTx)).toBe(true);
  });

  test('does not match pox-4 delegate calls', () => {
    expect(predicate(delegateStxTx)).toBe(false);
  });

  test('does not match wrapper function names on unknown contracts', () => {
    expect(
      predicate({
        ...wrappedStakeTx,
        contract_call: { ...wrappedStakeTx.contract_call, contract_id: signerManagerContractId },
      })
    ).toBe(false);
  });

  test('does not match pox-5 function names on other contracts', () => {
    expect(
      predicate({
        ...stakeTx,
        contract_call: { ...stakeTx.contract_call, contract_id: signerManagerContractId },
      })
    ).toBe(false);
  });
});

describe(convertPox5Transaction.name, () => {
  test('converts a pending stake call', () => {
    expect(convertPox5Transaction(stakeTx)).toEqual({
      kind: 'stake',
      txId: '0xstake',
      amountMicroStx: 40_000_000n,
      numCycles: 12,
      signerManagerContractId,
    });
  });

  test('converts a pending stake-update call', () => {
    expect(convertPox5Transaction(stakeUpdateTx)).toEqual({
      kind: 'stake-update',
      txId: '0xupdate',
      cyclesToExtend: 6,
      amountIncreaseMicroStx: 10_000_000n,
      newSignerManagerContractId: signerManagerContractId,
    });
  });

  test('converts a pending unstake call', () => {
    expect(convertPox5Transaction(unstakeTx)).toEqual({ kind: 'unstake', txId: '0xunstake' });
  });

  test('converts wrapper delegate calls to the matching pending kinds', () => {
    expect(convertPox5Transaction(wrappedStakeTx)).toEqual({
      kind: 'stake',
      txId: '0xwrapped-stake',
      amountMicroStx: 40_000_000n,
      numCycles: 12,
      signerManagerContractId,
    });
    expect(convertPox5Transaction(wrappedStakeUpdateTx)).toEqual({
      kind: 'stake-update',
      txId: '0xwrapped-update',
      cyclesToExtend: 6,
      amountIncreaseMicroStx: 10_000_000n,
      newSignerManagerContractId: signerManagerContractId,
    });
    expect(convertPox5Transaction(wrappedUnstakeTx)).toEqual({
      kind: 'unstake',
      txId: '0xwrapped-unstake',
    });
  });

  test('throws on unexpected function names', () => {
    expect(() => convertPox5Transaction(delegateStxTx)).toThrowError();
  });
});
