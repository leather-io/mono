import { AddressTypeBadge } from '@/components/address-type-badge';

import {
  Box,
  CopyIcon,
  Flag,
  IconButton,
  ItemLayout,
  Pressable,
  Text,
} from '@leather.io/ui/native';

interface ReceiveAssetItemProps {
  address: string;
  addressType?: string;
  assetName: string;
  assetSymbol: string;
  icon: React.ReactNode;
  onCopy: () => void;
  onPress: () => void;
}
export function ReceiveAssetItem({
  address,
  addressType,
  assetName,
  assetSymbol,
  icon,
  onCopy,
  onPress,
}: ReceiveAssetItemProps) {
  return (
    <Pressable flexDirection="row" onPress={onPress}>
      <Flag key={assetSymbol} img={icon}>
        <ItemLayout
          titleLeft={
            <Box alignItems="center" flexDirection="row" gap="1">
              <Text variant="label02">{assetName}</Text>
              {addressType && <AddressTypeBadge type={addressType} />}
            </Box>
          }
          actionIcon={<IconButton icon={<CopyIcon />} onPress={onCopy} />}
          captionLeft={address}
        />
      </Flag>
    </Pressable>
  );
}
