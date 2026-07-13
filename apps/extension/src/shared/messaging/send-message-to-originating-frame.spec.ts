import { afterEach, describe, expect, test, vi } from 'vitest';

import { sendMessageToOriginatingFrame } from './send-message-to-originating-frame';

describe(sendMessageToOriginatingFrame.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('delivers a response only to the originating frame', () => {
    const sendMessage = vi.fn();
    vi.stubGlobal('chrome', { tabs: { sendMessage } });
    const message = { id: 'request-id', jsonrpc: '2.0', result: { success: true } };

    void sendMessageToOriginatingFrame({ frameId: 42, tabId: 7 }, message);

    expect(sendMessage).toHaveBeenCalledWith(7, message, { frameId: 42 });
  });
});
