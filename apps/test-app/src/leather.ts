// Minimal typings + helper for talking to the injected Leather provider.
//
// The provider resolves with `{ jsonrpc, id, result }` on success and rejects
// with `{ jsonrpc, id, error: { code, message, data? } }` on failure (user
// rejection, invalid params, …).

interface LeatherRpcSuccessResponse<TResult = unknown> {
  jsonrpc: '2.0';
  id: string;
  result: TResult;
}

interface InjectedProvider {
  request(method: string, params?: unknown): Promise<LeatherRpcSuccessResponse>;
}

declare global {
  interface Window {
    LeatherProvider?: InjectedProvider;
  }
}

export function getLeatherProvider(): InjectedProvider | undefined {
  return typeof window === 'undefined' ? undefined : window.LeatherProvider;
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
  return params === undefined ? provider.request(method) : provider.request(method, params);
}
