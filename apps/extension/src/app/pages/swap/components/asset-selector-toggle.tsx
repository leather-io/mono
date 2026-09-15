import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AssetAvatarIcon, ChevronDownIcon, PlusIcon } from '@leather.io/ui';

interface AssetSelectorToggleProps {
  asset: SwappableFungibleCryptoAsset | undefined;
  disabled?: boolean;
  onPress(): void;
  testId?: string;
}

export function AssetSelectorToggle({
  asset,
  disabled,
  onPress,
  testId,
}: AssetSelectorToggleProps) {
  return (
    <styled.button
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap="space.02"
      pl="space.01"
      pr="space.02"
      bg="ink.component-background-hover"
      height={32}
      borderRadius="round"
      opacity={disabled ? 0.5 : 1}
      _active={{ opacity: 0.75 }}
      onClick={onPress}
      data-testid={testId}
    >
      {renderAvatar(asset)}
      <styled.span textStyle="label.03" data-testid={SwapRevampSelectors.SelectedAssetSymbol}>
        {asset ? asset.symbol : `Select`}
      </styled.span>
      <ChevronDownIcon variant="small" />
    </styled.button>
  );
}

function renderAvatar(asset: SwappableFungibleCryptoAsset | undefined) {
  if (!asset) {
    return (
      <Flex
        borderWidth={1}
        borderColor="ink.border-transparent"
        alignItems="center"
        justifyContent="center"
        width={24}
        height={24}
        borderRadius="round"
      >
        <PlusIcon color="ink.text-subdued" variant="small" />
      </Flex>
    );
  }

  return <AssetAvatarIcon asset={asset} size="sm" />;
}
