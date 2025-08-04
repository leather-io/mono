import { z } from 'zod';

// +-----------+------------+------------+--------------------+------------+
// |           | pnpm dev   | PR build   | staging.leather.io | leather.io |
// +-----------+------------+------------+--------------------+------------+
// | MODE      | development| production | production         | production |
// | TARGET    | development| branch     | staging            | production |
// +-----------+------------+------------+--------------------+------------+

const envModeSchema = z.enum(['development', 'production']);
type EnvMode = z.infer<typeof envModeSchema>;

export const MODE = envModeSchema.parse(import.meta.env.MODE);

const leatherApiUrlSchema = z.url().optional();
export const LEATHER_API_URL = leatherApiUrlSchema.parse(import.meta.env.LEATHER_API_URL);

type WhenEnvModeMap<T> = Record<EnvMode, T>;
export function whenEnvMode<T>(envModeMap: WhenEnvModeMap<T>): T {
  return envModeMap[MODE];
}

const envTargetSchema = z.enum(['development', 'branch', 'staging', 'production']);
type EnvTarget = z.infer<typeof envTargetSchema>;

export const TARGET = envTargetSchema
  .default('production')
  .parse(import.meta.env.CLOUDFLARE_ENV ?? import.meta.env.LEATHER_TARGET);

// New type for the map
export type WhenEnvTargetMap<T> = Record<EnvTarget, T>;
export function whenEnvTarget<T>(envTargetMap: WhenEnvTargetMap<T>): T {
  return envTargetMap[TARGET];
}

if (typeof window !== 'undefined') {
  (window as any).LEATHER_ENV = {
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
  return import.meta.env.LEATHER_MOCK_MODE === 'true' || getLocalStorageMockMode();
}

export const LEATHER_MOCK_MODE = getLeatherMockMode();
