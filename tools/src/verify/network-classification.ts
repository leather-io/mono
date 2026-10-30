import type { VerifyNetworkCounts, VerifyNetworkSummary } from './verify-contract.js';

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

export interface ServerAddress {
  readonly ipAddress: string;
  readonly port: number;
}

export interface NetworkRecord {
  readonly url: string;
  readonly method: string;
  readonly resourceType: string;
  readonly initiator: NetworkInitiator;
  readonly classification: NetworkClassification;
  readonly status: number | null;
  readonly failure?: string;
  readonly at: number;
}

export const cancelledByPageError = 'net::ERR_ABORTED';

const localHostnames = new Set(['localhost', '127.0.0.1']);
const extensionProtocol = 'chrome-extension:';
const httpProtocolPrefix = 'http';
const maxRealUrls = 20;

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

export function classifyFailure(
  url: string,
  errorText: string | undefined,
  hermetic: boolean
): NetworkClassification {
  const parsed = parseUrl(url);
  if (parsed === undefined) return 'other';
  if (!parsed.protocol.startsWith(httpProtocolPrefix)) return 'failed';
  if (localHostnames.has(parsed.hostname)) return 'failed';
  if (errorText === cancelledByPageError) return 'failed';
  return hermetic ? 'fallback' : 'failed';
}

export function emptyNetworkCounts(): Record<NetworkClassification, number> {
  return { extension: 0, local: 0, mocked: 0, fallback: 0, real: 0, failed: 0, other: 0 };
}

export function summarizeNetwork(
  records: readonly NetworkRecord[],
  hermetic: boolean
): VerifyNetworkSummary {
  const counts = emptyNetworkCounts();
  const realUrls = new Set<string>();
  for (const record of records) {
    counts[record.classification] += 1;
    if (record.classification === 'real') realUrls.add(`${record.method} ${record.url}`);
  }
  const frozen: VerifyNetworkCounts = counts;
  return {
    total: records.length,
    counts: frozen,
    serviceWorkerRequests: records.filter(record => record.initiator === 'service-worker').length,
    realUrls: [...realUrls].slice(0, maxRealUrls),
    blockingReal: hermetic ? counts.real : 0,
  };
}
