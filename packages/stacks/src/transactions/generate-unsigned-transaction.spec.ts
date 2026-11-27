import {
  AuthType,
  ClarityVersion,
  type FungiblePostCondition,
  PayloadType,
  PostConditionMode,
  deserializeTransaction,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { assert, describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { formatAssetString } from '../stacks.utils';
import { generateStacksUnsignedTransaction, initNonce } from './generate-unsigned-transaction';
import {
  type StacksUnsignedContractCallOptions,
  type StacksUnsignedContractDeployOptions,
  type StacksUnsignedTokenTransferOptions,
  TransactionTypes,
} from './transaction.types';

const testPublicKey = '8721c6a5237f5e8d361161a7855aa56885a3e19e2ea6ee268fb14eabc5e2ed9001';

describe('initNonce', () => {
  it('should initialize nonce as BigNumber', () => {
    const nonce = '123';
    const result = initNonce(nonce);
    expect(result).toBeInstanceOf(BigNumber);
    expect(result.toString()).toBe('123');
  });
});

describe('generateStacksUnsignedTransaction', () => {
  it('should generate unsigned contract call', async () => {
    const options: StacksUnsignedContractCallOptions = {
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      contractName: 'hello-world',
      functionName: 'print',
      fee: createMoney(new BigNumber(1000), 'STX'),
      functionArgs: [],
      nonce: '1',
      postConditions: [],
      publicKey: testPublicKey,
    };

    const result = await generateStacksUnsignedTransaction(options);
    expect(result).toBeDefined();
    expect(result.payload.payloadType).toEqual(PayloadType.ContractCall);
    expect(result.auth.spendingCondition.fee).toBe(BigInt('1000'));
    expect(result.auth.spendingCondition.nonce).toBe(BigInt('1'));
  });

  it('should keep the post condition mode and encode post conditions of a contract call', async () => {
    const postCondition: FungiblePostCondition = {
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
    const options: StacksUnsignedContractCallOptions = {
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      contractName: 'hello-world',
      functionName: 'print',
      fee: createMoney(new BigNumber(0), 'STX'),
      functionArgs: [],
      nonce: 0,
      postConditionMode: PostConditionMode.Allow,
      postConditions: [postCondition],
      publicKey: testPublicKey,
    };

    const result = await generateStacksUnsignedTransaction(options);
    expect(result.postConditionMode).toEqual(PostConditionMode.Allow);
    const postConditionValue = result.postConditions.values[0];
    expect('amount' in postConditionValue && postConditionValue.amount).toEqual(100n);
  });

  it('should generate unsigned contract deploy', async () => {
    const options: StacksUnsignedContractDeployOptions = {
      txType: TransactionTypes.ContractDeploy,
      codeBody: 'code',
      contractName: 'hello-world',
      fee: createMoney(new BigNumber(1000), 'STX'),
      nonce: '1',
      publicKey: testPublicKey,
    };

    const result = await generateStacksUnsignedTransaction(options);
    expect(result).toBeDefined();
    expect(result.payload.payloadType).toEqual(PayloadType.SmartContract);
    expect(result.auth.spendingCondition.fee).toBe(BigInt('1000'));
    expect(result.auth.spendingCondition.nonce).toBe(BigInt('1'));
  });

  it.each([
    ClarityVersion.Clarity1,
    ClarityVersion.Clarity2,
    ClarityVersion.Clarity3,
    ClarityVersion.Clarity4,
    ClarityVersion.Clarity5,
    ClarityVersion.Clarity6,
  ])(
    'should never generate a versioned contract deploy, even when Clarity %i is passed',
    async clarityVersion => {
      const optionsWithClarityVersion = {
        txType: TransactionTypes.ContractDeploy,
        clarityVersion,
        codeBody: 'code',
        contractName: 'hello-world',
        fee: createMoney(new BigNumber(1000), 'STX'),
        nonce: '1',
        publicKey: testPublicKey,
      };

      const result = await generateStacksUnsignedTransaction(optionsWithClarityVersion);
      const roundTripped = deserializeTransaction(result.serialize());
      expect(roundTripped.payload.payloadType).not.toEqual(PayloadType.VersionedSmartContract);
      if (roundTripped.payload.payloadType !== PayloadType.SmartContract)
        throw new Error('Expected smart contract payload');
      expect('clarityVersion' in roundTripped.payload).toEqual(false);
      expect(roundTripped.payload.contractName.content).toEqual('hello-world');
      expect(roundTripped.payload.codeBody.content).toEqual('code');
    }
  );

  it('should generate unsigned STX token transfer', async () => {
    const options: StacksUnsignedTokenTransferOptions = {
      txType: TransactionTypes.StxTokenTransfer,
      fee: createMoney(new BigNumber(1000), 'STX'),
      nonce: '1',
      recipient: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      amount: createMoney(new BigNumber(100), 'STX'),
      publicKey: testPublicKey,
    };

    const result = await generateStacksUnsignedTransaction(options);
    expect(result).toBeDefined();
    expect(result.payload.payloadType).toEqual(PayloadType.TokenTransfer);
    expect(result.auth.spendingCondition.fee).toBe(BigInt('1000'));
    expect(result.auth.spendingCondition.nonce).toBe(BigInt('1'));
    assert(result.payload.payloadType === PayloadType.TokenTransfer);
    expect(result.payload.recipient.value).toBe('ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH');
    expect(result.payload.amount).toBe(BigInt('100'));
  });

  it('should generate a sponsored STX token transfer with sponsored auth', async () => {
    const options: StacksUnsignedTokenTransferOptions = {
      txType: TransactionTypes.StxTokenTransfer,
      fee: createMoney(new BigNumber(0), 'STX'),
      nonce: '1',
      recipient: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      amount: createMoney(new BigNumber(100), 'STX'),
      publicKey: testPublicKey,
      sponsored: true,
    };

    const result = await generateStacksUnsignedTransaction(options);
    expect(result.auth.authType).toEqual(AuthType.Sponsored);
    expect(result.auth.spendingCondition.fee).toBe(BigInt('0'));
  });

  it('should generate a sponsored contract call with sponsored auth', async () => {
    const options: StacksUnsignedContractCallOptions = {
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
      contractName: 'hello-world',
      functionName: 'print',
      fee: createMoney(new BigNumber(0), 'STX'),
      functionArgs: [],
      nonce: '1',
      postConditions: [],
      publicKey: testPublicKey,
      sponsored: true,
    };

    const result = await generateStacksUnsignedTransaction(options);
    expect(result.auth.authType).toEqual(AuthType.Sponsored);
    expect(result.auth.spendingCondition.fee).toBe(BigInt('0'));
  });
});
