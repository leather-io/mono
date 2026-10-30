import path from 'node:path';

import { getMonorepoRoot } from '../utils/paths.js';
import { verifyPageObjectNames } from '../verify/verify-contract.js';

export interface FeatureMapAppConfig {
  readonly app: string;
  readonly appDir: string;
  readonly routeUrlsFile: string;
  readonly routeUrlsObjectName: string;
  readonly routerScanDirs: readonly string[];
  readonly routerExcludeFiles: readonly string[];
  readonly importAliases: Readonly<Record<string, string>>;
  readonly verifyPageObjects: readonly string[];
  readonly exclusiveMocks: readonly (readonly [string, string])[];
  readonly featureFlagsFile: string;
  readonly featureFlagsInterfaceName: string;
  readonly rpcMethodsDir: string;
  readonly rpcEndpointsDir: string;
  readonly featuresDir: string;
  readonly selectorsDir: string;
  readonly pageObjectsDir: string;
  readonly mocksDir: string;
  readonly setupMocksFunctionName: string;
  readonly verifyMockRegistryFile: string;
  readonly specsDir: string;
  readonly outputFile: string;
  readonly persistWhitelistFile: string;
  readonly persistWhitelistName: string;
  readonly networkIdsFile: string;
  readonly networkIdsObjectName: string;
  readonly rpcCatalogDir: string;
}

const supportedApps = ['extension'] as const;

function makeExtensionConfig(root: string): FeatureMapAppConfig {
  const appDir = path.join(root, 'apps', 'extension');
  return {
    app: 'extension',
    appDir,
    routeUrlsFile: path.join(appDir, 'src/shared/route-urls.ts'),
    routeUrlsObjectName: 'RouteUrls',
    routerScanDirs: [path.join(appDir, 'src/app')],
    routerExcludeFiles: [
      path.join(appDir, 'src/app/routes/components/modal-background-wrapper.tsx'),
    ],
    importAliases: { '@app/': path.join(appDir, 'src/app/') },
    verifyPageObjects: verifyPageObjectNames,
    exclusiveMocks: [
      ['mockMixedUtxosForSend', 'mockNativeSegwitOnlyUtxosForSend'],
      ['mockEmptyStacksBalancesRequest', 'mockMainnetTestAccountStacksBalancesRequest'],
      ['mockMainnetTestAccountEmptyUtxosRequests', 'mockMainnetTestAccountBitcoinRequests'],
    ],
    featureFlagsFile: path.join(appDir, 'src/app/features/feature-flags/index.tsx'),
    featureFlagsInterfaceName: 'FeatureFlags',
    rpcMethodsDir: path.join(appDir, 'src/background/messaging/rpc-methods'),
    rpcEndpointsDir: path.join(root, 'packages/rpc/src/methods'),
    featuresDir: path.join(appDir, 'tests/feature-map'),
    selectorsDir: path.join(appDir, 'tests/selectors'),
    pageObjectsDir: path.join(appDir, 'tests/page-object-models'),
    mocksDir: path.join(appDir, 'tests/mocks'),
    setupMocksFunctionName: 'setupMockApis',
    verifyMockRegistryFile: path.join(appDir, 'tests/verify/mock-registry.ts'),
    specsDir: path.join(appDir, 'tests/specs'),
    outputFile: path.join(root, '.claude/skills/feature-map/extension.md'),
    persistWhitelistFile: path.join(appDir, 'src/shared/storage/persist-whitelist.ts'),
    persistWhitelistName: 'persistWhitelist',
    networkIdsFile: path.join(root, 'packages/models/src/network/network.model.ts'),
    networkIdsObjectName: 'WalletDefaultNetworkConfigurationIds',
    rpcCatalogDir: path.join(root, 'apps/test-app/src/methods'),
  };
}

export function getFeatureMapAppConfig(app: string): FeatureMapAppConfig {
  const root = getMonorepoRoot();
  if (app === 'extension') return makeExtensionConfig(root);
  throw new Error(
    `feature-map: unsupported app '${app}'. Supported apps: ${supportedApps.join(', ')}`
  );
}

export function toRepoRelative(file: string): string {
  return path.relative(getMonorepoRoot(), file).split(path.sep).join('/');
}
