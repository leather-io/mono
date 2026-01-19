import { type CryptoAssetId } from '@leather.io/models';
import { isSameAssetId } from '@leather.io/utils';

import { type DisabledPairRule } from '../swap-state.types';

function matchesAssetIdRule(ruleId: CryptoAssetId | '*', assetId: CryptoAssetId): boolean {
  if (ruleId === '*') return true;
  return isSameAssetId(ruleId, assetId);
}

export function isBaseEntirelyDisabled(baseId: CryptoAssetId, rules: DisabledPairRule[]): boolean {
  return rules.some(rule => matchesAssetIdRule(rule.base, baseId) && rule.target === '*');
}

export function isPairDisabled(
  baseId: CryptoAssetId,
  targetId: CryptoAssetId,
  rules: DisabledPairRule[]
): boolean {
  return rules.some(
    rule => matchesAssetIdRule(rule.base, baseId) && matchesAssetIdRule(rule.target, targetId)
  );
}
