import { PayloadType, StacksTransactionWire } from '@stacks/transactions';

import { FeeRateTransactionFeeQuote, TransactionFeeTier } from '@leather.io/models';
import { isSip9TransferContactCall, isSip10TransferContactCall } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { HiroTransactionFeeEstimateResponse } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { StacksFeeConfig } from '../infrastructure/app-config/app-config.service';
import { calculateFeeRate, enforceFeeBounds, enforceFeeMinimum } from './transaction-fees.utils';

export type StacksPayloadTypeFeeConfig = StacksFeeConfig['transfers'];

/* 
  Takes default fees for each tier for given Tx payload type.
*/
export function getStacksTxFeeDefaultAmounts(
  unsignedTx: StacksTransactionWire,
  config: StacksFeeConfig
): Record<TransactionFeeTier, number> {
  const payloadTypeFees = getStacksTxPayloadTypeFees(unsignedTx, config);
  return {
    high: payloadTypeFees.high.default,
    standard: payloadTypeFees.standard.default,
    low: payloadTypeFees.low.default,
  };
}

export function getStacksTxPayloadTypeFees(
  unsignedTx: StacksTransactionWire,
  config: StacksFeeConfig
) {
  switch (unsignedTx.payload.payloadType) {
    case PayloadType.TokenTransfer:
      return config.transfers;
    case PayloadType.ContractCall:
      return isSip10TransferContactCall(unsignedTx) || isSip9TransferContactCall(unsignedTx)
        ? config.sipTokenSends
        : config.contractCalls;
    case PayloadType.SmartContract:
    case PayloadType.VersionedSmartContract:
      return config.contractDeployments;
    default:
      return config.transfers;
  }
}

/* 
  Maps Hiro Stacks API fee estimates to internal fee tiers.
  - Enforces aboslute min/max bounds for each tier.
  - Enforces Stacks network minimum relay fee.
 */
export function getStacksTxFeeBoundedEstimates(
  feeApiEstimates: HiroTransactionFeeEstimateResponse,
  estimatedTxSize: number,
  unsignedTx: StacksTransactionWire,
  config: StacksFeeConfig
): Record<TransactionFeeTier, number> {
  const payloadTypeConfig = getStacksTxPayloadTypeFees(unsignedTx, config);
  const minRelayFee = config.minimumRelayFeeRate * estimatedTxSize;
  return {
    low: enforceFeeMinimum(
      enforceFeeBounds(
        feeApiEstimates.estimations?.[0]?.fee ?? payloadTypeConfig.low.default,
        payloadTypeConfig.low.minimum,
        payloadTypeConfig.low.maximum
      ),
      minRelayFee
    ),
    standard: enforceFeeMinimum(
      enforceFeeBounds(
        feeApiEstimates.estimations?.[1]?.fee ?? payloadTypeConfig.standard.default,
        payloadTypeConfig.standard.minimum,
        payloadTypeConfig.standard.maximum
      ),
      minRelayFee
    ),
    high: enforceFeeMinimum(
      enforceFeeBounds(
        feeApiEstimates.estimations?.[2]?.fee ?? payloadTypeConfig.high.default,
        payloadTypeConfig.high.minimum,
        payloadTypeConfig.high.maximum
      ),
      minRelayFee
    ),
  };
}

export function createStacksTxFeeQuote(
  fee: number,
  estimatedTxSize: number
): FeeRateTransactionFeeQuote {
  return {
    type: 'feeRate',
    value: createMoney(fee, 'STX'),
    rate: calculateFeeRate(fee, estimatedTxSize),
    rateUnit: 'µSTX/byte',
    estimatedTxSize,
    sizeUnit: 'byte',
  };
}
