import { useEffect } from 'react';

import { type RpcMethodNames, type RpcResponses } from '@leather.io/rpc';

export interface MockRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: RpcMethodNames;
  params?: unknown;
}

const mockRequestEventName = 'mockRequest';
const mockResponseEventName = 'mockResponse';

class MockRequestEvent extends Event {
  constructor(readonly detail: MockRpcRequest) {
    super(mockRequestEventName);
  }
}

class MockResponseEvent extends Event {
  constructor(readonly detail: RpcResponses) {
    super(mockResponseEventName);
  }
}

const requestEventBus = new EventTarget();
export function dispatchMockRequestEvent(requestPayload: MockRpcRequest): void {
  requestEventBus.dispatchEvent(new MockRequestEvent(requestPayload));
}

const responseEventBus = new EventTarget();
export function dispatchMockResponseEvent(responsePayload: RpcResponses): void {
  responseEventBus.dispatchEvent(new MockResponseEvent(responsePayload));
}

type EventHandler<T extends MockRpcRequest | RpcResponses> = (detail: T) => void;

export function useMockLeatherRequestsEventListener(handler: EventHandler<MockRpcRequest>) {
  useEffect(() => {
    function wrappedHandler(e: Event) {
      if (!(e instanceof MockRequestEvent)) return;
      handler(e.detail);
    }
    requestEventBus.addEventListener(mockRequestEventName, wrappedHandler);
    return () => requestEventBus.removeEventListener(mockRequestEventName, wrappedHandler);
  }, [handler]);
}

export async function waitForMockResponseEventWithId(id: string): Promise<RpcResponses> {
  return new Promise(resolve => {
    function handler(e: Event) {
      if (!(e instanceof MockResponseEvent)) return;
      if (e.detail && e.detail.id === id) {
        responseEventBus.removeEventListener(mockResponseEventName, handler);
        resolve(e.detail);
      }
    }
    responseEventBus.addEventListener(mockResponseEventName, handler);
  });
}
