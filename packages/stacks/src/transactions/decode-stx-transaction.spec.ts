import {
  Pc,
  PostConditionMode,
  noneCV,
  principalCV,
  privateKeyToPublic,
  publicKeyToHex,
  serializeCV,
  uintCV,
} from '@stacks/transactions';

import { createMoney } from '@leather.io/utils';

import { decodeStxTransactionPayload } from './decode-stx-transaction';
import { generateStacksUnsignedTransaction } from './generate-unsigned-transaction';
import { TransactionTypes } from './transaction.types';

const privateKeys = ['11'.repeat(32) + '01', '22'.repeat(32) + '01'];
const publicKeys = privateKeys.map(key => publicKeyToHex(privateKeyToPublic(key)));
const recipient = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';

describe(decodeStxTransactionPayload.name, () => {
  test('decodes a token transfer payload', async () => {
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      recipient,
      amount: createMoney(1000, 'STX'),
      fee: createMoney(250, 'STX'),
      nonce: 0,
      publicKeys,
      numSignatures: 2,
      useNonSequentialMultiSig: true,
    });

    expect(decodeStxTransactionPayload(tx.serialize())).toEqual({
      type: 'stxTransfer',
      recipient,
      amount: 1000n,
      memo: '',
      fee: 250n,
    });
  });

  test('decodes a contract call payload', async () => {
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-4',
      functionName: 'delegate-stx',
      functionArgs: [],
      fee: createMoney(250, 'STX'),
      nonce: 0,
      publicKey: publicKeys[0],
    });

    expect(decodeStxTransactionPayload(tx.serialize())).toEqual({
      type: 'contractCall',
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-4',
      functionName: 'delegate-stx',
      fee: 250n,
    });
  });

  test('decodes a post-condition-guarded sip10 transfer as its own payload type', async () => {
    const sender = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';
    const contractId = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token';
    const functionArgs = [uintCV(2_500_000), principalCV(sender), principalCV(recipient), noneCV()];
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT',
      contractName: 'sbtc-token',
      functionName: 'transfer',
      functionArgs: functionArgs.map(arg => serializeCV(arg)),
      postConditionMode: PostConditionMode.Deny,
      postConditions: [Pc.principal(sender).willSendEq(2_500_000).ft(contractId, 'sbtc-token')],
      fee: createMoney(250, 'STX'),
      nonce: 0,
      publicKey: publicKeys[0],
    });

    expect(decodeStxTransactionPayload(tx.serialize())).toEqual({
      type: 'sip10Transfer',
      contractId,
      assetName: 'sbtc-token',
      amount: 2_500_000n,
      sender,
      recipient,
      memo: undefined,
      fee: 250n,
    });
  });

  test('decodes a transfer-shaped call without post conditions as a generic contract call', async () => {
    const sender = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';
    const functionArgs = [uintCV(2_500_000), principalCV(sender), principalCV(recipient), noneCV()];
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT',
      contractName: 'sbtc-token',
      functionName: 'transfer',
      functionArgs: functionArgs.map(arg => serializeCV(arg)),
      fee: createMoney(250, 'STX'),
      nonce: 0,
      publicKey: publicKeys[0],
    });

    expect(decodeStxTransactionPayload(tx.serialize())).toEqual({
      type: 'contractCall',
      contractAddress: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT',
      contractName: 'sbtc-token',
      functionName: 'transfer',
      fee: 250n,
    });
  });

  test('decodes a contract deploy payload', async () => {
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.ContractDeploy,
      contractName: 'my-contract',
      codeBody: '(define-read-only (noop) true)',
      fee: createMoney(250, 'STX'),
      nonce: 0,
      publicKey: publicKeys[0],
    });

    expect(decodeStxTransactionPayload(tx.serialize())).toEqual({
      type: 'contractDeploy',
      contractName: 'my-contract',
      fee: 250n,
    });
  });
});
