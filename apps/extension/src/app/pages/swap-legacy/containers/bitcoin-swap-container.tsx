import { BitcoinNativeSegwitAccountLoader } from '@app/components/loaders/bitcoin-account-loader';
import { BitcoinNativeSegwitUtxosLoader } from '@app/components/loaders/bitcoin-utxos-loader';

import { BitcoinSwapProvider } from '../providers/bitcoin-swap-provider';

export function BitcoinSwapContainer() {
  return (
    <BitcoinNativeSegwitAccountLoader current>
      {signer => (
        <BitcoinNativeSegwitUtxosLoader>
          {utxos => {
            return <BitcoinSwapProvider signer={signer} utxos={utxos} />;
          }}
        </BitcoinNativeSegwitUtxosLoader>
      )}
    </BitcoinNativeSegwitAccountLoader>
  );
}
