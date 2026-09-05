import { Navigate } from 'react-router';

import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { BtcAvatarIcon, ExternalLinkIcon, Flag, InfoCircleIcon, Pressable } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import type { BondContext, BondPosition } from '@app/features/bonds/bond-position.model';
import { bondLockedBtc } from '@app/features/bonds/bond-position.utils';
import { bitcoinStakingUrl, inBondLabel, inBondTooltip } from '@app/features/bonds/bonds.constants';
import {
  BondPeriodCard,
  NextPeriodCard,
  RenewalCard,
} from '@app/features/bonds/components/bond-detail-cards';
import { useBondLockedBtcQuote, useBondPosition } from '@app/features/bonds/use-bond-position';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

interface BondDetailContentProps {
  position: BondPosition;
  ctx: BondContext;
  fiatValue?: Money;
}

/** The screen body without page chrome, so the playground can frame it */
export function BondDetailContent({ position, ctx, fiatValue }: BondDetailContentProps) {
  const isActive = position.status === 'active';
  const lockedBtc = isActive ? bondLockedBtc(position) : undefined;

  return (
    <Stack gap="space.00" width="100%">
      <Flex justifyContent="space-between" alignItems="flex-start" pt="space.04" pb="space.05">
        <Stack gap="space.02" data-testid={BondsSelectors.BondDetailTotal}>
          <BasicTooltip label={inBondTooltip} side="top">
            <Flag
              reverse
              spacing="space.01"
              img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
            >
              <styled.h2 textStyle="label.02">{inBondLabel}</styled.h2>
            </Flag>
          </BasicTooltip>
          <styled.span textStyle="heading.03">
            {fiatValue && isActive ? formatCurrency(fiatValue) : emptyAmountPlaceholder}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {lockedBtc
              ? formatCurrency(lockedBtc, { preset: 'pad-decimals' })
              : 'Nothing locked right now'}
          </styled.span>
        </Stack>
        <BtcAvatarIcon />
      </Flex>

      <Divider />
      <BondPeriodCard position={position} ctx={ctx} />

      {position.renewal && (
        <>
          <Divider />
          <RenewalCard renewal={position.renewal} amount={bondLockedBtc(position)} ctx={ctx} />
        </>
      )}

      {!position.renewal && position.nextPeriod && (
        <>
          <Divider />
          <NextPeriodCard nextPeriod={position.nextPeriod} ctx={ctx} />
        </>
      )}

      <Divider />
      <Pressable
        py="space.04"
        onClick={() => openInNewTab(bitcoinStakingUrl)}
        data-testid={BondsSelectors.BondManageLink}
      >
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <styled.span textStyle="label.02">Manage in Bitcoin Staking</styled.span>
          <ExternalLinkIcon color="ink.text-subdued" variant="small" />
        </Flex>
      </Pressable>
    </Stack>
  );
}

export function BondDetailPage() {
  const bond = useBondPosition();
  const position = bond.state === 'success' ? bond.value.position : null;
  const fiatValue = useBondLockedBtcQuote(position);

  // Nothing to show without a position; the row that leads here only renders with one.
  if (bond.state === 'success' && !position) {
    return <Navigate to={RouteUrls.AllBalances} replace />;
  }

  return (
    <Flex height="100vh" direction="column" data-testid={BondsSelectors.BondDetailPage}>
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
        />
      </Header>
      <Content>
        <Box width="100%" height="100%" overflowY="auto" px="space.05" pb="space.05">
          {bond.state === 'success' && position && (
            <BondDetailContent position={position} ctx={bond.value} fiatValue={fiatValue} />
          )}
        </Box>
      </Content>
    </Flex>
  );
}
