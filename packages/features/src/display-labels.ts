import type { CryptoAssetProtocol } from '@leather.io/models';

type ChainType = 'bitcoin' | 'stacks';

/**
 * Returns a human-readable label for the blockchain layer.
 * @param chain - The chain type ('bitcoin' or 'stacks')
 * @returns Display label like "Layer 1 (Bitcoin)" or "Layer 2 (Stacks)"
 */
export function getChainDisplayLabel(chain: ChainType): string {
  const labels: Record<ChainType, string> = {
    bitcoin: 'Layer 1 (Bitcoin)',
    stacks: 'Layer 2 (Stacks)',
  };
  return labels[chain];
}

/**
 * Returns a human-readable label for the crypto asset protocol.
 * @param protocol - The protocol type from CryptoAssetProtocol
 * @returns Display label like "SIP-009", "Ordinals", etc.
 */
export function getProtocolDisplayLabel(protocol: CryptoAssetProtocol): string {
  const labels: Record<CryptoAssetProtocol, string> = {
    nativeBtc: 'Bitcoin',
    nativeStx: 'Stacks',
    sip9: 'SIP-009',
    sip10: 'SIP-010',
    inscription: 'Ordinals',
    stamp: 'Stamps',
    brc20: 'BRC-20',
    src20: 'SRC-20',
    rune: 'Runes',
  };
  return labels[protocol] ?? protocol;
}
