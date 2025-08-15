import { useMemo, useState } from 'react';

import { WhenClient } from '~/components/when-client';
import {
  dispatchMockResponseEvent,
  useMockLeatherRequestsEventListener,
} from '~/mocks/extension/event-bus';
import { createMockGetAddressesResponse } from '~/mocks/extension/get-addresses/get-addresses.mock';

import { RpcRequests, createRpcErrorResponse } from '@leather.io/rpc';

import { MockLeatherDialogLayout } from './mock-dialog.layout';

export function MockLeatherDialog() {
  const [payload, setPayload] = useState<null | RpcRequests>(null);

  useMockLeatherRequestsEventListener(payload => setPayload(payload));

  const response = useMemo(() => {
    if (!payload) return null;
    switch (payload.method) {
      case 'getAddresses':
      case 'stx_getAddresses':
        return createMockGetAddressesResponse(payload.id);
      default:
        return { jsonrpc: '2.0', id: payload.id, result: {} } as any;
    }
  }, [payload]);

  if (!payload) return null;

  return (
    <WhenClient>
      <MockLeatherDialogLayout
        payload={payload}
        response={response}
        onClose={() => setPayload(null)}
        onResolve={() => {
          if (!response) return;
          dispatchMockResponseEvent(response);
        }}
        onReject={() => {
          dispatchMockResponseEvent(
            createRpcErrorResponse(payload.method, {
              error: { message: 'Mock error', code: -32603 },
              id: payload.id,
            })
          );
          setPayload(null);
        }}
      />
    </WhenClient>
  );
}
