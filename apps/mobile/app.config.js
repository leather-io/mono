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
      slug: 'leather-wallet-mobile',
      owner: 'leather-wallet',
      version: '2.3.0',
      runtimeVersion: {
        policy: 'fingerprint',
      },
      platforms: ['ios', 'android'],
      orientation: 'portrait',
      icon: './src/assets/icon.png',
      scheme: 'leather',
      userInterfaceStyle: 'automatic',
      updates: {
        fallbackToCacheTimeout: 0,
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        name: 'leatherwalletmobile',
        deploymentTarget: '13.4',
        googleServicesFile: './GoogleService-Info.plist',
        bundleIdentifier: 'io.leather.mobilewallet',
        supportsTablet: false,
        usesNonExemptEncryption: false,
        entitlements: {
          'aps-environment': 'production',
        },
        infoPlist: {
          UIBackgroundModes: ['remote-notification', 'fetch'],
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
                NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPIType',
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
          '@react-native-firebase/app',
          '@react-native-firebase/messaging',
          'expo-router',
          'expo-secure-store',
          'expo-asset',
          [
            'expo-font',
            {
              fonts: [
                'src/assets/fonts/ABCDiatype-Light.otf',
                'src/assets/fonts/ABCDiatype-Medium.otf',
                'src/assets/fonts/ABCDiatype-Regular.otf',
                'src/assets/fonts/FiraCode-Retina.otf',
                'src/assets/fonts/FiraCode-Medium.otf',
                'src/assets/fonts/MarchePro-Super.otf',
                'src/assets/fonts/SpaceMono-Regular.ttf',
              ],
            },
          ],
          [
            'expo-dev-client',
            {
              launchMode: 'most-recent',
            },
          ],
          [
            'expo-build-properties',
            {
              ios: {
                useFrameworks: 'static',
                deploymentTarget: '15.1',
              },
              // android: {
              //   kotlinVersion: '1.7.20',
              //   compileSdkVersion: 34,
              //   targetSdkVersion: 34,
              //   buildToolsVersion: '34.0.0',
              // },
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
        owner: 'leather-wallet',
        experiments: {
          typedRoutes: true,
        },
      },
    },
  };
};
