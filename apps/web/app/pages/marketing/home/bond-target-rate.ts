import { z } from 'zod';

const stakingBondsUrl = 'https://api.hiro.so/extended/v3/staking/bonds';

// Every active PoX-5 bond carried this target when the card was written (11 Nov 2026).
// Shown only when the Stacks API is slow or down, so the card never renders empty.
const fallbackTargetRateBps = 300;

const stakingBondsSchema = z.object({
  results: z.array(
    z.object({
      status: z.string(),
      parameters: z.object({ target_rate_bps: z.number() }),
    })
  ),
});

export interface BondTargetRate {
  /** Highest target rate across active bonds, in basis points. */
  rateBps: number;
  isLive: boolean;
}

/**
 * Loader helper: the Bitcoin Staking bond target rate for the homepage. Each bond's rate is
 * fixed for its term when the bond is set up. Never throws, so an API outage can't take down
 * the homepage.
 */
export async function fetchBondTargetRate(): Promise<BondTargetRate> {
  try {
    const response = await fetch(stakingBondsUrl, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error(`Staking bonds responded ${response.status}`);
    const { results } = stakingBondsSchema.parse(await response.json());
    const activeRates = results
      .filter(bond => bond.status === 'active')
      .map(bond => bond.parameters.target_rate_bps);
    if (!activeRates.length) throw new Error('No active staking bonds');
    return { rateBps: Math.max(...activeRates), isLive: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load the bond target rate', error);
    return { rateBps: fallbackTargetRateBps, isLive: false };
  }
}

export function formatBondTargetRate(rateBps: number) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(rateBps / 100)}%`;
}
