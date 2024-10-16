/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { updateInjectedProvider } = require('./scripts/update-injected-provider.cjs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// add SVG compatibility
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['require', 'node', 'import'],
};

config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
};

// #1 - Watch all files in the monorepo
config.watchFolders = [workspaceRoot];
// #2 - Force resolving nested modules to the folders below
config.resolver.disableHierarchicalLookup = true;
// #3 - Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules', '.pnpm', 'node_modules'),
];
const symlinkResolver = MetroSymlinksResolver({
  experimental_retryResolvingFromDisk: 'force',
});

function prepareDebounce(time) {
  let timeout = null;
  return callback => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(callback, time);
  };
}

const debounce = prepareDebounce(200);

updateInjectedProvider();

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // TODO: either read tsconfig automatically or figure out another way of resolving tsconfig aliases.
  // If we add more aliases in tsconfig, we need to add those to this if statement.
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(context, moduleName, platform);
  }

  if (moduleName === 'axios') {
    return context.resolveRequest(context, moduleName, platform);
  }

  // Ensures resolution of the browser version of `@noble/hashes`s exports.
  // Without this the node export is resolved, resulting in
  // `crypto.getRandomValues` exceptions
  // https://github.com/paulmillr/noble-hashes/blob/main/package.json#L47-L50
  if (moduleName === '@noble/hashes/crypto') {
    return context.resolveRequest(context, moduleName, platform);
  }
  if (moduleName === 'axios') {
    return context.resolveRequest(context, moduleName, platform);
  }
  debounce(updateInjectedProvider);

  return symlinkResolver(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
