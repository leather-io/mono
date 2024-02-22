/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

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

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // TODO: either read tsconfig automatically or figure out another way of resolving tsconfig aliases.
  // If we add more aliases in tsconfig, we need to add those to this if statement.
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(context, moduleName, platform);
  }
  const symlinkResolver = MetroSymlinksResolver();
  return symlinkResolver(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
