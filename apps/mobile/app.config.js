export default ({ config }) => ({
  ...config,
  name: '@leather-wallet/mobile',
  slug: 'leather-wallet_mobile',
  extra: {
    storybookEnabled: process.env.STORYBOOK_ENABLED,
  },
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.leather.mobilewallet',
    buildNumber: '1.0.0',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.leather.mobilewallet',
  },
  web: {
    favicon: './src/assets/favicon.png',
  },
  plugins: ['expo-font'],
});
