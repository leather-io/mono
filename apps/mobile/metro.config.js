/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const MetroSymlinksResolver = require("@rnx-kit/metro-resolver-symlinks");


const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// #1 - Watch all files in the monorepo
config.watchFolders = [workspaceRoot];
// #2 - Force resolving nested modules to the folders below
config.resolver.disableHierarchicalLookup = true;
// #3 - Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules", ".pnpm", "node_modules"),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    // Logic to resolve the module name to a file path...
    // NOTE: Throw an error if there is no resolution.
    const relativePath = moduleName.replace("@/", "src/");
    const filePathWithoutExt = path.resolve(__dirname, relativePath);
    const filePaths = config.resolver.sourceExts
      .map(ext => {
        const filePathWithExt = `${filePathWithoutExt}.${ext}`;
        if (context.doesFileExist(filePathWithExt)) {
          return filePathWithExt;
        }
        return;
      })
      .filter(filePathWithExt => filePathWithExt);

    if (filePaths.length === 0) throw new Error("File cannot be found: " + filePathWithoutExt);

    return {
      filePath: filePaths[0],
      type: "sourceFile",
    };
  }
  const symlingResolver = MetroSymlinksResolver();
  return symlingResolver(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
