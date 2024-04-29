import { whenInscriptionMimeType } from '@leather-wallet/models';
import { HIRO_INSCRIPTIONS_API_URL } from '@leather-wallet/models';

import { Inscription, useGetInscriptionQuery } from './inscription.query';

export function createInscriptionInfoUrl(id: string) {
  return `https://ordinals.hiro.so/inscription/${id}`;
}

function createIframePreviewUrl(id: string) {
  return `https://ordinals.com/preview/${id}`;
}

// TODO: Refactor with new models, include with PR #108
export function convertInscriptionToSupportedInscriptionType(inscription: Inscription) {
  const title = `Inscription ${inscription.number}`;
  return whenInscriptionMimeType(inscription.content_type, {
    audio: () => ({
      infoUrl: createInscriptionInfoUrl(inscription.id),
      src: createIframePreviewUrl(inscription.id),
      title,
      type: 'audio',
      ...inscription,
    }),
    html: () => ({
      infoUrl: createInscriptionInfoUrl(inscription.id),
      src: createIframePreviewUrl(inscription.id),
      title,
      type: 'html',
      ...inscription,
    }),
    image: () => ({
      infoUrl: createInscriptionInfoUrl(inscription.id),
      src: `${HIRO_INSCRIPTIONS_API_URL}/${inscription.id}/content`,
      title,
      type: 'image',
      ...inscription,
    }),
    svg: () => ({
      infoUrl: createInscriptionInfoUrl(inscription.id),
      src: createIframePreviewUrl(inscription.id),
      title,
      type: 'svg',
      ...inscription,
    }),
    text: () => ({
      contentSrc: `${HIRO_INSCRIPTIONS_API_URL}/${inscription.id}/content`,
      infoUrl: createInscriptionInfoUrl(inscription.id),
      title,
      type: 'text',
      ...inscription,
    }),
    video: () => ({
      infoUrl: createInscriptionInfoUrl(inscription.id),
      src: createIframePreviewUrl(inscription.id),
      title,
      type: 'video',
      ...inscription,
    }),
    other: () => ({
      infoUrl: createInscriptionInfoUrl(inscription.id),
      title,
      type: 'other',
      ...inscription,
    }),
  });
}

export function useInscription(id: string) {
  return useGetInscriptionQuery(id, {
    select: resp => convertInscriptionToSupportedInscriptionType(resp),
  });
}
