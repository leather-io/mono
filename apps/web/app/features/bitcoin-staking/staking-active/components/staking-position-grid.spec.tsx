import { type ReactNode } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { EM_DASH } from '~/constants/constants';
import { type StakingPoolSlug, getStakingPoolFromSlug } from '~/data/bitcoin-staking-data';

import { type ActiveStakingDetails } from '../hooks/use-active-staking-info';
import { StakingPositionGrid } from './staking-position-grid';

vi.mock('./staking-action-buttons', () => ({ StakingActionButtons: () => null }));
vi.mock('../../components/pool-tvl-value', () => ({ PoolTvlValue: () => null }));
vi.mock('~/components/copy-address', () => ({
  CopyAddress: ({ addr }: { addr: string }) => <span>{addr}</span>,
}));
vi.mock('~/features/stacking/components/stacking-info-grid.layout', () => ({
  StackingInfoGridLayout: ({ cells }: { cells: Record<string, ReactNode> }) => (
    <>
      <div data-testid="rewards-token">{cells.rewardsToken}</div>
      <div data-testid="rewards-payout">{cells.rewardAddress}</div>
    </>
  ),
}));

const btcRewardAddress = '1JFFXEDe8dze2DUm3R1XwXAkVm7jGVtaVb';
const details: ActiveStakingDetails = {
  endCycle: 120,
  unlockDate: null,
  isInPreparePhase: false,
  secondsUntilStakingReopens: 0,
  nextCycleNumber: null,
  daysUntilNextCycle: null,
  claimable: { isLoading: false, totalEarned: 0n, byCycle: [] },
  payoutPreference: null,
  payoutPreferenceStatus: 'success',
};

function renderGrid(
  overrides: Partial<ActiveStakingDetails> = {},
  poolSlug: StakingPoolSlug = 'fast-pool'
) {
  const pool = getStakingPoolFromSlug(poolSlug);
  render(
    <StakingPositionGrid
      poolSlug={poolSlug}
      pool={pool}
      info={{
        amountMicroStx: 1000000000n,
        firstRewardCycle: 108,
        numCycles: 12,
        signerManagerContractId:
          'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager',
      }}
      details={{ ...details, ...overrides }}
    />
  );
}

afterEach(cleanup);

describe(StakingPositionGrid.name, () => {
  test('shows BTC for the reported native BTC payout election', () => {
    renderGrid({
      payoutPreference: { btcRewardAddress, maxFeeSats: 1000n, minClaimSats: 10000n },
    });
    expect(screen.getByTestId('rewards-token').textContent).toBe('Rewards tokenBTC');
    expect(screen.getByTestId('rewards-payout').textContent).toBe(
      `Rewards payout${btcRewardAddress}`
    );
  });

  test.each<ActiveStakingDetails['payoutPreferenceStatus']>(['pending', 'error'])(
    'shows placeholders when the payout read is %s',
    status => {
      renderGrid({ payoutPreferenceStatus: status });
      expect(screen.getByTestId('rewards-token').textContent).toBe(`Rewards token${EM_DASH}`);
      expect(screen.getByTestId('rewards-payout').textContent).toBe(`Rewards payout${EM_DASH}`);
    }
  );

  test('shows sBTC when a successful read confirms no BTC preference', () => {
    renderGrid();
    expect(screen.getByTestId('rewards-token').textContent).toBe('Rewards tokensBTC');
    expect(screen.getByTestId('rewards-payout').textContent).toBe('Rewards payoutsBTC on Stacks');
  });

  test('preserves BTC for an operator-paid pool', () => {
    renderGrid({}, 'planbetter');
    expect(screen.getByTestId('rewards-token').textContent).toBe('Rewards tokenBTC');
    expect(screen.getByTestId('rewards-payout').textContent).toBe(`Rewards payout${EM_DASH}`);
  });
});
