import deepMerge from 'deepmerge';

// Manifest can only be prod or dev
const WALLET_ENVIRONMENT =
  process.env.WALLET_ENVIRONMENT === 'production' ? 'production' : 'development';

const IS_DEV = WALLET_ENVIRONMENT === 'development';

const PREVIEW_RELEASE = process.env.PREVIEW_RELEASE;

const TARGET_BROWSER = process.env.TARGET_BROWSER ?? 'chromium';
const BIOMETRIC_UNLOCK_U0 = process.env.BIOMETRIC_UNLOCK_U0 === 'true';

const biometricUnlockU0Key =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwefS4alWEpkSHxvpWyNGUbax7+P/PYK1ylBqy4tT4Ae6+gKWS8KGfw0SSDccCmRwue8q5AevTxduH4cH3r2fkE/RXQaGAkoElJ4AjwsmeBihYynCSPSPbUrlpmxlxFXd5ll4J0u0PHXb/N9L2eFAs7LrxCESwu94nb+eTIWX7P0DJxezB7WU5BIxALjp3V9QnRKyRtofWRnBSGnW7ZQWKYLlFyMn8VhVa468kNRMMxxQ0qZzjYB6Gco08883BWFCumSF4no8ODOz4reCzfekAbEhODZvqfjzrrTOv7mbEtXmBtEiW9cLdsqc460GWPhtthbN3ckaiZ/hkLhVr9N6lQIDAQAB';

function generateImageAssetUrlsWithSuffix(suffix = '') {
  return {
    128: `assets/icons/leather-icon-128${suffix}.png`,
    256: `assets/icons/leather-icon-256${suffix}.png`,
    512: `assets/icons/leather-icon-512${suffix}.png`,
  };
}

const environmentIcons = {
  development: {
    icons: generateImageAssetUrlsWithSuffix('-dev'),
  },
  production: {
    icons: generateImageAssetUrlsWithSuffix(PREVIEW_RELEASE ? '-preview' : ''),
  },
};

const devCsp =
  "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; frame-src https://*.onramper.com https://*.onramper.dev; frame-ancestors 'none';";

const prodCsp = `default-src 'none'; connect-src *; style-src 'unsafe-inline'; img-src 'self' data: https:; script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; frame-src https://*.onramper.com; frame-ancestors 'none';`;

const contentSecurityPolicyEnvironment = {
  testing: prodCsp,
  development: devCsp,
  production: prodCsp,
};

const defaultIconEnvironment = {
  development: 'assets/icons/leather-icon-128-dev.png',
  production: 'assets/icons/leather-icon-128.png',
};

const browserSpecificConfig = {
  firefox: {
    background: {
      scripts: ['background.js'],
    },
    browser_specific_settings: {
      gecko: {
        id: '{e22ae397-03d7-4622-bd8f-ecaca8c9b277}',
      },
    },
  },
  chromium: {
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
  },
};

/**
 * @type {Manifest} manifest
 */
const manifest = {
  manifest_version: 3,
  author: 'Leather Wallet, LLC',
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
    extension_pages: contentSecurityPolicyEnvironment[WALLET_ENVIRONMENT],
  },
  web_accessible_resources: [{ resources: ['inpage.js'], matches: ['*://*/*'] }],
  action: {
    default_title: 'Leather',
    default_popup: 'action-popup.html',
    default_icon: defaultIconEnvironment[WALLET_ENVIRONMENT],
  },
  options_ui: {
    page: 'index.html',
    open_in_tab: true,
  },
  content_scripts: [
    {
      run_at: 'document_start',
      js: ['content-script.js'],
      matches: ['*://*/*'],
      all_frames: true,
    },
  ],
};

const devManifest = {
  name: 'Leather Dev',
};

const name = PREVIEW_RELEASE ? 'Leather Preview' : 'Leather';

const prodManifest = {
  name,
  icons: generateImageAssetUrlsWithSuffix(PREVIEW_RELEASE ? '-preview' : ''),
  action: {
    default_icon: `assets/icons/leather-icon-128${PREVIEW_RELEASE ? '-preview' : ''}.png`,
  },
};

const biometricUnlockU0Manifest = BIOMETRIC_UNLOCK_U0
  ? {
      key: biometricUnlockU0Key,
      name: 'Leather Biometric Unlock U0',
    }
  : {};

export default function generateManifest(packageVersion) {
  if (!packageVersion)
    throw new Error('Version number must be passed to `generateManifest` function');

  const version = packageVersion.includes('-') ? packageVersion.split('-')[0] : packageVersion;

  const releaseEnvironmentConfig = IS_DEV ? devManifest : prodManifest;

  const browserConfig = browserSpecificConfig[TARGET_BROWSER];

  return deepMerge.all([
    { version },
    manifest,
    releaseEnvironmentConfig,
    browserConfig,
    environmentIcons[WALLET_ENVIRONMENT],
    biometricUnlockU0Manifest,
  ]);
}
