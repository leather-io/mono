import { InscriptionMimeType } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleText } from './collectible-text.native';
import { CollectibleVideo } from './collectible-video.native';

export interface InscriptionProps {
  mimeType: InscriptionMimeType;
  name: string;
  height: number;
  src: string;
  previewSrc?: string | null;
  onPress?: () => void;
}

export function Inscription({
  mimeType,
  name,
  height = 200,
  src,
  previewSrc = null,
  onPress,
}: InscriptionProps) {
  switch (mimeType) {
    case 'audio':
      return <CollectibleAudio alt={name} src={src} size={height} onPress={onPress} />;
    case 'text':
      return <CollectibleText src={src} height={height} onPress={onPress} />;
    case 'html':
    case 'gltf':
      return <CollectibleHtml src={src} height={height} onPress={onPress} />;
    case 'video':
      return (
        <CollectibleVideo
          alt={name}
          height={height}
          onPress={onPress}
          previewSrc={previewSrc}
          src={src}
        />
      );
    case 'other':
    case 'svg':
    case 'image':
      return <CollectibleImage source={src} alt={name} height={height} onPress={onPress} />;
    default:
      assertUnreachable(mimeType);
  }
}
