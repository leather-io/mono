import { useAccountDisplayName } from '@/hooks/use-account-display-name';
import { AccountLookup } from '@/shared/types';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';

import { AccountDisplayPreference } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

interface UseAccountDisplayAddressProps extends AccountLookup {
  displayPreference?: AccountDisplayPreference;
}

export function useAccountDisplayAddress({
  accountIndex,
  fingerprint,
  displayPreference,
}: UseAccountDisplayAddressProps) {
  const { accountDisplayPreference } = useSettings();
  const preference = displayPreference ?? accountDisplayPreference.type;

  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayer = taproot.derivePayer({ addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit.derivePayer({ addressIndex: 0 });

  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';

  const { data: bnsName } = useAccountDisplayName({
    address: stxAddress,
  });

  switch (preference) {
    case 'native-segwit':
      return truncateMiddle(nativeSegwitPayer.address);
    case 'taproot':
      return truncateMiddle(taprootPayer.address);
    case 'bns':
      return bnsName;
    case 'stacks':
    default:
      return truncateMiddle(stxAddress);
  }
}
