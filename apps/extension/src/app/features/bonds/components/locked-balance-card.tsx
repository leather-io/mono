import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { ChevronRightIcon, Flag, InfoCircleIcon, Pressable, SkeletonLoader } from '@leather.io/ui';

import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

const lockedBalanceTooltip =
  'Funds committed to a bond or to stacking. They come back to you when the period ends.';

interface LockedBalanceCardLayoutProps {
  fiatValue: string;
  isLoading?: boolean;
  isPrivate?: boolean;
  onShowValue?(): void;
  onClick?(): void;
}

export function LockedBalanceCardLayout({
  fiatValue,
  isLoading,
  isPrivate = false,
  onShowValue,
  onClick,
}: LockedBalanceCardLayoutProps) {
  return (
    <Pressable
      data-testid={BondsSelectors.LockedBalanceCard}
      onClick={onClick}
      border="1px solid"
      borderColor="ink.border-default"
      borderRadius="md"
      px="space.04"
      py="space.03"
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <Flex direction="column" gap="space.01" alignItems="flex-start">
          <BasicTooltip side="right" label={lockedBalanceTooltip}>
            <Flag
              reverse
              spacing="space.01"
              img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
            >
              <styled.span textStyle="label.02">Locked</styled.span>
            </Flag>
          </BasicTooltip>
          <SkeletonLoader width="120px" height="28px" isLoading={!!isLoading}>
            <styled.span textStyle="heading.05">
              <PrivateTextLayout
                isPrivate={isPrivate}
                onShowValue={onShowValue}
                display="inline-block"
              >
                {fiatValue}
              </PrivateTextLayout>
            </styled.span>
          </SkeletonLoader>
        </Flex>
        <ChevronRightIcon color="ink.text-primary" />
      </Flex>
    </Pressable>
  );
}
