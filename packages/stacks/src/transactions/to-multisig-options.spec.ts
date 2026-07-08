import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { toUnsignedMultiSigStacksOptions } from './to-multisig-options';
import {
  type StacksUnsignedSingleSigContractCallOptions,
  type StacksUnsignedTokenTransferOptions,
  TransactionTypes,
} from './transaction.types';

const publicKeys = ['02aa', '03bb', '02cc'];

describe('toUnsignedMultiSigStacksOptions', () => {
  it('converts a single-sig token transfer to non-sequential multisig with placeholder nonce', () => {
    const options: StacksUnsignedTokenTransferOptions = {
      txType: TransactionTypes.StxTokenTransfer,
      recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      amount: createMoney(1000, 'STX'),
      fee: createMoney(300, 'STX'),
      nonce: 7,
      publicKey: '02deadbeef',
      network: 'testnet',
    };

    const result = toUnsignedMultiSigStacksOptions(options, { publicKeys, numSignatures: 2 });

    expect(result).toMatchObject({
      txType: TransactionTypes.StxTokenTransfer,
      recipient: options.recipient,
      publicKeys,
      numSignatures: 2,
      useNonSequentialMultiSig: true,
      nonce: 0,
    });
    expect('publicKey' in result).toBe(false);
  });

  it('preserves contract-call payload fields and drops the single-sig publicKey', () => {
    const options: StacksUnsignedSingleSigContractCallOptions = {
      txType: TransactionTypes.ContractCall,
      contractAddress: 'SP000000000000000000002Q6VF78',
      contractName: 'pox',
      functionName: 'delegate-stx',
      functionArgs: ['0x00'],
      fee: createMoney(500, 'STX'),
      nonce: 3,
      publicKey: '02deadbeef',
      network: 'mainnet',
    };

    const result = toUnsignedMultiSigStacksOptions(options, { publicKeys, numSignatures: 3 });

    expect(result).toMatchObject({
      txType: TransactionTypes.ContractCall,
      contractName: 'pox',
      functionName: 'delegate-stx',
      functionArgs: ['0x00'],
      publicKeys,
      numSignatures: 3,
      useNonSequentialMultiSig: true,
      nonce: 0,
    });
    expect('publicKey' in result).toBe(false);
  });
});
