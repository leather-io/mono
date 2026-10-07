import axios from 'axios';
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

describe('getFeeEstimatesFromNetworkMempoolApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('that it reads recommended fees from the network mempool api', async () => {
    const getMock = vi
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { fastestFee: 3, halfHourFee: 2, hourFee: 1 } });

    const client = bitcoinClient({
      networkName: 'regtest',
      basePath: 'https://mempool.bitcoin.regtest.hiro.so/api',
    });
    const fees = await client.feeEstimatesApi.getFeeEstimatesFromNetworkMempoolApi();

    expect(getMock).toHaveBeenCalledWith(
      'https://mempool.bitcoin.regtest.hiro.so/api/v1/fees/recommended'
    );
    expect(fees).toEqual({ slow: 1, medium: 2, fast: 3 });
  });
});
