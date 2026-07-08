import {
  deconstructBtcAddress,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

const p2wpkhAddressType = '0x04';
const p2wpkhScriptPrefix = [0x00, 0x14];

// Re-encode a native SegWit (p2wpkh) address to the given network's encoding.
export function normalizeNativeSegwitAddress(address: string, mode: BitcoinNetworkModes): string {
  try {
    const { type, hashbytes } = deconstructBtcAddress(address);
    if (type !== p2wpkhAddressType) return address;
    const script = new Uint8Array([...p2wpkhScriptPrefix, ...hashbytes]);
    return getAddressFromOutScript(script, getBtcSignerLibNetworkConfigByMode(mode)) ?? address;
  } catch {
    return address;
  }
}
