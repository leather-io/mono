import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleText } from './collectible-text.native';

export interface CollectibleCardProps {
  name: string;
  type: 'inscription' | 'stacks';
  src: string;
  mimeType?: string | null;
}

export function CollectibleCard({ name, type, src, mimeType }: CollectibleCardProps) {
  const isOrdinal = type === 'inscription';

  if (isOrdinal) {
    switch (mimeType) {
      case 'audio':
        return <CollectibleAudio />;
      case 'text':
        return <CollectibleText src={src} />;
      case 'html':
      case 'gltf':
      case 'svg':
      case 'video':
        return <CollectibleHtml src={src} />;
      default:
        // TODO: Needs explicit case handling for when mimeType is not set/of unknown type.
        return null;
    }
  }

  return <CollectibleImage source={src} alt={name} />;
}
