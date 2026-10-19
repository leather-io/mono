import { afterEach, describe, expect, test, vi } from 'vitest';

import { bitcoinClient } from './bitcoin-client';

describe('broadcastTransaction', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('that it posts the raw transaction hex with a text/plain content type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('txid'));
    vi.stubGlobal('fetch', fetchMock);

    const client = bitcoinClient({ networkName: 'mainnet', basePath: 'https://example.com/api' });
    await client.transactionsApi.broadcastTransaction('0200000001abcdef');

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/tx', {
      method: 'POST',
      body: '0200000001abcdef',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  });
});
