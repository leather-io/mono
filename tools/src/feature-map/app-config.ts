import path from 'node:path';

import { getMonorepoRoot } from '../utils/paths.js';
import { webFeatureFlags, webFeatureGates, webFeatureSessions } from './feature-entry.js';

export interface FeatureMapAppConfig {
  readonly app: string;
  readonly appDir: string;
  readonly routeUrlsFile: string;
  readonly routeUrlsObjectName: string;
  readonly routerScanDirs: readonly string[];
  readonly routerExcludeFiles: readonly string[];
  readonly importAliases: Readonly<Record<string, string>>;
  readonly featureFlagsFile?: string;
  readonly featureFlagsInterfaceName?: string;
  readonly rpcMethodsDir?: string;
  readonly rpcEndpointsDir?: string;
  readonly featuresDir: string;
  readonly selectorsDir: string;
  readonly pageObjectsDir?: string;
  readonly mocksDir?: string;
  readonly setupMocksFunctionName?: string;
  readonly specsDir: string;
  readonly outputFile: string;
  readonly routeConfigFile?: string;
  readonly layoutGates?: Readonly<Record<string, string>>;
  readonly conditionFlags?: Readonly<Record<string, string>>;
  readonly gates?: readonly string[];
  readonly sessions?: readonly string[];
  readonly flags?: readonly string[];
  readonly readySelectorRequired?: boolean;
  readonly routeKeysRequired?: boolean;
}

const supportedApps = ['extension', 'web'] as const;

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
    featureFlagsFile: path.join(appDir, 'src/app/features/feature-flags/index.tsx'),
    featureFlagsInterfaceName: 'FeatureFlags',
    rpcMethodsDir: path.join(appDir, 'src/background/messaging/rpc-methods'),
    rpcEndpointsDir: path.join(root, 'packages/rpc/src/methods'),
    featuresDir: path.join(appDir, 'tests/feature-map'),
    selectorsDir: path.join(appDir, 'tests/selectors'),
    pageObjectsDir: path.join(appDir, 'tests/page-object-models'),
    mocksDir: path.join(appDir, 'tests/mocks'),
    setupMocksFunctionName: 'setupMockApis',
    specsDir: path.join(appDir, 'tests/specs'),
    outputFile: path.join(root, '.claude/skills/feature-map/extension.md'),
  };
}

const webProductionModeCondition = "import.meta.env.MODE !== 'production'";

function makeWebConfig(root: string): FeatureMapAppConfig {
  const appDir = path.join(root, 'apps', 'web');
  return {
    app: 'web',
    appDir,
    routeUrlsFile: path.join(appDir, 'app/route-urls.ts'),
    routeUrlsObjectName: 'RouteUrls',
    routerScanDirs: [],
    routerExcludeFiles: [],
    importAliases: { '~/': path.join(appDir, 'app/') },
    featuresDir: path.join(appDir, 'tests/feature-map'),
    selectorsDir: path.join(appDir, 'tests/selectors'),
    mocksDir: path.join(appDir, 'app/mocks'),
    specsDir: path.join(appDir, 'tests'),
    outputFile: path.join(root, '.claude/skills/feature-map/web.md'),
    routeConfigFile: path.join(appDir, 'app/routes.ts'),
    layoutGates: {
      'pages/multisig/multisig.layout.tsx': 'multisigLayout',
      'pages/playground/playground.layout.tsx': 'playgroundLayout',
    },
    conditionFlags: { [webProductionModeCondition]: 'nonProductionBuild' },
    gates: webFeatureGates,
    sessions: webFeatureSessions,
    flags: webFeatureFlags,
    readySelectorRequired: false,
    routeKeysRequired: true,
  };
}

export function getFeatureMapAppConfig(app: string): FeatureMapAppConfig {
  const root = getMonorepoRoot();
  if (app === 'extension') return makeExtensionConfig(root);
  if (app === 'web') return makeWebConfig(root);
  throw new Error(
    `feature-map: unsupported app '${app}'. Supported apps: ${supportedApps.join(', ')}`
  );
}

export function toRepoRelative(file: string): string {
  return path.relative(getMonorepoRoot(), file).split(path.sep).join('/');
}
