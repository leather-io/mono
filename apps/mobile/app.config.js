import fs from 'fs';
import path from 'path';

// Setup EAS env variables for Firebase
function setupFirebaseEnvVariablesAndroid() {
  const googleServicesPathAndroid = process.env.GOOGLE_SERVICES_JSON;
  const googleServicesB64 = process.env.GOOGLE_SERVICES_JSON_B64;
  if (googleServicesPathAndroid && fs.existsSync(googleServicesPathAndroid)) {
    fs.copyFileSync(googleServicesPathAndroid, path.join(__dirname, './google-services.json'));
  }

  if (googleServicesB64) {
    const decodedJson = Buffer.from(googleServicesB64, 'base64').toString('utf-8');
    fs.writeFileSync(path.join(__dirname, './google-services.json'), decodedJson);
  }
}

function setupFirebaseEnvVariablesIos() {
  const googleServicesPathIos = process.env.GOOGLE_SERVICES_INFO_PLIST;
  const googleServicesB64 = process.env.GOOGLE_SERVICES_INFO_PLIST_B64;
  if (googleServicesPathIos && fs.existsSync(googleServicesPathIos)) {
    fs.copyFileSync(googleServicesPathIos, path.join(__dirname, './GoogleService-Info.plist'));
  }

  if (googleServicesB64) {
    const decodedPlist = Buffer.from(googleServicesB64, 'base64').toString('utf-8');
    fs.writeFileSync(
      path.join(__dirname, 'ios/leatherwalletmobile/GoogleService-Info.plist'),
      decodedPlist
    );
  }
}

export default () => {
  setupFirebaseEnvVariablesAndroid();
  setupFirebaseEnvVariablesIos();
  const easUpdatesEnabled = !!process.env.EXPO_ENABLE_UPDATES;

  const updates = easUpdatesEnabled
    ? {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/c03c1f22-be7b-4b76-aa1b-3ebf716bd2cc',
      codeSigningCertificate: './certs/certificate.pem',
      codeSigningMetadata: {
        keyid: 'main',
        alg: 'rsa-v1_5-sha256',
      },
    }
    : undefined;

  return {
    expo: {
      name: 'Leather',
      owner: 'leather-wallet',
      slug: 'leather-wallet-mobile',
      version: '2.54.5', // x-release-please-version
      runtimeVersion: {
        policy: 'fingerprint',
      },
      orientation: 'portrait',
      icon: './src/assets/icon.png',
      scheme: 'leather',
      userInterfaceStyle: 'automatic',
      platforms: ['ios', 'android'],
      updates,
      assetBundlePatterns: ['**/*'],
      ios: {
        config: {
          usesNonExemptEncryption: false,
        },
        deploymentTarget: '15.1',
        bundleIdentifier: 'io.leather.mobilewallet',
        googleServicesFile: './GoogleService-Info.plist',
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
        package: 'io.leather.mobilewallet',
        googleServicesFile: './google-services.json',
        edgeToEdgeEnabled: true,
        adaptiveIcon: {
          foregroundImage: './src/assets/adaptive-icon.png',
          backgroundColor: '#12100F',
        },
        notification: {
          icon: './src/assets/android-notification-icon.png',
          color: '#12100F',
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
        '@react-native-firebase/app',
        '@react-native-firebase/messaging',
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
    },
  };
};
