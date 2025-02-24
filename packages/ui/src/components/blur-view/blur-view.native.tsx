import { LegacyRef, forwardRef } from 'react';

import {
  ExperimentalBlurMethod,
  BlurTint as ExpoBlurTint,
  BlurView as ExpoBlurView,
  BlurViewProps as ExpoBlurViewProps,
} from 'expo-blur';

import { ThemeVariant } from '../../theme-native/theme';

interface BlurViewProps extends ExpoBlurViewProps {
  themeVariant: ThemeVariant;
  experimentalBlurMethod?: ExperimentalBlurMethod;
}

export const BlurView = forwardRef((props: BlurViewProps, ref: LegacyRef<ExpoBlurView>) => {
  const { themeVariant, experimentalBlurMethod } = props;
  const tint: ExpoBlurTint =
    themeVariant === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  return (
    <ExpoBlurView
      experimentalBlurMethod={experimentalBlurMethod}
      ref={ref}
      tint={tint}
      {...props}
    />
  );
});

BlurView.displayName = 'BlurView';
