import axios from 'axios';
import { getPrimaryName } from 'bns-v2-sdk';
import { describe, expect, it, vi } from 'vitest';

import { fetchNamesForAddress } from './bns.utils';

vi.mock('axios');
vi.mock('bns-v2-sdk');

describe('bns.utils', () => {
  describe('fetchNamesForAddress', () => {
    const mockAddress = 'ST123';
    const mockSignal = new AbortController().signal;

    it('returns single name without fetching primary name', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { names: [{ full_name: 'test.btc' }] },
      });

      const result = await fetchNamesForAddress({
        address: mockAddress,
        signal: mockSignal,
        network: 'mainnet',
      });

      expect(result).toEqual({ names: ['test.btc'] });
      expect(getPrimaryName).not.toHaveBeenCalled();
    });

    it('orders primary name first when multiple names exist', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          names: [
            { full_name: 'secondary.btc' },
            { full_name: 'primary.btc' },
            { full_name: 'another.btc' },
          ],
        },
      });

      vi.mocked(getPrimaryName).mockResolvedValueOnce({
        name: 'primary',
        namespace: 'btc',
      });

      const result = await fetchNamesForAddress({
        address: mockAddress,
        signal: mockSignal,
        network: 'mainnet',
      });

      expect(result).toEqual({
        names: ['primary.btc', 'secondary.btc', 'another.btc'],
      });
    });
  });
});
