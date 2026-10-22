import { keys } from 'remeda';
import { z } from 'zod';

import type { useFlags } from '@app/features/feature-flags';

import { VerifyUsageError } from './verify-errors';

type FeatureFlagKey = keyof ReturnType<typeof useFlags>;

const featureFlagKeyRecord = {
  releaseOnramperBuy: true,
  releaseOnramperSell: true,
  assetsRevamp: true,
  swapSbtcBridging: true,
  releaseTrendingTokens: true,
} satisfies Record<FeatureFlagKey, true>;

export const featureFlagKeys = keys(featureFlagKeyRecord);

const featureFlagKeySchema = z.enum(featureFlagKeys);
const flagValueSchema = z.enum(['true', 'false']);

export function parseFlagOverrides(pairs: readonly string[]): Record<string, boolean> {
  const overrides: Record<string, boolean> = {};
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex <= 0) {
      throw new VerifyUsageError(`--flag expects key=true|false, got "${pair}"`);
    }
    const key = featureFlagKeySchema.safeParse(pair.slice(0, separatorIndex));
    if (!key.success) {
      throw new VerifyUsageError(
        `Unknown feature flag "${pair.slice(0, separatorIndex)}". Known flags: ${featureFlagKeys.join(', ')}`
      );
    }
    const value = flagValueSchema.safeParse(pair.slice(separatorIndex + 1));
    if (!value.success) {
      throw new VerifyUsageError(`--flag ${key.data} expects true or false, got "${pair}"`);
    }
    overrides[key.data] = value.data === 'true';
  }
  return overrides;
}
