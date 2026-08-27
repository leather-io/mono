import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { HttpCacheService } from '../../cache/http-cache.service';
import type { SettingsService } from '../../settings/settings.service';
import { EmilyApiClient } from './emily-api.client';
import type { EmilyDepositRequest } from './emily-api.types';

const depositRequest: EmilyDepositRequest = {
  bitcoinTxid: 'b'.repeat(64),
  bitcoinTxOutputIndex: 0,
  depositScript: 'deposit-script',
  reclaimScript: 'reclaim-script',
  transactionHex: 'tx-hex',
};

function makeClient(mode: 'mainnet' | 'testnet' = 'mainnet') {
  const settingsService = {
    getSettings: () => ({ network: { chain: { bitcoin: { mode } } } }),
  } as unknown as SettingsService;
  const cacheService = {
    fetchWithCache: (_key: unknown, fetchFn: () => Promise<unknown>) => fetchFn(),
  } as unknown as HttpCacheService;
  return new EmilyApiClient(settingsService, cacheService);
}

describe(EmilyApiClient.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('notifyDeposit', () => {
    it('posts the deposit to the network emily url with a timeout', async () => {
      const post = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          bitcoinTxid: depositRequest.bitcoinTxid,
          bitcoinTxOutputIndex: 0,
          status: 'pending',
        },
      });

      await makeClient('testnet').notifyDeposit(depositRequest);

      expect(post).toHaveBeenCalledWith(
        'https://beta.sbtc-emily.com/deposit',
        depositRequest,
        expect.objectContaining({ timeout: 10_000 })
      );
    });

    it('resolves on any 2xx regardless of the response body shape', async () => {
      vi.spyOn(axios, 'post').mockResolvedValue({ data: { bitcoinTxOutputIndex: '0' } });

      await expect(makeClient().notifyDeposit(depositRequest)).resolves.toBeUndefined();
    });

    it('propagates axios rejections for non-2xx responses', async () => {
      vi.spyOn(axios, 'post').mockRejectedValue(new Error('Request failed with status code 400'));

      await expect(makeClient().notifyDeposit(depositRequest)).rejects.toThrowError(
        'Request failed with status code 400'
      );
    });
  });
});
