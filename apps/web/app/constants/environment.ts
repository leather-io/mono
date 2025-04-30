import { z } from 'zod';

// +-----------+------------+------------+--------------------+------------+
// |           | pnpm dev   | PR build   | staging.leather.io | leather.io |
// +-----------+------------+------------+--------------------+------------+
// | MODE      | development| production | production         | production |
// | TARGET    | development| branch     | staging            | production |
// +-----------+------------+------------+--------------------+------------+

const envModeSchema = z.enum(['development', 'production']);
type EnvMode = z.infer<typeof envModeSchema>;

const MODE = envModeSchema.parse(import.meta.env.MODE);

type WhenEnvModeMap<T> = Record<EnvMode, T>;
export function whenEnvMode<T>(envModeMap: WhenEnvModeMap<T>): T {
  return envModeMap[MODE];
}

const envTargetSchema = z.enum(['development', 'branch', 'staging', 'production']);
type EnvTarget = z.infer<typeof envTargetSchema>;

const TARGET = envTargetSchema.default('production').parse(import.meta.env.LEATHER_TARGET);

// New type for the map
export type WhenEnvTargetMap<T> = Record<EnvTarget, T>;
export function whenEnvTarget<T>(envTargetMap: WhenEnvTargetMap<T>): T {
  return envTargetMap[TARGET];
}
