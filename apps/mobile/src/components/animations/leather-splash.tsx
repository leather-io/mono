import { forwardRef } from 'react';

import { useSettings } from '@/store/settings/settings';
import LottieView, { LottieViewProps } from 'lottie-react-native';

interface LeatherSplashProps {
  onAnimationEnd(): void;
}

export const LeatherSplash = forwardRef<LottieView, Partial<LottieViewProps> & LeatherSplashProps>(
  (props, ref) => {
    const { whenTheme } = useSettings();
    const lottieSource = whenTheme({
      light: require('@/assets/lottie-splash-screen-light.json'),
      dark: require('@/assets/lottie-splash-screen-dark.json'),
    });

    return (
      <LottieView
        ref={ref}
        resizeMode="cover"
        style={{ flex: 1 }}
        speed={1}
        onAnimationFailure={() => props.onAnimationEnd()}
        onAnimationFinish={() => props.onAnimationEnd()}
        autoPlay
        loop={false}
        {...props}
        source={lottieSource}
      />
    );
  }
);
