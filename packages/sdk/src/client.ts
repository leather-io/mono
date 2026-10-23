import { entries, keys } from 'remeda';

import { type Prettify } from '@leather.io/models';
import {
  type ExtractSuccessResponse,
  type LeatherProvider,
  type RpcEndpointMap,
  endpoints,
} from '@leather.io/rpc';

export function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

const endpointEntries = entries(endpoints);

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

export type LeatherSdk = {
  [Method in keyof ClientEndpointMap]: ClientEndpointMap[Method]['request'] extends {
    params?: infer P;
  }
    ? object extends P
      ? (params?: P) => Promise<ExtractResult<Method>>
      : (params: P) => Promise<ExtractResult<Method>>
    : () => Promise<ExtractResult<Method>>;
};

function assertLeatherSdk(value: object): asserts value is LeatherSdk {
  if (!keys(endpoints).every(fnName => fnName in value))
    throw new Error('Leather client is missing endpoint methods');
}

const leatherGlobal: typeof globalThis & { LeatherProvider?: LeatherProvider } = globalThis;

interface LeatherClientConfig {
  getProvider?(): LeatherProvider | undefined;
  onProviderNotFound?(): void;
}
const defaultOptions = {
  getProvider() {
    return leatherGlobal.LeatherProvider;
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
        const provider = getProvider();
        if (!provider) return;
        if ('params' in endpoint && params) {
          const { result } = await provider.request(endpoint.method, params);
          return result;
        }
        const { result } = await provider.request(endpoint.method);
        return result;
      },
    }),
    {}
  );

  assertLeatherSdk(actionMap);

  return actionMap;
}
