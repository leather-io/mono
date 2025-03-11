import { InscriptionCryptoAssetInfo } from './crypto-asset-info.model';

/**
 * Inscriptions contain arbitrary data. When retrieving an inscription, it should be
 * classified into one of the types below, indicating that the app can handle it
 * appropriately and securely. Inscriptions of types not ready to be handled by the
 * app should be classified as "other".
 */
export const inscriptionMimeTypes = [
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

/* Deprecated: Made obsolete by InscriptionCryptoAssetInfo; Will be removed */
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
