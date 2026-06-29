import { privateKeyToPublic, publicKeyToHex } from '@stacks/transactions';

import { createMoney } from '@leather.io/utils';

import { decodeStxTransferPayload } from './decode-stx-transfer';
import { generateStacksUnsignedTransaction } from './generate-unsigned-transaction';
import { TransactionTypes } from './transaction.types';

const privateKeys = ['11'.repeat(32) + '01', '22'.repeat(32) + '01'];
const publicKeys = privateKeys.map(key => publicKeyToHex(privateKeyToPublic(key)));
const recipient = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';

describe(decodeStxTransferPayload.name, () => {
  test('reads recipient, amount, and fee from a serialized multisig transfer', async () => {
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

    const details = decodeStxTransferPayload(tx.serialize());

    expect(details).not.toBeNull();
    expect(details?.recipient).toBe(recipient);
    expect(details?.amount).toBe(1000n);
    expect(details?.fee).toBe(250n);
  });

  test('returns null for a non-token-transfer transaction', async () => {
    const tx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.ContractCall,
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox',
      functionName: 'noop',
      functionArgs: [],
      fee: createMoney(250, 'STX'),
      nonce: 0,
      publicKey: publicKeys[0],
    });

    expect(decodeStxTransferPayload(tx.serialize())).toBeNull();
  });
});
