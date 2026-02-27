import type { InscriptionMimeType } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { CollectibleAudio } from './collectible-audio';
import { CollectibleGltf } from './collectible-gltf';
import { CollectibleHtml } from './collectible-html';
import { CollectibleImage } from './collectible-image';
import { CollectibleSvg } from './collectible-svg';
import { CollectibleText } from './collectible-text';
import { CollectibleVideo } from './collectible-video';

interface InscriptionProps {
  mimeType: InscriptionMimeType;
  name: string;
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
}

export function Inscription({ mimeType, name, src, thumbnailSrc, onPress }: InscriptionProps) {
  switch (mimeType) {
    case 'audio':
      return <CollectibleAudio alt={name} src={src} onPress={onPress} />;
    case 'text':
      return <CollectibleText src={src} onPress={onPress} />;
    case 'html':
      return <CollectibleHtml src={src} thumbnailSrc={thumbnailSrc} onPress={onPress} />;
    case 'gltf':
      return <CollectibleGltf src={src} thumbnailSrc={thumbnailSrc} onPress={onPress} />;
    case 'svg':
      return <CollectibleSvg src={src} onPress={onPress} />;
    case 'video':
      return <CollectibleVideo src={src} alt={name} onPress={onPress} />;
    case 'other':
    case 'image':
      return (
        <CollectibleImage src={src} alt={name} thumbnailSrc={thumbnailSrc} onPress={onPress} />
      );
    default:
      assertUnreachable(mimeType);
  }
}
