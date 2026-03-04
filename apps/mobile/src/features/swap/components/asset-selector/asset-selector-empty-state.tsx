import { FadeIn, FadeOut } from 'react-native-reanimated';

import { getFungibleAssetDisplayName } from '@/features/swap/swap.utils';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Image } from 'expo-image';

import { AccountSwapAsset } from '@leather.io/services';
import { AnimatedBox, type BoxProps, Button, Text, TextProps } from '@leather.io/ui/native';

const emptyStateHeightRatio = '55%';

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
        <Title>{t`No assets found`}</Title>
        <Button size="sm" variant="outline" onPress={onClearSearch}>
          {t`Clear search`}
        </Button>
      </Root>
    );
  }

  if (type === 'target' && selectedBaseAsset) {
    const assetName = getFungibleAssetDisplayName(selectedBaseAsset.asset);
    return (
      <Root>
        <Title>{t`No swaps available`}</Title>
        <Description>
          <Trans>
            <Text variant="label02">{assetName}</Text> has no available receiving options right now.
          </Trans>
        </Description>
      </Root>
    );
  }

  return (
    <Root>
      <Image style={{ height: 180, width: 180 }} source={require('@/assets/stickers/wallet.png')} />
      <Title>{t`No assets`}</Title>
      <Description>
        {t`Add funds to your wallet to start\nswapping between currencies.`}
      </Description>
    </Root>
  );
}

function Root(props: BoxProps) {
  return (
    <AnimatedBox
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(100)}
      p="5"
      height={emptyStateHeightRatio}
      alignItems="center"
      justifyContent="center"
      gap="2"
      {...props}
    />
  );
}

function Title(props: TextProps) {
  return <Text variant="label01" {...props} />;
}

function Description(props: TextProps) {
  return (
    <Text variant="label02" color="ink.text-subdued-secondary" textAlign="center" {...props} />
  );
}
