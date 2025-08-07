const config = {
  sourceSkips: [
    'ExpoConfigRuntimeVersionIfString',
    'ExpoConfigVersions',
    'PackageJsonAndroidAndIosScriptsIfNotContainRun',
    'PackageJsonScriptsAll',
    'GitIgnore',
  ],
  fileHookTransform: (source, chunk, isEndOfFile, encoding) => {
    // Remove the google services files from the config to avoid the fingerprinting those when the file path changes based on environment.
    if (source.type === 'contents' && SourceCode.id === 'expoConfig') {
      assert(isEndOfFile, 'contents source is expected to have single chunk.');
      const config = JSON.parse(chunk);
      delete config.ios.googleServicesFile;
      delete config.android.googleServicesFile;
      console.log('config', config);
      return JSON.stringify(config);
    }
  },
};

module.exports = config;
