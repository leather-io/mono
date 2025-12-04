import type BigNumber from 'bignumber.js';

import type { ExecutionConstraint } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { EmilySbtcLimitsResponse } from '../infrastructure/api/emily/emily-api.types';

export function getSbtcBridgeExecutionConstraints(
  txType: 'deposit' | 'withdraw',
  amount: BigNumber,
  sbtcLimits: EmilySbtcLimitsResponse
): ExecutionConstraint[] {
  if (txType === 'deposit') {
    if (sbtcLimits.perDepositMinimum && amount.isLessThan(sbtcLimits.perDepositMinimum)) {
      return [
        {
          reason: 'minimum-threshold-not-met',
          threshold: createMoney(sbtcLimits.perDepositMinimum, 'BTC'),
        },
      ];
    }
    if (sbtcLimits.perDepositCap && amount.isGreaterThan(sbtcLimits.perDepositCap)) {
      return [
        {
          reason: 'maximum-threshold-exceeded',
          threshold: createMoney(sbtcLimits.perDepositCap, 'BTC'),
        },
      ];
    }
  }

  if (txType === 'withdraw') {
    if (sbtcLimits.perWithdrawalCap && amount.isGreaterThan(sbtcLimits.perWithdrawalCap)) {
      return [
        {
          reason: 'maximum-threshold-exceeded',
          threshold: createMoney(sbtcLimits.perWithdrawalCap, 'BTC'),
        },
      ];
    }
  }

  return [];
}
