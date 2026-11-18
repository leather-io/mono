import { type QueryStatus } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { type StakingPoolSlug, getStakingPoolFromSlug } from '~/data/bitcoin-staking-data';

import { usePox5Position } from '../../hooks/use-pox5-position';
import { usePox5PayoutPreferenceQuery } from '../../queries/pox5-stacking.query';
import { useActiveStakingInfo } from './use-active-staking-info';

vi.mock('../../hooks/use-pox5-position', () => ({ usePox5Position: vi.fn() }));
vi.mock('../../hooks/use-pox5-cycle-clock', () => ({ usePox5CycleClock: () => ({}) }));
vi.mock('../../queries/pox5-node.query', () => ({
  usePox5PoxInfoQuery: () => ({}),
  usePox5SecondsUntilNextCycleQuery: () => ({}),
}));
vi.mock('../../queries/pox5-stacking.query', () => ({
  usePox5ClaimableRewards: () => ({ isLoading: false, totalEarned: 0n, byCycle: [] }),
  usePox5PayoutPreferenceQuery: vi.fn(),
}));

function mockPosition(poolSlug: StakingPoolSlug) {
  vi.mocked(usePox5Position).mockReturnValue({
    isLoading: false,
    position: {
      status: 'active',
      pendingTx: null,
      pool: getStakingPoolFromSlug(poolSlug),
      info: {
        amountMicroStx: 1000000000n,
        firstRewardCycle: 108,
        numCycles: 12,
        signerManagerContractId:
          'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager',
      },
    },
  });
}

describe(useActiveStakingInfo.name, () => {
  test.each<QueryStatus>(['pending', 'error', 'success'])(
    'preserves the payout query status %s',
    status => {
      mockPosition('fast-pool');
      vi.mocked(usePox5PayoutPreferenceQuery, { partial: true }).mockReturnValue({ status });
      const { result } = renderHook(useActiveStakingInfo);
      expect(result.current.details?.payoutPreferenceStatus).toBe(status);
    }
  );

  test('treats a disabled sBTC-only payout query as resolved', () => {
    mockPosition('stacking-dao');
    vi.mocked(usePox5PayoutPreferenceQuery, { partial: true }).mockReturnValue({
      status: 'pending',
    });
    const { result } = renderHook(useActiveStakingInfo);
    expect(usePox5PayoutPreferenceQuery).toHaveBeenLastCalledWith(undefined);
    expect(result.current.details?.payoutPreferenceStatus).toBe('success');
  });
});
