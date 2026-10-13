import { Flex, styled } from 'leather-styles/jsx';
import type { VaultAssetItem } from '~/features/multisig/assets/vault-asset-items';

import { AssetAvatarIcon, ChevronDownIcon, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { VaultAssetList } from '../../components/vault-asset-list';

interface AssetSelectorToggleProps {
  item: VaultAssetItem;
  onClick(): void;
}

export function AssetSelectorToggle({ item, onClick }: AssetSelectorToggleProps) {
  return (
    <styled.button
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap="space.02"
      px="space.04"
      color="ink.text-subdued"
      borderLeftWidth="1px"
      borderLeftStyle="solid"
      borderLeftColor="ink.border-default"
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-hover' }}
      _active={{ opacity: 0.75 }}
      onClick={onClick}
    >
      <AssetAvatarIcon asset={item.asset} size="sm" />
      <styled.span textStyle="label.02">{item.asset.symbol}</styled.span>
      <ChevronDownIcon variant="small" />
    </styled.button>
  );
}

interface AssetSelectorSheetProps {
  items: VaultAssetItem[];
  isShowing: boolean;
  onSelect(item: VaultAssetItem): void;
  onClose(): void;
}

export function AssetSelectorSheet({
  items,
  isShowing,
  onSelect,
  onClose,
}: AssetSelectorSheetProps) {
  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap="space.04"
          px="space.05"
          py="space.04"
          width="100%"
          minHeight="headerHeight"
        >
          <styled.h2 textStyle="heading.05">Choose asset</styled.h2>
          <IconButton icon={<CloseIcon />} onClick={onClose} />
        </Flex>
      }
    >
      <Flex direction="column" px="space.05" pb="space.05">
        <VaultAssetList items={items} onSelect={onSelect} />
      </Flex>
    </Sheet>
  );
}
