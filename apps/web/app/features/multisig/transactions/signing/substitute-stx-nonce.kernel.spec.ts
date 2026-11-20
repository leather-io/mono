import { bytesToHex, hexToBytes } from '@stacks/common';

import { nonceCodec, transactionUpToNonce } from './substitute-stx-nonce.kernel';

const versionAndChainId = '0000000001';
const authType = '04';
const hashMode = '05';
const signerHash = 'bf753763204843631823bc99674208cdc5a87346';
const nonce = '000000000000002a';
const afterNonce = 'cafe';

describe('stx nonce codecs', () => {
  test('a nonce is eight big-endian bytes', () => {
    expect(bytesToHex(nonceCodec.encode(42))).toBe(nonce);
  });

  test('a transaction is read as version and chain id, auth type, hash mode, signer hash, nonce, then the rest', () => {
    const [fields, rest] = transactionUpToNonce.decode(
      hexToBytes(versionAndChainId + authType + hashMode + signerHash + nonce + afterNonce)
    );
    expect(fields).toEqual([
      hexToBytes(versionAndChainId),
      4,
      5,
      hexToBytes(signerHash),
      hexToBytes(nonce),
    ]);
    expect(rest).toEqual(hexToBytes(afterNonce));
  });
});
