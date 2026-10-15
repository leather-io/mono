import { STACKS_TESTNET } from '@stacks/network';
import type * as StacksTransactions from '@stacks/transactions';
import { type StacksTransactionWire, makeUnsignedSTXTokenTransfer } from '@stacks/transactions';
import { type Mock, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type * as LeatherUtils from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

import { stacksBroadcastTransaction } from './stacks-broadcast-transaction';

interface HoistedMocks {
  broadcastTransaction: Mock<() => Promise<unknown>>;
}

const h = vi.hoisted(
  (): HoistedMocks => ({
    broadcastTransaction: vi.fn(),
  })
);

vi.mock('@stacks/transactions', async importOriginal => ({
  ...(await importOriginal<typeof StacksTransactions>()),
  broadcastTransaction: h.broadcastTransaction,
}));

vi.mock('@leather.io/utils', async importOriginal => ({
  ...(await importOriginal<typeof LeatherUtils>()),
  delay: () => Promise.resolve(),
}));

vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: vi.fn(), untypedTrack: vi.fn() },
}));

vi.mock('@app/common/utils', () => ({
  createError: (fields: { message: string }) => new Error(fields.message),
  serializeError: () => ({}),
}));

vi.mock('@app/query/stacks/stacks-client', () => ({
  hiroFetchWrapper: vi.fn(),
}));

const network = STACKS_TESTNET;
const txid = 'a'.repeat(64);

describe(stacksBroadcastTransaction.name, () => {
  let signedTx: StacksTransactionWire;

  beforeAll(async () => {
    signedTx = await makeUnsignedSTXTokenTransfer({
      recipient: 'ST000000000000000000002AMW42H',
      amount: 1n,
      fee: 0,
      nonce: 0,
      publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      network: 'testnet',
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not report a failure when the success handler throws after a broadcast', async () => {
    h.broadcastTransaction.mockResolvedValue({ txid });
    const onError = vi.fn();
    const onSuccess = vi.fn(() => {
      throw new Error('boom');
    });

    await stacksBroadcastTransaction({ network, signedTx, onSuccess, onError });

    expect(onSuccess).toHaveBeenCalledWith(txid, signedTx);
    expect(onError).not.toHaveBeenCalled();
    expect(analytics.untypedTrack).not.toHaveBeenCalledWith(
      'stacks_transaction_broadcast_failed',
      expect.anything()
    );
  });

  test('reports a failure when the broadcast is rejected', async () => {
    h.broadcastTransaction.mockResolvedValue({ error: 'rejected', reason: 'BadNonce' });
    const onError = vi.fn();
    const onSuccess = vi.fn();

    await stacksBroadcastTransaction({ network, signedTx, onSuccess, onError });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
  });
});
