module.exports = {
  // Use Expo's recommended skips for noisy, non-native-affecting fields.
  sourceSkips: [
    'ExpoConfigRuntimeVersionIfString',
    'ExpoConfigVersions',
    'PackageJsonAndroidAndIosScriptsIfNotContainRun',
    'PackageJsonScriptsAll',
    'GitIgnore',
  ],
  // Ignore env-specific native config and assets that you don't want to
  // trigger a "native change" (and therefore a new EAS build).
  ignorePaths: [
    // iOS / Android Firebase config that varies per environment.
    '**/GoogleService-Info*.plist',
    '**/google-services*.json',
    // App icon that you tweak frequently but don't need to
    // force a new native build for.
    'src/assets/adaptive-icon.png',
  ],
};
