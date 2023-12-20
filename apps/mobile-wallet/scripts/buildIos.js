/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

// Expo cli is built well for running the app builds on EAS but it is pretty hard to do it otherwise on other CI-s
// Thus, we reuse some parts of the `expo run:ios` that are only responsible for building the application.
// This file only uses a part of packages/@expo/cli/src/run/ios/runIosAsync.ts code
// This should be revised if we decide to update the Expo package
const { ensureNativeProjectAsync } = require('@expo/cli/build/src/run/ensureNativeProject');
const { maybePromptToSyncPodsAsync } = require('@expo/cli/build/src/utils/cocoapods');
const { resolveOptionsAsync } = require('@expo/cli/build/src/run/ios/options/resolveOptions');
const { profile } = require('@expo/cli/build/src/utils/profile');
const XcodeBuild = require('@expo/cli/build/src/run/ios/XcodeBuild');
const path = require('path');
const fs = require('fs');

async function buildIos(projectRoot, options) {
  if (await ensureNativeProjectAsync(projectRoot, { platform: 'ios', install: true })) {
    await maybePromptToSyncPodsAsync(projectRoot);
  }

  // Resolve the CLI arguments into useable options.
  const props = await resolveOptionsAsync(projectRoot, options);

  // Spawn the `xcodebuild` process to create the app binary.
  const buildOutput = await XcodeBuild.buildAsync(props);

  // Find the path to the built app binary, this will be used to install the binary
  // on a device.
  const binaryPath = await profile(XcodeBuild.getAppBinaryPath)(buildOutput);

  fs.writeFile('./iosBuildPath', binaryPath, () => {});
}

buildIos(path.resolve(__dirname, '..'), {
  buildCache: true,
  install: true,
  bundler: false,
  port: undefined,
  device: undefined,
  scheme: undefined,
  configuration: 'Release',
});
