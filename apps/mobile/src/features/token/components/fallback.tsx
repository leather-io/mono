import { t } from '@lingui/core/macro';

import { ImageUnavailable, Text } from '@leather.io/ui/native';

export function FallbackImage() {
  return (
    <ImageUnavailable>
      <Text textAlign="center">{t`Image currently unavailable`}</Text>
    </ImageUnavailable>
  );
}
