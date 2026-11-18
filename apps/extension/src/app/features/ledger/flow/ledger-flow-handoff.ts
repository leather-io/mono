import { z } from 'zod';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

import type { LedgerFlowHandoffRequest } from './ledger-flow.types';

const ledgerFlowHandoffKey = 'ledger-flow-intent';
const ledgerFlowHandoffTtlMs = 60_000;
export const ledgerFlowHandoffParam = 'ledgerHandoff';

const ledgerFlowHandoffRecordSchema = z.object({
  request: z.custom<LedgerFlowHandoffRequest>(
    request => typeof request === 'object' && request !== null
  ),
  createdAt: z.number(),
  token: z.string(),
});
type LedgerFlowHandoffRecord = z.infer<typeof ledgerFlowHandoffRecordSchema>;

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
  const storedRecord: unknown = stored[ledgerFlowHandoffKey];
  if (storedRecord === undefined) return null;
  const parsedRecord = ledgerFlowHandoffRecordSchema.safeParse(storedRecord);
  if (!parsedRecord.success) {
    await sessionStorage.remove(ledgerFlowHandoffKey);
    return null;
  }
  const record = parsedRecord.data;
  if (Date.now() - record.createdAt > ledgerFlowHandoffTtlMs) {
    await sessionStorage.remove(ledgerFlowHandoffKey);
    return null;
  }
  if (record.token !== token) return null;
  await sessionStorage.remove(ledgerFlowHandoffKey);
  return record.request;
}
