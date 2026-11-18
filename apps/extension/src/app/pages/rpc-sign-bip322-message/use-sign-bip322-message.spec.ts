// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { useSignBip322Message } from './use-sign-bip322-message';

interface HoistedMocks {
  params: URLSearchParams;
  createTaprootPayer: Mock | undefined;
  createNativeSegwitPayer: Mock | undefined;
  sendMessageToOriginatingFrame: Mock;
  closeWindow: Mock;
}

const nativeSegwitAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

const h = vi.hoisted(
  (): HoistedMocks => ({
    params: new URLSearchParams(),
    createTaprootPayer: undefined,
    createNativeSegwitPayer: undefined,
    sendMessageToOriginatingFrame: vi.fn(),
    closeWindow: vi.fn(),
  })
);

vi.mock('@app/common/initial-search-params', () => ({
  get initialSearchParams() {
    return h.params;
  },
}));

vi.mock('@app/common/hooks/use-default-request-search-params', () => ({
  useDefaultRequestParams: () => ({ frameId: 0, tabId: 7, origin: 'https://app.example' }),
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/taproot-account.hooks', () => ({
  useCurrentAccountTaprootPayer: () => h.createTaprootPayer,
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks', () => ({
  useCurrentAccountNativeSegwitPayer: () => h.createNativeSegwitPayer,
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/bitcoin.hooks', () => ({
  useSignBitcoinTx: () => vi.fn(),
}));

vi.mock('@leather.io/bitcoin', () => ({
  createBitcoinAddress: (value: string) => value,
}));

vi.mock('@app/common/sign-bip322-message-unless-dismissed', () => ({
  signBip322MessageUnlessDismissed: vi.fn(),
}));

vi.mock('@app/features/ledger/flow/unwrap-ledger-signing-outcome', () => ({
  isLedgerSigningCancelledError: () => false,
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('@app/features/toasts/use-toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: vi.fn() },
}));

vi.mock('@shared/messaging/send-message-to-originating-frame', () => ({
  sendMessageToOriginatingFrame: h.sendMessageToOriginatingFrame,
}));

vi.mock('@shared/utils', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  closeWindow: h.closeWindow,
}));

function requestSignature(paymentType: string) {
  h.params = new URLSearchParams({ requestId: 'request-1', message: 'hello', paymentType });
  return renderHook(() => useSignBip322Message()).result.current;
}

describe(useSignBip322Message.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.createTaprootPayer = undefined;
    h.createNativeSegwitPayer = vi.fn(() => ({ payment: { address: nativeSegwitAddress } }));
  });

  test('signs native segwit requests when the account has no taproot keys', () => {
    expect(requestSignature('p2wpkh').address).toBe(nativeSegwitAddress);
  });

  test('has no signer for a taproot request when the account has no taproot keys', () => {
    expect(requestSignature('p2tr').address).toBeUndefined();
  });

  test('has no signer for an unsupported payment type', () => {
    expect(requestSignature('p2pkh').address).toBeUndefined();
  });

  test('rejects the request and closes the window when no signer is available', () => {
    requestSignature('p2tr').onSignerUnavailable();

    expect(h.sendMessageToOriginatingFrame).toHaveBeenCalledWith(
      { frameId: 0, tabId: 7 },
      expect.objectContaining({ id: 'request-1' })
    );
    expect(h.sendMessageToOriginatingFrame.mock.calls[0]?.[1]).toMatchObject({
      error: { code: RpcErrorCode.INVALID_REQUEST },
    });
    expect(h.closeWindow).toHaveBeenCalledOnce();
  });
});
