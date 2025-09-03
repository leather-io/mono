import { Inscription } from '@leather.io/models';
import { createInscriptionAsset } from '@leather.io/utils';

import {
  BestInSlotInscriptionResponse,
  BestinSlotInscriptionBatchInfoResponse,
} from '../clients/best-in-slot';

// there are disrepancies in inscription models in BiS api
export function normalizeBestInSlotInscriptionResponse(
  inscription: BestinSlotInscriptionBatchInfoResponse
): BestInSlotInscriptionResponse {
  const date = new Date(inscription.genesis_ts * 1000);
  const genesis_ts = date.toISOString();

  return {
    ...inscription,
    output_value: inscription.output_value || 0,
    owner_wallet_addr: inscription.wallet,
    genesis_ts,
    genesis_block_hash: '',
  };
}

export function createBestInSlotInscription(
  bisInscription: BestInSlotInscriptionResponse
): Inscription {
  const mimeType = bisInscription.delegate?.mime_type ?? bisInscription.mime_type;
  return createInscriptionAsset({
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
  });
}
