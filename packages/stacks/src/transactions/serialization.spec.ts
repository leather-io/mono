import { estimateTransactionByteLength } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { generateStacksUnsignedTransaction } from './generate-unsigned-transaction';
import { estimateStacksTransactionByteLength } from './serialization';
import { TransactionTypes } from './transaction.types';

const recipient = 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW';
const publicKeys = [
  '026a04ab98d9e4774ad806e302dddeb63bea16b5cb5f223ee77478e861bb583eb3',
  '02410c8e39987b918021268fcd601670fc75e138e7b0027fc690abd954bc03aa20',
];
const messageSignatureWireByteLength = 66;

describe('estimateStacksTransactionByteLength', () => {
  it('matches the library estimate for single-signature transactions', async () => {
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      recipient,
      amount: createMoney(new BigNumber(1000), 'STX'),
      fee: createMoney(new BigNumber(0), 'STX'),
      nonce: '0',
      network: 'testnet',
      publicKey: publicKeys[0],
    });
    expect(estimateStacksTransactionByteLength(tx)).toBe(estimateTransactionByteLength(tx));
  });

  it('reserves signature space for non-sequential multisig transactions', async () => {
    const numSignatures = 2;
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      recipient,
      amount: createMoney(new BigNumber(1000), 'STX'),
      fee: createMoney(new BigNumber(0), 'STX'),
      nonce: '0',
      network: 'testnet',
      publicKeys,
      numSignatures,
      useNonSequentialMultiSig: true,
    });
    expect(estimateStacksTransactionByteLength(tx)).toBe(
      estimateTransactionByteLength(tx) + numSignatures * messageSignatureWireByteLength
    );
    expect(estimateStacksTransactionByteLength(tx)).toBeGreaterThan(tx.serializeBytes().byteLength);
  });
});
