import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

import type { LedgerFlowHandoffRequest } from './ledger-flow.types';

const ledgerFlowHandoffKey = 'ledger-flow-intent';
const ledgerFlowHandoffTtlMs = 60_000;

interface LedgerFlowHandoffRecord {
  request: LedgerFlowHandoffRequest;
  createdAt: number;
}

function isLedgerFlowHandoffRecord(value: unknown): value is LedgerFlowHandoffRecord {
  if (typeof value !== 'object' || value === null) return false;
  if (!('request' in value) || !('createdAt' in value)) return false;
  return (
    typeof value.request === 'object' &&
    value.request !== null &&
    typeof value.createdAt === 'number'
  );
}

interface HandOffLedgerFlowOptions {
  target?: RouteUrls;
  closeCurrentWindow?: boolean;
}

export async function handOffLedgerFlowToFullPage(
  request: LedgerFlowHandoffRequest,
  { target = RouteUrls.Home, closeCurrentWindow = false }: HandOffLedgerFlowOptions = {}
) {
  const sessionStorage = chrome.storage.session;
  if (sessionStorage) {
    const record: LedgerFlowHandoffRecord = { request, createdAt: Date.now() };
    await sessionStorage.set({ [ledgerFlowHandoffKey]: record });
  }
  await openIndexPageInNewTab(target);
  if (closeCurrentWindow) closeWindow();
}

export async function consumeLedgerFlowHandoff(): Promise<LedgerFlowHandoffRequest | null> {
  const sessionStorage = chrome.storage.session;
  if (!sessionStorage) return null;
  const stored = await sessionStorage.get(ledgerFlowHandoffKey);
  const record: unknown = stored[ledgerFlowHandoffKey];
  if (record === undefined) return null;
  await sessionStorage.remove(ledgerFlowHandoffKey);
  if (!isLedgerFlowHandoffRecord(record)) return null;
  if (Date.now() - record.createdAt > ledgerFlowHandoffTtlMs) return null;
  return record.request;
}
