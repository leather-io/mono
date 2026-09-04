import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  type BondScenario,
  bondFixtures,
  bondScenarioLabels,
  bondScenarios,
} from '@app/features/bonds/bond-fixtures';
import {
  bondLockedBtc,
  bondLockedStx,
  hasActiveBond,
} from '@app/features/bonds/bond-position.utils';
import { inBondLabel, inBondTooltip } from '@app/features/bonds/bonds.constants';
import {
  BondCalloutLayout,
  getBondCalloutCopy,
  getBondCalloutVariant,
} from '@app/features/bonds/components/bond-callout';
import { LockedBalanceCardLayout } from '@app/features/bonds/components/locked-balance-card';
import {
  isBondMockAllowed,
  setBondScenario,
  useBondScenario,
} from '@app/features/bonds/use-bond-position';
import { TokenDetailsBalanceItem } from '@app/features/token/components/token-details-balance-item';
import { formatBalance } from '@app/pages/all-balances/all-balances.utils';
import { BalanceRow } from '@app/pages/all-balances/components/balance-row';
import { BondDetailContent } from '@app/pages/bond-detail/bond-detail';
import { useMarketData } from '@app/query/common/market-data/market-data.query';

/**
 * Dev-only surface: every bond component in every scenario, side by side, so a
 * state can be reviewed from a PR build without a funded wallet. Same gate as the
 * mock key, so it 404s in store builds.
 */
export function BondsPlaygroundPage() {
  if (!isBondMockAllowed) return <Navigate to={RouteUrls.Home} replace />;

  return (
    <Flex height="100vh" direction="column" data-testid={BondsSelectors.BondsPlaygroundPage}>
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={<styled.span textStyle="heading.05">Bonds playground</styled.span>}
        />
      </Header>
      <Content>
        <Box width="100%" height="100%" overflowY="auto" px="space.05" pb="space.06">
          <LiveScenarioBar />
          {bondScenarios.map(scenario => (
            <ScenarioSection key={scenario} scenario={scenario} />
          ))}
        </Box>
      </Content>
    </Flex>
  );
}

function LiveScenarioBar() {
  const current = useBondScenario();
  return (
    <Stack gap="space.03" py="space.05">
      <Stack gap="space.01">
        <styled.span textStyle="label.02">Live scenario</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Applies to Home, All balances and the token pages in this build. Stored under{' '}
          <styled.code fontFamily="mono">leather-mock-bond</styled.code>.
        </styled.span>
      </Stack>
      <Flex gap="space.02" flexWrap="wrap">
        {bondScenarios.map(scenario => {
          const isCurrent = scenario === current;
          return (
            <styled.button
              key={scenario}
              type="button"
              textStyle="label.03"
              px="space.03"
              py="space.02"
              borderRadius="round"
              border="1px solid"
              borderColor={isCurrent ? 'ink.text-primary' : 'ink.border-default'}
              bg={isCurrent ? 'ink.text-primary' : 'ink.background-primary'}
              color={isCurrent ? 'ink.background-primary' : 'ink.text-primary'}
              _hover={{ cursor: 'pointer' }}
              onClick={() => setBondScenario(scenario)}
            >
              {bondScenarioLabels[scenario]}
            </styled.button>
          );
        })}
      </Flex>
      <Divider />
    </Stack>
  );
}

// Frames are for looking at, so their actions go nowhere
function noop() {
  return undefined;
}

interface ScenarioSectionProps {
  scenario: BondScenario;
}

function ScenarioSection({ scenario }: ScenarioSectionProps) {
  const ctx = bondFixtures[scenario];
  const btcMarketData = useMarketData(btcAsset);
  const stxMarketData = useMarketData(stxAsset);

  function toBtcQuote(money: Money) {
    return btcMarketData.state === 'success'
      ? baseCurrencyAmountInQuote(money, btcMarketData.value)
      : undefined;
  }
  function toStxQuote(money: Money) {
    return stxMarketData.state === 'success'
      ? baseCurrencyAmountInQuote(money, stxMarketData.value)
      : undefined;
  }

  const activeBond = hasActiveBond(ctx) ? ctx : undefined;
  const bondBtc = activeBond ? bondLockedBtc(activeBond.position) : undefined;
  const bondBtcQuote = bondBtc ? toBtcQuote(bondBtc) : undefined;
  const bondStx = activeBond ? bondLockedStx(activeBond.position) : undefined;
  const bondStxQuote = bondStx ? toStxQuote(bondStx) : undefined;

  const calloutVariant = getBondCalloutVariant(ctx);
  const calloutCopy =
    calloutVariant && ctx.position ? getBondCalloutCopy(calloutVariant, ctx.position, ctx) : null;

  return (
    <Stack gap="space.04" py="space.05">
      <Stack gap="space.01">
        <styled.h2 textStyle="heading.05">{bondScenarioLabels[scenario]}</styled.h2>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          <styled.code fontFamily="mono">leather-mock-bond = {scenario}</styled.code>
          {' · '}block {ctx.burnBlockHeight.toLocaleString()}
        </styled.span>
      </Stack>

      <Flex gap="space.04" flexWrap="wrap" alignItems="flex-start">
        <Frame label="Home · Locked card (bond share only)">
          {activeBond ? (
            <LockedBalanceCardLayout
              fiatValue={bondBtcQuote ? formatCurrency(bondBtcQuote) : emptyAmountPlaceholder}
              onClick={noop}
            />
          ) : (
            <NotShown reason="Nothing locked, card hidden" />
          )}
        </Frame>

        <Frame label="Home · Callout">
          {calloutVariant && calloutCopy ? (
            <BondCalloutLayout
              variant={calloutVariant}
              title={calloutCopy.title}
              body={calloutCopy.body}
              primaryActionLabel={calloutCopy.primaryActionLabel}
              onPrimaryAction={noop}
              onDismiss={noop}
            />
          ) : (
            <NotShown reason="No callout in this state" />
          )}
        </Frame>

        <Frame label="All balances · rows">
          {activeBond ? (
            <>
              <BalanceRow
                label={inBondLabel}
                fiatValue={formatBalance(bondBtcQuote)}
                cryptoValue={formatBalance(bondBtc)}
                tooltipText={inBondTooltip}
                onClick={noop}
              />
              <BalanceRow
                label={inBondLabel}
                fiatValue={formatBalance(bondStxQuote)}
                cryptoValue={formatBalance(bondStx)}
                tooltipText={inBondTooltip}
                onClick={noop}
              />
            </>
          ) : (
            <NotShown reason="Rows hidden, sections unchanged" />
          )}
        </Frame>

        <Frame label="Stacks token page · Balances row">
          {activeBond && bondStx ? (
            <TokenDetailsBalanceItem
              title={inBondLabel}
              caption={`Unlocks ${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`}
              rightTop={formatCurrency(bondStx)}
              rightBottom={bondStxQuote ? formatCurrency(bondStxQuote) : undefined}
              onPressRow={noop}
            />
          ) : (
            <NotShown reason="Row hidden" />
          )}
        </Frame>

        <Frame label="Bitcoin → In a bond">
          {ctx.position ? (
            <BondDetailContent position={ctx.position} ctx={ctx} fiatValue={bondBtcQuote} />
          ) : (
            <NotShown reason="Unreachable, no row leads here" />
          )}
        </Frame>
      </Flex>
      <Divider />
    </Stack>
  );
}

interface FrameProps {
  label: string;
  children: ReactNode;
}

function Frame({ label, children }: FrameProps) {
  return (
    <Stack
      gap="space.03"
      width="390px"
      maxWidth="100%"
      flexShrink={0}
      p="space.04"
      border="1px solid"
      borderColor="ink.border-default"
      borderRadius="md"
      bg="ink.background-primary"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      {children}
    </Stack>
  );
}

function NotShown({ reason }: { reason: string }) {
  return (
    <styled.span textStyle="caption.01" color="ink.text-non-interactive" fontStyle="italic">
      {reason}
    </styled.span>
  );
}
