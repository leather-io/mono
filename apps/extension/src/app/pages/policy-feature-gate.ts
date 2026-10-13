import { RpcErrorCode, type RpcMethodNames, createRpcErrorResponse } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { closeWindow } from '@shared/utils';

import { useFlags } from '@app/features/feature-flags';

interface PolicyFeatureGateArgs {
  method: RpcMethodNames;
  id: string;
  frameId: number;
  tabId?: number;
}

// Gates the policy RPC methods (btc_addAccount / stx_addAccount) behind
// the `releaseAddAccount` flag. The flag is only readable in the React layer
// (LaunchDarkly client SDK), so when it is off the approval page rejects the
// request as unsupported and closes instead of showing the approval UI.
export function usePolicyFeatureGate({ frameId, method, id, tabId }: PolicyFeatureGateArgs) {
  const { releaseAddAccount } = useFlags();

  return {
    isFeatureEnabled: releaseAddAccount,
    rejectAsUnsupported() {
      if (tabId)
        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcErrorResponse(method, {
            id,
            error: {
              code: RpcErrorCode.METHOD_NOT_SUPPORTED,
              message: `"${method}" is not currently available`,
            },
          })
        );
      closeWindow();
    },
  };
}
