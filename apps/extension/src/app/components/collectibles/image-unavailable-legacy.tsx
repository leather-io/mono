import { styled } from 'leather-styles/jsx';

import { Eye1ClosedIcon } from '@leather.io/ui';

import { CollectiblePlaceholderLayoutLegacy } from './collectible-placeholder.layout-legacy';

export function ImageUnavailableLegacy() {
  return (
    <CollectiblePlaceholderLayoutLegacy>
      <Eye1ClosedIcon />
      <styled.span pt="space.02" px="space.04" textStyle="label.03">
        Image currently unavailable
      </styled.span>
    </CollectiblePlaceholderLayoutLegacy>
  );
}
