import { Money } from './money.model';

export type BtcStakingPositionStatus = 'locked' | 'exiting' | 'matured' | 'reclaimed' | 'exited';

export type BtcBondStatus = 'upcoming' | 'active' | 'unlocked';

export interface BtcBondOutput {
  readonly txid: string;
  readonly vout: number;
  readonly amount: Money;
  readonly unlockBurnHeight: number;
  readonly spent: boolean;
}

export interface BtcBond {
  readonly index: number;
  readonly status: BtcBondStatus;
  readonly activationBurnHeight: number;
  readonly unlockBurnHeight: number;
}

export interface BtcStakingPosition {
  readonly bondIndex: number;
  readonly stxAddress: string;
  readonly stakerAddress: string;
  readonly outputs: BtcBondOutput[];
  readonly exitAnnouncedAtBurnHeight: number | null;
  readonly status: BtcStakingPositionStatus;
  readonly amount: Money;
  readonly stxStacked: Money | null;
  readonly rewardsAccrued: Money | null;
  readonly rewardsClaimed: Money | null;
  readonly unlockBurnHeight: number;
  readonly estimatedUnlockAt: Date;
  readonly bond: BtcBond;
}

export interface BtcBondEnrollmentWindow {
  readonly bondIndex: number;
  readonly activationBurnHeight: number;
  readonly closesAtBurnHeight: number;
  readonly estimatedActivationAt: Date;
  readonly estimatedClosesAt: Date;
}
