import { Inscription, createInscription, whenInscriptionMimeType } from '@leather.io/models';

import { InscriptionResponseHiro } from '../../../types/inscription';
import { BestInSlotInscriptionResponse } from '../clients/best-in-slot';

export function createHiroInscription(inscriptionResponse: InscriptionResponseHiro) {
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
  inscription: BestInSlotInscriptionResponse
): Inscription {
  const id = inscription.inscription_id;
  const delegate = inscription.delegate;

  const contentSrc = delegate ? delegate.content_url : inscription.content_url;
  const mimeType = delegate ? delegate.mime_type : inscription.mime_type;

  const iframeSrc = `https://ordinals.com/preview/${id}`;
  const preview = `https://ordinals.hiro.so/inscription/${id}`;
  const title = `Inscription ${inscription.inscription_number}`;
  const [txid, output, offset] = inscription.satpoint.split(':');

  const genesisTimestamp = new Date(inscription.genesis_ts).getTime();

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

    genesisBlockHash: inscription.genesis_block_hash,
    genesisTimestamp: Math.floor(genesisTimestamp / 1000),
    value: inscription.output_value.toString(),
  };

  if (!mimeType) {
    return {
      ...sharedInfo,
      mimeType: 'other',
      name: 'inscription',
      src: '',
    };
  }

  return whenInscriptionMimeType<Inscription>(mimeType, {
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
