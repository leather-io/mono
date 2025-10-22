import { InscriptionMimeType } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

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
    case 'text':
      return <CollectibleText src={src} height={height} onPress={onPress} />;
    case 'audio':
    case 'html':
    case 'gltf':
      return <CollectibleHtml src={src} height={height} onPress={onPress} contentType={mimeType} />;
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
