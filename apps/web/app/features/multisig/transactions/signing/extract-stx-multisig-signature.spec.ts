import { privateKeyToPublic, publicKeyToHex } from '@stacks/transactions';

import {
  TransactionTypes,
  generateStacksUnsignedTransaction,
  signStacksTransaction,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { extractStxMultisigSignature } from './extract-stx-multisig-signature';

const privateKeys = ['11'.repeat(32) + '01', '22'.repeat(32) + '01', '33'.repeat(32) + '01'];
const publicKeys = privateKeys.map(key => publicKeyToHex(privateKeyToPublic(key)));
const recipient = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';

function makeUnsignedMultisigTransfer() {
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.StxTokenTransfer,
    recipient,
    amount: createMoney(100, 'STX'),
    fee: createMoney(1000, 'STX'),
    nonce: 0,
    publicKeys,
    numSignatures: 2,
    useNonSequentialMultiSig: true,
  });
}

describe(extractStxMultisigSignature.name, () => {
  test('returns the lone VRS signature a signer contributed', async () => {
    const tx = await makeUnsignedMultisigTransfer();
    const signedHex = signStacksTransaction(tx, privateKeys[0]).serialize();

    const signature = extractStxMultisigSignature(signedHex);
    // A recoverable VRS signature is 65 bytes = 130 hex chars.
    expect(signature).toMatch(/^[0-9a-f]{130}$/);
    expect(signedHex).toContain(signature);
  });

  test('throws when no signature has been added yet', async () => {
    const unsignedHex = (await makeUnsignedMultisigTransfer()).serialize();
    expect(() => extractStxMultisigSignature(unsignedHex)).toThrow('found 0');
  });

  test('throws for a single-sig (non-multisig) transaction', async () => {
    const singleSig = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      recipient,
      amount: createMoney(100, 'STX'),
      fee: createMoney(1000, 'STX'),
      nonce: 0,
      publicKey: publicKeys[0],
    });
    expect(() => extractStxMultisigSignature(singleSig.serialize())).toThrow('multisig');
  });
});
