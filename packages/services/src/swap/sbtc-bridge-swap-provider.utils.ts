import { Cl, Pc } from '@stacks/transactions';
import type BigNumber from 'bignumber.js';

import { deconstructBtcAddress } from '@leather.io/bitcoin';
import type { ExecutionConstraint, Money, NetworkModes } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { EmilySbtcLimitsResponse } from '../infrastructure/api/emily/emily-api.types';

export type SbtcBridgeTxType = 'deposit' | 'withdrawal';

export const sbtcStacksAddressMap = {
  mainnet: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
  testnet: 'SNGWPN3XDAQE673MXYXF81016M50NHF5X5PWWM70',
};

export interface getSbtcBridgeExecutionConstraintsArgs {
  bridgeTxType: SbtcBridgeTxType;
  bridgeAmount: BigNumber;
  sbtcLimits: EmilySbtcLimitsResponse;
}

export function getSbtcBridgeExecutionConstraints({
  bridgeTxType,
  bridgeAmount,
  sbtcLimits,
}: getSbtcBridgeExecutionConstraintsArgs): ExecutionConstraint[] {
  if (bridgeTxType === 'deposit') {
    if (sbtcLimits.perDepositMinimum && bridgeAmount.isLessThan(sbtcLimits.perDepositMinimum)) {
      return [
        {
          reason: 'minimum-threshold-not-met',
          threshold: createMoney(sbtcLimits.perDepositMinimum, 'BTC'),
        },
      ];
    }
    if (sbtcLimits.perDepositCap && bridgeAmount.isGreaterThan(sbtcLimits.perDepositCap)) {
      return [
        {
          reason: 'maximum-threshold-exceeded',
          threshold: createMoney(sbtcLimits.perDepositCap, 'BTC'),
        },
      ];
    }
  }
  if (bridgeTxType === 'withdrawal') {
    if (sbtcLimits.perWithdrawalCap && bridgeAmount.isGreaterThan(sbtcLimits.perWithdrawalCap)) {
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

export interface getSbtcWithdrawalContractCallDataArgs {
  stxAddress: string;
  withdrawalBtcAddress: string;
  quoteAmount: Money;
  withdrawalSweepTxFee: number;
  network: NetworkModes;
}

export function getSbtcWithdrawalContractCallData({
  stxAddress,
  withdrawalBtcAddress,
  quoteAmount,
  withdrawalSweepTxFee,
  network,
}: getSbtcWithdrawalContractCallDataArgs) {
  const quoteAmountSats = quoteAmount.amount.toNumber();
  const { type, hashbytes } = deconstructBtcAddress(withdrawalBtcAddress);

  const recipient = {
    version: Cl.bufferFromHex(type),
    hashbytes: Cl.buffer(hashbytes),
  };

  const sbtcAddress = sbtcStacksAddressMap[network];

  const sbtcPostCondition = Pc.principal(stxAddress)
    .willSendEq(quoteAmountSats + withdrawalSweepTxFee)
    .ft(`${sbtcAddress}.sbtc-token`, 'sbtc-token');

  return {
    contractAddress: sbtcAddress,
    contractName: 'sbtc-withdrawal',
    functionName: 'initiate-withdrawal-request',
    functionArgs: [Cl.uint(quoteAmountSats), Cl.tuple(recipient), Cl.uint(withdrawalSweepTxFee)],
    postConditions: [sbtcPostCondition],
    postConditionMode: 'deny',
  };
}

const depositSweepTxFeeWeightVbytes = 250;
const withdrawalSweepTxFeeWeightVbytes = 170;

export function calculateSignerSweepTxFee(txType: SbtcBridgeTxType, feeRate: number): number {
  return Math.ceil(
    txType === 'deposit'
      ? depositSweepTxFeeWeightVbytes * feeRate
      : withdrawalSweepTxFeeWeightVbytes * feeRate
  );
}
