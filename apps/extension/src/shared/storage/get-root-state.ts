import { RpcErrorCode, type RpcMethodNames, createRpcErrorResponse } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';

import type { RootState } from '@app/store';

export async function getRootState() {
  const storage = await chrome.storage.local.get(['persist:root']);
  if (!storage || !storage['persist:root']) return null;
  return storage['persist:root'] as RootState;
}

interface SendMissingStateErrorToTabArgs {
  frameId: number;
  tabId: number;
  method: RpcMethodNames;
  id: string;
}
export function sendMissingStateErrorToTab({
  frameId,
  tabId,
  method,
  id,
}: SendMissingStateErrorToTabArgs) {
  return sendMessageToOriginatingFrame(
    { frameId, tabId },
    createRpcErrorResponse(method, {
      id,
      error: {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: 'Internal error, wallet not initialized',
      },
    })
  );
}
