import { useAccountBnsNames } from '@/queries/bns/bns.query';
import { type AccountLookup } from '@/shared/types';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { toUnicode } from 'punycode';

import { type AccountDisplayPreference } from '@leather.io/models';
import { type AccountBnsName } from '@leather.io/services';
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

  const { value: bnsNames } = useAccountBnsNames(fingerprint, accountIndex);

  const taprootPayer = taproot?.derivePayer({ change: 0, addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 });

  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';

  switch (preference) {
    case 'native-segwit':
      return nativeSegwitPayer && truncateMiddle(nativeSegwitPayer.address);
    case 'taproot':
      return taprootPayer && truncateMiddle(taprootPayer.address);
    case 'bns': {
      const bnsName = readAccountBnsName(bnsNames);
      return bnsName && formatAccountName(parseIfValidPunycode(bnsName));
    }
    case 'stacks':
    default:
      return truncateMiddle(stxAddress);
  }
}

function readAccountBnsName(bnsNames: AccountBnsName[] = []) {
  const primaryName = bnsNames.find(n => n.isPrimary);
  return primaryName?.fullName;
}

function formatAccountName(input: string, maxLength = 20, offset = 4) {
  return input.length > maxLength ? truncateMiddle(input, offset) : input;
}

function parseIfValidPunycode(s: string) {
  try {
    return toUnicode(s);
  } catch {
    return s;
  }
}
