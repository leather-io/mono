// Minimal typings + helper for talking to the injected Leather provider.
//
// The provider resolves with `{ jsonrpc, id, result }` on success and rejects
// with `{ jsonrpc, id, error: { code, message, data? } }` on failure (user
// rejection, invalid params, …).
import { isRecord, readString } from './guards';

interface LeatherRpcSuccessResponse<TResult = unknown> {
  jsonrpc: '2.0';
  id: string;
  result: TResult;
}

interface InjectedProvider {
  request(method: string, params?: unknown): Promise<unknown>;
}

export function getLeatherProvider(): InjectedProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  const provider: unknown = Reflect.get(window, 'LeatherProvider');
  if (!isRecord(provider)) return undefined;
  const { request } = provider;
  if (typeof request !== 'function') return undefined;
  return {
    async request(method, params) {
      const args = params === undefined ? [method] : [method, params];
      const response: unknown = await Reflect.apply(request, provider, args);
      return response;
    },
  };
}

function toSuccessResponse(response: unknown): LeatherRpcSuccessResponse {
  if (!isRecord(response) || !('result' in response))
    throw new Error('Leather returned a response without a result.');
  return { jsonrpc: '2.0', id: readString(response, 'id') ?? '', result: response.result };
}

export async function callRpc(
  method: string,
  params?: unknown
): Promise<LeatherRpcSuccessResponse> {
  const provider = getLeatherProvider();
  if (!provider) {
    throw new Error(
      'Leather wallet not detected. Install/enable the Leather extension, then reload this page.'
    );
  }
  // No-param methods are called without the second argument so the provider
  // does not wrap them with an empty params object where one is not expected.
  const response =
    params === undefined ? await provider.request(method) : await provider.request(method, params);
  return toSuccessResponse(response);
}
