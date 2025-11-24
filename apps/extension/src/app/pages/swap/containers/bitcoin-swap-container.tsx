import { BitcoinNativeSegwitAccountLoader } from '@app/components/loaders/bitcoin-account-loader';

import { BitcoinSwapProvider } from '../providers/bitcoin-swap-provider';

export function BitcoinSwapContainer() {
  return (
    <BitcoinNativeSegwitAccountLoader current>
      {signer => <BitcoinSwapProvider signer={signer} />}
    </BitcoinNativeSegwitAccountLoader>
  );
}
