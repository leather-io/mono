import {
  deconstructBtcAddress,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
  isValidBitcoinNetworkAddress,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

const p2wpkhAddressType = '0x04';
const p2wpkhScriptPrefix = [0x00, 0x14];

function crossesMainnetBoundary(address: string, mode: BitcoinNetworkModes) {
  return isValidBitcoinNetworkAddress(address, 'mainnet') !== (mode === 'mainnet');
}

// Re-encode a native SegWit (p2wpkh) address to the given network's encoding.
export function normalizeNativeSegwitAddress(address: string, mode: BitcoinNetworkModes): string {
  if (crossesMainnetBoundary(address, mode)) return address;
  try {
    const { type, hashbytes } = deconstructBtcAddress(address);
    if (type !== p2wpkhAddressType) return address;
    const script = new Uint8Array([...p2wpkhScriptPrefix, ...hashbytes]);
    return getAddressFromOutScript(script, getBtcSignerLibNetworkConfigByMode(mode)) ?? address;
  } catch {
    return address;
  }
}
