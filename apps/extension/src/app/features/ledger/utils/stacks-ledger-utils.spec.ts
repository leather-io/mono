import {
  deserializeTransaction,
  isSingleSig,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';

import { signStacksTransactionWithSignature } from './stacks-ledger-utils';

const recipient = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';
const signerPublicKey = '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';
const secondPublicKey = '03c1e856462ca2844adb898aee90af5237e9d1be0fe51212635b2f7a643b0585e1';
const signatureHex = '00'.repeat(65);
const signatureVrs = Buffer.from(signatureHex, 'hex');

describe(signStacksTransactionWithSignature.name, () => {
  test('sets the signature on single-sig transactions', async () => {
    const unsignedTx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 500,
      fee: 100,
      nonce: 0,
      network: 'mainnet',
      publicKey: signerPublicKey,
    });

    const signedTx = signStacksTransactionWithSignature(unsignedTx.serialize(), signatureVrs);
    const spendingCondition = signedTx.auth.spendingCondition;

    if (!isSingleSig(spendingCondition)) throw new Error('Expected single-sig spending condition');

    expect(spendingCondition.signature.data).toEqual(signatureHex);
    expect(() => signedTx.serialize()).not.toThrow();
  });

  test('appends a signature auth field to multisig transactions', async () => {
    const unsignedTx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 500,
      fee: 100,
      nonce: 0,
      network: 'mainnet',
      publicKeys: [secondPublicKey, signerPublicKey],
      numSignatures: 2,
    });

    const signedTx = signStacksTransactionWithSignature(unsignedTx.serialize(), signatureVrs);
    const spendingCondition = signedTx.auth.spendingCondition;

    if (isSingleSig(spendingCondition)) throw new Error('Expected multisig spending condition');

    expect(spendingCondition.fields).toHaveLength(1);
    expect(() => signedTx.serialize()).not.toThrow();

    const serializedTx = signedTx.serialize();
    const deserializedTx = deserializeTransaction(serializedTx);
    const deserializedSpendingCondition = deserializedTx.auth.spendingCondition;

    if (isSingleSig(deserializedSpendingCondition))
      throw new Error('Expected deserialized multisig spending condition');

    expect(deserializedSpendingCondition.fields).toHaveLength(1);
  });
});
