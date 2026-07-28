export type VerifyAddressVariant = 'btcNativeSegwit' | 'btcTaproot' | 'btcMultisig' | 'stx';

export const verifyAddressPaths: Record<VerifyAddressVariant, string> = {
  btcNativeSegwit: 'verify-address/native-segwit',
  btcTaproot: 'verify-address/taproot',
  btcMultisig: 'verify-address/btc-multisig',
  stx: 'verify-address/stx',
};
