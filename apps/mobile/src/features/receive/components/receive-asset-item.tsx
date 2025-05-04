import { AddressTypeBadge } from '@/components/address-type-badge';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { Box, Cell, CopyIcon, IconButton, Text } from '@leather.io/ui/native';

interface ReceiveAssetItemProps {
  address: string;
  addressType?: string;
  name: string;
  symbol: string;
  icon: React.ReactNode;
  onCopy: () => void;
  onPress: () => void;
}
export function ReceiveAssetItem({
  address,
  addressType,
  name,
  icon,
  onCopy,
  onPress,
}: ReceiveAssetItemProps) {
  return (
    <Cell.Root
      pressable={true}
      disabled={!onPress}
      onPress={onPress}
      testID={TestId.receiveAssetItem}
    >
      <Cell.Icon>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">
          {
            <Box alignItems="center" flexDirection="row" gap="1">
              <Text variant="label02">{name}</Text>
              {addressType && <AddressTypeBadge type={addressType} />}
            </Box>
          }
        </Cell.Label>
        <Cell.Label variant="secondary">{address}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <IconButton
          label={t({
            id: 'receive.copy_address_label',
            message: 'Copy address',
          })}
          mr="-2"
          icon={<CopyIcon />}
          onPress={onCopy}
        />
      </Cell.Aside>
    </Cell.Root>
  );
}
