import { createInscription } from '@leather.io/models';

import { InscriptionResponseHiro } from '../../../types/inscription';

export function createInscriptionHiro(inscriptionResponse: InscriptionResponseHiro) {
  const {
    content_type: contentType,
    genesis_block_height: genesisBlockHeight,
    genesis_block_hash: genesisBlockHash,
    genesis_timestamp: genesisTimestamp,
    tx_id: txid,
    ...rest
  } = inscriptionResponse;

  return createInscription({
    contentType,
    genesisBlockHash,
    genesisBlockHeight,
    genesisTimestamp,
    txid,
    ...rest,
  });
}
