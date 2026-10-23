import type {
  LeatherRpcMethodMap,
  RpcMethodNames,
  RpcParameter,
  RpcResponses,
} from '@leather.io/rpc';

import { addLeatherToProviders } from './add-leather-to-providers';

import './crypto-random-uuid-polyfill';

import { deprecatedProviderMethods } from './deprecated-provider-methods';

interface InpageRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: RpcMethodNames;
  params: NonNullable<RpcParameter>;
}

interface initInpageProviderArgs {
  onDispatch(rpcRequest: InpageRpcRequest): void;
  env: { branch: string; commitSha: string; version: string };
}

interface WindowWithBtc extends Window {
  btc?: unknown;
}

function hasResponseId(value: unknown) {
  return typeof value === 'object' && value !== null && 'id' in value;
}

function assertIsRpcResponse(value: unknown): asserts value is RpcResponses {
  if (!hasResponseId(value)) throw new TypeError('Message is not an RPC response');
}

export function initInpageProvider({ onDispatch, env }: initInpageProviderArgs) {
  addLeatherToProviders();

  const provider = {
    isLeather: true,

    ...deprecatedProviderMethods(),

    getProductInfo() {
      return {
        version: env.version,
        name: 'Leather',
        meta: {
          tag: env.branch,
          commit: env.commitSha,
        },
      };
    },

    request(
      method: RpcMethodNames,
      params?: RpcParameter
    ): Promise<LeatherRpcMethodMap[RpcMethodNames]['response']> {
      const id: string = crypto.randomUUID();
      const rpcRequest: InpageRpcRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params: params ?? {},
      };

      onDispatch(rpcRequest);

      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<unknown>) {
          const response: unknown =
            typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (!hasResponseId(response) || response.id !== id) return;
          assertIsRpcResponse(response);
          window.removeEventListener('message', handleMessage);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if ('error' in response) return reject(response);
          return resolve(response);
        }
        window.addEventListener('message', handleMessage);
      });
    },
  };

  try {
    // Makes properties immutable to contend with other wallets that use agressive
    // "prioritisation" default settings. As other wallet's use this approach,
    // Leather has to use it too, so that the browsers' own internal logic being
    // used to determine content script exeuction order. A more fair way to
    // contend over shared provider space. `StacksProvider` should be considered
    // deprecated and each wallet use their own provider namespace.
    Object.defineProperty(window, 'StacksProvider', {
      get: () => provider,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
    });
  } catch {
    // eslint-disable-next-line no-console
    console.log('Unable to set StacksProvider');
  }

  try {
    Object.defineProperty(window, 'HiroWalletProvider', {
      get: () => provider,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
    });
  } catch {
    // eslint-disable-next-line no-console
    console.log('Unable to set HiroWalletProvider');
  }

  try {
    Object.defineProperty(window, 'LeatherProvider', {
      get: () => provider,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
    });
  } catch {
    // eslint-disable-next-line no-console
    console.warn('Unable to set LeatherProvider');
  }

  // Legacy product provider objects
  const win: WindowWithBtc = window;
  if (typeof win.btc === 'undefined') {
    win.btc = provider;
  }
}
