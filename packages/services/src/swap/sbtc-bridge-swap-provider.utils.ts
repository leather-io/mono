import { Cl, Pc } from '@stacks/transactions';
import axios from 'axios';
import BigNumber from 'bignumber.js';

import { deconstructBtcAddress } from '@leather.io/bitcoin';
import type { ExecutionConstraint, Money, NetworkModes } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  type EmilySbtcLimitsResponse,
  emilyErrorResponseSchema,
} from '../infrastructure/api/emily/emily-api.types';

type SbtcBridgeTxType = 'deposit' | 'withdrawal';

export const sbtcStacksAddressMap = {
  mainnet: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
  testnet: 'SNGWPN3XDAQE673MXYXF81016M50NHF5X5PWWM70',
};

export function getRemainingSbtcSupply(
  pegCap: number | null,
  totalSupply: BigNumber | null
): BigNumber | null {
  if (pegCap === null || totalSupply === null) return null;
  return BigNumber.max(new BigNumber(pegCap).minus(totalSupply), 0);
}

interface getSbtcBridgeExecutionConstraintsArgs {
  bridgeTxType: SbtcBridgeTxType;
  bridgeAmount: BigNumber;
  sbtcLimits: EmilySbtcLimitsResponse;
  remainingSupply?: BigNumber | null;
}

export function getSbtcBridgeExecutionConstraints({
  bridgeTxType,
  bridgeAmount,
  sbtcLimits,
  remainingSupply = null,
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
    if (remainingSupply && bridgeAmount.isGreaterThan(remainingSupply)) {
      return [
        {
          reason: 'supply-cap-exceeded',
          threshold: createMoney(remainingSupply, 'BTC'),
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

interface getSbtcWithdrawalContractCallDataArgs {
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

export type SbtcDepositNotificationResult =
  | { status: 'notified' }
  | { status: 'failed'; errorMessage: string; httpStatus?: number };

type SbtcDepositNotificationFailure = Extract<SbtcDepositNotificationResult, { status: 'failed' }>;

interface SbtcNotifyErrorClassification {
  retryable: boolean;
  failure: SbtcDepositNotificationFailure;
}

const httpTooManyRequestsStatus = 429;
const httpServerErrorStatusFloor = 500;
const hexPrefix = '0x';
const compressedPublicKeyHexLength = 66;
const xOnlyPublicKeyHexLength = 64;
const compressedPublicKeyParityHexLength = 2;

export function classifySbtcNotifyError(error: unknown): SbtcNotifyErrorClassification {
  if (axios.isAxiosError(error)) {
    const httpStatus = error.response?.status;
    if (httpStatus === undefined) {
      return { retryable: true, failure: { status: 'failed', errorMessage: error.message } };
    }
    const parsedBody = emilyErrorResponseSchema.safeParse(error.response?.data);
    const errorMessage = parsedBody.success ? parsedBody.data.message : error.message;
    const retryable =
      httpStatus === httpTooManyRequestsStatus || httpStatus >= httpServerErrorStatusFloor;
    return { retryable, failure: { status: 'failed', errorMessage, httpStatus } };
  }
  return {
    retryable: false,
    failure: {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    },
  };
}

export function toXOnlyPublicKeyHex(publicKeyHex: string): string {
  const hex = publicKeyHex.startsWith(hexPrefix)
    ? publicKeyHex.slice(hexPrefix.length)
    : publicKeyHex;
  if (hex.length === xOnlyPublicKeyHexLength) return hex;
  if (hex.length === compressedPublicKeyHexLength) {
    return hex.slice(compressedPublicKeyParityHexLength);
  }
  throw new Error(`Unexpected signers public key length: ${hex.length} hex characters`);
}
