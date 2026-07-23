import {
  ClarityVersion,
  PayloadType,
  TokenTransferPayloadWire,
  deserializeTransaction,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { generateStacksUnsignedTransaction, initNonce } from './generate-unsigned-transaction';
import {
  StacksUnsignedContractCallOptions,
  StacksUnsignedContractDeployOptions,
  StacksUnsignedTokenTransferOptions,
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

  it('should generate a versioned contract deploy when a released clarity version is specified', async () => {
    const options: StacksUnsignedContractDeployOptions = {
      txType: TransactionTypes.ContractDeploy,
      clarityVersion: ClarityVersion.Clarity2,
      codeBody: 'code',
      contractName: 'hello-world',
      fee: createMoney(new BigNumber(1000), 'STX'),
      nonce: '1',
      publicKey: testPublicKey,
    };

    const result = await generateStacksUnsignedTransaction(options);
    if (result.payload.payloadType !== PayloadType.VersionedSmartContract)
      throw new Error('Expected versioned smart contract payload');
    expect(result.payload.clarityVersion).toEqual(ClarityVersion.Clarity2);
    expect(result.payload.contractName.content).toEqual('hello-world');
    expect(result.payload.codeBody.content).toEqual('code');
  });

  it('should omit the clarity version when Clarity 6 is specified', async () => {
    const options: StacksUnsignedContractDeployOptions = {
      txType: TransactionTypes.ContractDeploy,
      clarityVersion: ClarityVersion.Clarity6,
      codeBody: 'code',
      contractName: 'hello-world',
      fee: createMoney(new BigNumber(1000), 'STX'),
      nonce: '1',
      publicKey: testPublicKey,
    };

    const result = await generateStacksUnsignedTransaction(options);
    const roundTripped = deserializeTransaction(result.serialize());
    if (roundTripped.payload.payloadType !== PayloadType.SmartContract)
      throw new Error('Expected smart contract payload');
    expect('clarityVersion' in roundTripped.payload).toEqual(false);
    expect(roundTripped.payload.contractName.content).toEqual('hello-world');
    expect(roundTripped.payload.codeBody.content).toEqual('code');
  });

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
    expect((result.payload as TokenTransferPayloadWire).recipient.value).toBe(
      'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH'
    );
    expect((result.payload as TokenTransferPayloadWire).amount).toBe(BigInt('100'));
  });
});
