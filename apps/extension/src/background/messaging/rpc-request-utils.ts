import type { To } from 'react-router';

import { z } from 'zod';

import {
  RpcErrorCode,
  type RpcMethodNames,
  type RpcRequests,
  createRpcErrorResponse,
} from '@leather.io/rpc';
import { isUndefined } from '@leather.io/utils';

import { InternalMethods } from '@shared/message-types';
import { sendMessage } from '@shared/messages';
import {
  type OriginatingFrame,
  sendMessageToOriginatingFrame,
} from '@shared/messaging/send-message-to-originating-frame';
import {
  getPermissionsByOrigin,
  isConnectedToExistingWallet,
} from '@shared/permissions/permission.helpers';
import { RouteUrls } from '@shared/route-urls';
import {
  RpcErrorMessage,
  getRpcParamErrorsFormatted,
  validateRpcParams,
} from '@shared/rpc/methods/validation.utils';
import { getRootState, sendMissingStateErrorToTab } from '@shared/storage/get-root-state';
import { getHostnameFromUrl } from '@shared/utils/urls';

import type { RootState } from '@app/store';
import { popup } from '@background/popup';

import { trackRpcRequestError } from './rpc-helpers';

function getTabIdFromPort(port: chrome.runtime.Port) {
  return port.sender?.tab?.id ?? 0;
}

function getFrameIdFromPort(port: chrome.runtime.Port) {
  return port.sender?.frameId ?? 0;
}

export function getOriginatingFrameFromPort(port: chrome.runtime.Port): OriginatingFrame {
  return { frameId: getFrameIdFromPort(port), tabId: getTabIdFromPort(port) };
}

export function getOriginFromPort(port: chrome.runtime.Port) {
  if (port.sender?.url) return new URL(port.sender.url).origin;
  return port.sender?.origin;
}

function getHostnameFromPort(port: chrome.runtime.Port) {
  const origin = getOriginFromPort(port);
  if (!origin) throw new Error('No URL found in port sender');
  return getHostnameFromUrl(origin);
}

//
// Playwright does not currently support Chrome extension popup testing:
// https://github.com/microsoft/playwright/issues/5593
async function openRequestInFullPage(path: string | To, urlParams: URLSearchParams) {
  return chrome.tabs.create({
    url: chrome.runtime.getURL(`index.html#${path}?${urlParams.toString()}`),
  });
}

interface ListenForPopupCloseArgs {
  // ID that comes from newly created window
  id?: number;
  // TabID from requesting tab, to which request should be returned
  tabId?: number;
  frameId: number;
  response: any;
}
export function listenForPopupClose({ frameId, id, tabId, response }: ListenForPopupCloseArgs) {
  chrome.windows.onRemoved.addListener(winId => {
    if (winId !== id || !tabId) return;
    const responseMessage = response;
    void sendMessageToOriginatingFrame({ frameId, tabId }, responseMessage);
  });
}

interface SendErrorResponseOnUserPopupCloseArgs {
  tabId?: number;
  frameId: number;
  id: number;
  request: RpcRequests;
  message?: string;
}
export function sendErrorResponseOnUserPopupClose({
  frameId,
  tabId,
  id,
  message,
  request,
}: SendErrorResponseOnUserPopupCloseArgs) {
  listenForPopupClose({
    frameId,
    tabId,
    id,
    response: createRpcErrorResponse(request.method, {
      id: request.id,
      error: {
        code: RpcErrorCode.USER_REJECTION,
        message: message ?? RpcErrorMessage.UserRejectedOperation,
      },
    }),
  });
}

interface ListenForOriginTabCloseArgs {
  tabId?: number;
}
export function listenForOriginTabClose({ tabId }: ListenForOriginTabCloseArgs) {
  chrome.tabs.onRemoved.addListener(closedTabId => {
    if (tabId !== closedTabId) return;
    void sendMessage({ method: InternalMethods.OriginatingTabClosed, payload: { tabId } });
  });
}

export type RequestParams = [string, string][];

export function createConnectingAppMetadataSearchParams(
  port: chrome.runtime.Port,
  otherParams: RequestParams = []
) {
  const urlParams = new URLSearchParams();
  const origin = getOriginFromPort(port);
  const tabId = getTabIdFromPort(port);
  const frameId = getFrameIdFromPort(port);
  urlParams.set('origin', origin ?? '');
  urlParams.set('frameId', frameId.toString());
  urlParams.set('tabId', tabId.toString());
  otherParams.forEach(([key, value]) => urlParams.append(key, value));
  return { urlParams, origin, frameId, tabId };
}

export async function createConnectingAppSearchParamsWithLastKnownAccount(
  port: chrome.runtime.Port,
  otherParams: RequestParams = []
) {
  const { urlParams, origin, frameId, tabId } = createConnectingAppMetadataSearchParams(
    port,
    otherParams
  );
  if (origin) {
    const appPermissions = await getPermissionsByOrigin(getHostnameFromPort(port));
    if (appPermissions) {
      const hasRequestScopedAccount = urlParams.has('accountIndex');
      if (!hasRequestScopedAccount)
        urlParams.set('accountIndex', appPermissions.accountIndex.toString());
      urlParams.set('fingerprint', appPermissions.fingerprint);
      if (!hasRequestScopedAccount && appPermissions.policyId)
        urlParams.set('policyId', appPermissions.policyId);
    }
  }
  return { urlParams, origin, frameId, tabId };
}

const IS_TEST_ENV = process.env.TEST_ENV === 'true';

export async function triggerRequestPopupWindowOpen(path: RouteUrls, urlParams: URLSearchParams) {
  if (IS_TEST_ENV) return openRequestInFullPage(path, urlParams);
  return popup({ url: `/popup.html#${path}?${urlParams.toString()}` });
}

export async function triggerSwapWindowOpen(path: To, urlParams: URLSearchParams) {
  if (IS_TEST_ENV) return openRequestInFullPage(path, urlParams);
  return popup({ url: `/popup.html#${path}?${urlParams.toString()}` });
}

type ValidationResult = 'success' | 'failure';

interface ValidateRequestParamsArgs {
  id: string;
  method: RpcMethodNames;
  params: unknown;
  port: chrome.runtime.Port;
  schema: z.Schema;
}
export function validateRequestParams({
  id,
  method,
  params,
  port,
  schema,
}: ValidateRequestParamsArgs): { status: ValidationResult } {
  if (isUndefined(params)) {
    void trackRpcRequestError({ endpoint: method, error: RpcErrorMessage.UndefinedParams });
    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse(method, {
        id,
        error: { code: RpcErrorCode.INVALID_REQUEST, message: RpcErrorMessage.UndefinedParams },
      })
    );
    return { status: 'failure' };
  }

  if (!validateRpcParams(params, schema)) {
    void trackRpcRequestError({ endpoint: method, error: RpcErrorMessage.InvalidParams });

    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse(method, {
        id,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: getRpcParamErrorsFormatted(params, schema),
        },
      })
    );
    return { status: 'failure' };
  }
  return { status: 'success' };
}

const walletNoLongerAvailableMessage =
  'Wallet no longer available. Reconnect the app to an available wallet.';

type MaybePreMultiWalletRootState = Omit<RootState, 'wallets'> & {
  wallets?: RootState['wallets'];
};

type ConnectedWalletFailureReason = 'missing-state' | 'wallet-unavailable';

type ConnectedWalletCheckResult =
  | { status: 'success'; frameId: number; tabId: number }
  | { status: 'failure'; reason: ConnectedWalletFailureReason; frameId: number; tabId: number };

async function checkConnectedWalletExists(
  port: chrome.runtime.Port
): Promise<ConnectedWalletCheckResult> {
  const tabId = getTabIdFromPort(port);
  const frameId = getFrameIdFromPort(port);
  const state = (await getRootState()) as MaybePreMultiWalletRootState | null;
  if (!state) return { status: 'failure', reason: 'missing-state', frameId, tabId };

  const walletEntities = state.wallets?.entities;
  if (!walletEntities) return { status: 'failure', reason: 'missing-state', frameId, tabId };

  const hostname = getHostnameFromPort(port);
  const originPermissions = state.appPermissions.entities[hostname];

  if (!isConnectedToExistingWallet(originPermissions, walletEntities))
    return { status: 'failure', reason: 'wallet-unavailable', frameId, tabId };

  return { status: 'success', frameId, tabId };
}

export async function validateConnectedWalletExists(
  request: RpcRequests,
  port: chrome.runtime.Port,
  errorMessage = walletNoLongerAvailableMessage
): Promise<{ status: ValidationResult }> {
  const result = await checkConnectedWalletExists(port);

  if (result.status === 'failure' && result.reason === 'missing-state') {
    void sendMissingStateErrorToTab({
      frameId: result.frameId,
      tabId: result.tabId,
      method: request.method,
      id: request.id,
    });
    return { status: 'failure' };
  }

  if (result.status === 'failure') {
    void sendMessageToOriginatingFrame(
      result,
      createRpcErrorResponse(request.method, {
        id: request.id,
        error: { code: RpcErrorCode.UNAUTHENTICATED, message: errorMessage },
      })
    );
    return { status: 'failure' };
  }

  return { status: 'success' };
}
