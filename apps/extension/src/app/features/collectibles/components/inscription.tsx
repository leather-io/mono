import { Box, styled } from 'leather-styles/jsx';

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

function InscriptionContent({
  mimeType,
  name,
  src,
  thumbnailSrc,
}: Omit<InscriptionProps, 'onPress'>) {
  switch (mimeType) {
    case 'audio':
      return <CollectibleAudio alt={name} src={src} />;
    case 'text':
      return <CollectibleText src={src} />;
    case 'html':
      return <CollectibleHtml src={src} thumbnailSrc={thumbnailSrc} />;
    case 'gltf':
      return <CollectibleGltf src={src} thumbnailSrc={thumbnailSrc} />;
    case 'svg':
      return <CollectibleSvg src={src} />;
    case 'video':
      return <CollectibleVideo src={src} />;
    case 'other':
    case 'image':
      return <CollectibleImage src={src} alt={name} thumbnailSrc={thumbnailSrc} />;
    default:
      assertUnreachable(mimeType);
  }
}

export function Inscription({ mimeType, name, src, thumbnailSrc, onPress }: InscriptionProps) {
  if (!onPress) {
    return (
      <InscriptionContent mimeType={mimeType} name={name} src={src} thumbnailSrc={thumbnailSrc} />
    );
  }

  return (
    <Box position="relative">
      <InscriptionContent mimeType={mimeType} name={name} src={src} thumbnailSrc={thumbnailSrc} />
      <styled.button
        type="button"
        onClick={onPress}
        position="absolute"
        inset={0}
        zIndex={1}
        bg="transparent"
        border="none"
        cursor="pointer"
        p={0}
        m={0}
      />
    </Box>
  );
}
