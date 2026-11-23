import * as P from 'micro-packed';

const versionAndChainIdLength = 5;
const signerHashLength = 20;
const nonceByteLength = 8;

export const nonceCodec = P.apply(P.U64BE, P.coders.numberBigint);
export const transactionUpToNonce = P.tuple([
  P.bytes(versionAndChainIdLength),
  P.U8,
  P.U8,
  P.bytes(signerHashLength),
  P.bytes(nonceByteLength),
  P.bytes(null),
]);
