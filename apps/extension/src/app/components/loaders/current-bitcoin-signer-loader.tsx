import type { P2Ret, P2TROut } from '@scure/btc-signer/payment';

import { BitcoinSigner } from '@leather.io/bitcoin';

import { useCurrentAccountNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

interface CurrentBitcoinSignerLoaderProps {
  children(data: {
    nativeSegwit: BitcoinSigner<P2Ret>;
    taproot: BitcoinSigner<P2TROut>;
  }): React.ReactNode;
}
export function CurrentBitcoinSignerLoader({ children }: CurrentBitcoinSignerLoaderProps) {
  const nativeSegwit = useCurrentAccountNativeSegwitSigner()?.({ changeIndex: 0, addressIndex: 0 });
  const taproot = useCurrentAccountTaprootSigner()?.({ changeIndex: 0, addressIndex: 0 });
  if (!taproot || !nativeSegwit) return null;
  return children({ nativeSegwit, taproot });
}
