import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  StampAsset,
} from '@leather.io/models';
import { CreateInscriptionData } from '@leather.io/utils';

import { BisInscription } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { STAMPCHAIN_API_BASE_URL } from '../infrastructure/api/stampchain/stampchain-api.client';

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

export function sortByBlockHeight(a: { blockHeight: number }, b: { blockHeight: number }) {
  return b.blockHeight - a.blockHeight;
}

interface StampData {
  stamp: number;
  stampUrl: string;
  blockHeight: number;
}

export function createStampAsset({ stamp, stampUrl, blockHeight }: StampData): StampAsset {
  return {
    chain: CryptoAssetChains.bitcoin,
    category: CryptoAssetCategories.nft,
    protocol: CryptoAssetProtocols.stamp,
    stamp,
    stampUrl,
    stampExplorerUrl: `${STAMPCHAIN_API_BASE_URL}/stamp/${stamp}`,
    blockHeight,
  };
}
