import type { OwnedUtxo } from '@leather.io/models';

import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';

interface BitcoinUtxosLoaderProps {
  children(this: void, utxos: OwnedUtxo[]): React.ReactNode;
}
export function BitcoinUtxosLoader({ children }: BitcoinUtxosLoaderProps) {
  const { utxos } = useCurrentUtxos();
  return children(utxos.available);
}
