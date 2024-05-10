import { createInscription } from '@leather-wallet/models';

import { InscriptionResponseHiro } from '../../../types/inscription';

export function createInscriptionHiro(inscriptionResponse: InscriptionResponseHiro) {
  const {
    tx_id: txid,
    genesis_block_hash: genesisBlockHash,
    genesis_timestamp: genesisTimestamp,
    genesis_block_height: genesisBlockHeight,
    ...rest
  } = inscriptionResponse;

  return createInscription({
    txid,
    genesisBlockHash,
    genesisTimestamp,
    genesisBlockHeight,
    ...rest,
  });
}
