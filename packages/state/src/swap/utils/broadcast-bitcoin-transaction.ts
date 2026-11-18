import { isError } from 'remeda';

import { type BitcoinBroadcastResult } from '../swap-state.types';

type BitcoinBroadcastResponse = Pick<Response, 'ok' | 'status' | 'text'>;

export interface BitcoinTransactionBroadcaster {
  broadcastTransaction(txHex: string): Promise<BitcoinBroadcastResponse>;
}

const httpClientErrorStatusFloor = 400;
const httpServerErrorStatusFloor = 500;

async function readTrimmedResponseBody(response: { text(): Promise<string> }) {
  try {
    return (await response.text()).trim();
  } catch {
    return undefined;
  }
}

export async function broadcastBitcoinTransaction(
  broadcaster: BitcoinTransactionBroadcaster,
  txHex: string
): Promise<BitcoinBroadcastResult> {
  try {
    const response = await broadcaster.broadcastTransaction(txHex);
    if (response.ok) return { status: 'accepted' };
    const body = await readTrimmedResponseBody(response);
    const errorMessage = body || `Broadcast failed: ${response.status}`;
    const isClientError =
      response.status >= httpClientErrorStatusFloor && response.status < httpServerErrorStatusFloor;
    if (isClientError) return { status: 'rejected', errorMessage };
    return { status: 'unknown', errorMessage };
  } catch (error) {
    return { status: 'unknown', errorMessage: isError(error) ? error.message : String(error) };
  }
}
