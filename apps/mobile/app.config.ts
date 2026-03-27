import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'Leather',
    owner: 'leather-wallet',
    slug: 'leather-wallet-mobile',
    version: '2.104.2', // x-release-please-version
    runtimeVersion: {
      policy: 'fingerprint',
    },
    notification: {
      icon: './src/assets/icon.png',
    },
    updates: {
      url: 'https://u.expo.dev/c03c1f22-be7b-4b76-aa1b-3ebf716bd2cc',
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
      associatedDomains: ['applinks:connect.leather.io'],
      entitlements: {
        'aps-environment': 'production',
        'com.apple.developer.associated-domains': [
          'applinks:connect.leather.io',
          'webcredentials:connect.leather.io',
        ],
      },
      infoPlist: {
        UIBackgroundModes: ['remote-notification', 'fetch'],
        NSCameraUsageDescription:
          'This app uses the camera to scan QR codes for sending transactions.',
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ['leather', 'exp+leather'],
          },
        ],
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
      intentFilters: [
        {
          action: 'VIEW',
          category: ['DEFAULT', 'BROWSABLE'],
          data: {
            scheme: 'https',
            host: 'connect.leather.io',
          },
          autoVerify: true,
        },
      ],
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
      [
        // 'expo-build-properties' must be first. See https://github.com/invertase/react-native-firebase/issues/8657#issuecomment-3312082933

        'expo-build-properties',
        {
          ios: {
            /**
             * Helps RNFB to compile correctly on iOS, since firebase-ios-sdk requires use_frameworks
             * @see https://rnfirebase.io/#configure-react-native-firebase-modules
             */
            useFrameworks: 'static',
            deploymentTarget: '15.1',
            /**
             * RNFirebase iOS build fix using static linking (maintainer-recommended).
             * This `forceStaticLinking` configuration follows the Expo maintainer’s suggested solution:
             * https://github.com/expo/expo/issues/39607#issuecomment-3337284928
             * ⚠️ IMPORTANT: If installing/removing react-native-firebase npm packages, ensure you also update this list.
             * - Look for `s.name` property in node_modules/@react-native-firebase/<module>/<module>.podspec to get the Pod name.
             */
            forceStaticLinking: ['RNFBApp', 'RNFBMessaging'],
          },
        },
      ],
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
        'expo-font',
        {
          fonts: [
            'node_modules/@leather.io/ui/src/assets-native/fonts/FiraCode-Retina.otf',
            'node_modules/@leather.io/ui/src/assets-native/fonts/FiraCode-Medium.otf',
            'node_modules/@leather.io/ui/src/assets-native/fonts/ABCDiatype-Regular.otf',
            'node_modules/@leather.io/ui/src/assets-native/fonts/ABCDiatype-Light.otf',
            'node_modules/@leather.io/ui/src/assets-native/fonts/ABCDiatype-Medium.otf',
            'node_modules/@leather.io/ui/src/assets-native/fonts/MarchePro-Super.otf',
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
      [
        'expo-alternate-app-icons',
        [
          {
            name: 'Icon1',
            ios: './src/assets/icon-1.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-1.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon2',
            ios: './src/assets/icon-2.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-2.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon3',
            ios: './src/assets/icon-3.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-3.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon4',
            ios: './src/assets/icon-4.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-4.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon5',
            ios: './src/assets/icon-5.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-5.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon6',
            ios: './src/assets/icon-6.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-6.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon7',
            ios: './src/assets/icon-7.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-7.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon8',
            ios: './src/assets/icon-8.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-8.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon9',
            ios: './src/assets/icon-9.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-9.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon10',
            ios: './src/assets/icon-10.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-10.png',
              backgroundColor: '#12100F',
            },
          },
          {
            name: 'Icon11',
            ios: './src/assets/icon-11.png',
            android: {
              foregroundImage: './src/assets/adaptive-icon-11.png',
              backgroundColor: '#12100F',
            },
          },
        ],
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
      autolinkingModuleResolution: true,
    },
  };
};
