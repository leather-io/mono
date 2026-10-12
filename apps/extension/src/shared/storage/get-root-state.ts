import { RpcErrorCode, type RpcMethodNames, createRpcErrorResponse } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { isRecord } from '@shared/utils/is-record';

import type { RootState } from '@app/store';

function isPersistedRootState(value: unknown): value is RootState {
  return isRecord(value);
}

export async function getRootState() {
  const storage = await chrome.storage.local.get<Record<string, unknown>>(['persist:root']);
  if (!storage || !storage['persist:root']) return null;
  const persistedRoot = storage['persist:root'];
  return isPersistedRootState(persistedRoot) ? persistedRoot : null;
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
