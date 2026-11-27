import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { HttpResponse, http } from 'msw';

import { recordBroadcast } from '../e2e-state';
import { findInputProblem } from '../fixtures/bitcoin-signatures';
import { readServedPrevouts } from '../served-prevouts';
import { mempoolUrl } from './urls';

const rpcErrorPrefix = 'sendrawtransaction RPC error:';

function reject(message: string) {
  return HttpResponse.text(`${rpcErrorPrefix} ${message}`, { status: 400 });
}

function readTransaction(hex: string) {
  try {
    return btc.Transaction.fromRaw(hexToBytes(hex.trim()), { allowUnknownOutputs: true });
  } catch {
    return null;
  }
}

function broadcast(hex: string) {
  const tx = readTransaction(hex);
  if (!tx) return reject('TX decode failed');
  if (tx.inputsLength === 0) return reject('bad-txns-vin-empty');
  if (!tx.isFinal) {
    return reject(
      'mandatory-script-verify-flag-failed (Witness program was passed an empty witness)'
    );
  }
  const problem = findInputProblem(tx, readServedPrevouts);
  if (problem === 'missing-input') return reject('bad-txns-inputs-missingorspent');
  if (problem === 'bad-signature') {
    return reject(
      'mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)'
    );
  }
  recordBroadcast('bitcoin', tx.id);
  return HttpResponse.text(tx.id);
}

export const mempoolHandlers = [
  http.post(mempoolUrl('/tx'), async ({ request }) => broadcast(await request.text())),
  http.get(mempoolUrl('/v1/fees/recommended'), () =>
    HttpResponse.json({ fastestFee: 15, halfHourFee: 10, hourFee: 5, economyFee: 2, minimumFee: 1 })
  ),
];
