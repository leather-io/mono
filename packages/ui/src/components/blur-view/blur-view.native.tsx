import { RefObject, useEffect } from 'react';
import { Platform } from 'react-native';

import {
  BlurMethod,
  BlurTint as ExpoBlurTint,
  BlurView as ExpoBlurView,
  BlurViewProps as ExpoBlurViewProps,
} from 'expo-blur';

import { ThemeVariant } from '../../theme-native/theme';

interface BlurViewProps extends ExpoBlurViewProps {
  themeVariant: ThemeVariant;
  blurMethod?: BlurMethod;
}

export function BlurView(props: BlurViewProps & { ref?: RefObject<ExpoBlurView> }) {
  useEffect(() => {
    if (Platform.OS === 'android' && props.blurMethod === 'dimezisBlurView') {
      // eslint-disable-next-line no-console
      console.warn(
        `Don't use BlurView on android with "dimezisBlurView" as it's not working properly on it, see https://docs.expo.dev/versions/latest/sdk/blur-view/#experimentalblurmethod`
      );
    }
  }, [props.blurMethod]);

  const tint: ExpoBlurTint =
    props.themeVariant === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';

  return <ExpoBlurView blurMethod="none" ref={props.ref} tint={tint} {...props} />;
}

BlurView.displayName = 'BlurView';
