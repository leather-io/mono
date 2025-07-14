import { useEffect } from 'react';

import { RpcRequests, RpcResponses } from '@leather.io/rpc';

const mockRequestEventName = 'mockRequest';
const mockResponseEventName = 'mockResponse';
export type MockResponseEventName = typeof mockResponseEventName;

export const requestEventBus = new EventTarget();
export function dispatchMockRequestEvent(requestPayload: RpcRequests): void {
  requestEventBus.dispatchEvent(new CustomEvent(mockRequestEventName, { detail: requestPayload }));
}

export const responseEventBus = new EventTarget();
export function dispatchMockResponseEvent(responsePayload: RpcResponses): void {
  responseEventBus.dispatchEvent(
    new CustomEvent(mockResponseEventName, { detail: responsePayload })
  );
}

type EventHandler<T extends RpcRequests | RpcResponses> = (detail: T) => void;

export function useMockLeatherRequestsEventListener(handler: EventHandler<RpcRequests>) {
  useEffect(() => {
    function wrappedHandler(e: Event) {
      const customEvent = e as CustomEvent<RpcRequests>;
      handler(customEvent.detail);
    }
    requestEventBus.addEventListener(mockRequestEventName, wrappedHandler);
    return () => requestEventBus.removeEventListener(mockRequestEventName, wrappedHandler);
  }, [handler]);
}

export async function waitForMockResponseEventWithId(id: string): Promise<RpcResponses> {
  return new Promise(resolve => {
    function handler(e: Event) {
      const customEvent = e as CustomEvent<RpcResponses>;
      if (customEvent.detail && customEvent.detail.id === id) {
        responseEventBus.removeEventListener(mockResponseEventName, handler);
        resolve(customEvent.detail);
      }
    }
    responseEventBus.addEventListener(mockResponseEventName, handler);
  });
}
