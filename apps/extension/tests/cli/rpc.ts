import type { BrowserContext, Page } from '@playwright/test';
import { requestLeatherProvider } from '@tests/leather-provider';
import { readFileSync } from 'node:fs';

import {
  type RequestContext,
  findSpec,
  resolveParams,
  rpcMethods,
} from '@leather.io/test-app/catalog';

import { VerifyUsageError, describeError } from './verify-errors';
import type { RpcPlan } from './verify-options';

export const rpcRequestFileName = 'rpc-request.json';
export const rpcResponsePending = 'pending';

export interface ResolvedRpcRequest {
  method: string;
  params: unknown;
  source: RpcPlan['source'];
  catalogId?: string;
}

export interface DispatchedRpc {
  popup: Page | undefined;
  response: Promise<unknown>;
}

interface PopupOutcome {
  kind: 'popup';
  popup: Page | undefined;
}

interface ResponseOutcome {
  kind: 'response';
  response: unknown;
}

export function listCatalogMethods(): Map<string, string> {
  return new Map(rpcMethods.map(spec => [spec.id, spec.method]));
}

export function readRpcParamsFile(filePath: string): unknown {
  let text: string;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new VerifyUsageError(
      `--params file ${filePath} is not readable: ${describeError(error)}`
    );
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new VerifyUsageError(
      `--params file ${filePath} is not valid JSON: ${describeError(error)}`
    );
  }
}

async function readTestAppNetwork(page: Page): Promise<string> {
  return page.evaluate(() => {
    const api: unknown = Reflect.get(window, '__leatherTestApp');
    if (typeof api !== 'object' || api === null || !('network' in api)) {
      throw new Error('__leatherTestApp missing');
    }
    const { network } = api;
    if (typeof network !== 'function') throw new Error('__leatherTestApp missing');
    const value: unknown = Reflect.apply(network, api, []);
    if (typeof value !== 'string') throw new Error('__leatherTestApp.network() is not a string');
    return value;
  });
}

function createPageRequestContext(page: Page, network: string): RequestContext {
  return {
    network,
    request(method, params) {
      const args: [string, unknown] = [method, params];
      return page.evaluate(async ([requestMethod, requestParams]) => {
        if (!window.LeatherProvider) throw new Error('LeatherProvider missing');
        const response = await window.LeatherProvider.request(requestMethod, requestParams);
        return response.result;
      }, args);
    },
  };
}

export async function resolveRpcRequest(
  rpc: RpcPlan,
  page: Page,
  paramsFromFile: unknown
): Promise<ResolvedRpcRequest> {
  if (rpc.source === 'params') {
    return { method: rpc.method, params: paramsFromFile, source: rpc.source };
  }
  const spec = findSpec(rpc.catalogId);
  if (spec === undefined) throw new VerifyUsageError(`Unknown catalog id "${rpc.catalogId}"`);
  const network = await readTestAppNetwork(page);
  const params = await resolveParams(spec, createPageRequestContext(page, network));
  return { method: spec.method, params, source: rpc.source, catalogId: spec.id };
}

async function awaitPopup(popupPromise: Promise<Page | undefined>): Promise<PopupOutcome> {
  return { kind: 'popup', popup: await popupPromise };
}

async function awaitResponse(responsePromise: Promise<unknown>): Promise<ResponseOutcome> {
  return { kind: 'response', response: await responsePromise };
}

export async function dispatchRpcRequest(
  page: Page,
  context: BrowserContext,
  request: ResolvedRpcRequest
): Promise<DispatchedRpc> {
  const popupPromise = context.waitForEvent('page').catch(() => undefined);
  const response = page
    .evaluate(requestLeatherProvider, { method: request.method, params: request.params })
    .catch((error: unknown) => ({ evaluateError: describeError(error) }));
  const first = await Promise.race([awaitPopup(popupPromise), awaitResponse(response)]);
  if (first.kind === 'popup') return { popup: first.popup, response };
  return { popup: undefined, response };
}

const pendingSentinel = { pending: true };

export async function settleRpcResponse(response: Promise<unknown>): Promise<unknown> {
  const outcome = await Promise.race([response, Promise.resolve(pendingSentinel)]);
  if (outcome === pendingSentinel) return rpcResponsePending;
  return outcome;
}
