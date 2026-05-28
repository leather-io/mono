import type { CryptoAssetProtocol } from '@leather.io/models';

type ChainType = 'bitcoin' | 'stacks';

export function getChainDisplayLabel(chain: ChainType): string {
  const labels: Record<ChainType, string> = {
    bitcoin: 'Layer 1 (Bitcoin)',
    stacks: 'Layer 2 (Stacks)',
  };
  return labels[chain];
}

export function getProtocolDisplayLabel(protocol: CryptoAssetProtocol): string {
  const labels: Record<CryptoAssetProtocol, string> = {
    nativeBtc: 'Bitcoin',
    nativeStx: 'Stacks',
    sip9: 'SIP-009',
    sip10: 'SIP-010',
  };
  return labels[protocol] ?? protocol;
}
