import { t } from '@lingui/core/macro';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  AssetAvatarIcon,
  Box,
  ChevronDownIcon,
  PlusIcon,
  Pressable,
  Text,
} from '@leather.io/ui/native';

interface AssetPickerTriggerProps {
  asset: SwappableFungibleCryptoAsset | undefined;
  disabled?: boolean;
  onPress(): void;
}

export function AssetSelectorToggle({ asset, onPress, disabled }: AssetPickerTriggerProps) {
  return (
    <Pressable
      flexDirection="row"
      alignItems="center"
      gap="2"
      pl="1"
      pr="2"
      bg="ink.component-background-hover"
      height={32}
      borderRadius="round"
      opacity={disabled ? 0.5 : 1}
      onPress={onPress}
      disabled={disabled}
    >
      {renderAvatar(asset)}
      <Text ml="-0.5" variant="label03">
        {asset ? asset.symbol : t`Select`}
      </Text>
      <ChevronDownIcon variant="small" />
    </Pressable>
  );
}

function renderAvatar(asset: SwappableFungibleCryptoAsset | undefined) {
  if (!asset) {
    return (
      <Box
        borderWidth={1}
        borderColor="ink.border-transparent"
        alignItems="center"
        justifyContent="center"
        width={24}
        height={24}
        borderRadius="round"
      >
        <PlusIcon color="ink.text-subdued-secondary" variant="small" />
      </Box>
    );
  }

  return <AssetAvatarIcon asset={asset} size="sm" />;
}
