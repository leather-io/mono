import { BlockchainActivity, CryptoAsset } from '@leather.io/models';

export function sortActivityByTimestampDesc(a: { timestamp: number }, b: { timestamp: number }) {
  return b.timestamp - a.timestamp;
}

export function filterActivityByAsset(
  activity: BlockchainActivity[],
  asset: CryptoAsset
): BlockchainActivity[] {
  switch (asset.protocol) {
    case 'nativeBtc':
      return activity.filter(a => a.chain === 'bitcoin');
    case 'nativeStx':
      return activity.filter(a => a.events.some(e => e.asset.protocol === 'nativeStx'));
    case 'sip10':
      return activity.filter(a =>
        a.events.some(e => e.asset.protocol === 'sip10' && e.asset.assetId === asset.assetId)
      );
    default:
      return [];
  }
}
