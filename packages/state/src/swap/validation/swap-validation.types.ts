import { type Money } from '@leather.io/models';

export type Field = 'baseSwapAsset' | 'targetSwapAsset' | 'baseAmount' | 'slippage' | 'nonce';

export interface CodesByField {
  baseSwapAsset: 'REQUIRED';
  targetSwapAsset: 'REQUIRED';
  baseAmount:
    | 'REQUIRED'
    | 'TOO_LARGE'
    | 'TOO_SMALL'
    | 'INVALID'
    | 'PRECISION_INVALID'
    | 'INSUFFICIENT_BALANCE';
  nonce: 'INVALID';
  slippage: 'REQUIRED' | 'INVALID' | 'OUT_OF_RANGE';
}

export type BaseAmountIssue =
  | { field: 'baseAmount'; code: 'REQUIRED' }
  | { field: 'baseAmount'; code: 'INVALID' }
  | { field: 'baseAmount'; code: 'PRECISION_INVALID'; context: { decimals: number } }
  | { field: 'baseAmount'; code: 'TOO_SMALL'; context: { minimum: Money } }
  | { field: 'baseAmount'; code: 'TOO_LARGE'; context: { maximum: Money } }
  | { field: 'baseAmount'; code: 'INSUFFICIENT_BALANCE'; context: { balance: Money } };

export type SlippageIssue =
  | { field: 'slippage'; code: 'REQUIRED' }
  | { field: 'slippage'; code: 'INVALID' }
  | { field: 'slippage'; code: 'OUT_OF_RANGE'; context: { min: number; max: number } };

export interface BaseSwapAssetIssue {
  field: 'baseSwapAsset';
  code: 'REQUIRED';
}

export interface TargetSwapAssetIssue {
  field: 'targetSwapAsset';
  code: 'REQUIRED';
}

interface NonceIssue {
  field: 'nonce';
  code: 'INVALID';
}

export type Issue =
  | BaseAmountIssue
  | SlippageIssue
  | BaseSwapAssetIssue
  | TargetSwapAssetIssue
  | NonceIssue;

type ByField = {
  [F in Field]: Extract<Issue, { field: F }> | undefined;
};

export interface ValidationResult {
  isValid: boolean;
  issues: ByField;
}
