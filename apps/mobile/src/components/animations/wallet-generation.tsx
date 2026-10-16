import walletCreationDarkAnimation from '@/assets/wallet-creation-animation-dark.json';
import walletCreationLightAnimation from '@/assets/wallet-creation-animation-light.json';
import { useSettings } from '@/store/settings/settings';
import LottieView from 'lottie-react-native';

export function WalletGenerationAnimation() {
  const { whenTheme } = useSettings();
  const animationSource = whenTheme({
    light: walletCreationLightAnimation,
    dark: walletCreationDarkAnimation,
  });
  return (
    <LottieView
      resizeMode="cover"
      style={{ flex: 1 }}
      speed={1}
      source={animationSource}
      autoPlay
      loop={false}
    />
  );
}
