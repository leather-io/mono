import { ReactNode } from 'react';

import { HeadsetIcon } from '@leather.io/ui';

import {
  CollectibleItemLayoutLegacy,
  CollectibleItemLayoutLegacyProps,
} from './collectible-item.layout-legacy';
import { CollectiblePlaceholderLayoutLegacy } from './collectible-placeholder.layout-legacy';

interface CollectibleAudioLegacyProps extends Omit<CollectibleItemLayoutLegacyProps, 'children'> {
  icon: ReactNode;
}
export function CollectibleAudioLegacy({ icon, ...props }: CollectibleAudioLegacyProps) {
  return (
    <CollectibleItemLayoutLegacy collectibleTypeIcon={icon} {...props}>
      <CollectiblePlaceholderLayoutLegacy>
        <HeadsetIcon height={36} width={36} />
      </CollectiblePlaceholderLayoutLegacy>
    </CollectibleItemLayoutLegacy>
  );
}
