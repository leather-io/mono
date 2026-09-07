import {
  BtcBond,
  BtcBondEnrollmentWindow,
  BtcBondOutput,
  BtcStakingPosition,
  BtcStakingPositionStatus,
  Money,
} from '@leather.io/models';
import { createMoney, initBigNumber, minutesInMs, sumMoney } from '@leather.io/utils';

import {
  HiroPoxInfoResponse,
  HiroPrincipalStakingBond,
  HiroStakingBond,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { LeatherApiStakingBond } from '../infrastructure/api/leather/leather-api.client';

type LeatherApiStakingBondOutput = LeatherApiStakingBond['outputs'][number];

const averageBitcoinBlockTimeMs = minutesInMs(10);

export function estimateBurnHeightDate(height: number, burnTip: number, now: Date): Date {
  return new Date(now.getTime() + (height - burnTip) * averageBitcoinBlockTimeMs);
}

export function deriveBtcStakingPositionStatus(
  registration: LeatherApiStakingBond,
  burnTip: number
): BtcStakingPositionStatus {
  const announced = registration.exitAnnouncedAtBurnHeight !== null;
  const unspent = registration.outputs.filter(output => !output.spent);
  if (unspent.length === 0) return announced ? 'exited' : 'reclaimed';
  if (announced) return 'exiting';
  if (unspent.every(output => output.unlockBurnHeight <= burnTip)) return 'matured';
  return 'locked';
}

function toBtcBond(bond: HiroStakingBond): BtcBond {
  return {
    index: bond.index,
    status: bond.status,
    activationBurnHeight: bond.schedule.activation.bitcoin_height,
    unlockBurnHeight: bond.schedule.unlock.bitcoin_height,
  };
}

function toBtcBondOutput(output: LeatherApiStakingBondOutput): BtcBondOutput {
  return {
    txid: output.txid,
    vout: output.vout,
    amount: createMoney(initBigNumber(output.amountSats), 'BTC'),
    unlockBurnHeight: output.unlockBurnHeight,
    spent: output.spent,
  };
}

function sumBondOutputs(outputs: BtcBondOutput[]): Money {
  return outputs.length > 0
    ? sumMoney(outputs.map(output => output.amount))
    : createMoney(0, 'BTC');
}

interface ToBtcStakingPositionArgs {
  registration: LeatherApiStakingBond;
  stakerAddress: string;
  bond: HiroStakingBond;
  principalBond: HiroPrincipalStakingBond | undefined;
  burnTip: number;
  now: Date;
}

export function toBtcStakingPosition({
  registration,
  stakerAddress,
  bond,
  principalBond,
  burnTip,
  now,
}: ToBtcStakingPositionArgs): BtcStakingPosition {
  const outputs = registration.outputs.map(toBtcBondOutput);
  const unlockBurnHeight = outputs.reduce(
    (max, output) => Math.max(max, output.unlockBurnHeight),
    0
  );
  return {
    bondIndex: registration.bondIndex,
    stxAddress: registration.stxAddress,
    stakerAddress,
    outputs,
    exitAnnouncedAtBurnHeight: registration.exitAnnouncedAtBurnHeight,
    status: deriveBtcStakingPositionStatus(registration, burnTip),
    amount: sumBondOutputs(outputs),
    stxStacked: principalBond ? createMoney(initBigNumber(principalBond.locked.stx), 'STX') : null,
    rewardsAccrued: principalBond
      ? createMoney(initBigNumber(principalBond.rewards.btc.accrued), 'BTC')
      : null,
    rewardsClaimed: principalBond
      ? createMoney(initBigNumber(principalBond.rewards.btc.claimed), 'BTC')
      : null,
    unlockBurnHeight,
    estimatedUnlockAt: estimateBurnHeightDate(unlockBurnHeight, burnTip, now),
    bond: toBtcBond(bond),
  };
}

export function selectUpcomingBond(bonds: HiroStakingBond[]): HiroStakingBond | undefined {
  return bonds
    .filter(bond => bond.status === 'upcoming')
    .sort((a, b) => a.schedule.activation.bitcoin_height - b.schedule.activation.bitcoin_height)[0];
}

export function deriveBondEnrollmentWindow(
  bond: HiroStakingBond,
  poxInfo: HiroPoxInfoResponse,
  now: Date
): BtcBondEnrollmentWindow {
  const activationBurnHeight = bond.schedule.activation.bitcoin_height;
  const closesAtBurnHeight = activationBurnHeight - poxInfo.prepare_phase_block_length;
  const burnTip = poxInfo.current_burnchain_block_height;
  return {
    bondIndex: bond.index,
    activationBurnHeight,
    closesAtBurnHeight,
    estimatedActivationAt: estimateBurnHeightDate(activationBurnHeight, burnTip, now),
    estimatedClosesAt: estimateBurnHeightDate(closesAtBurnHeight, burnTip, now),
  };
}
