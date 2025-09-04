import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'Leather',
    owner: 'leather-wallet',
    slug: 'leather-wallet-mobile',
    version: '2.70.0', // x-release-please-version
    runtimeVersion: {
      policy: 'fingerprint',
    },
    notification: {
      icon: './src/assets/icon.png',
    },
    orientation: 'portrait',
    icon: './src/assets/icon.png',
    scheme: 'leather',
    userInterfaceStyle: 'automatic',
    platforms: ['ios', 'android'],
    assetBundlePatterns: ['**/*'],
    ios: {
      ...config.ios,
      config: {
        usesNonExemptEncryption: false,
      },
      bundleIdentifier: 'io.leather.mobilewallet',
      googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST ?? './GoogleService-Info.plist',
      supportsTablet: false,
      entitlements: {
        'aps-environment': 'production',
      },
      infoPlist: {
        UIBackgroundModes: ['remote-notification', 'fetch'],
        NSCameraUsageDescription:
          'This app uses the camera to scan QR codes for sending transactions.',
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
          },
        ],
        NSPrivacyCollectedDataTypes: [],
        NSPrivacyTracking: false,
      },
      splash: {
        image: './src/assets/light-mode-splash.png',
        resizeMode: 'contain',
        backgroundColor: '#12100F',
        dark: {
          image: './src/assets/dark-mode-splash.png',
          resizeMode: 'contain',
          backgroundColor: '#716A60',
        },
      },
    },
    android: {
      ...config.android,
      package: 'io.leather.mobilewallet',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: './src/assets/adaptive-icon.png',
        backgroundColor: '#12100F',
      },
      splash: {
        image: './src/assets/light-mode-splash.png',
        resizeMode: 'contain',
        backgroundColor: '#12100F',
        dark: {
          image: './src/assets/dark-mode-splash.png',
          resizeMode: 'contain',
          backgroundColor: '#716A60',
        },
      },
    },
    plugins: [
      '@react-native-firebase/messaging',
      '@react-native-firebase/app',
      [
        '@sentry/react-native/expo',
        {
          project: 'leather-mobile',
          organization: 'trust-machines',
          url: 'https://trust-machines.sentry.io',
        },
      ],
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID biometric data.',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/FiraCode-Retina.otf',
            'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/FiraCode-Medium.otf',
            'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/ABCDiatype-Regular.otf',
            'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/ABCDiatype-Light.otf',
            'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/ABCDiatype-Medium.otf',
            'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/MarchePro-Super.otf',
          ],
        },
      ],
      'expo-router',
      'expo-secure-store',
      ['expo-asset'],
      [
        'expo-dev-client',
        {
          launchMode: 'most-recent',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Camera access enables scanning addresses or opening websites.',
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'c03c1f22-be7b-4b76-aa1b-3ebf716bd2cc',
      },
    },
    experiments: {
      typedRoutes: true,
      buildCacheProvider: 'eas',
    },
  };
};
