import { AddressTypeBadge } from '@/components/address-type-badge';
import { TestId } from '@/shared/test-id';

import { Box, Cell, CopyIcon, IconButton, Text } from '@leather.io/ui/native';

interface ReceiveAssetItemProps {
  address: string;
  addressType?: string;
  assetName: string;
  assetSymbol: string;
  type: string;
  icon: React.ReactNode;
  onCopy: () => void;
  onPress: () => void;
}
export function ReceiveAssetItem({
  address,
  addressType,
  assetName,
  type,
  icon,
  onCopy,
  onPress,
}: ReceiveAssetItemProps) {
  return (
    <Cell.Root
      pressable={true}
      disabled={!onPress}
      onPress={onPress}
      testID={`${TestId.receiveAssetItem}-${type}`}
    >
      <Cell.Icon>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">
          {
            <Box alignItems="center" flexDirection="row" gap="1">
              <Text variant="label02">{assetName}</Text>
              {addressType && <AddressTypeBadge type={addressType} />}
            </Box>
          }
        </Cell.Label>
        <Cell.Label variant="secondary">{address}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <IconButton icon={<CopyIcon />} onPress={onCopy} />
      </Cell.Aside>
    </Cell.Root>
  );
}
