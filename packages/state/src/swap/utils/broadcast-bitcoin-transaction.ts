import { isError } from 'remeda';

import { type BitcoinClient } from '@leather.io/query';

import { type BitcoinBroadcastResult } from '../swap-state.types';

const httpClientErrorStatusFloor = 400;
const httpServerErrorStatusFloor = 500;

export async function broadcastBitcoinTransaction(
  bitcoinClient: BitcoinClient,
  txHex: string
): Promise<BitcoinBroadcastResult> {
  try {
    const response = await bitcoinClient.transactionsApi.broadcastTransaction(txHex);
    if (response.ok) return { status: 'accepted' };
    const body = (await response.text().catch(() => '')).trim();
    const errorMessage = body || `Broadcast failed: ${response.status}`;
    const isClientError =
      response.status >= httpClientErrorStatusFloor && response.status < httpServerErrorStatusFloor;
    if (isClientError) return { status: 'rejected', errorMessage };
    return { status: 'unknown', errorMessage };
  } catch (error) {
    return { status: 'unknown', errorMessage: isError(error) ? error.message : String(error) };
  }
}
