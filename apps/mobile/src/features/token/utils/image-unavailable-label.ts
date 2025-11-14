import { t } from '@lingui/core/macro';

export const imageUnavailableLabel = getImageUnavailableLabel();

// this is convoluted but avoids hardcoding text in the UI library
export function getImageUnavailableLabel() {
  return t`Image currently unavailable`;
}
