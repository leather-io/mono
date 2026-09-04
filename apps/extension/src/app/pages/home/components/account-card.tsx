import { useNavigate } from 'react-router';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { css, cx } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Flag, InfoCircleIcon, SkeletonLoader, shimmerStyles } from '@leather.io/ui';
import { sumMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useScaleText } from '@app/common/hooks/use-scale-text';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { hasActiveBond } from '@app/features/bonds/bond-position.utils';
import { LockedBalanceCardLayout } from '@app/features/bonds/components/locked-balance-card';
import { useBondLockedBtcQuote, useBondPosition } from '@app/features/bonds/use-bond-position';
import { NetworkSwitcherBadge } from '@app/pages/settings/components/network-switcher';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { useHomePageState } from '../use-home-page-state';

const totalBalanceTooltipLabel =
  'Your total tokens on chain. Includes both available and locked amounts.';

function isMoney(value: Money | undefined): value is Money {
  return !!value;
}

export function AccountCard() {
  const navigate = useNavigate();
  const { totalBalance, availableBalance, stxAccountBalance, isPrivateMode, togglePrivateMode } =
    useHomePageState();
  const scaleTextRef = useScaleText();
  const isAtLeastMd = useViewportMinWidth('md');

  const bond = useBondPosition();
  const bondCtx = bond.state === 'success' ? bond.value : undefined;
  const activeBond = hasActiveBond(bondCtx) ? bondCtx : undefined;
  const bondLockedQuote = useBondLockedBtcQuote(activeBond?.position);

  const tooltipVariant = isAtLeastMd ? 'md' : 'sm';
  const isLoadingBalance = totalBalance.state === 'loading' || availableBalance.state === 'loading';
  const totalBalanceMoney = totalBalance.value;
  const totalBalanceFormatted =
    totalBalance.state !== 'success' ? emptyAmountPlaceholder : formatCurrency(totalBalance.value);

  // Locked = STX committed to stacking + BTC sitting in a bond
  const lockedParts = [stxAccountBalance.value?.quote.lockedBalance, bondLockedQuote].filter(
    isMoney
  );
  const lockedBalance = lockedParts.length ? sumMoney(lockedParts) : undefined;
  const showLockedBalance = !!lockedBalance && lockedBalance.amount.isGreaterThan(0);

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

              {showLockedBalance && (
                <Box pt="space.04">
                  <LockedBalanceCardLayout
                    fiatValue={formatCurrency(lockedBalance)}
                    isLoading={isLoadingBalance}
                    isPrivate={isPrivateMode}
                    onShowValue={togglePrivateMode}
                    onClick={() => navigate(RouteUrls.AllBalances)}
                  />
                </Box>
              )}
            </Flex>
          </SkeletonLoader>
        </Box>
      </Flex>
    </Flex>
  );
}
