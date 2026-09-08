// Optional real-UTXO mode.
//
// Every PSBT button spends a fictitious outpoint by default: the wallet signs,
// but nothing can ever be broadcast, so half of what a signature means goes
// untested. Point `VITE_TEST_APP_ESPLORA_URL` at an Esplora API — a local
// regtest one, or a public testnet4 one — and scenarios can spend the wallet's
// real coins and push the result.
//
// Network access lives here and nowhere else, so the rest of the catalog stays
// pure and offline.
import { ESPLORA_URL } from '../constants';

export interface EsploraUtxo {
  txid: string;
  vout: number;
  value: number;
  status: { confirmed: boolean; block_height?: number };
}

export function esploraConfigured(): boolean {
  return !!ESPLORA_URL;
}

function esploraBase(): string {
  if (!ESPLORA_URL)
    throw new Error(
      'No Esplora API configured — set VITE_TEST_APP_ESPLORA_URL to spend real utxos.'
    );
  return ESPLORA_URL.replace(/\/$/, '');
}

async function esploraFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${esploraBase()}${path}`, init);
  if (!response.ok)
    throw new Error(`Esplora ${path} responded ${response.status}: ${await response.text()}`);
  return response;
}

/** Confirmed utxos at `address`, largest first. */
export async function fetchUtxos(address: string): Promise<EsploraUtxo[]> {
  const utxos: EsploraUtxo[] = await (await esploraFetch(`/address/${address}/utxo`)).json();
  return utxos.filter(utxo => utxo.status.confirmed).sort((a, b) => b.value - a.value);
}

/** Current chain tip, for choosing a timelock a bond can actually clear. */
export async function fetchBlockHeight(): Promise<number> {
  return Number(await (await esploraFetch('/blocks/tip/height')).text());
}

/** Push a raw transaction; resolves with its txid. */
export async function broadcastTransaction(txHex: string): Promise<string> {
  return (await esploraFetch('/tx', { method: 'POST', body: txHex })).text();
}

/** The scriptPubKey Esplora reports for an outpoint, needed as a witnessUtxo. */
export async function fetchOutputScript(txid: string, vout: number): Promise<string> {
  const tx: { vout: { scriptpubkey: string }[] } = await (await esploraFetch(`/tx/${txid}`)).json();
  const output = tx.vout[vout];
  if (!output) throw new Error(`Transaction ${txid} has no output ${vout}`);
  return output.scriptpubkey;
}

export interface SpendableUtxo extends EsploraUtxo {
  scriptPubKey: string;
}

/**
 * The largest confirmed utxo at `address`, with its locking script — enough to
 * build a PSBT that can actually be broadcast.
 */
export async function fetchSpendableUtxo(address: string): Promise<SpendableUtxo> {
  const [utxo] = await fetchUtxos(address);
  if (!utxo) throw new Error(`No confirmed utxos at ${address} — fund it and mine a block first.`);
  return { ...utxo, scriptPubKey: await fetchOutputScript(utxo.txid, utxo.vout) };
}
