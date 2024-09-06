import { LegacyRef, forwardRef } from 'react';

import {
  BlurTint as ExpoBlurTint,
  BlurView as ExpoBlurView,
  BlurViewProps as ExpoBlurViewProps,
} from 'expo-blur';

import { ThemeVariant } from '../../theme-native/theme';

interface BlurViewProps extends ExpoBlurViewProps {
  themeVariant: ThemeVariant;
}

export const BlurView = forwardRef((props: BlurViewProps, ref: LegacyRef<ExpoBlurView>) => {
  const { themeVariant } = props;
  const tint: ExpoBlurTint =
    themeVariant === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  return <ExpoBlurView ref={ref} tint={tint} {...props} />;
});
