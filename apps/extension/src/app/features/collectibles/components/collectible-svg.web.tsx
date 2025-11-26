import { CollectibleImage, type CollectibleImageProps } from './collectible-image.web';

export type CollectibleSvgProps = Omit<CollectibleImageProps, 'isSvg'>;

export function CollectibleSvg(props: CollectibleSvgProps) {
  return <CollectibleImage {...props} isSvg />;
}
