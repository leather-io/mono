// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { UnsignedMessage } from '@shared/signature/signature-types';

import { useSignStacksMessage } from './use-sign-stacks-message';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  sign: vi.fn(),
}));

vi.mock('@shared/utils/analytics', () => ({ analytics: { track: vi.fn() } }));

vi.mock('@app/common/use-wallet-type', () => ({
  useWalletType: () => ({
    whenWallet:
      ({ ledger }: { ledger(message: UnsignedMessage): Promise<void> }) =>
      (message: UnsignedMessage) =>
        ledger(message),
  }),
}));

vi.mock('@app/features/ledger/flow/ledger-flow.context', () => ({
  useLedgerFlow: () => ({ sign: h.sign }),
}));

vi.mock('@app/features/stacks-message-signer/stacks-message-signing.utils', () => ({
  improveUxWithShortDelayAsStacksSigningIsSoFast: vi.fn(),
  useMessageSignerStacksSoftwareWallet: () => vi.fn(),
}));

const unsignedMessage: UnsignedMessage = { messageType: 'utf8', message: 'hello' };

function renderSignStacksMessage() {
  const onSignMessageCompleted = vi.fn();
  const onSignMessageCancelled = vi.fn();
  let signMessage: ReturnType<typeof useSignStacksMessage>['signMessage'] | undefined;
  function TestComponent() {
    signMessage = useSignStacksMessage({
      onSignMessageCompleted,
      onSignMessageCancelled,
    }).signMessage;
    return null;
  }
  act(() => {
    createRoot(document.createElement('div')).render(createElement(TestComponent));
  });
  return {
    onSignMessageCompleted,
    onSignMessageCancelled,
    signMessage(message: UnsignedMessage) {
      if (!signMessage) throw new Error('Hook did not render');
      return signMessage(message);
    },
  };
}

describe(useSignStacksMessage.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('completes with the Ledger signature', async () => {
    const signature = { signature: 'sig', publicKey: 'pub' };
    h.sign.mockResolvedValue({ status: 'signed', value: signature });
    const rendered = renderSignStacksMessage();

    await rendered.signMessage(unsignedMessage);

    expect(h.sign).toHaveBeenCalledWith({ kind: 'sign-stacks-message', message: unsignedMessage });
    expect(rendered.onSignMessageCompleted).toHaveBeenCalledWith(signature);
  });

  test('cancels the request when Ledger signing is cancelled', async () => {
    h.sign.mockResolvedValue({ status: 'cancelled' });
    const rendered = renderSignStacksMessage();

    await rendered.signMessage(unsignedMessage);

    expect(rendered.onSignMessageCancelled).toHaveBeenCalled();
  });

  test('cancels the request when Ledger signing fails', async () => {
    h.sign.mockResolvedValue({ status: 'failed', error: 'No account' });
    const rendered = renderSignStacksMessage();

    await rendered.signMessage(unsignedMessage);

    expect(rendered.onSignMessageCancelled).toHaveBeenCalled();
    expect(rendered.onSignMessageCompleted).not.toHaveBeenCalled();
  });

  test('keeps the request open for a retry when Ledger signing is dismissed', async () => {
    h.sign.mockResolvedValue({ status: 'dismissed' });
    const rendered = renderSignStacksMessage();

    await rendered.signMessage(unsignedMessage);

    expect(rendered.onSignMessageCancelled).not.toHaveBeenCalled();
    expect(rendered.onSignMessageCompleted).not.toHaveBeenCalled();
  });
});
