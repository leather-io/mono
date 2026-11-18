import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountAddresses } from '@leather.io/models';

import type { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type { HiroPrincipalNftBalance } from '../../../infrastructure/api/hiro/hiro-stacks-api.types';
import type { SettingsService } from '../../../infrastructure/settings/settings.service';
import { createTestUserSettings } from '../../../test/balances-settings';
import { createMock } from '../../../test/create-mock';
import type { StackingDaoLstService } from './stacking-dao-lst.service';
import { StackingDaoStStxBtcService } from './stacking-dao-ststxbtc.service';
import { ststxbtcWithdrawNftIdentifier } from './stacking-dao.constants';

describe(StackingDaoStStxBtcService.name, () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'fp1', accountIndex: 0 },
    stacks: { stxAddress: 'ST123' },
  };
  const withdrawalNfts: HiroPrincipalNftBalance[] = [
    {
      asset_identifier: ststxbtcWithdrawNftIdentifier,
      value: { hex: '0x0100000000000000000000000000000001', repr: 'u1' },
    },
  ];

  const getAddressFtBalances = vi.fn();
  const getPrincipalNftBalances = vi.fn();
  const getLstWithdrawals = vi.fn();

  const service = new StackingDaoStStxBtcService(
    createMock<HiroStacksApiClient>({ getAddressFtBalances, getPrincipalNftBalances }),
    createMock<StackingDaoLstService>({
      getLstHolding: vi.fn().mockResolvedValue(null),
      getLstWithdrawals,
      getSbtcReward: vi.fn().mockResolvedValue(null),
    }),
    createMock<SettingsService>({ getSettings: () => createTestUserSettings() })
  );

  beforeEach(() => {
    vi.clearAllMocks();
    getAddressFtBalances.mockResolvedValue({ limit: 0, offset: 0, total: 0, results: [] });
    getPrincipalNftBalances.mockResolvedValue(withdrawalNfts);
    getLstWithdrawals.mockResolvedValue([]);
  });

  it('only requests ststxbtc withdrawal NFTs from the Stacks API', async () => {
    const signal = new AbortController().signal;

    await service.getAccountPositions(account, signal);

    expect(getPrincipalNftBalances).toHaveBeenCalledWith(
      'ST123',
      { assetIdentifier: ststxbtcWithdrawNftIdentifier, maxPages: 5 },
      { signal }
    );
    expect(getLstWithdrawals).toHaveBeenCalledWith('ststxbtc', withdrawalNfts, signal);
  });

  it('skips the Stacks API for accounts without a stacks address', async () => {
    const positions = await service.getAccountPositions({
      id: { fingerprint: 'fp1', accountIndex: 0 },
    });

    expect(positions).toEqual([]);
    expect(getPrincipalNftBalances).not.toHaveBeenCalled();
  });
});
