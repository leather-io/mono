import { injectable } from 'inversify';

import { BtcBondEnrollmentWindow, BtcStakingPosition } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  LeatherApiClient,
  LeatherApiStakingBond,
} from '../infrastructure/api/leather/leather-api.client';
import { AccountRequest } from '../types';
import { getBondStakerAddress } from '../utxos/utxos.utils';
import {
  deriveBondEnrollmentWindow,
  selectUpcomingBond,
  toBtcStakingPosition,
} from './bitcoin-staking.utils';

export interface BtcStakingPositionsRequest extends AccountRequest {
  includeSpent?: boolean;
}

@injectable()
export class BitcoinStakingService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly stacksApiClient: HiroStacksApiClient
  ) {}

  /**
   * Gets the account's bond positions: one per registration with unspent lock outputs, or
   * every registration when spent bonds are requested, enriched with the bond schedule and
   * the staker principal's stacked STX and rewards.
   */
  public async getAccountStakingPositions(
    { account, exclusions, includeSpent }: BtcStakingPositionsRequest,
    signal?: AbortSignal
  ): Promise<BtcStakingPosition[]> {
    const stakerAddress = getBondStakerAddress(account, exclusions);
    if (!stakerAddress) return [];
    const [registrations, poxInfo] = await Promise.all([
      this.leatherApiClient.fetchStakingBonds(stakerAddress, { includeSpent, signal }),
      this.stacksApiClient.getPoxInfo({ signal }),
    ]);
    const now = new Date();
    return Promise.all(
      registrations.map(registration =>
        this.getStakingPosition(
          registration,
          stakerAddress,
          poxInfo.current_burnchain_block_height,
          now,
          signal
        )
      )
    );
  }

  /**
   * Gets the registration window of the next bond to activate, or null when none is upcoming.
   */
  public async getUpcomingBondEnrollmentWindow(
    signal?: AbortSignal
  ): Promise<BtcBondEnrollmentWindow | null> {
    const [bonds, poxInfo] = await Promise.all([
      this.stacksApiClient.getStakingBonds({ signal }),
      this.stacksApiClient.getPoxInfo({ signal }),
    ]);
    const upcomingBond = selectUpcomingBond(bonds.results);
    return upcomingBond ? deriveBondEnrollmentWindow(upcomingBond, poxInfo, new Date()) : null;
  }

  private async getStakingPosition(
    registration: LeatherApiStakingBond,
    stakerAddress: string,
    burnTip: number,
    now: Date,
    signal?: AbortSignal
  ): Promise<BtcStakingPosition> {
    const [bond, principalBonds] = await Promise.all([
      this.stacksApiClient.getStakingBond(registration.bondIndex, { signal }),
      this.stacksApiClient.getPrincipalStakingBonds(registration.stxAddress, { signal }),
    ]);
    return toBtcStakingPosition({
      registration,
      stakerAddress,
      bond,
      principalBond: principalBonds.results.find(
        principalBond => principalBond.bond_index === registration.bondIndex
      ),
      burnTip,
      now,
    });
  }
}
