import { CryptoAssetProtocol } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { Box } from '../../../../native';
import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleText } from './collectible-text.native';

export interface CollectibleCardProps {
  mimeType?: string;
  name: string;
  size: number;
  src: string;
  type: CryptoAssetProtocol;
}

export function CollectibleCard({ mimeType, name, size = 200, src, type }: CollectibleCardProps) {
  return (
    <Box>
      {(() => {
        if (type === 'inscription') {
          switch (mimeType) {
            case 'audio':
              return <CollectibleAudio size={size} />;
            case 'text':
              return <CollectibleText src={src} size={size} />;
            case 'html':
            case 'gltf':
            case 'svg':
            case 'video':
              return <CollectibleHtml src={src} size={size} />;
            case 'image':
              return <CollectibleImage source={src} alt={name} size={size} />;
            default:
              assertUnreachable(mimeType as never);
          }
        }

        return <CollectibleImage source={src} alt={name} size={size} />;
      })()}
    </Box>
  );
}
