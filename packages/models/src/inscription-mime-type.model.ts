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
