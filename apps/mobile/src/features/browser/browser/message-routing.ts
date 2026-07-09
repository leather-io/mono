import {
  RpcRequest,
  RpcRequests,
  getInfo,
  parseEndpointRequest,
  supportedMethods,
} from '@leather.io/rpc';

export function getVerifiedMessageOrigin(
  frameUrl: string,
  topFrameOrigin: string | null
): string | null {
  if (!topFrameOrigin) return null;
  try {
    const url = new URL(frameUrl);
    const isWebProtocol = url.protocol === 'http:' || url.protocol === 'https:';
    if (!isWebProtocol) return null;
    if (url.origin !== topFrameOrigin) return null;
    return url.origin;
  } catch {
    return null;
  }
}

type BrowserRpcAction =
  | { type: 'drop' }
  | { type: 'get-info'; request: RpcRequest<typeof getInfo> }
  | { type: 'supported-methods'; request: RpcRequest<typeof supportedMethods> }
  | { type: 'present'; request: RpcRequests; origin: string };

interface ResolveBrowserRpcRequestArgs {
  data: string;
  frameUrl: string;
  topFrameOrigin: string | null;
}

export function resolveBrowserRpcRequest({
  data,
  frameUrl,
  topFrameOrigin,
}: ResolveBrowserRpcRequestArgs): BrowserRpcAction {
  const messageOrigin = getVerifiedMessageOrigin(frameUrl, topFrameOrigin);
  if (!messageOrigin) return { type: 'drop' };

  let newMessage: unknown;
  try {
    newMessage = JSON.parse(data);
  } catch {
    return { type: 'drop' };
  }

  const parsedMessage = parseEndpointRequest(newMessage);
  if (!parsedMessage) return { type: 'drop' };

  const getInfoMessage = getInfo.request.safeParse(parsedMessage);
  if (getInfoMessage.success) return { type: 'get-info', request: getInfoMessage.data };

  const supportedMethodsMessage = supportedMethods.request.safeParse(parsedMessage);
  if (supportedMethodsMessage.success) {
    return { type: 'supported-methods', request: supportedMethodsMessage.data };
  }

  return { type: 'present', request: parsedMessage, origin: messageOrigin };
}
