import type { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { btcAsset } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { LockedBalanceBadge } from '@app/components/balance/locked-balance-badge';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { getBondFixture } from '@app/features/bonds/bond-fixtures';
import {
  type BondScenario,
  bondScenarioLabels,
  bondScenarios,
  isBondMockAllowed,
  setBondScenario,
  useBondScenario,
} from '@app/features/bonds/bond-scenarios';
import { btcBalanceCategoryMap, formatBalance } from '@app/pages/all-balances/all-balances.utils';
import {
  getRenewalOpensAt,
  isPastPosition,
  summarizePastPositions,
} from '@app/pages/all-balances/bond-positions.utils';
import { BalanceRow } from '@app/pages/all-balances/components/balance-row';
import { BondPositionSection } from '@app/pages/all-balances/components/bond-position-section';
import { PastPeriodsRow } from '@app/pages/all-balances/components/past-periods-row';
import { UpcomingBondSection } from '@app/pages/all-balances/components/upcoming-bond-section';
import { useMarketData } from '@app/query/common/market-data/market-data.query';

/**
 * Dev-only surface: every bond state side by side, rendered with the real
 * components and fixture positions, so a state can be reviewed from a PR build
 * without a funded wallet. Same gate as the mock scenarios, so it never ships.
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
  const navigate = useNavigate();
  const current = useBondScenario();
  return (
    <Stack gap="space.03" py="space.05">
      <Stack gap="space.01">
        <styled.span textStyle="label.02">Live scenario</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Replaces the staking index for Home, All balances and the token pages in this build.
          Stored under <styled.code fontFamily="mono">leather-mock-bond</styled.code>.
        </styled.span>
      </Stack>
      <Flex gap="space.02" flexWrap="wrap">
        {bondScenarios.map(scenario => (
          <Chip
            key={scenario}
            isActive={scenario === current}
            onClick={() => setBondScenario(scenario)}
            testId={`${BondsSelectors.BondsPlaygroundScenario}${scenario}`}
          >
            {bondScenarioLabels[scenario]}
          </Chip>
        ))}
      </Flex>
      <Flex gap="space.02" flexWrap="wrap">
        <Chip onClick={() => void navigate(RouteUrls.Home)}>Open Home</Chip>
        <Chip onClick={() => void navigate(RouteUrls.AllBalances)}>Open All balances</Chip>
        <Chip
          onClick={() => void navigate(RouteUrls.AllBalancesDetail.replace(':category', 'bonded'))}
        >
          Open In a bond
        </Chip>
      </Flex>
      <Divider />
    </Stack>
  );
}

interface ChipProps {
  children: ReactNode;
  isActive?: boolean;
  onClick(): void;
  testId?: string;
}

function Chip({ children, isActive = false, onClick, testId }: ChipProps) {
  return (
    <styled.button
      type="button"
      textStyle="label.03"
      px="space.03"
      py="space.02"
      borderRadius="round"
      border="1px solid"
      borderColor={isActive ? 'ink.text-primary' : 'ink.border-default'}
      bg={isActive ? 'ink.text-primary' : 'ink.background-primary'}
      color={isActive ? 'ink.background-primary' : 'ink.text-primary'}
      _hover={{ cursor: 'pointer' }}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </styled.button>
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
  const fixture = getBondFixture(scenario);
  const marketData = useMarketData(btcAsset);
  const { title, tooltipText } = btcBalanceCategoryMap.bonded;

  function toQuote(money: Money): Money | undefined {
    if (marketData.state !== 'success') return undefined;
    return baseCurrencyAmountInQuote(money, marketData.value);
  }

  const locked = createMoney(fixture.lockedSats, 'BTC');
  const lockedQuote = toQuote(locked);
  const hasLocked = fixture.lockedSats > 0;

  const currentPositions = fixture.positions.filter(p => !isPastPosition(p));
  const pastSummary = summarizePastPositions(fixture.positions);
  const upcomingWindow =
    fixture.enrollmentWindow &&
    !fixture.positions.some(p => p.bondIndex === fixture.enrollmentWindow?.bondIndex)
      ? fixture.enrollmentWindow
      : null;

  return (
    <Stack gap="space.04" py="space.05">
      <Stack gap="space.01">
        <styled.h2 textStyle="heading.05">{bondScenarioLabels[scenario]}</styled.h2>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          <styled.code fontFamily="mono">leather-mock-bond = {scenario}</styled.code>
          {' · '}block {fixture.burnTip.toLocaleString()}
        </styled.span>
      </Stack>

      <Flex gap="space.04" flexWrap="wrap" alignItems="flex-start">
        <Frame label="Home · Bitcoin row chip">
          {hasLocked ? (
            <Flex justifyContent="flex-end">
              <LockedBalanceBadge balance={locked} />
            </Flex>
          ) : (
            <NotShown reason="No chip, nothing locked" />
          )}
        </Frame>

        <Frame label="All balances · In a bond row">
          <BalanceRow
            label={title}
            fiatValue={lockedQuote ? formatCurrency(lockedQuote) : emptyAmountPlaceholder}
            cryptoValue={formatBalance(locked)}
            tooltipText={tooltipText}
            onClick={noop}
          />
        </Frame>

        <Frame label="Bitcoin → In a bond">
          <Stack gap="space.00">
            <Stack gap="space.02" pb="space.04">
              <styled.span textStyle="label.02">{title}</styled.span>
              <styled.span textStyle="heading.03">
                {lockedQuote ? formatCurrency(lockedQuote) : emptyAmountPlaceholder}
              </styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {formatBalance(locked)}
              </styled.span>
            </Stack>
            {fixture.positions.length === 0 && <NotShown reason="No bonds for this account" />}
            {currentPositions.map(position => (
              <Box key={position.bondIndex}>
                <Divider />
                <BondPositionSection position={position} heldBy="Your key, timelock script" />
              </Box>
            ))}
            {upcomingWindow && (
              <>
                <Divider />
                <UpcomingBondSection
                  window={upcomingWindow}
                  opensAt={getRenewalOpensAt(fixture.positions)}
                />
              </>
            )}
            {pastSummary.count > 0 && (
              <>
                <Divider />
                <PastPeriodsRow summary={pastSummary} onClick={noop} />
              </>
            )}
          </Stack>
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
