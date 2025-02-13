import { Prettify } from '@leather.io/models';
import {
  ExtractSuccessResponse,
  LeatherProvider,
  RpcEndpointMap,
  endpoints,
} from '@leather.io/rpc';

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
  getProvider(): LeatherProvider | undefined;
}

const defaultOptions: LeatherClientConfig = {
  getProvider() {
    return (globalThis as any).LeatherProvider;
  },
};

export function createLeatherClient(clientConfig?: LeatherClientConfig) {
  const { getProvider } = { ...defaultOptions, ...clientConfig };

  if (!getProvider()) throw new Error('LeatherProvider not found on global object');

  const actionMap = endpointEntries.reduce(
    (client, [fnName, endpoint]) => ({
      ...client,
      async [fnName](params?: object) {
        if ('params' in endpoint && params) return getProvider()?.request(endpoint.method, params);
        return getProvider()?.request(endpoint.method);
      },
    }),
    {}
  ) as LeatherSdk;

  return actionMap;
}
