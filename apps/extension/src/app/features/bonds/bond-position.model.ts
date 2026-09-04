export type BondPositionStatus = 'upcoming' | 'active' | 'unlocked';

export interface BondPeriodSchedule {
  bondIndex: number;
  /** Burn (Bitcoin) block height at which the period's lock takes effect */
  startBurnHeight: number;
  /** Burn (Bitcoin) block height at which the lock expires */
  unlockBurnHeight: number;
}

/**
 * A single account's position in a bond. One Stacks principal can hold at most
 * one bond at a time, so this is a single object rather than a list.
 *
 * Mirrors what `pox-5.get-bond-membership` returns, joined with the bond's
 * schedule from `GET /extended/v3/staking/bonds/{bond_index}`.
 */
export interface BondPosition extends BondPeriodSchedule {
  status: BondPositionStatus;
  /** BTC locked in the timelock script, in sats */
  amountSats: number;
  /** STX stacked alongside the BTC, in micro-STX */
  amountUstx: number;
  /** The p2wsh policy address the BTC sits in */
  policyAddress: string;
  /** Rewards already paid out for this position, in sats */
  paidOutSats: number;
  /** Set when the account has already registered for the following period */
  renewal?: BondPeriodSchedule;
  /** The next period's registration window, when known */
  nextPeriod?: {
    bondIndex: number;
    registrationOpensBurnHeight: number;
    registrationClosesBurnHeight: number;
  };
}

export interface BondContext {
  position: BondPosition | null;
  /** Current burn (Bitcoin) chain tip, used to derive time-based states */
  burnBlockHeight: number;
}
