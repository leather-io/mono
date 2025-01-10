import { AccountId } from '@/models/domain.model';
import { useAccountDisplayAddress } from '@/store/settings/settings.read';

import { Text, TextProps } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

type AccountAddressProps = AccountId & TextProps;

export function AccountAddress({ accountIndex, fingerprint, ...textProps }: AccountAddressProps) {
  const displayAddress = useAccountDisplayAddress(fingerprint, accountIndex);
  return (
    <Text variant="label03" color="ink.text-subdued" textTransform="uppercase" {...textProps}>
      {truncateMiddle(displayAddress)}
    </Text>
  );
}
