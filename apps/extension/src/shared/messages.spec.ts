import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { noop } from '@leather.io/utils';

import { WALLET_LOCK_MESSAGE } from './message-types';
import { addWalletLockListener, broadcastWalletLock } from './messages';

interface RuntimeMessage {
  method?: string;
}
type RuntimeListener = (message: RuntimeMessage, sender: unknown, sendResponse: () => void) => void;

describe('wallet lock cross-frame propagation', () => {
  let openFrameListeners: RuntimeListener[];
  let sentMessages: RuntimeMessage[];

  beforeEach(() => {
    openFrameListeners = [];
    sentMessages = [];
    vi.stubGlobal('chrome', {
      runtime: {
        onMessage: {
          addListener(listener: RuntimeListener) {
            openFrameListeners.push(listener);
          },
        },
        sendMessage(message: RuntimeMessage) {
          sentMessages.push(message);
          openFrameListeners.forEach(listener => listener(message, {}, noop));
          return Promise.resolve();
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('a lock in one frame propagates to every other open frame', () => {
    const closePopup = vi.fn();
    const closeFullPageTab = vi.fn();
    addWalletLockListener(closePopup);
    addWalletLockListener(closeFullPageTab);

    void broadcastWalletLock();

    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(closeFullPageTab).toHaveBeenCalledTimes(1);
  });

  test('broadcasts the exact message other frames listen for', () => {
    void broadcastWalletLock();

    expect(sentMessages).toEqual([{ method: WALLET_LOCK_MESSAGE }]);
  });

  test('ignores unrelated cross-frame messages', () => {
    const handler = vi.fn();
    addWalletLockListener(handler);

    void chrome.runtime.sendMessage({ method: 'wallet/some-other-action' });

    expect(handler).not.toHaveBeenCalled();
  });
});
