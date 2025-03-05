import type { StacksProvider } from '@stacks/connect';

import {
  type LeatherRpcMethodMap,
  type RpcMethodNames,
  type RpcParameter,
  RpcRequests,
  type RpcResponses,
} from '@leather.io/rpc';

import { addLeatherToProviders } from './add-leather-to-providers';
import './crypto-random-uuid-polyfill';
import { getLegacyRequests } from './legacy-requests';
import { Platform } from './types';

interface initInpageProviderArgs {
  onDispatch(rpcRequest: RpcRequests): void;
  env: { branch: string; commitSha: string; version: string; platform: Platform };
}

export function initInpageProvider({ onDispatch, env }: initInpageProviderArgs) {
  addLeatherToProviders();

  interface LeatherProviderOverrides extends StacksProvider {
    isLeather: true;
  }

  const provider: LeatherProviderOverrides = {
    isLeather: true,

    ...getLegacyRequests(env.platform),

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
      const rpcRequest: RpcRequests = {
        jsonrpc: '2.0',
        id,
        method,
        params: (params ?? {}) as any,
      };

      onDispatch(rpcRequest);

      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<RpcResponses>) {
          const response =
            typeof event.data === 'object' ? event.data : JSON.parse(event.data as any);
          if (response.id !== id) return;
          window.removeEventListener('message', handleMessage);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if ('error' in response) return reject(response);
          return resolve(response);
        }
        window.addEventListener('message', handleMessage);
      });
    },
  };

  function consoleDeprecationNotice(text: string) {
    // eslint-disable-next-line no-console
    console.warn(`Deprecation warning: ${text}`);
  }

  function warnAboutDeprecatedProvider(legacyProvider: object) {
    return Object.fromEntries(
      Object.entries(legacyProvider).map(([key, value]) => {
        if (typeof value === 'function') {
          return [
            key,
            (...args: any[]) => {
              switch (key) {
                case 'authenticationRequest':
                  consoleDeprecationNotice(
                    `Use LeatherProvider.request('getAddresses') instead, see docs https://leather.gitbook.io/developers/bitcoin/connect-users/get-addresses`
                  );
                  break;
                case 'psbtRequest':
                  consoleDeprecationNotice(
                    `Use LeatherProvider.request('signPsbt') instead, see docs https://leather.gitbook.io/developers/bitcoin/sign-transactions/partially-signed-bitcoin-transactions-psbts`
                  );
                  break;
                case 'structuredDataSignatureRequest':
                case 'signatureRequest':
                  consoleDeprecationNotice(
                    `Use LeatherProvider.request('stx_signMessage') instead`
                  );
                  break;
                default:
                  consoleDeprecationNotice(
                    'The provider object is deprecated. Use `LeatherProvider` instead'
                  );
              }

              return value(...args);
            },
          ];
        }
        return [key, value];
      })
    );
  }

  try {
    // Makes properties immutable to contend with other wallets that use agressive
    // "prioritisation" default settings. As other wallet's use this approach,
    // Leather has to use it too, so that the browsers' own internal logic being
    // used to determine content script exeuction order. A more fair way to
    // contend over shared provider space. `StacksProvider` should be considered
    // deprecated and each wallet use their own provider namespace.
    Object.defineProperty(window, 'StacksProvider', {
      get: () => warnAboutDeprecatedProvider(provider),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set: () => {},
    });
  } catch {
    // eslint-disable-next-line no-console
    console.log('Unable to set StacksProvider');
  }

  try {
    Object.defineProperty(window, 'HiroWalletProvider', {
      get: () => warnAboutDeprecatedProvider(provider),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set: () => {},
    });
  } catch {
    // eslint-disable-next-line no-console
    console.log('Unable to set HiroWalletProvider');
  }

  try {
    Object.defineProperty(window, 'LeatherProvider', {
      get: () => provider,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set: () => {},
    });
  } catch {
    // eslint-disable-next-line no-console
    console.warn('Unable to set LeatherProvider');
  }

  // Legacy product provider objects
  if (typeof (window as any).btc === 'undefined') {
    (window as any).btc = warnAboutDeprecatedProvider(provider);
  }
}
