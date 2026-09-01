import { defineManifest } from '@crxjs/vite-plugin';

import { buildMetadata } from './build/build-metadata';

type TargetBrowser = 'chromium' | 'firefox';

interface CreateManifestOptions {
  previewRelease: boolean;
  targetBrowser: TargetBrowser;
  version: string;
  walletEnvironment: string;
}

function generateImageAssetUrlsWithSuffix(suffix = '') {
  return {
    128: `assets/icons/leather-icon-128${suffix}.png`,
    256: `assets/icons/leather-icon-256${suffix}.png`,
    512: `assets/icons/leather-icon-512${suffix}.png`,
  };
}

function getIconSuffix(isProduction: boolean, previewRelease: boolean) {
  if (!isProduction) return '-dev';
  return previewRelease ? '-preview' : '';
}

function getManifestName(isProduction: boolean, previewRelease: boolean) {
  if (!isProduction) return 'Leather Dev';
  return previewRelease ? 'Leather Preview' : 'Leather';
}

export function createManifest({
  previewRelease,
  targetBrowser,
  version,
  walletEnvironment,
}: CreateManifestOptions) {
  const isProduction = walletEnvironment === 'production';
  const iconSuffix = getIconSuffix(isProduction, previewRelease);
  const productionCsp =
    "default-src 'none'; connect-src *; style-src 'unsafe-inline'; img-src 'self' data: https:; script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; frame-src https://*.onramper.com; frame-ancestors 'none';";
  const developmentCsp =
    "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; frame-src https://*.onramper.com https://*.onramper.dev; frame-ancestors 'none';";
  const manifest = {
    manifest_version: 3,
    version: version.includes('-') ? version.split('-')[0] : version,
    name: getManifestName(isProduction, previewRelease),
    description: 'Leather Bitcoin Wallet - Your Bitcoin Wallet for DeFi, NFTs, and dApps',
    permissions: ['contextMenus', 'storage', 'unlimitedStorage', 'notifications'],
    commands: {
      _execute_browser_action: {
        suggested_key: {
          default: 'Ctrl+Shift+B',
          mac: 'MacCtrl+Shift+B',
        },
        description: 'Opens Stacks App',
      },
    },
    host_permissions: ['*://*/*'],
    content_security_policy: {
      extension_pages: isProduction ? productionCsp : developmentCsp,
    },
    action: {
      default_title: 'Leather',
      default_popup: 'action-popup.html',
      default_icon: generateImageAssetUrlsWithSuffix(iconSuffix),
    },
    options_ui: {
      page: 'index.html',
      open_in_tab: true,
    },
    content_scripts: [
      {
        run_at: 'document_start',
        js: ['src/content-scripts/content-script.ts'],
        matches: ['*://*/*'],
        all_frames: true,
      },
    ],
    icons: generateImageAssetUrlsWithSuffix(iconSuffix),
    ...(targetBrowser === 'firefox'
      ? {
          background: {
            scripts: ['src/background/background.ts'],
          },
          browser_specific_settings: {
            gecko: {
              id: '{e22ae397-03d7-4622-bd8f-ecaca8c9b277}',
            },
          },
        }
      : {
          background: {
            service_worker: 'src/background/background.ts',
            type: 'module',
          },
        }),
  };

  Reflect.set(manifest, 'author', 'Leather Wallet, LLC');
  return manifest;
}

export function getTargetBrowser(value: string | undefined): TargetBrowser {
  return value === 'firefox' ? 'firefox' : 'chromium';
}

export default defineManifest(() =>
  createManifest({
    previewRelease: Boolean(process.env.PREVIEW_RELEASE),
    targetBrowser: getTargetBrowser(process.env.TARGET_BROWSER),
    version: buildMetadata.version,
    walletEnvironment: process.env.WALLET_ENVIRONMENT ?? 'development',
  })
);
