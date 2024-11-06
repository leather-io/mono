export default ({ config }) => ({
  ...config,
  name: '@leather.io/ui',
  slug: 'leather-wallet_ui',
  extra: {
    storybookEnabled: process.env.STORYBOOK_ENABLED,
  },
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets-native/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets-native/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'io.leather.mobilewallet',
    buildNumber: '1.0.0',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets-native/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'io.leather.mobilewallet',
  },
  web: {
    favicon: './src/assets-native/images/favicon.png',
  },
  plugins: ['expo-font'],
});
