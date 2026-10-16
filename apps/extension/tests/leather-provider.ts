interface TestRpcAddress {
  symbol?: string;
  type?: string;
  kind?: string;
  address?: string;
}

interface TestRpcResult {
  [key: string]: unknown;
  addresses?: TestRpcAddress[];
}

export interface TestRpcResponse {
  id?: string;
  jsonrpc?: string;
  result?: TestRpcResult;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface TestLeatherProvider {
  request(method: string, params?: unknown): Promise<TestRpcResponse>;
}

declare global {
  interface Window {
    LeatherProvider?: TestLeatherProvider;
  }
}

export function getResponseAddresses(response: TestRpcResponse | undefined) {
  const addresses = response?.result?.addresses;
  if (!addresses) throw new Error('Expected addresses in RPC response');
  return addresses;
}

interface LeatherProviderRequest {
  method: string;
  params: unknown;
}

export async function requestLeatherProvider({ method, params }: LeatherProviderRequest) {
  const provider = 'LeatherProvider' in window ? window.LeatherProvider : undefined;
  if (typeof provider?.request !== 'function') throw new Error('LeatherProvider is not available');
  const response: unknown = await provider.request(method, params).catch((e: unknown) => e);
  if (typeof response !== 'object' || response === null) {
    throw new Error('Expected an RPC response object');
  }
  return Object.fromEntries<unknown>(Object.entries(response));
}
