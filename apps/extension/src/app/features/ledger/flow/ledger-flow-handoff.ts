import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

import type { LedgerFlowHandoffRequest } from './ledger-flow.types';

const ledgerFlowHandoffKey = 'ledger-flow-intent';
const ledgerFlowHandoffTtlMs = 60_000;
export const ledgerFlowHandoffParam = 'ledgerHandoff';

interface LedgerFlowHandoffRecord {
  request: LedgerFlowHandoffRequest;
  createdAt: number;
  token: string;
}

function isLedgerFlowHandoffRecord(value: unknown): value is LedgerFlowHandoffRecord {
  if (typeof value !== 'object' || value === null) return false;
  if (!('request' in value) || !('createdAt' in value) || !('token' in value)) return false;
  return (
    typeof value.request === 'object' &&
    value.request !== null &&
    typeof value.createdAt === 'number' &&
    typeof value.token === 'string'
  );
}

interface HandOffLedgerFlowOptions {
  target?: RouteUrls;
  closeCurrentWindow?: boolean;
}

function toHandoffSafeRequest(request: LedgerFlowHandoffRequest): LedgerFlowHandoffRequest {
  if (request.kind !== 'request-keys') return request;
  return { ...request, autoConnect: false };
}

export async function handOffLedgerFlowToFullPage(
  request: LedgerFlowHandoffRequest,
  { target = RouteUrls.Home, closeCurrentWindow = false }: HandOffLedgerFlowOptions = {}
) {
  const token = crypto.randomUUID();
  const sessionStorage = chrome.storage.session;
  if (sessionStorage) {
    const record: LedgerFlowHandoffRecord = {
      request: toHandoffSafeRequest(request),
      createdAt: Date.now(),
      token,
    };
    await sessionStorage.set({ [ledgerFlowHandoffKey]: record });
  }
  await openIndexPageInNewTab(target, `?${ledgerFlowHandoffParam}=${token}`);
  if (closeCurrentWindow) closeWindow();
}

export async function consumeLedgerFlowHandoff(
  token: string | null
): Promise<LedgerFlowHandoffRequest | null> {
  const sessionStorage = chrome.storage.session;
  if (!sessionStorage || !token) return null;
  const stored = await sessionStorage.get(ledgerFlowHandoffKey);
  const record: unknown = stored[ledgerFlowHandoffKey];
  if (record === undefined) return null;
  if (!isLedgerFlowHandoffRecord(record)) {
    await sessionStorage.remove(ledgerFlowHandoffKey);
    return null;
  }
  if (Date.now() - record.createdAt > ledgerFlowHandoffTtlMs) {
    await sessionStorage.remove(ledgerFlowHandoffKey);
    return null;
  }
  if (record.token !== token) return null;
  await sessionStorage.remove(ledgerFlowHandoffKey);
  return record.request;
}
