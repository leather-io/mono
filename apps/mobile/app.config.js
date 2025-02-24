import fs from 'fs';
import path from 'path';

// Setup EAS env variables for Firebase
function setupFirebaseEnvVariables() {
  const googleServicesPathIos = process.env.GOOGLE_SERVICES_INFO_PLIST;
  const googleServicesPathAndroid = process.env.GOOGLE_SERVICES_JSON;

  if (googleServicesPathAndroid && fs.existsSync(googleServicesPathAndroid)) {
    fs.copyFileSync(
      googleServicesPathAndroid,
      path.join(__dirname, './android/app/google-services.json')
    );
  }

  if (googleServicesPathIos && fs.existsSync(googleServicesPathIos)) {
    fs.copyFileSync(
      googleServicesPathIos,
      path.join(__dirname, './ios/leatherwalletmobile/GoogleService-Info.plist')
    );
  }
}

export default () => {
  setupFirebaseEnvVariables();

  return {
    expo: {
      name: 'Leather',
      slug: 'leather-wallet-mobile',
      version: '2.0.0',
      orientation: 'portrait',
      icon: './src/assets/icon.png',
      scheme: 'myapp',
      userInterfaceStyle: 'automatic',
      updates: {
        fallbackToCacheTimeout: 0,
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        googleServicesFile: './ios/leatherwalletmobile/GoogleService-Info.plist',
        entitlements: {
          'aps-environment': 'production',
        },
        infoPlist: {
          UIBackgroundModes: ['remote-notification', 'fetch'],
        },
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
        googleServicesFile: './android/app/google-services.json',
        icon: './src/assets/icon.png',
        adaptiveIcon: {
          foregroundImage: './src/assets/adaptive-icon.png',
          backgroundColor: '#12100F',
        },
        package: 'io.leather.mobilewallet',
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
        [
          'expo-asset',
          {
            assets: ['src/scripts/injected-provider.js'],
          },
        ],
        [
          'expo-dev-client',
          {
            launchMode: 'most-recent',
          },
        ],
        '@react-native-firebase/app',
        '@react-native-firebase/messaging',
      ],
      extra: {
        router: {
          origin: false,
        },
        eas: {
          projectId: 'c03c1f22-be7b-4b76-aa1b-3ebf716bd2cc',
        },
      },
      owner: 'leather-wallet',
      experiments: {
        typedRoutes: true,
      },
    },
  };
};
