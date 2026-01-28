/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const isDevelopment = process.env.NODE_ENV === 'development';

const config = getSentryExpoConfig(projectRoot);

// add SVG compatibility
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
};

// #1 - Watch all files in the monorepo
config.watchFolders = [workspaceRoot];
// #2 - Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @noble/hashes internal imports that aren't in exports field
  // These work via file-based resolution but SDK 54 warns about them
  if (moduleName === '@noble/hashes/crypto' || moduleName === '@noble/hashes/cryptoBrowser') {
    // Use file-based resolution without warning
    return context.resolveRequest(
      {
        ...context,
        unstable_enablePackageExports: false,
      },
      moduleName,
      platform
    );
  }

  // Block @stacks/connect-ui which contains webpack-specific dynamic imports
  // that Metro can't handle (used by @bitflowlabs/core-sdk)
  if (moduleName.startsWith('@stacks/connect-ui')) {
    return {
      type: 'empty',
    };
  }

  // Use the browser version of the package for React Native
  // Tracking here: https://github.com/axios/axios/issues/6899#issuecomment-2864940687
  if (moduleName === 'axios' || moduleName.startsWith('axios/')) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ['browser'],
      },
      moduleName,
      platform
    );
  }

  // Enable fast refresh for the UI package
  if (isDevelopment) {
    if (moduleName === '@leather.io/ui/native') {
      return context.resolveRequest(
        context,
        path.resolve(workspaceRoot, 'packages/ui/src/native.ts'),
        platform
      );
    }

    if (moduleName.startsWith('@leather.io/ui/native/')) {
      const componentPath = moduleName.replace('@leather.io/ui/native/', '');
      return context.resolveRequest(
        context,
        path.resolve(workspaceRoot, 'packages/ui/src/components', componentPath),
        platform
      );
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
