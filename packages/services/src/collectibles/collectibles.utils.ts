import { CreateInscriptionData } from '@leather.io/utils';

import { BisInscription } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';

export function mapBisInscriptionToCreateInscriptionData(
  bisInscription: BisInscription
): CreateInscriptionData {
  const mimeType = bisInscription.delegate?.mime_type ?? bisInscription.mime_type;
  return {
    id: bisInscription.inscription_id,
    number: bisInscription.inscription_number,
    contentSrc: bisInscription.delegate?.content_url ?? bisInscription.content_url,
    mimeType: mimeType ?? undefined,
    thumbnailSrc: bisInscription.render_url ?? bisInscription.delegate?.render_url ?? undefined,
    ownerAddress: bisInscription.owner_wallet_addr,
    satPoint: bisInscription.satpoint,
    genesisBlockHash: bisInscription.genesis_block_hash,
    genesisTimestamp: bisInscription.genesis_ts,
    genesisBlockHeight: bisInscription.genesis_height,
    outputValue: bisInscription.output_value?.toString() ?? '0',
  };
}

export function sortBisInscriptionByBlockHeight(a: BisInscription, b: BisInscription) {
  return (
    b.last_transfer_block_height ??
    b.genesis_height - (a.last_transfer_block_height ?? a.genesis_height)
  );
}

export function sortByBlockHeight(a: { blockHeight: number }, b: { blockHeight: number }) {
  return b.blockHeight - a.blockHeight;
}

const lpTokenPatterns = [
  '::pool-token-id',
  '::lp-token',
  '::liquidity-token',
  '.dlmm-pool-',
  '.amm-pool-',
];

export function isLpToken(assetIdentifier: string): boolean {
  const lowerIdentifier = assetIdentifier.toLowerCase();
  return lpTokenPatterns.some(pattern => lowerIdentifier.includes(pattern));
}
