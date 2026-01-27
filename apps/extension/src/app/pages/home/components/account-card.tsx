import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { css, cx } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { Flag, InfoCircleIcon, SkeletonLoader, shimmerStyles } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useScaleText } from '@app/common/hooks/use-scale-text';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { Divider } from '@app/components/layout/divider';
import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { NetworkSwitcherBadge } from '@app/pages/settings/components/network-switcher';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { useHomePageState } from '../use-home-page-state';

const totalBalanceTooltipLabel =
  'Your total tokens on chain. Includes both available and locked amounts.';

const lockedBalanceTooltip =
  'Amount you’ve committed to stacking. You won’t be able to move or spend it until the stacking period ends.';

export function AccountCard() {
  const { totalBalance, availableBalance, stxAccountBalance, isPrivateMode, togglePrivateMode } =
    useHomePageState();
  const scaleTextRef = useScaleText();
  const isAtLeastMd = useViewportMinWidth('md');

  const tooltipVariant = isAtLeastMd ? 'md' : 'sm';
  const isLoadingBalance = totalBalance.state === 'loading' || availableBalance.state === 'loading';
  const lockedBalanceMoney = stxAccountBalance.value?.quote.lockedBalance;
  const totalBalanceMoney = totalBalance.value;
  const totalBalanceFormatted =
    totalBalance.state !== 'success' ? emptyAmountPlaceholder : formatCurrency(totalBalance.value);

  return (
    <Flex direction="column" rounded="md">
      <Flex justifyContent="space-between">
        <Box>
          <BasicTooltip side="right" variant={tooltipVariant} label={totalBalanceTooltipLabel}>
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
      <Flex flexDir={{ base: 'column', md: 'row' }} justify="space-between">
        <Box width="100%" pt="space.02">
          <SkeletonLoader width="200px" height="46px" isLoading={isLoadingBalance}>
            <Flex direction="column">
              <styled.h1
                textStyle="heading.02"
                data-state={isLoadingBalance ? 'loading' : undefined}
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
                style={{
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  transformOrigin: 'left center',
                  maxWidth: '100%',
                }}
                ref={scaleTextRef}
              >
                <PrivateTextLayout
                  isPrivate={isPrivateMode}
                  onShowValue={togglePrivateMode}
                  display="inline-block"
                  overflow="hidden"
                >
                  {totalBalanceFormatted}
                </PrivateTextLayout>
              </styled.h1>

              {lockedBalanceMoney?.amount && lockedBalanceMoney?.amount.toNumber() > 0 && (
                <>
                  <Divider my="space.05" />

                  <Box>
                    <BasicTooltip
                      side="right"
                      variant={tooltipVariant}
                      label={lockedBalanceTooltip}
                    >
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
                    data-state={isLoadingBalance ? 'loading' : undefined}
                    className={shimmerStyles}
                    data-testid={SharedComponentsSelectors.AccountCardBalanceText}
                    style={{
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                      transformOrigin: 'left center',
                      maxWidth: '100%',
                    }}
                    pt="space.02"
                    ref={scaleTextRef}
                  >
                    <PrivateTextLayout
                      isPrivate={isPrivateMode}
                      onShowValue={togglePrivateMode}
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
      </Flex>
    </Flex>
  );
}
