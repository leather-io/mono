import { InscriptionMimeType } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleGltf } from './collectible-gltf.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleText } from './collectible-text.native';

export interface InscriptionProps {
  mimeType: InscriptionMimeType;
  name: string;
  height: number;
  src: string;
  onPress?: () => void;
}

export function Inscription({ mimeType, name, height = 200, src, onPress }: InscriptionProps) {
  switch (mimeType) {
    case 'audio':
      return <CollectibleAudio size={height} onPress={onPress} />;
    case 'text':
      return <CollectibleText src={src} height={height} onPress={onPress} />;
    case 'html':
    case 'gltf':
      return <CollectibleGltf src={src} height={height} onPress={onPress} />;
    case 'video':
      return <CollectibleHtml src={src} height={height} onPress={onPress} />;
    case 'other':
    case 'svg':
    case 'image':
      return <CollectibleImage source={src} alt={name} height={height} onPress={onPress} />;
    default:
      assertUnreachable(mimeType);
  }
}
