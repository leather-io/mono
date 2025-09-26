import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset } from '@leather.io/models';
import {
  Box,
  BtcAvatarIcon,
  ChevronDownIcon,
  PlusIcon,
  Pressable,
  Sip10AvatarIcon,
  StxAvatarIcon,
  Text,
} from '@leather.io/ui/native';

interface AssetPickerTriggerProps {
  asset: FungibleCryptoAsset | undefined;
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

function renderAvatar(asset: FungibleCryptoAsset | undefined) {
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
        <PlusIcon color="ink.text-subdued" variant="small" />
      </Box>
    );
  }

  if (asset.symbol === 'BTC') {
    return <BtcAvatarIcon size="sm" />;
  }

  if (asset.symbol === 'STX') {
    return <StxAvatarIcon size="sm" />;
  }

  if (asset.protocol === 'sip10') {
    return (
      <Sip10AvatarIcon
        size="sm"
        contractId={asset.contractId}
        imageCanonicalUri={asset.imageCanonicalUri}
        name={asset.name}
      />
    );
  }

  return null;
}
