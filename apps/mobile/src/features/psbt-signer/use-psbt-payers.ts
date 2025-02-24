import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';

import { getPsbtInputDerivationPaths } from './utils';

export function usePsbtPayers({ psbtHex }: { psbtHex: string }) {
  const keychains = useBitcoinAccounts();
  const inputDerivationPaths = getPsbtInputDerivationPaths({ psbtHex });
  const inputKeyOrigins = inputDerivationPaths.map(derivationPath => derivationPath.keyOrigin);
  const payers = keychains.list
    .map(keychain => keychain.derivePayer({ addressIndex: 0 }))
    .filter(keychain => inputKeyOrigins.includes(keychain.keyOrigin));

  return payers;
}
