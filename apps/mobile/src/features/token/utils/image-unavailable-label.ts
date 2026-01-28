import { t } from '@lingui/core/macro';

// this is convoluted but avoids hardcoding text in the UI library
export function getImageUnavailableLabel() {
  return t`Image currently unavailable`;
}
