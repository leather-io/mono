import { createGetPox5TransactionQueryOptions } from './create-get-pox5-transaction-query-options';

const txId = `0x${'22'.repeat(32)}`;

function makeContext() {
  return { signal: new AbortController().signal };
}

function makeClient(
  getTransactionById: (txid: string, signal: AbortSignal) => Promise<{ tx_status: string }>
) {
  return { getTransactionById };
}

describe(createGetPox5TransactionQueryOptions.name, () => {
  test('keys the query by txid and disables it without one', () => {
    const withTxId = createGetPox5TransactionQueryOptions({
      txId,
      client: makeClient(() => Promise.resolve({ tx_status: 'success' })),
    });
    expect(withTxId.queryKey).toEqual(['pox5-transaction', txId]);
    expect(withTxId.enabled).toBe(true);

    const withoutTxId = createGetPox5TransactionQueryOptions({
      txId: null,
      client: makeClient(() => Promise.resolve({ tx_status: 'success' })),
    });
    expect(withoutTxId.enabled).toBe(false);
  });

  test('maps the chain status to an outcome', async () => {
    const options = createGetPox5TransactionQueryOptions({
      txId,
      client: makeClient(() => Promise.resolve({ tx_status: 'abort_by_response' })),
    });
    await expect(options.queryFn(makeContext())).resolves.toEqual({
      status: 'failed',
      reason: 'aborted',
    });
  });

  test('resolves to null when the transaction is not indexed yet', async () => {
    const options = createGetPox5TransactionQueryOptions({
      txId,
      client: makeClient(() => Promise.reject(new Error('Request failed with status code 404'))),
    });
    await expect(options.queryFn(makeContext())).resolves.toBeNull();
  });
});
