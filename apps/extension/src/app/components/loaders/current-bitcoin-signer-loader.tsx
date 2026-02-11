import { BitcoinNativeSegwitPayer, BitcoinTaprootPayer } from '@leather.io/bitcoin';

import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

interface CurrentBitcoinPayerLoaderProps {
  children(data: {
    nativeSegwit: BitcoinNativeSegwitPayer;
    taproot: BitcoinTaprootPayer;
  }): React.ReactNode;
}
export function CurrentBitcoinPayerLoader({ children }: CurrentBitcoinPayerLoaderProps) {
  const nativeSegwitFactory = useCurrentAccountNativeSegwitPayer();
  const taprootFactory = useCurrentAccountTaprootPayer();

  const nativeSegwitPayer = nativeSegwitFactory?.({ changeIndex: 0, addressIndex: 0 });
  const taprootPayer = taprootFactory?.({ changeIndex: 0, addressIndex: 0 });

  if (!nativeSegwitPayer || !taprootPayer) return null;

  return children({ nativeSegwit: nativeSegwitPayer, taproot: taprootPayer });
}
