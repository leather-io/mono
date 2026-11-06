import type { BrowserContext, Page } from '@playwright/test';
import { requestLeatherProvider } from '@tests/leather-provider';
import { ConnectAccountSelectors } from '@tests/selectors/requests.selectors';

import { type RequestContext, findSpec, resolveParams } from '@leather.io/test-app/catalog';
import type { VerifyRpc, VerifyRpcSource } from '@leather.io/tools/verify-contract';

import { RouteUrls } from '@shared/route-urls';

export const testAppUrl = 'localhost:3000';
export const rpcResponsePending = 'pending';

export interface ResolvedRpcRequest {
  readonly method: string;
  readonly params: unknown;
  readonly source: VerifyRpcSource;
  readonly catalogId?: string;
}

export interface DispatchedRpc {
  readonly popup: Page | undefined;
  readonly response: Promise<unknown>;
}

interface PopupOutcome {
  readonly kind: 'popup';
  readonly popup: Page | undefined;
}

interface ResponseOutcome {
  readonly kind: 'response';
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function approveGetAddressesPopup(popup: Page) {
  await popup.waitForLoadState();
  if (!popup.url().includes(RouteUrls.RpcGetAddresses)) return;
  await popup.getByTestId(ConnectAccountSelectors.ApproveBtn).click();
}

function createRequestContext(page: Page, network: string): RequestContext {
  return {
    network,
    async request(method, params) {
      const response = await page.evaluate(requestLeatherProvider, { method, params });
      return response.result;
    },
  };
}

export async function resolveRpcRequest(
  rpc: VerifyRpc,
  page: Page,
  context: BrowserContext,
  network: string
): Promise<ResolvedRpcRequest> {
  if (rpc.catalogId === undefined) {
    return {
      method: rpc.method,
      params: rpc.params,
      source: rpc.params === undefined ? 'none' : 'params',
    };
  }
  const spec = findSpec(rpc.catalogId);
  if (spec === undefined) {
    throw new Error(
      `verify: catalog id '${rpc.catalogId}' is not exported by @leather.io/test-app/catalog.`
    );
  }
  function onPopup(popup: Page) {
    void approveGetAddressesPopup(popup);
  }
  context.on('page', onPopup);
  try {
    const params = await resolveParams(spec, createRequestContext(page, network));
    return { method: spec.method, params, source: 'catalog', catalogId: spec.id };
  } finally {
    context.off('page', onPopup);
  }
}

async function awaitPopup(popupPromise: Promise<Page | undefined>): Promise<PopupOutcome> {
  return { kind: 'popup', popup: await popupPromise };
}

async function awaitResponse(responsePromise: Promise<unknown>): Promise<ResponseOutcome> {
  await responsePromise;
  return { kind: 'response' };
}

const latePopupTimeoutMs = 10_000;

export async function dispatchRpcRequest(
  page: Page,
  context: BrowserContext,
  request: ResolvedRpcRequest
): Promise<DispatchedRpc> {
  const popupPromise = context
    .waitForEvent('page', { timeout: latePopupTimeoutMs })
    .catch(() => undefined);
  const response = page
    .evaluate(requestLeatherProvider, { method: request.method, params: request.params })
    .catch((error: unknown) => ({ evaluateError: errorMessage(error) }));
  const first = await Promise.race([awaitPopup(popupPromise), awaitResponse(response)]);
  if (first.kind === 'popup') return { popup: first.popup, response };
  return { popup: await popupPromise, response };
}

const pendingSentinel = { pending: true };

export async function settleRpcResponse(response: Promise<unknown>): Promise<unknown> {
  const outcome = await Promise.race([response, Promise.resolve(pendingSentinel)]);
  if (outcome === pendingSentinel) return rpcResponsePending;
  return outcome;
}
