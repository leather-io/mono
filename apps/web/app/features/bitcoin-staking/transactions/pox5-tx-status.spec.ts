import {
  getBroadcastTxId,
  getPox5TxOutcome,
  getPox5TxRefetchInterval,
  getPox5TxScreenState,
  isUserRejectionError,
  pox5TxNotFoundTimeoutMs,
  pox5TxPollIntervalMs,
} from './pox5-tx-status';

const txIdWithoutPrefix = '11'.repeat(32);
const txIdWithPrefix = `0x${txIdWithoutPrefix}`;

describe(getBroadcastTxId.name, () => {
  test('returns null when there is nothing to poll for', () => {
    expect(getBroadcastTxId(undefined)).toBeNull();
    expect(getBroadcastTxId(null)).toBeNull();
    expect(getBroadcastTxId({})).toBeNull();
    expect(getBroadcastTxId({ txid: '' })).toBeNull();
    expect(getBroadcastTxId({ txid: 1 })).toBeNull();
  });

  test('returns null for a proposed multisig transaction', () => {
    expect(
      getBroadcastTxId({ status: 'proposed', transaction: 'abc', proposalId: '1' })
    ).toBeNull();
  });

  test('normalizes the txid to a hex prefix', () => {
    expect(getBroadcastTxId({ txid: txIdWithoutPrefix, transaction: 'abc' })).toEqual(
      txIdWithPrefix
    );
    expect(getBroadcastTxId({ txid: txIdWithPrefix, transaction: 'abc' })).toEqual(txIdWithPrefix);
  });

  test('accepts a broadcast status alongside a txid', () => {
    expect(getBroadcastTxId({ status: 'broadcast', txid: txIdWithPrefix })).toEqual(txIdWithPrefix);
  });
});

describe(getPox5TxOutcome.name, () => {
  test('maps mempool and confirmed statuses', () => {
    expect(getPox5TxOutcome('pending')).toEqual({ status: 'pending' });
    expect(getPox5TxOutcome('success')).toEqual({ status: 'confirmed' });
  });

  test('maps contract aborts', () => {
    expect(getPox5TxOutcome('abort_by_response')).toEqual({ status: 'failed', reason: 'aborted' });
    expect(getPox5TxOutcome('abort_by_post_condition')).toEqual({
      status: 'failed',
      reason: 'aborted',
    });
  });

  test('maps every dropped status', () => {
    expect(getPox5TxOutcome('dropped_replace_by_fee')).toEqual({
      status: 'failed',
      reason: 'dropped',
    });
    expect(getPox5TxOutcome('dropped_stale_garbage_collect')).toEqual({
      status: 'failed',
      reason: 'dropped',
    });
  });

  test('falls back to an unknown failure', () => {
    expect(getPox5TxOutcome('some_new_status')).toEqual({ status: 'failed', reason: 'unknown' });
  });
});

describe(getPox5TxRefetchInterval.name, () => {
  test('keeps polling while pending or unresolved', () => {
    expect(getPox5TxRefetchInterval(undefined)).toEqual(pox5TxPollIntervalMs);
    expect(getPox5TxRefetchInterval(null)).toEqual(pox5TxPollIntervalMs);
    expect(getPox5TxRefetchInterval({ status: 'pending' })).toEqual(pox5TxPollIntervalMs);
  });

  test('stops polling once settled', () => {
    expect(getPox5TxRefetchInterval({ status: 'confirmed' })).toBe(false);
    expect(getPox5TxRefetchInterval({ status: 'failed', reason: 'aborted' })).toBe(false);
  });
});

describe(getPox5TxScreenState.name, () => {
  const startedAt = 1_000_000;

  test('shows pending while the transaction is not indexed yet', () => {
    expect(getPox5TxScreenState({ outcome: null, startedAt, now: startedAt })).toEqual({
      status: 'pending',
    });
    expect(
      getPox5TxScreenState({
        outcome: null,
        startedAt,
        now: startedAt + pox5TxNotFoundTimeoutMs,
      })
    ).toEqual({ status: 'pending' });
  });

  test('fails once the lookup times out', () => {
    expect(
      getPox5TxScreenState({
        outcome: null,
        startedAt,
        now: startedAt + pox5TxNotFoundTimeoutMs + 1,
      })
    ).toEqual({ status: 'failed', reason: 'not-found' });
  });

  test('prefers a resolved outcome over the timeout', () => {
    expect(
      getPox5TxScreenState({
        outcome: { status: 'confirmed' },
        startedAt,
        now: startedAt + pox5TxNotFoundTimeoutMs * 10,
      })
    ).toEqual({ status: 'confirmed' });
  });
});

describe(isUserRejectionError.name, () => {
  test('detects a rejection on both error shapes', () => {
    expect(isUserRejectionError({ code: 4001 })).toBe(true);
    expect(isUserRejectionError({ jsonrpc: '2.0', id: '1', error: { code: 4001 } })).toBe(true);
  });

  test('ignores anything else', () => {
    expect(isUserRejectionError({ code: -32603 })).toBe(false);
    expect(isUserRejectionError({ error: { code: -32603 } })).toBe(false);
    expect(isUserRejectionError(new Error('Mock Leather error'))).toBe(false);
    expect(isUserRejectionError(null)).toBe(false);
    expect(isUserRejectionError(undefined)).toBe(false);
  });
});
