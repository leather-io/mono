import {
  HIRO_INSCRIPTIONS_API_URL,
  Inscription,
  createInscription,
  whenInscriptionMimeType,
} from '@leather.io/models';

import { BestinslotInscriptionResponse, InscriptionResponseHiro } from '../../../types/inscription';

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

export function createBestinSlotInscription(
  inscription: BestinslotInscriptionResponse
): Inscription {
  const id = inscription.inscription_id;
  const contentSrc = `${HIRO_INSCRIPTIONS_API_URL}/${id}/content`;
  const iframeSrc = `https://ordinals.com/preview/${id}`;
  const preview = `https://ordinals.hiro.so/inscription/${id}`;
  const title = `Inscription ${inscription.inscription_number}`;
  const [txid, output, offset] = inscription.satpoint.split(':');

  const sharedInfo = {
    id: inscription.inscription_id,
    number: inscription.inscription_number,
    output,
    txid,
    offset,
    address: inscription.owner_wallet_addr,
    preview,
    title,
    genesisBlockHeight: inscription.genesis_height,

    // TODO: currently no data from BestinSlot API
    genesisBlockHash: '0',
    genesisTimestamp: 0,
    value: '0',
  };

  if (!inscription.mime_type) {
    return {
      ...sharedInfo,
      mimeType: 'other',
      name: 'inscription',
      src: '',
    };
  }

  return whenInscriptionMimeType<Inscription>(inscription.mime_type, {
    audio: () => ({
      ...sharedInfo,
      mimeType: 'audio',
      name: 'inscription',
      src: iframeSrc,
    }),
    gltf: () => ({
      ...sharedInfo,
      mimeType: 'gltf',
      name: 'inscription',
      src: iframeSrc,
    }),
    html: () => ({
      ...sharedInfo,
      mimeType: 'html',
      name: 'inscription',
      src: iframeSrc,
    }),
    image: () => ({
      ...sharedInfo,
      mimeType: 'image',
      name: 'inscription',
      src: contentSrc,
    }),
    svg: () => ({
      ...sharedInfo,
      mimeType: 'svg',
      name: 'inscription',
      src: iframeSrc,
    }),
    text: () => ({
      ...sharedInfo,
      mimeType: 'text',
      name: 'inscription',
      src: contentSrc,
    }),
    video: () => ({
      ...sharedInfo,
      mimeType: 'video',
      name: 'inscription',
      src: iframeSrc,
    }),
    other: () => ({
      ...sharedInfo,
      mimeType: 'other',
      name: 'inscription',
      src: '',
    }),
  });
}
