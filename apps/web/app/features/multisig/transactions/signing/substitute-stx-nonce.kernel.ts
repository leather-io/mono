import { fixedBytes, thenRestAsBytes, tuple, uint } from '@leather.io/kernel';

const versionAndChainIdLength = 5;
const signerHashLength = 20;
const nonceByteLength = 8;

export const nonceCodec = uint(nonceByteLength, 'big');
export const transactionUpToNonce = thenRestAsBytes(
  tuple(
    fixedBytes(versionAndChainIdLength),
    uint(1, 'big'),
    uint(1, 'big'),
    fixedBytes(signerHashLength),
    fixedBytes(nonceByteLength)
  )
);
