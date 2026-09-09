import { AccountAddresses } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  HiroPoxInfoResponse,
  HiroStakingBond,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  LeatherApiClient,
  LeatherApiStakingBond,
} from '../infrastructure/api/leather/leather-api.client';
import { BitcoinStakingService } from './bitcoin-staking.service';

const hdAccount: AccountAddresses = {
  id: { fingerprint: 'deadbeef', accountIndex: 0 },
  bitcoin: {
    type: 'hd',
    taprootDescriptor: 'tr(...)',
    nativeSegwitDescriptor: 'wpkh(...)',
    zeroIndexNativeSegwitPayerAddress: 'bc1qpayer',
  },
};

const registration: LeatherApiStakingBond = {
  bondIndex: 4,
  stxAddress: 'SP1STAKER',
  enrollmentTxId: '0xenroll',
  registeredAtBurnHeight: 899_000,
  exitAnnouncedAtBurnHeight: null,
  outputs: [
    {
      txid: 'lock-tx',
      vout: 0,
      amountSats: '200000000',
      unlockBurnHeight: 922_900,
      lockScriptHex: '00',
      spent: false,
      lastCheckedAt: null,
    },
  ],
};

function createBond(
  index: number,
  status: HiroStakingBond['status'],
  activation: number
): HiroStakingBond {
  return {
    index,
    pox_version: 'pox5',
    status,
    parameters: {
      target_rate_bps: 300,
      stx_value_ratio: 310237,
      minimum_stx_ratio: 500,
      btc_capacity: '0',
    },
    registrations: { allowed_count: 0, registered_count: 0 },
    schedule: {
      activation: { bitcoin_height: activation, pox_cycle: 0 },
      unlock: { bitcoin_height: activation + 25_200, pox_cycle: 12 },
    },
    balances: { locked: { btc: '0', stx: '0' }, paid_out: { btc: '0' } },
  };
}

const poxInfo: HiroPoxInfoResponse = {
  contract_id: 'SP000000000000000000002Q6VF78.pox-5',
  first_burnchain_block_height: 666_050,
  current_burnchain_block_height: 900_000,
  prepare_phase_block_length: 100,
  reward_phase_block_length: 2000,
};

describe(BitcoinStakingService.name, () => {
  const fetchStakingBonds = vi.fn();
  const getPoxInfo = vi.fn();
  const getStakingBond = vi.fn();
  const getStakingBonds = vi.fn();
  const getPrincipalStakingBonds = vi.fn();

  const service = new BitcoinStakingService(
    { fetchStakingBonds } as unknown as LeatherApiClient,
    {
      getPoxInfo,
      getStakingBond,
      getStakingBonds,
      getPrincipalStakingBonds,
    } as unknown as HiroStacksApiClient
  );

  beforeEach(() => {
    vi.clearAllMocks();
    fetchStakingBonds.mockResolvedValue([registration]);
    getPoxInfo.mockResolvedValue(poxInfo);
    getStakingBond.mockResolvedValue(createBond(4, 'active', 899_500));
    getPrincipalStakingBonds.mockResolvedValue({
      total: 1,
      limit: 20,
      cursor: { next: null, previous: null, current: '4' },
      results: [
        {
          bond_index: 4,
          status: 'enrolled',
          active: true,
          enrollment: { tx_id: '0xenroll', btc_lockup: { amount: '200000000' } },
          locked: { btc: '200000000', stx: '10000000000' },
          rewards: { btc: { accrued: '1035000', claimed: '1035000', claimable: '0' } },
        },
      ],
    });
  });

  describe('getAccountStakingPositions', () => {
    test('composes a position from the registration, the bond, and the principal bond', async () => {
      const positions = await service.getAccountStakingPositions({ account: hdAccount });

      expect(fetchStakingBonds).toHaveBeenCalledWith('bc1qpayer', {
        includeSpent: undefined,
        signal: undefined,
      });
      expect(getStakingBond).toHaveBeenCalledWith(4, { signal: undefined });
      expect(getPrincipalStakingBonds).toHaveBeenCalledWith('SP1STAKER', { signal: undefined });
      expect(positions).toHaveLength(1);
      expect(positions[0].stakerAddress).toEqual('bc1qpayer');
      expect(positions[0].amount.amount.toString()).toEqual('200000000');
      expect(positions[0].stxStacked?.amount.toString()).toEqual('10000000000');
      expect(positions[0].rewardsClaimed?.amount.toString()).toEqual('1035000');
      expect(positions[0].status).toEqual('locked');
      expect(positions[0].bond.status).toEqual('active');
    });

    test('passes the spent-bonds flag through to the registrations fetch', async () => {
      await service.getAccountStakingPositions({ account: hdAccount, includeSpent: true });

      expect(fetchStakingBonds).toHaveBeenCalledWith('bc1qpayer', {
        includeSpent: true,
        signal: undefined,
      });
    });

    test('returns no positions for accounts without a staker address', async () => {
      const positions = await service.getAccountStakingPositions({
        account: { id: { fingerprint: 'no-btc', accountIndex: 0 } },
      });

      expect(positions).toEqual([]);
      expect(fetchStakingBonds).not.toHaveBeenCalled();
    });

    test('fails when the bond lookup fails', async () => {
      getStakingBond.mockRejectedValue(new Error('hiro unavailable'));

      await expect(service.getAccountStakingPositions({ account: hdAccount })).rejects.toThrow(
        'hiro unavailable'
      );
    });
  });

  describe('getUpcomingBondEnrollmentWindow', () => {
    test('derives the window of the next upcoming bond', async () => {
      getStakingBonds.mockResolvedValue({
        total: 3,
        limit: 10,
        cursor: { next: null, previous: null, current: '6' },
        results: [
          createBond(6, 'upcoming', 905_000),
          createBond(5, 'upcoming', 902_900),
          createBond(4, 'active', 899_500),
        ],
      });

      const window = await service.getUpcomingBondEnrollmentWindow();

      expect(window?.bondIndex).toEqual(5);
      expect(window?.activationBurnHeight).toEqual(902_900);
      expect(window?.closesAtBurnHeight).toEqual(902_800);
    });

    test('is null when no bond is upcoming', async () => {
      getStakingBonds.mockResolvedValue({
        total: 1,
        limit: 10,
        cursor: { next: null, previous: null, current: '4' },
        results: [createBond(4, 'active', 899_500)],
      });

      expect(await service.getUpcomingBondEnrollmentWindow()).toBeNull();
    });
  });
});
