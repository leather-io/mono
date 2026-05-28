import DOMPurify from 'dompurify';
import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import {
  BulletSeparator,
  ItemLayout,
  Pressable,
  SkeletonLoader,
  shimmerStyles,
} from '@leather.io/ui';

import { useSpamFilterWithWhitelist } from '@app/common/spam-filter/use-spam-filter';
import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { parseCryptoAssetBalance } from './crypto-asset-item.layout.utils';

export interface CryptoAssetItemLayoutProps {
  availableBalance: Money;
  balanceSuffix?: string;
  captionLeft: string;
  captionRightBulletInfo?: React.ReactNode;
  contractId?: string;
  fiatBalance?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  isLoadingAdditionalData?: boolean;
  isPrivate?: boolean;
  onSelectAsset?(symbol: string, contractId?: string): void;
  titleLeft: string;
  titleRightBulletInfo?: React.ReactNode;
  dataTestId: string;
}
export function CryptoAssetItemLayout({
  availableBalance,
  balanceSuffix,
  captionLeft,
  captionRightBulletInfo,
  contractId,
  fiatBalance,
  icon,
  isLoading = false,
  isLoadingAdditionalData = false,
  isPrivate = false,
  onSelectAsset,
  titleLeft,
  titleRightBulletInfo,
  dataTestId,
}: CryptoAssetItemLayoutProps) {
  const { availableBalanceString, formattedBalance } = parseCryptoAssetBalance(availableBalance);

  const spamFilter = useSpamFilterWithWhitelist();

  const titleRight = (
    <SkeletonLoader width="126px" isLoading={isLoading}>
      <Flex alignItems="center" gap="space.02" textStyle="label.01">
        <BulletSeparator>
          <PrivateTextLayout
            isPrivate={isPrivate}
            data-state={isLoadingAdditionalData ? 'loading' : undefined}
            className={shimmerStyles}
          >
            {fiatBalance}
          </PrivateTextLayout>
          {titleRightBulletInfo}
        </BulletSeparator>
      </Flex>
    </SkeletonLoader>
  );

  const captionRight = (
    <SkeletonLoader width="78px" isLoading={isLoading}>
      <BasicTooltip
        asChild
        label={formattedBalance.isCompact && !isPrivate ? availableBalanceString : undefined}
        side="left"
      >
        <Flex alignItems="center" color="ink.text-primary" gap="space.02">
          <BulletSeparator>
            <styled.span
              textStyle="label.03"
              data-state={isLoadingAdditionalData ? 'loading' : undefined}
              className={shimmerStyles}
            >
              <PrivateTextLayout isPrivate={isPrivate}>
                {formattedBalance.value} {balanceSuffix}
              </PrivateTextLayout>
            </styled.span>
            {captionRightBulletInfo}
          </BulletSeparator>
        </Flex>
      </BasicTooltip>
    </SkeletonLoader>
  );

  const isInteractive = !!onSelectAsset;

  const content = (
    <ItemLayout
      img={icon}
      titleLeft={
        <styled.span textStyle="label.01" width="100%" overflow="hidden" textOverflow="ellipsis">
          {spamFilter(titleLeft)}
        </styled.span>
      }
      captionLeft={
        <styled.span textStyle="label.03" color="ink.text-primary">
          {spamFilter(captionLeft)}
        </styled.span>
      }
      titleRight={titleRight}
      captionRight={captionRight}
    />
  );

  if (isInteractive)
    return (
      <Pressable
        data-testid={dataTestId}
        onClick={() => onSelectAsset(availableBalance.symbol, contractId)}
        my="space.02"
      >
        {content}
      </Pressable>
    );

  return (
    <Box my="space.02" data-testid={DOMPurify.sanitize(dataTestId)}>
      {content}
    </Box>
  );
}
