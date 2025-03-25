import { HeadsetIcon } from '../../../icons/headset-icon.native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

interface CollectibleAudioProps {
  size?: number;
}

export function CollectibleAudio({ size = 200 }: CollectibleAudioProps) {
  return (
    <CollectibleCardLayout width={size} height={size}>
      <HeadsetIcon height={36} width={36} />
    </CollectibleCardLayout>
  );
}
