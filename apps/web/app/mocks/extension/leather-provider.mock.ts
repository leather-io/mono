import { RpcMethodNames } from '@leather.io/rpc';

import { dispatchMockRequestEvent, waitForMockResponseEventWithId } from './event-bus';

export const mockLeatherProvider = {
  getProvider() {
    return {
      async request(method: RpcMethodNames, params: any) {
        const uuid = crypto.randomUUID();
        dispatchMockRequestEvent({ jsonrpc: '2.0', method, params, id: uuid });
        const resp = await waitForMockResponseEventWithId(uuid);

        if ('error' in resp) {
          throw new Error(`Mock Leather error: ${resp.error.message}`);
        }

        return resp;
      },
    };
  },
};
