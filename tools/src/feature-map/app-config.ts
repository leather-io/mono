import path from 'node:path';

import { getMonorepoRoot } from '../utils/paths.js';

export interface ExpoRouterConfig {
  readonly appDir: string;
  readonly gateComponents: Readonly<Record<string, string>>;
}

export interface MaestroConfig {
  readonly flowsDirs: readonly string[];
  readonly actionsDir: string;
}

export interface FeatureMapAppConfig {
  readonly app: string;
  readonly appDir: string;
  readonly routeUrlsFile: string;
  readonly routeUrlsObjectName: string;
  readonly routerScanDirs: readonly string[];
  readonly routerExcludeFiles: readonly string[];
  readonly importAliases: Readonly<Record<string, string>>;
  readonly featureFlagsFile: string;
  readonly featureFlagsInterfaceName?: string;
  readonly rpcMethodsDir?: string;
  readonly rpcEndpointsDir: string;
  readonly featuresDir: string;
  readonly selectorsDir: string;
  readonly pageObjectsDir?: string;
  readonly mocksDir?: string;
  readonly setupMocksFunctionName?: string;
  readonly specsDir: string;
  readonly outputFile: string;
  readonly featureFlagHooks?: readonly string[];
  readonly rpcDispatchFiles?: readonly string[];
  readonly expoRouter?: ExpoRouterConfig;
  readonly maestro?: MaestroConfig;
}

const supportedApps = ['extension', 'mobile'] as const;

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

function makeMobileConfig(root: string): FeatureMapAppConfig {
  const appDir = path.join(root, 'apps', 'mobile');
  const maestroDir = path.join(appDir, 'maestro');
  return {
    app: 'mobile',
    appDir,
    routeUrlsFile: path.join(appDir, 'src/shared/app-routes.ts'),
    routeUrlsObjectName: 'AppRoutes',
    routerScanDirs: [],
    routerExcludeFiles: [],
    importAliases: {},
    featureFlagsFile: path.join(appDir, 'src/features/feature-flags/index.ts'),
    rpcEndpointsDir: path.join(root, 'packages/rpc/src/methods'),
    featuresDir: path.join(appDir, 'tests/feature-map'),
    selectorsDir: path.join(appDir, 'src/shared/selectors'),
    specsDir: path.join(appDir, 'src'),
    outputFile: path.join(root, '.claude/skills/feature-map/mobile.md'),
    featureFlagHooks: ['useBoolVariation', 'useStringVariation'],
    rpcDispatchFiles: [
      path.join(appDir, 'src/features/browser/browser/message-routing.ts'),
      path.join(appDir, 'src/features/browser/approver-sheet/browser-approver.tsx'),
    ],
    expoRouter: {
      appDir: path.join(appDir, 'src/app'),
      gateComponents: { SplashScreenGuard: 'splashScreen' },
    },
    maestro: {
      flowsDirs: [path.join(maestroDir, 'flows'), path.join(maestroDir, 'shared')],
      actionsDir: path.join(maestroDir, 'shared'),
    },
  };
}

export function getFeatureMapAppConfig(app: string): FeatureMapAppConfig {
  const root = getMonorepoRoot();
  if (app === 'extension') return makeExtensionConfig(root);
  if (app === 'mobile') return makeMobileConfig(root);
  throw new Error(
    `feature-map: unsupported app '${app}'. Supported apps: ${supportedApps.join(', ')}`
  );
}

export function toRepoRelative(file: string): string {
  return path.relative(getMonorepoRoot(), file).split(path.sep).join('/');
}
