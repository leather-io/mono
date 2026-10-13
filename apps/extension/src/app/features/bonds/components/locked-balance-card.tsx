import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { ChevronRightIcon, Flag, Pressable, SkeletonLoader } from '@leather.io/ui';

import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { InfoTooltip } from '@app/ui/components/tooltip/info-tooltip';

const lockedBalanceTooltip =
  "Tokens committed for a set period. They can't be sent until they unlock.";

interface LockedBalanceCardLayoutProps {
  fiatValue: string;
  isLoading?: boolean;
  isPrivate?: boolean;
  onShowValue?(): void;
  onClick?(): void;
}

export function LockedBalanceCardLayout({
  fiatValue,
  isLoading = false,
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
      _before={{ top: 0, right: 0, bottom: 0, left: 0, borderRadius: 'inherit' }}
    >
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <Flex direction="column" gap="space.01" alignItems="flex-start">
          <Flag reverse spacing="space.01" img={<InfoTooltip label={lockedBalanceTooltip} />}>
            <styled.span textStyle="label.02">Locked</styled.span>
          </Flag>
          <SkeletonLoader width="120px" height="28px" isLoading={isLoading}>
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
        {/* The 24px glyph fills two thirds of its box and reads oversized next to
            heading.05; at 18px it matches the 16px chevron's proportions */}
        <Flex width="24px" height="24px" flexShrink={0} alignItems="center" justifyContent="center">
          <ChevronRightIcon
            color="ink.action-primary-default"
            variant="medium"
            width={18}
            height={18}
          />
        </Flex>
      </Flex>
    </Pressable>
  );
}
