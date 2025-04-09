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
    fs.writeFileSync(path.join(__dirname, './GoogleService-Info.plist'), decodedPlist);
  }
}

export default () => {
  setupFirebaseEnvVariablesAndroid();
  setupFirebaseEnvVariablesIos();

  return {
    expo: {
      name: 'leather-wallet-mobile',
      owner: 'leather-wallet',
      slug: 'leather-wallet-mobile',
      version: '2.2.0',
      runtimeVersion: {
        policy: 'fingerprint',
      },
      orientation: 'portrait',
      icon: './src/assets/icon.png',
      scheme: 'leather',
      userInterfaceStyle: 'automatic',
      platforms: ['ios', 'android'],
      updates: {
        fallbackToCacheTimeout: 0,
        url: 'https://u.expo.dev/c03c1f22-be7b-4b76-aa1b-3ebf716bd2cc',
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        googleServicesFile: './GoogleService-Info.plist',
        entitlements: {
          'aps-environment': 'production',
        },
        infoPlist: {
          UIBackgroundModes: ['remote-notification', 'fetch'],
          NSCameraUsageDescription:
            'This app uses the camera to scan QR codes for sending transactions.',
        },
        icon: './src/assets/icon.png',
        bundleIdentifier: 'io.leather.mobilewallet',
        supportsTablet: false,
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
        icon: './src/assets/icon.png',
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
          'expo-build-properties',
          {
            ios: {
              useFrameworks: 'static',
            },
          },
        ],
        [
          'expo-font',
          {
            fonts: [
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/ABCDiatype-Light.otf',
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/ABCDiatype-Medium.otf',
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/ABCDiatype-Regular.otf',
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/FiraCode-Retina.otf',
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/FiraCode-Medium.otf',
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/MarchePro-Super.otf',
              'node_modules/@leather.io/ui/dist-native/src/assets-native/fonts/SpaceMono-Regular.ttf',
            ],
          },
        ],
        'expo-router',
        'expo-secure-store',
        'expo-asset',
        [
          'expo-dev-client',
          {
            launchMode: 'most-recent',
          },
        ],
        // '@react-native-firebase/app',
        // '@react-native-firebase/messaging',
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
      },
    },
  };
};
