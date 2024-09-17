import { styled } from 'leather-styles/jsx';

import { Eye1ClosedIcon } from '../../../../native';
import { CollectiblePlaceholderLayout } from './collectible-placeholder.layout.web';

export function ImageUnavailable() {
  return (
    <CollectiblePlaceholderLayout>
      <Eye1ClosedIcon />
      <styled.span pt="space.02" px="space.04" textStyle="label.03">
        Image currently unavailable
      </styled.span>
    </CollectiblePlaceholderLayout>
  );
}
