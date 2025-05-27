import { useBitcoinPayerFromKeyOrigin } from '@/store/keychains/bitcoin/bitcoin-keychains.read';

import { isDefined } from '@leather.io/utils';

import { getPsbtInputDerivationPaths } from './utils';

export function usePsbtPayers({ psbtHex }: { psbtHex: string }) {
  const inputDerivationPaths = getPsbtInputDerivationPaths({ psbtHex });
  const payerLookup = useBitcoinPayerFromKeyOrigin();
  return inputDerivationPaths.map(path => payerLookup(path.keyOrigin)).filter(isDefined);
}
