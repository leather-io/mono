import { AddressTypeBadge } from '@/components/address-type-badge';
import { TokenIcon } from '@/features/balances/token-icon';
import { SelectedAsset } from '@/features/receive/screens/select-asset';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { Box, Cell, CopyIcon, IconButton, Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

interface ReceiveAssetItemProps {
  asset: SelectedAsset;
  onCopyAddress: (asset: SelectedAsset) => void;
  onPress: () => void;
}
export function ReceiveAssetItem({ asset, onCopyAddress, onPress }: ReceiveAssetItemProps) {
  const { address, addressType, name } = asset;

  return (
    <Cell.Root
      pressable={true}
      disabled={!onPress}
      onPress={onPress}
      testID={TestId.receiveAssetItem}
    >
      <Cell.Icon>
        <TokenIcon ticker={asset.symbol} showIndicator />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">
          {
            <Box alignItems="center" flexDirection="row" gap="1">
              <Text variant="label02">{name}</Text>
              {addressType && <AddressTypeBadge type={addressType} />}
            </Box>
          }
        </Cell.Label>
        <Cell.Label variant="secondary">{truncateMiddle(address)}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <IconButton
          label={t({
            id: 'receive.copy_address_label',
            message: 'Copy address',
          })}
          mr="-2"
          icon={<CopyIcon />}
          onPress={() => onCopyAddress(asset)}
        />
      </Cell.Aside>
    </Cell.Root>
  );
}
