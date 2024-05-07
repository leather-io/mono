import { whenInscriptionMimeType } from '@leather-wallet/models';
import { HIRO_INSCRIPTIONS_API_URL } from '@leather-wallet/models';

import { Inscription, InscriptionResponse } from '../../../types/inscription';
import { useGetInscriptionQuery } from './inscription.query';

export function makeInscription(inscription: InscriptionResponse) {
  const contentSrc = `${HIRO_INSCRIPTIONS_API_URL}/${inscription.id}/content`;
  const iframeSrc = `https://ordinals.com/preview/${inscription.id}`;
  const preview = `https://ordinals.hiro.so/inscription/${inscription.id}`;
  const title = `Inscription ${inscription.number}`;

  const sharedInfo = {
    id: inscription.id,
    number: inscription.number,
    preview,
    title,
  };

  return whenInscriptionMimeType<Inscription>(inscription.content_type, {
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

export function useInscription(id: string) {
  return useGetInscriptionQuery(id, {
    select: resp => makeInscription(resp),
  });
}
