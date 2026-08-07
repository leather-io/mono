import { STACKS_TESTNET } from '@stacks/network';
import { type FungiblePostCondition, PostConditionMode } from '@stacks/transactions';

import { TransactionTypes, formatAssetString } from '@leather.io/stacks';

import { generateUnsignedTransaction } from './generate-unsigned-txs';
import type { ContractCallPayload } from './stacks-transaction-payloads';

describe('generated signed transactions', () => {
  test('can handle encoded payload', async () => {
    const pc: FungiblePostCondition = {
      type: 'ft-postcondition',
      address: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      condition: 'gte',
      amount: '100',
      asset: formatAssetString({
        contractAddress: 'ST34RKEJKQES7MXQFBT29KSJZD73QK3YNT5N56C6X',
        contractName: 'test-asset-contract',
        assetName: 'test-asset-name',
      }),
    };
    const txData: ContractCallPayload = {
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      contractName: 'hello-world',
      functionName: 'print',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [pc],
      publicKey: '8721c6a5237f5e8d361161a7855aa56885a3e19e2ea6ee268fb14eabc5e2ed9001',
      network: STACKS_TESTNET,
    };
    const tx = await generateUnsignedTransaction({
      txData,
      publicKey: '8721c6a5237f5e8d361161a7855aa56885a3e19e2ea6ee268fb14eabc5e2ed9001',
      nonce: 0,
      fee: 0,
    });
    expect(tx.postConditionMode).toEqual(PostConditionMode.Allow);
    const postConditionValue = tx.postConditions.values[0];
    expect('amount' in postConditionValue && postConditionValue.amount).toEqual(100n);
  }, 5000);
});
