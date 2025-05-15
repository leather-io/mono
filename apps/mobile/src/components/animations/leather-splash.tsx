import { RefObject, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

import { useSettings } from '@/store/settings/settings';
import LottieView, { LottieViewProps } from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export interface SplashLottieView {
  start(): void;
}

interface LeatherSplashProps {
  splashRef: RefObject<SplashLottieView | null>;
  type: 'locked' | 'unlocked';
}

export function LeatherSplash(props: Partial<Omit<LottieViewProps, 'ref'>> & LeatherSplashProps) {
  const { whenTheme } = useSettings();
  const ref = useRef<LottieView>(null);
  // all of these hoops to be able to run lottie on new arch, eh
  const [speed, setSpeed] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [mode, setMode] = useState<LottieViewProps['renderMode']>();

  const lottieSource = whenTheme({
    light: require('@/assets/lottie-splash-screen-light.json'),
    dark: require('@/assets/lottie-splash-screen-dark.json'),
  });
  const lottieLockedSource = whenTheme({
    light: require('@/assets/lottie-locked-splash-screen-light.json'),
    dark: require('@/assets/lottie-locked-splash-screen-dark.json'),
  });
  useImperativeHandle(props.splashRef, () => ({
    start() {
      setSpeed(1);
      setAutoPlay(true);
      setMode('HARDWARE');
      ref.current?.play();
    },
  }));
  return (
    <LottieView
      resizeMode="cover"
      style={{ width, height }}
      speed={speed}
      loop={false}
      ref={ref}
      autoPlay={autoPlay}
      renderMode={mode}
      {...props}
      source={props.type === 'unlocked' ? lottieSource : lottieLockedSource}
    />
  );
}

LeatherSplash.displayName = 'LeatherSplash';
