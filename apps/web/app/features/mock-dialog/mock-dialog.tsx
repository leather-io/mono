import { useMemo, useState } from 'react';

import { WhenClient } from '~/components/when-client';
import {
  type MockRpcRequest,
  dispatchMockResponseEvent,
  useMockLeatherRequestsEventListener,
} from '~/mocks/extension/event-bus';
import { createMockGetAddressesResponse } from '~/mocks/extension/get-addresses/get-addresses.mock';

import { type RpcResponses, createRpcErrorResponse } from '@leather.io/rpc';

import { MockLeatherDialogLayout } from './mock-dialog.layout';

const mockBroadcastTxId = `0x${'11'.repeat(32)}`;

export function MockLeatherDialog() {
  const [payload, setPayload] = useState<null | MockRpcRequest>(null);

  useMockLeatherRequestsEventListener(payload => setPayload(payload));

  const response = useMemo((): RpcResponses | null => {
    if (!payload) return null;
    switch (payload.method) {
      case 'getAddresses':
      case 'stx_getAddresses':
        return createMockGetAddressesResponse(payload.id);
      case 'stx_callContract':
        return {
          jsonrpc: '2.0',
          id: payload.id,
          result: { txid: mockBroadcastTxId, transaction: '' },
        };
      default:
        return { jsonrpc: '2.0', id: payload.id, result: {} };
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
