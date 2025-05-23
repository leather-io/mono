import { describe, expect, it, vi } from 'vitest';

import { getPrimaryName } from './bns-v2-sdk';
import { fetchNamesForAddress } from './bns.utils';

vi.mock('axios');
vi.mock('./bns-v2-sdk');

describe('bns.utils', () => {
  describe('fetchNamesForAddress', () => {
    const mockAddress = 'ST123';
    const mockSignal = new AbortController().signal;
    const mockClient = {
      getNamesByAddress: vi.fn(),
      getZoneFileData: vi.fn(),
      getBnsNameDataByName: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns single name without fetching primary name', async () => {
      mockClient.getNamesByAddress.mockResolvedValueOnce({
        names: [{ full_name: 'test.btc' }],
      });

      const result = await fetchNamesForAddress({
        address: mockAddress,
        signal: mockSignal,
        network: 'mainnet',
        client: mockClient,
      });

      expect(result).toEqual({ names: ['test.btc'] });
      expect(getPrimaryName).not.toHaveBeenCalled();
    });

    it('orders primary name first when multiple names exist', async () => {
      mockClient.getNamesByAddress.mockResolvedValueOnce({
        names: [
          { full_name: 'secondary.btc' },
          { full_name: 'primary.btc' },
          { full_name: 'another.btc' },
        ],
      });

      vi.mocked(getPrimaryName).mockResolvedValueOnce({
        name: 'primary',
        namespace: 'btc',
      });

      const result = await fetchNamesForAddress({
        address: mockAddress,
        signal: mockSignal,
        network: 'mainnet',
        client: mockClient,
      });

      expect(result).toEqual({
        names: ['primary.btc', 'secondary.btc', 'another.btc'],
      });
    });
  });
});
