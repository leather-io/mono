import { InscriptionMimeType } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleText } from './collectible-text.native';

export interface InscriptionProps {
  mimeType: InscriptionMimeType;
  name: string;
  height: number;
  src: string;
}

export function Inscription({ mimeType, name, height = 200, src }: InscriptionProps) {
  switch (mimeType) {
    case 'audio':
      return <CollectibleAudio size={height} />;
    case 'text':
      return <CollectibleText src={src} height={height} />;
    case 'html':
    case 'gltf':
    case 'svg':
    case 'video':
      return <CollectibleHtml src={src} height={height} />;
    case 'other':
    case 'image':
      return <CollectibleImage source={src} alt={name} height={height} />;
    default:
      assertUnreachable(mimeType);
  }
}
