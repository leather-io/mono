import type { BrowserContext, Request, Response } from '@playwright/test';

import type { MockMode } from '../mock-registry';

export const networkClassifications = [
  'extension',
  'local',
  'mocked',
  'fallback',
  'real',
  'failed',
  'other',
] as const;
export type NetworkClassification = (typeof networkClassifications)[number];
export type NetworkInitiator = 'page' | 'service-worker';
export type BackgroundObservation = 'observed' | 'unobserved';

export interface ServerAddress {
  ipAddress: string;
  port: number;
}

export interface NetworkRecord {
  ts: string;
  url: string;
  method: string;
  resourceType: string;
  status: number | null;
  initiator: NetworkInitiator;
  classification: NetworkClassification;
  failure?: string;
}

export type NetworkCounts = Record<NetworkClassification, number>;

export interface NetworkSummary {
  counts: NetworkCounts;
  serviceWorkerRequests: number;
  realUrls: string[];
  background: BackgroundObservation;
}

export interface NetworkRecorder {
  attachToContext(context: BrowserContext): void;
  settle(): Promise<void>;
  records(): NetworkRecord[];
  serialize(): string;
}

const localHostnames = new Set(['localhost', '127.0.0.1']);
const extensionProtocol = 'chrome-extension:';
const httpProtocolPrefix = 'http';
const maxRealUrls = 20;
const serverAddressUnavailable = 'server address unavailable';

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export function classifyResponse(
  url: string,
  serverAddr: ServerAddress | null
): NetworkClassification {
  const parsed = parseUrl(url);
  if (parsed === undefined) return 'other';
  if (parsed.protocol === extensionProtocol) return 'extension';
  if (localHostnames.has(parsed.hostname)) return 'local';
  if (!parsed.protocol.startsWith(httpProtocolPrefix)) return 'other';
  if (serverAddr === null) return 'mocked';
  return 'real';
}

export function classifyFailure(url: string, mode: MockMode): NetworkClassification {
  const parsed = parseUrl(url);
  if (parsed === undefined) return 'other';
  if (!parsed.protocol.startsWith(httpProtocolPrefix)) return 'failed';
  if (localHostnames.has(parsed.hostname)) return 'failed';
  if (mode === 'default') return 'fallback';
  return 'failed';
}

function emptyCounts(): NetworkCounts {
  return { extension: 0, local: 0, mocked: 0, fallback: 0, real: 0, failed: 0, other: 0 };
}

export function summarizeNetwork(
  records: readonly NetworkRecord[],
  background: BackgroundObservation
): NetworkSummary {
  const counts = emptyCounts();
  const realUrls = new Set<string>();
  const serviceWorkerRequests = records.filter(
    record => record.initiator === 'service-worker'
  ).length;
  for (const record of records) {
    counts[record.classification] += 1;
    if (record.classification === 'real') realUrls.add(record.url);
  }
  return {
    counts,
    serviceWorkerRequests,
    realUrls: [...realUrls].slice(0, maxRealUrls),
    background,
  };
}

function initiatorOf(request: Request): NetworkInitiator {
  return request.serviceWorker() === null ? 'page' : 'service-worker';
}

async function readServerAddress(response: Response): Promise<ServerAddress | null | undefined> {
  try {
    return await response.serverAddr();
  } catch {
    return undefined;
  }
}

export function createNetworkRecorder(mode: MockMode): NetworkRecorder {
  const records: NetworkRecord[] = [];
  const pending = new Set<Promise<void>>();

  async function recordResponse(response: Response) {
    const request = response.request();
    const url = request.url();
    const serverAddr = await readServerAddress(response);
    records.push({
      ts: new Date().toISOString(),
      url,
      method: request.method(),
      resourceType: request.resourceType(),
      status: response.status(),
      initiator: initiatorOf(request),
      classification: serverAddr === undefined ? 'other' : classifyResponse(url, serverAddr),
      ...(serverAddr === undefined ? { failure: serverAddressUnavailable } : {}),
    });
  }

  function recordFailure(request: Request) {
    records.push({
      ts: new Date().toISOString(),
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      status: null,
      initiator: initiatorOf(request),
      classification: classifyFailure(request.url(), mode),
      failure: request.failure()?.errorText,
    });
  }

  function track(work: Promise<void>) {
    pending.add(work);
    void work.finally(() => pending.delete(work));
  }

  return {
    attachToContext(context) {
      context.on('response', response => track(recordResponse(response)));
      context.on('requestfailed', recordFailure);
    },
    async settle() {
      await Promise.all([...pending]);
    },
    records() {
      return [...records];
    },
    serialize() {
      return records.map(record => `${JSON.stringify(record)}\n`).join('');
    },
  };
}
