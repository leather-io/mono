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

interface RpcRequester {
  request(method: string, params: unknown): Promise<unknown>;
}

interface LeatherProviderRequest {
  method: string;
  params: unknown;
}

export async function requestLeatherProvider({ method, params }: LeatherProviderRequest) {
  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
  function isRpcRequester(value: unknown): value is RpcRequester {
    return isRecord(value) && typeof value.request === 'function';
  }
  const provider = 'LeatherProvider' in window ? window.LeatherProvider : undefined;
  if (!isRpcRequester(provider)) throw new Error('LeatherProvider is not available');
  const response = await provider.request(method, params).catch((e: unknown) => e);
  if (!isRecord(response)) throw new Error('Expected an RPC response object');
  return response;
}
