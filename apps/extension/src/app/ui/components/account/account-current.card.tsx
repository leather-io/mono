import { ReactNode } from 'react';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { css, cx } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { type Money } from '@leather.io/models';
import { Flag, InfoCircleIcon, SkeletonLoader, shimmerStyles } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useScaleText } from '@app/common/hooks/use-scale-text';
import { Divider } from '@app/components/layout/divider';
import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { NetworkSwitcherBadge } from '@app/pages/settings/components/network-switcher';

import { BasicTooltip } from '../tooltip/basic-tooltip';

const totalBalanceTooltipLabel =
  'Your total tokens on chain. Includes both available and locked amounts.';

const lockedBalanceTooltip =
  'Amount you’ve committed to stacking. You won’t be able to move or spend it until the stacking period ends.';

interface AccountCardProps {
  totalBalance: string;
  totalBalanceMoney: Money | undefined;
  lockedBalanceMoney: Money | undefined;
  children?: ReactNode;
  isLoadingBalance: boolean;
  isLoadingAdditionalData?: boolean;
  isBalancePrivate?: boolean;
  onShowBalance?(): void;
}

export function AccountCard({
  totalBalance,
  totalBalanceMoney,
  lockedBalanceMoney,
  onShowBalance,
  children,
  isLoadingBalance,
  isLoadingAdditionalData,
  isBalancePrivate,
}: AccountCardProps) {
  const scaleTextRef = useScaleText();
  const isAtLeastMd = useViewportMinWidth('md');
  const tooltipSide = isAtLeastMd ? 'right' : 'bottom';

  return (
    <Flex direction="column" rounded="md">
      <Flex justifyContent="space-between">
        <Box>
          <BasicTooltip side={tooltipSide} label={totalBalanceTooltipLabel}>
            <Flag
              reverse
              spacing="space.01"
              img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
            >
              <styled.h2 textStyle="label.02">Total balance</styled.h2>
            </Flag>
          </BasicTooltip>
        </Box>
        <NetworkSwitcherBadge />
      </Flex>
      <Flex flexDir={['column', 'column', 'row']} justify="space-between">
        <Box width="100%" pt="space.02">
          <SkeletonLoader width="200px" height="46px" isLoading={isLoadingBalance}>
            <Flex direction="column">
              <styled.h1
                textStyle="heading.02"
                data-state={isLoadingAdditionalData ? 'loading' : undefined}
                className={cx(
                  shimmerStyles,
                  css({
                    color:
                      totalBalanceMoney?.amount && totalBalanceMoney.amount.toNumber() > 0
                        ? 'ink.text-primary'
                        : 'ink.text-non-interactive',
                  })
                )}
                data-testid={SharedComponentsSelectors.AccountCardBalanceText}
                whiteSpace="nowrap"
                display="inline-block"
                transformOrigin="left center"
                maxWidth="100%"
                ref={scaleTextRef}
              >
                <PrivateTextLayout
                  isPrivate={isBalancePrivate}
                  onShowValue={onShowBalance}
                  display="inline-block"
                  overflow="hidden"
                >
                  {totalBalance}
                </PrivateTextLayout>
              </styled.h1>

              {lockedBalanceMoney?.amount && lockedBalanceMoney?.amount.toNumber() > 0 && (
                <>
                  <Divider my="space.05" />

                  <Box>
                    <BasicTooltip side={tooltipSide} label={lockedBalanceTooltip}>
                      <Flag
                        reverse
                        spacing="space.01"
                        img={
                          <InfoCircleIcon
                            color="ink.text-subdued"
                            display="inline"
                            variant="small"
                          />
                        }
                      >
                        <styled.h2 textStyle="label.02">Locked</styled.h2>
                      </Flag>
                    </BasicTooltip>
                  </Box>
                  <styled.h1
                    textStyle="heading.05"
                    data-state={isLoadingAdditionalData ? 'loading' : undefined}
                    className={shimmerStyles}
                    data-testid={SharedComponentsSelectors.AccountCardBalanceText}
                    whiteSpace="nowrap"
                    display="inline-block"
                    transformOrigin="left center"
                    maxWidth="100%"
                    pt="space.02"
                    ref={scaleTextRef}
                  >
                    <PrivateTextLayout
                      isPrivate={isBalancePrivate}
                      onShowValue={onShowBalance}
                      display="inline-block"
                      overflow="hidden"
                    >
                      {formatCurrency(lockedBalanceMoney)}
                    </PrivateTextLayout>
                  </styled.h1>
                </>
              )}
            </Flex>
          </SkeletonLoader>
        </Box>
        {children}
      </Flex>
    </Flex>
  );
}
