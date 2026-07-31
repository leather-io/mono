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

describe(isPox5MutationCall.name, () => {
  const predicate = isPox5MutationCall(pox5ContractId);

  test('matches stake, stake-update, and unstake on the pox-5 contract', () => {
    expect(predicate(stakeTx)).toBe(true);
    expect(predicate(stakeUpdateTx)).toBe(true);
    expect(predicate(unstakeTx)).toBe(true);
  });

  test('does not match pox-4 delegate calls', () => {
    expect(predicate(delegateStxTx)).toBe(false);
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

  test('throws on unexpected function names', () => {
    expect(() => convertPox5Transaction(delegateStxTx)).toThrowError();
  });
});
