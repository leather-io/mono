import { LegacyRef, forwardRef } from 'react';

import { useSettings } from '@/store/settings/settings.write';
import { BlurTint, BlurView, BlurViewProps } from 'expo-blur';

export const ThemedBlurView = forwardRef((props: BlurViewProps, ref: LegacyRef<BlurView>) => {
  const { theme } = useSettings();
  const tint: BlurTint =
    theme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  return <BlurView ref={ref} tint={tint} {...props} />;
});
