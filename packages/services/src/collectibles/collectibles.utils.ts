import { StampAsset } from '@leather.io/models';
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
    ownerAddress: bisInscription.owner_wallet_addr,
    satPoint: bisInscription.satpoint,
    genesisBlockHash: bisInscription.genesis_block_hash,
    genesisTimestamp: bisInscription.genesis_ts,
    genesisBlockHeight: bisInscription.genesis_height,
    outputValue: bisInscription.output_value?.toString() ?? '0',
  };
}

export interface StampData {
  stamp: number;
  stamp_url: string;
  block_index?: number;
}

export function createStampAsset(stampData: StampData): StampAsset {
  return {
    chain: 'bitcoin',
    category: 'nft',
    protocol: 'stamp',
    stamp: stampData.stamp,
    stampUrl: stampData.stamp_url,
  };
}

export function sortByBlockHeight(a: { blockHeight: number }, b: { blockHeight: number }) {
  return b.blockHeight - a.blockHeight;
}
