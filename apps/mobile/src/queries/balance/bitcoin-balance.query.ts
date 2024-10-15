import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useQuery } from '@tanstack/react-query';

import { inferPaymentTypeFromPath } from '@leather.io/bitcoin';
import { getBtcBalanceService } from '@leather.io/services';
import { isDefined } from '@leather.io/utils';

function useParsedAccountDescriptors() {
  const keychains = useBitcoinAccounts();
  return keychains.list
    .map(accountKeychain => {
      switch (inferPaymentTypeFromPath(accountKeychain.keyOrigin)) {
        case 'p2tr':
          return `tr(${accountKeychain.xpub})`;
        case 'p2wpkh':
          return `wpkh(${accountKeychain.xpub})`;
        default:
          return undefined;
      }
    })
    .filter(isDefined);
}

export function useBitcoinBalanceQuery() {
  const descriptors = useParsedAccountDescriptors();
  return useQuery({
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: ['btc-composite-balance', descriptors],
    queryFn: () => getBtcBalanceService().getBtcCompositeBalance(descriptors),
    retryDelay: 1000 * 60,
    staleTime: 1000 * 60 * 5,
  });
}
