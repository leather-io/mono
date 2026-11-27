import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import { type LeatherUtxo } from './fixtures/bitcoin';
import { type Prevout } from './fixtures/bitcoin-signatures';
import { dappPsbtInputSats, dappPsbtTxid } from './fixtures/rpc-bitcoin-psbt';

const servedPrevouts = new Map<string, Map<string, Prevout>>();
const networks = [btc.NETWORK, btc.TEST_NETWORK];

function outpointKey(txid: string, vout: number) {
  return `${txid.toLowerCase()}:${vout}`;
}

function scriptOf(address: string) {
  return networks
    .flatMap(network => {
      try {
        return [btc.OutScript.encode(btc.Address(network).decode(address))];
      } catch {
        return [];
      }
    })
    .at(0);
}

export function rememberServedUtxos(utxos: LeatherUtxo[]) {
  utxos.forEach(utxo => {
    const script = scriptOf(utxo.address);
    if (!script) return;
    const key = outpointKey(utxo.txid, utxo.vout);
    const known = servedPrevouts.get(key) ?? new Map<string, Prevout>();
    known.set(bytesToHex(script), { script, amount: BigInt(utxo.value) });
    servedPrevouts.set(key, known);
  });
}

function servedScripts() {
  const scripts = new Map<string, Uint8Array>();
  servedPrevouts.forEach(known =>
    known.forEach(({ script }, scriptHex) => scripts.set(scriptHex, script))
  );
  return [...scripts.values()];
}

export function readServedPrevouts(txid: string, vout: number): Prevout[] {
  if (txid.toLowerCase() === dappPsbtTxid)
    return servedScripts().map(script => ({ script, amount: dappPsbtInputSats }));
  return [...(servedPrevouts.get(outpointKey(txid, vout))?.values() ?? [])];
}
