/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

// Expo cli is built well for running the app builds on EAS but it is pretty hard to do it otherwise on other CI-s
// Thus, we reuse some parts of the `expo run:android` that are only responsible for building the application.
// This file only uses a part of packages/@expo/cli/src/run/android/runAndroidAsync.ts code
// This should be revised if we decide to update the Expo package
const { assembleAsync } = require('@expo/cli/build/src/start/platforms/android/gradle');
const { ensureNativeProjectAsync } = require('@expo/cli/build/src/run/ensureNativeProject');

const { resolveGradleProps } = require('@expo/cli/build/src/run/android//resolveGradleProps');
const { resolveLaunchPropsAsync } = require('@expo/cli/build/src/run/android/resolveLaunchProps');
const { resolveBundlerPropsAsync } = require('@expo/cli/build/src/run/resolveBundlerProps');

const path = require('path');

async function resolveOptionsAsync(projectRoot, options) {
  return {
    ...(await resolveBundlerPropsAsync(projectRoot, options)),
    ...resolveGradleProps(projectRoot, options),
    ...(await resolveLaunchPropsAsync(projectRoot)),
    variant: options.variant ?? 'debug',
    // We should not resolve to a device as we only want an apk
    device: undefined,
    buildCache: !!options.buildCache,
    install: !!options.install,
  };
}

async function buildAndroid(projectRoot, options) {
  await ensureNativeProjectAsync(projectRoot, { platform: 'android', install: options.install });

  const props = await resolveOptionsAsync(projectRoot, options);

  const androidProjectRoot = path.join(projectRoot, 'android');

  await assembleAsync(androidProjectRoot, {
    variant: props.variant,
    port: props.port,
    appName: props.appName,
    buildCache: props.buildCache,
  });
}

buildAndroid(path.resolve(__dirname, '..'), {
  buildCache: true,
  bundler: true,
  install: true,
  port: undefined,
  variant: 'release',
  device: undefined,
});
