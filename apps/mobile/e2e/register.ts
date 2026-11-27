import { type ComponentType } from 'react';

import { Buffer } from 'buffer';

export const e2eOverlay: { Component: ComponentType | null } = { Component: null };

function noop() {
  return undefined;
}

function installShims() {
  class EventShim extends Event {}

  class MessageEventShim extends Event {
    data: unknown;
    constructor(type: string, init?: { data?: unknown }) {
      super(type);
      this.data = init?.data;
    }
  }

  class BroadcastChannelShim {
    addEventListener = noop;
    removeEventListener = noop;
    postMessage = noop;
    close = noop;
  }

  const shims: Record<string, unknown> = {
    Buffer,
    MessageEvent: MessageEventShim,
    CloseEvent: EventShim,
    BroadcastChannel: BroadcastChannelShim,
    XMLHttpRequestUpload: EventShim,
  };
  for (const [name, shim] of Object.entries(shims)) {
    if (!Reflect.has(globalThis, name)) Reflect.set(globalThis, name, shim);
  }
  const readHeaders = XMLHttpRequest.prototype.getAllResponseHeaders;
  XMLHttpRequest.prototype.getAllResponseHeaders = function getAllResponseHeaders() {
    return readHeaders.call(this) ?? '';
  };
  const abortRequest = XMLHttpRequest.prototype.abort;
  XMLHttpRequest.prototype.abort = function abort() {
    try {
      abortRequest.call(this);
    } catch {
      return;
    }
  };
  if (!Reflect.has(Response.prototype, 'body')) {
    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get(this: Response) {
        const text = this.clone().text();
        const isStream = this.headers.get('Content-Type')?.includes('text/event-stream') ?? false;
        let done = false;
        return {
          getReader() {
            return {
              async read() {
                if (done && isStream) return new Promise(noop);
                if (done) return { done: true, value: undefined };
                done = true;
                return { done: false, value: new TextEncoder().encode(await text) };
              },
            };
          },
        };
      },
    });
  }
}

if (__DEV__ && process.env.EXPO_PUBLIC_E2E_MOCKS === 'true') {
  installShims();
  require('./server');
}
