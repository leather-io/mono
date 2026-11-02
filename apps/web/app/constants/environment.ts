import { z } from 'zod';

// +-----------+------------+------------+--------------------+------------+
// |           | pnpm dev   | PR build   | staging.leather.io | leather.io |
// +-----------+------------+------------+--------------------+------------+
// | MODE      | development| production | production         | production |
// | TARGET    | development| branch     | staging            | production |
// +-----------+------------+------------+--------------------+------------+

export const MODE = z.enum(['development', 'production']).parse(import.meta.env.MODE);

const leatherApiUrlSchema = z.url().optional();
export const LEATHER_API_URL = leatherApiUrlSchema.parse(import.meta.env.LEATHER_API_URL);

const envTargetSchema = z.enum(['development', 'branch', 'staging', 'production']);
type EnvTarget = z.infer<typeof envTargetSchema>;

export const TARGET = envTargetSchema
  .default('production')
  .parse(import.meta.env.CLOUDFLARE_ENV ?? import.meta.env.LEATHER_TARGET);

// New type for the map
type WhenEnvTargetMap<T> = Record<EnvTarget, T>;
export function whenEnvTarget<T>(envTargetMap: WhenEnvTargetMap<T>): T {
  return envTargetMap[TARGET];
}

declare global {
  interface ImportMetaEnv {
    readonly CLOUDFLARE_ENV?: string;
    readonly LEATHER_TARGET?: string;
    readonly LEATHER_API_URL?: string;
    readonly LEATHER_BITCOIN_API_URL?: string;
    readonly LEATHER_STACKS_API_URL?: string;
    readonly LEATHER_STACKS_CHAIN_ID?: string;
    readonly LEATHER_PRIVATE_NETWORK_FLAVOR?: string;
    readonly LEATHER_PRIVATE_NETWORK_NAME?: string;
    readonly LEATHER_PRIVATE_NETWORK_KEY?: string;
    readonly LEATHER_FRONT_WEB_APP_API_TOKEN?: string;
    readonly LEATHER_MIXPANEL_TOKEN?: string;
    readonly LEATHER_SENTRY_DSN?: string;
    readonly LEATHER_SHOW_MOCK_MODE_TOGGLE?: string;
  }

  interface Window {
    LEATHER_ENV?: {
      MODE: typeof MODE;
      TARGET: typeof TARGET;
      CLOUDFLARE_ENV?: string;
    };
  }
}

if (typeof window !== 'undefined') {
  window.LEATHER_ENV = {
    MODE,
    TARGET,
    CLOUDFLARE_ENV: import.meta.env.CLOUDFLARE_ENV,
  };
}

function getLocalStorageMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('leather-mock-mode') === 'true';
  } catch {
    return false;
  }
}

export function setLocalStorageMockMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('leather-mock-mode', enabled.toString());
}

export function getLeatherMockMode() {
  return getLocalStorageMockMode();
}

export const SHOW_MOCK_MODE_TOGGLE =
  import.meta.env.LEATHER_SHOW_MOCK_MODE_TOGGLE === 'true' || getLeatherMockMode();
