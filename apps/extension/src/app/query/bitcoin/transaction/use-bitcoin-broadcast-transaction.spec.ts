// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, test, vi } from 'vitest';

import type * as LeatherUtils from '@leather.io/utils';

import { useBitcoinBroadcastTransaction } from './use-bitcoin-broadcast-transaction';

interface HoistedMocks {
  broadcastTransaction: Mock<(tx: string) => Promise<Response>>;
}

const h = vi.hoisted(
  (): HoistedMocks => ({
    broadcastTransaction: vi.fn(),
  })
);

vi.mock('@leather.io/bitcoin', () => ({
  decodeBitcoinTx: () => ({ inputs: [] }),
}));

vi.mock('@leather.io/services', () => ({
  getMempoolApiClient: () => ({ broadcastTransaction: h.broadcastTransaction }),
}));

vi.mock('@leather.io/utils', async importOriginal => ({
  ...(await importOriginal<typeof LeatherUtils>()),
  delay: () => Promise.resolve(),
}));

vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('./use-check-taproot-utxos', () => ({
  useCheckTaprootUtxos: () => ({ checkIfInputsIncludeTaproot: () => Promise.resolve(false) }),
}));

const txid = 'a'.repeat(64);

type BroadcastArgs = Parameters<
  ReturnType<typeof useBitcoinBroadcastTransaction>['broadcastTx']
>[0];

async function broadcast(args: BroadcastArgs) {
  const { result } = renderHook(() => useBitcoinBroadcastTransaction());
  const pending = result.current.broadcastTx(args);
  await act(async () => {
    await pending;
  });
  return pending;
}

describe(useBitcoinBroadcastTransaction.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns the txid and skips onError when the success handler rejects', async () => {
    h.broadcastTransaction.mockResolvedValue(new Response(txid, { status: 200 }));
    const onError = vi.fn();
    const onFinally = vi.fn();
    const onSuccess = vi.fn<(txid: string) => Promise<void>>().mockRejectedValue(new Error('boom'));

    await expect(broadcast({ tx: '00', onSuccess, onError, onFinally })).resolves.toBe(txid);
    expect(onSuccess).toHaveBeenCalledWith(txid);
    expect(onError).not.toHaveBeenCalled();
    expect(onFinally).toHaveBeenCalledOnce();
  });

  test('calls onError when the broadcast fails', async () => {
    h.broadcastTransaction.mockResolvedValue(new Response('bad-txns', { status: 400 }));
    const onError = vi.fn();
    const onSuccess = vi.fn();

    await expect(broadcast({ tx: '00', onSuccess, onError })).resolves.toBeUndefined();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error('bad-txns'));
  });
});
