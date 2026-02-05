import type { P2Ret, P2TROut } from '@scure/btc-signer/payment';

import { BitcoinSigner } from '@leather.io/bitcoin';

import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

interface CurrentBitcoinPayerLoaderProps {
  children(data: {
    nativeSegwit: BitcoinSigner<P2Ret>;
    taproot: BitcoinSigner<P2TROut>;
  }): React.ReactNode;
}
export function CurrentBitcoinPayerLoader({ children }: CurrentBitcoinPayerLoaderProps) {
  const nativeSegwit = useCurrentAccountNativeSegwitPayer()?.({ changeIndex: 0, addressIndex: 0 });
  const taproot = useCurrentAccountTaprootPayer()?.({ changeIndex: 0, addressIndex: 0 });
  if (!taproot || !nativeSegwit) return null;
  return children({ nativeSegwit, taproot });
}
