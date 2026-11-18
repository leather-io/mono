import { useAccountDisplayAddress } from '@/hooks/use-account-display-address';
import { type AccountLookup } from '@/shared/types';

import { type AccountDisplayPreference } from '@leather.io/models';
import { Text, type TextProps } from '@leather.io/ui/native';

interface AccountAddressProps extends AccountLookup, TextProps {
  displayPreference?: AccountDisplayPreference;
}

export function AccountAddress({
  accountIndex,
  fingerprint,
  displayPreference,
  ...textProps
}: AccountAddressProps) {
  const displayAddress = useAccountDisplayAddress({ fingerprint, accountIndex, displayPreference });
  return (
    <Text variant="label03" color="ink.text-subdued" {...textProps}>
      {displayAddress}
    </Text>
  );
}
