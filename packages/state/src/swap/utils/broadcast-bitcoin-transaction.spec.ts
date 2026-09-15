import { describe, expect, test, vi } from 'vitest';

import { type BitcoinClient } from '@leather.io/query';

import { broadcastBitcoinTransaction } from './broadcast-bitcoin-transaction';

const txHex = '0200000001deadbeef';

function createBitcoinClient(broadcastTransaction: ReturnType<typeof vi.fn>) {
  return { transactionsApi: { broadcastTransaction } } as unknown as BitcoinClient;
}

function createResponse(status: number, body: string) {
  return { ok: status >= 200 && status < 300, status, text: () => Promise.resolve(body) };
}

describe(broadcastBitcoinTransaction.name, () => {
  test('resolves accepted on a 2xx response', async () => {
    const broadcastTransaction = vi.fn().mockResolvedValue(createResponse(200, 'a'.repeat(64)));

    const result = await broadcastBitcoinTransaction(
      createBitcoinClient(broadcastTransaction),
      txHex
    );

    expect(broadcastTransaction).toHaveBeenCalledWith(txHex);
    expect(result).toEqual({ status: 'accepted' });
  });

  test('resolves rejected with the response body on a 4xx response', async () => {
    const broadcastTransaction = vi
      .fn()
      .mockResolvedValue(
        createResponse(400, 'sendrawtransaction RPC error: min relay fee not met\n')
      );

    const result = await broadcastBitcoinTransaction(
      createBitcoinClient(broadcastTransaction),
      txHex
    );

    expect(result).toEqual({
      status: 'rejected',
      errorMessage: 'sendrawtransaction RPC error: min relay fee not met',
    });
  });

  test('treats 429 as rejected because the node never processed the transaction', async () => {
    const broadcastTransaction = vi.fn().mockResolvedValue(createResponse(429, ''));

    const result = await broadcastBitcoinTransaction(
      createBitcoinClient(broadcastTransaction),
      txHex
    );

    expect(result).toEqual({ status: 'rejected', errorMessage: 'Broadcast failed: 429' });
  });

  test('resolves unknown on a 5xx response', async () => {
    const broadcastTransaction = vi.fn().mockResolvedValue(createResponse(502, 'Bad Gateway'));

    const result = await broadcastBitcoinTransaction(
      createBitcoinClient(broadcastTransaction),
      txHex
    );

    expect(result).toEqual({ status: 'unknown', errorMessage: 'Bad Gateway' });
  });

  test('resolves unknown when the request itself fails', async () => {
    const broadcastTransaction = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await broadcastBitcoinTransaction(
      createBitcoinClient(broadcastTransaction),
      txHex
    );

    expect(result).toEqual({ status: 'unknown', errorMessage: 'Failed to fetch' });
  });

  test('resolves unknown when a non-ok response body cannot be read', async () => {
    const broadcastTransaction = vi.fn().mockResolvedValue({
      ok: false,
      status: 504,
      text: () => Promise.reject(new Error('body stream closed')),
    });

    const result = await broadcastBitcoinTransaction(
      createBitcoinClient(broadcastTransaction),
      txHex
    );

    expect(result).toEqual({ status: 'unknown', errorMessage: 'Broadcast failed: 504' });
  });
});
