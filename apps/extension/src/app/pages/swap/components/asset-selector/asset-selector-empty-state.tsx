import { Flex, styled } from 'leather-styles/jsx';

import { AccountSwapAsset } from '@leather.io/services';
import { Button, HasChildren } from '@leather.io/ui';

import { getFungibleAssetDisplayName } from '@app/pages/swap/swap-utils';

interface AssetSelectorEmptyStateProps {
  isPerformingSearch: boolean;
  onClearSearch(): void;
  type: 'base' | 'target';
  selectedBaseAsset: AccountSwapAsset | null;
}

export function AssetSelectorEmptyState({
  isPerformingSearch,
  onClearSearch,
  type,
  selectedBaseAsset,
}: AssetSelectorEmptyStateProps) {
  if (isPerformingSearch) {
    return (
      <Root>
        <Title>No assets found</Title>
        <Button size="sm" variant="outline" onClick={onClearSearch}>
          Clear search
        </Button>
      </Root>
    );
  }

  if (type === 'target' && selectedBaseAsset) {
    const assetName = getFungibleAssetDisplayName(selectedBaseAsset.asset);
    return (
      <Root>
        <Title>No swaps available</Title>
        <Description>{assetName} has no available receiving options right now.</Description>
      </Root>
    );
  }

  return (
    <Root>
      <Title>No assets</Title>
      <Description>Add funds to your wallet to start swapping between currencies.</Description>
    </Root>
  );
}

function Root({ children }: HasChildren) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      height="55%"
      p="space.05"
      gap="space.02"
    >
      {children}
    </Flex>
  );
}

function Title({ children }: HasChildren) {
  return <styled.span textStyle="label.01">{children}</styled.span>;
}

function Description({ children }: HasChildren) {
  return (
    <styled.span textStyle="label.02" color="ink.text-subdued-primary" textAlign="center">
      {children}
    </styled.span>
  );
}
