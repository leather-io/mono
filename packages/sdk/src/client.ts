import { Prettify } from '@leather.io/models';
import {
  ExtractSuccessResponse,
  LeatherProvider,
  RpcEndpointMap,
  endpoints,
} from '@leather.io/rpc';

export function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

type Entries<T, K extends keyof T = keyof T> = (K extends unknown ? [K, T[K]] : never)[];
const endpointEntries = Object.entries(endpoints) as Entries<typeof endpoints>;

type Endpoints = typeof endpoints;

// Keyed by friendly function name, not exact RPC method string
// stxSignMessage not stx_signMessage
export type ClientEndpointMap = Prettify<{
  [E in keyof Endpoints]: {
    request: RpcEndpointMap[Endpoints[E]['method']]['request'];
    response: RpcEndpointMap[Endpoints[E]['method']]['response'];
    result: ExtractSuccessResponse<RpcEndpointMap[Endpoints[E]['method']]['response']>['result'];
  };
}>;

type ExtractResult<Method extends keyof ClientEndpointMap> = ClientEndpointMap[Method]['result'];

type LeatherSdk = {
  [Method in keyof ClientEndpointMap]: ClientEndpointMap[Method]['request'] extends {
    params?: infer P;
  }
    ? object extends P
      ? (params?: P) => Promise<ExtractResult<Method>>
      : (params: P) => Promise<ExtractResult<Method>>
    : () => Promise<ExtractResult<Method>>;
};

interface LeatherClientConfig {
  getProvider?(): LeatherProvider | undefined;
  onProviderNotFound?(): void;
}
const defaultOptions = {
  getProvider() {
    return (globalThis as any).LeatherProvider as LeatherProvider;
  },
  onProviderNotFound() {
    // eslint-disable-next-line no-console
    if (isBrowser()) console.log('Provider not found');
  },
} satisfies LeatherClientConfig;

export function createLeatherClient(clientConfig?: LeatherClientConfig) {
  const { getProvider, onProviderNotFound } = { ...defaultOptions, ...clientConfig };

  if (isBrowser() && !getProvider()) {
    onProviderNotFound();
  }

  const actionMap = endpointEntries.reduce(
    (client, [fnName, endpoint]) => ({
      ...client,
      async [fnName](params?: object) {
        if ('params' in endpoint && params) return getProvider()?.request(endpoint.method, params);
        return getProvider()
          ?.request(endpoint.method)
          .then(({ result }) => result);
      },
    }),
    {}
  ) as LeatherSdk;

  return actionMap;
}
