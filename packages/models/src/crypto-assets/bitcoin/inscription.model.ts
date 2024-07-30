import { HIRO_INSCRIPTIONS_API_URL } from '../../network/network.model';
import { InscriptionCryptoAssetInfo } from '../crypto-asset-info.model';

/**
 * Inscriptions contain arbitrary data. When retrieving an inscription, it should be
 * classified into one of the types below, indicating that the app can handle it
 * appropriately and securely. Inscriptions of types not ready to be handled by the
 * app should be classified as "other".
 */
const inscriptionMimeTypes = [
  'audio',
  'gltf',
  'html',
  'image',
  'svg',
  'text',
  'video',
  'other',
] as const;

export type InscriptionMimeType = (typeof inscriptionMimeTypes)[number];

export function whenInscriptionMimeType<T>(
  mimeType: string,
  branches: { [k in InscriptionMimeType]?: () => T }
) {
  if (mimeType.startsWith('audio/') && branches.audio) {
    return branches.audio();
  }

  if (mimeType.startsWith('text/html') && branches.html) {
    return branches.html();
  }

  if (mimeType.startsWith('image/svg') && branches.svg) {
    return branches.svg();
  }

  if (mimeType.startsWith('image/') && branches.image) {
    return branches.image();
  }

  if (mimeType.startsWith('text') && branches.text) {
    return branches.text();
  }

  if (mimeType.startsWith('video/') && branches.video) {
    return branches.video();
  }

  if (mimeType.startsWith('model/gltf') && branches.gltf) {
    return branches.gltf();
  }

  if (branches.other) return branches.other();

  throw new Error('Unhandled inscription type');
}
export interface Inscription extends InscriptionCryptoAssetInfo {
  preview: string;
  src: string;
  title: string;
  output: string;
  txid: string;
  offset: string;
  address: string;
  genesisBlockHash: string;
  genesisTimestamp: number;
  genesisBlockHeight: number;
  value: string;
}

interface RawInscription {
  id: string;
  number: number;
  output: string;
  contentType: string;
  txid: string;
  offset: string;
  address: string;
  genesisBlockHash: string;
  genesisTimestamp: number;
  genesisBlockHeight: number;
  value: string;
}

export function createInscription(inscription: RawInscription): Inscription {
  const contentSrc = `${HIRO_INSCRIPTIONS_API_URL}/${inscription.id}/content`;
  const iframeSrc = `https://ordinals.com/preview/${inscription.id}`;
  const preview = `https://ordinals.hiro.so/inscription/${inscription.id}`;
  const title = `Inscription ${inscription.number}`;

  const sharedInfo = {
    id: inscription.id,
    number: inscription.number,
    output: inscription.output,
    txid: inscription.txid,
    offset: inscription.offset,
    address: inscription.address,
    genesisBlockHash: inscription.genesisBlockHash,
    genesisTimestamp: inscription.genesisTimestamp,
    genesisBlockHeight: inscription.genesisBlockHeight,
    value: inscription.value,
    preview,
    title,
  };

  return whenInscriptionMimeType<Inscription>(inscription.contentType, {
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
