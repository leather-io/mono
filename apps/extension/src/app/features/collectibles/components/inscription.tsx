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
  height: number;
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
}

export function Inscription({
  mimeType,
  name,
  height = 200,
  src,
  thumbnailSrc,
  onPress,
}: InscriptionProps) {
  switch (mimeType) {
    case 'audio':
      return <CollectibleAudio alt={name} src={src} size={height} onPress={onPress} />;
    case 'text':
      return <CollectibleText src={src} height={height} onPress={onPress} />;
    case 'html':
      return (
        <CollectibleHtml src={src} height={height} thumbnailSrc={thumbnailSrc} onPress={onPress} />
      );
    case 'gltf':
      return (
        <CollectibleGltf src={src} thumbnailSrc={thumbnailSrc} height={height} onPress={onPress} />
      );
    case 'svg':
      return <CollectibleSvg src={src} height={height} onPress={onPress} />;
    case 'video':
      return <CollectibleVideo src={src} alt={name} height={height} onPress={onPress} />;
    case 'other':
    case 'image':
      return (
        <CollectibleImage
          src={src}
          alt={name}
          height={height}
          thumbnailSrc={thumbnailSrc}
          onPress={onPress}
        />
      );
    default:
      assertUnreachable(mimeType);
  }
}
