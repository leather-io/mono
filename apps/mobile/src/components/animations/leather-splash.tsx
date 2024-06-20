import LottieView from 'lottie-react-native';

interface LeatherSplashProps {
  onAnimationEnd(): void;
}
export function LeatherSplash({ onAnimationEnd }: LeatherSplashProps) {
  return (
    <LottieView
      resizeMode="cover"
      style={{ flex: 1 }}
      speed={1}
      source={require('@/assets/splashScreenLottie.json')}
      onAnimationFailure={() => onAnimationEnd()}
      onAnimationFinish={() => onAnimationEnd()}
      autoPlay
      loop={false}
    />
  );
}
