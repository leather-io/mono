import LottieView from 'lottie-react-native';

export function WalletGenerationAnimation() {
  return (
    <LottieView
      resizeMode="cover"
      style={{ flex: 1 }}
      speed={1}
      source={require('@/assets/wallet-creation-animation.json')}
      autoPlay
      loop={false}
    />
  );
}
