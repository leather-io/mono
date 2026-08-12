import { RpcErrorCode } from '@leather.io/rpc';

export type Pox5TxKind = 'stake' | 'stake-update' | 'unstake' | 'claim-rewards';

type Pox5TxFailureReason = 'aborted' | 'dropped' | 'not-found' | 'unknown';

export type Pox5TxOutcome =
  | { status: 'pending' }
  | { status: 'confirmed' }
  | { status: 'failed'; reason: Pox5TxFailureReason };

export const pox5TxPollIntervalMs = 3000;
export const pox5TxNotFoundTimeoutMs = 120_000;

const proposedTxStatus = 'proposed';
const droppedTxStatusPrefix = 'dropped_';
const hexPrefix = '0x';

export function getBroadcastTxId(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null;
  if ('status' in result && result.status === proposedTxStatus) return null;
  if (!('txid' in result)) return null;
  const { txid } = result;
  if (typeof txid !== 'string' || txid.length === 0) return null;
  return txid.startsWith(hexPrefix) ? txid : `${hexPrefix}${txid}`;
}

export function getPox5TxOutcome(txStatus: string): Pox5TxOutcome {
  if (txStatus === 'pending') return { status: 'pending' };
  if (txStatus === 'success') return { status: 'confirmed' };
  if (txStatus === 'abort_by_response' || txStatus === 'abort_by_post_condition') {
    return { status: 'failed', reason: 'aborted' };
  }
  if (txStatus.startsWith(droppedTxStatusPrefix)) return { status: 'failed', reason: 'dropped' };
  return { status: 'failed', reason: 'unknown' };
}

export function getPox5TxRefetchInterval(outcome: Pox5TxOutcome | null | undefined) {
  if (!outcome || outcome.status === 'pending') return pox5TxPollIntervalMs;
  return false;
}

interface GetPox5TxScreenStateArgs {
  outcome: Pox5TxOutcome | null | undefined;
  startedAt: number;
  now: number;
}

export function getPox5TxScreenState({
  outcome,
  startedAt,
  now,
}: GetPox5TxScreenStateArgs): Pox5TxOutcome {
  if (outcome) return outcome;
  if (now - startedAt > pox5TxNotFoundTimeoutMs) return { status: 'failed', reason: 'not-found' };
  return { status: 'pending' };
}

function getRpcErrorCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  if ('code' in error && typeof error.code === 'number') return error.code;
  if ('error' in error) {
    const inner = error.error;
    if (inner && typeof inner === 'object' && 'code' in inner && typeof inner.code === 'number') {
      return inner.code;
    }
  }
  return null;
}

const wbipUserRejectionErrorCode = -32000;
const connectUserCanceledErrorCode = -31001;

const userRejectionErrorCodes: number[] = [
  RpcErrorCode.USER_REJECTION,
  wbipUserRejectionErrorCode,
  connectUserCanceledErrorCode,
];

export function isUserRejectionError(error: unknown): boolean {
  const code = getRpcErrorCode(error);
  return code !== null && userRejectionErrorCodes.includes(code);
}
