import { type RefObject, useEffect } from 'react';
import { Platform } from 'react-native';

import {
  type ExperimentalBlurMethod,
  type BlurTint as ExpoBlurTint,
  BlurView as ExpoBlurView,
  type BlurViewProps as ExpoBlurViewProps,
} from 'expo-blur';

import { type ThemeVariant } from '../../theme-native/theme';

interface BlurViewProps extends ExpoBlurViewProps {
  themeVariant: ThemeVariant;
  experimentalBlurMethod?: ExperimentalBlurMethod;
}

export function BlurView(props: BlurViewProps & { ref?: RefObject<ExpoBlurView> }) {
  useEffect(() => {
    if (Platform.OS === 'android' && props.experimentalBlurMethod === 'dimezisBlurView') {
      // eslint-disable-next-line no-console
      console.warn(
        `Don't use BlurView on android with "dimezisBlurView" as it's not working properly on it, see https://docs.expo.dev/versions/latest/sdk/blur-view/#experimentalblurmethod`
      );
    }
  }, [props.experimentalBlurMethod]);

  const tint: ExpoBlurTint =
    props.themeVariant === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';

  return <ExpoBlurView experimentalBlurMethod="none" ref={props.ref} tint={tint} {...props} />;
}

BlurView.displayName = 'BlurView';
