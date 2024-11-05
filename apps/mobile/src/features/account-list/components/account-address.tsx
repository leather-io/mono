import { AccountId } from '@/models/domain.model';
import { useAccountDisplayAddress } from '@/store/settings/settings.read';

import { Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

type AccountAddressProps = AccountId;

export function AccountAddress({ accountIndex, fingerprint }: AccountAddressProps) {
  const displayAddress = useAccountDisplayAddress(fingerprint, accountIndex);
  return (
    <Text variant="caption01" color="ink.text-subdued">
      {truncateMiddle(displayAddress)}
    </Text>
  );
}
