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
