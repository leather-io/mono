import { useAccountDisplayAddress } from '@/hooks/use-account-display-address';

import { AccountDisplayPreference } from '@leather.io/models';
import { Text, TextProps } from '@leather.io/ui/native';

interface AccountAddressProps extends TextProps {
  fingerprint: string;
  accountIndex: number;
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
    <Text variant="label03" color="ink.text-subdued" textTransform="uppercase" {...textProps}>
      {displayAddress}
    </Text>
  );
}
