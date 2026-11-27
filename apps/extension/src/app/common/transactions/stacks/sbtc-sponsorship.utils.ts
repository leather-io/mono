import type { StacksNetwork } from '@stacks/network';
import {
  ClarityType,
  type ClarityValue,
  PayloadType,
  PostConditionMode,
  PostConditionType,
  type StacksTransactionWire,
  deserializeTransaction,
  serializeCV,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import { SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET } from '@leather.io/constants';
import { FeeTypes, type TransactionFeeTier } from '@leather.io/models';
import {
  LeatherApiError,
  type SbtcSponsorshipErrorCode,
  type SbtcSponsorshipQuoteResponse,
  getErrorDetail,
  getSbtcSponsorshipErrorCode,
  getSbtcSponsorshipIneligibilityReason,
  getSbtcSponsorshipNetwork,
} from '@leather.io/services';
import {
  type SbtcSponsoredTransferParams,
  type StacksUnsignedContractCallOptions,
  TransactionTypes,
  buildSbtcSponsoredTransferPostCondition,
  buildSbtcTransferManyArgs,
  generateStacksUnsignedTransaction,
  getPrincipalFromAssetString,
  getStacksAssetStringParts,
  sbtcTransferManyFunctionName,
} from '@leather.io/stacks';
import { createMoney, microStxToStx } from '@leather.io/utils';

const sbtcContractPrincipals = [SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET].map(
  getPrincipalFromAssetString
);

export function isSbtcContractPrincipal(contractId: string) {
  return sbtcContractPrincipals.includes(contractId);
}

export const sponsoredTransactionBroadcastRefusedMessage =
  'Sponsored transactions are submitted through the sponsor and cannot be broadcast by the wallet';

const unknownSbtcSponsorshipErrorMessage = 'Something went wrong';

const notEligibleMessage = "This transfer isn't eligible for sBTC fee payment";

const sbtcSponsorshipErrorMessages: Partial<Record<SbtcSponsorshipErrorCode, string>> = {
  quote_expired: 'The sBTC fee quote expired. Review the updated fee and confirm again.',
  stale_nonce: 'This account has a pending transaction. Wait for it to confirm, then send again.',
  funding_pending:
    'The sponsor is still preparing the transaction. Your sBTC has not moved. Try again in a moment.',
};

const sbtcSponsorshipIneligibilityMessages: Partial<Record<string, string>> = {
  insufficient_sbtc: 'Your sBTC balance no longer covers the amount plus the fee.',
  bad_transfer_entry: 'The amount must be positive and the recipient cannot be your own address.',
  fee_too_low: 'The quoted fee is out of date. Review the updated fee and confirm again.',
  fee_too_high: 'The quoted fee is out of date. Review the updated fee and confirm again.',
  float_low: 'The sponsor is temporarily out of STX. Pay the fee in STX or try again later.',
};

export function getSbtcSponsorshipErrorMessage(error: unknown): string {
  const code = getSbtcSponsorshipErrorCode(error);
  if (code === 'not_eligible') {
    const reason = getSbtcSponsorshipIneligibilityReason(error);
    if (!reason) return notEligibleMessage;
    const reasonMessage = sbtcSponsorshipIneligibilityMessages[reason];
    return reasonMessage
      ? `${notEligibleMessage}. ${reasonMessage}`
      : `${notEligibleMessage} (${reason})`;
  }
  const message = code ? sbtcSponsorshipErrorMessages[code] : undefined;
  return message ?? getErrorDetail(error) ?? unknownSbtcSponsorshipErrorMessage;
}

const defaultSbtcSponsorshipFeeTier: TransactionFeeTier = 'standard';

const sbtcSponsorshipFeeTierByFeeType: Partial<Record<string, TransactionFeeTier>> = {
  [FeeTypes[FeeTypes.Low]]: 'low',
  [FeeTypes[FeeTypes.Middle]]: 'standard',
  [FeeTypes[FeeTypes.High]]: 'high',
};

export function isSbtcSponsorshipFeeType(feeType: string) {
  return feeType in sbtcSponsorshipFeeTierByFeeType;
}

export function getSbtcSponsorshipFeeTier(feeType: string): TransactionFeeTier {
  return sbtcSponsorshipFeeTierByFeeType[feeType] ?? defaultSbtcSponsorshipFeeTier;
}

type SbtcSponsorshipFeeQuote = Pick<
  SbtcSponsorshipQuoteResponse,
  'satsPerStx' | 'minFeeSats' | 'maxFeeSats'
>;

function priceStxFeeInSats(stxFeeMicro: number | string | BigNumber, satsPerStx: string) {
  return microStxToStx(stxFeeMicro).times(satsPerStx).integerValue(BigNumber.ROUND_CEIL);
}

export function getSbtcSponsorshipFeeSats(
  stxFeeMicro: number | string | BigNumber,
  { satsPerStx, minFeeSats, maxFeeSats }: SbtcSponsorshipFeeQuote
): number {
  const feeSats = priceStxFeeInSats(stxFeeMicro, satsPerStx);
  return BigNumber.min(BigNumber.max(feeSats, minFeeSats), maxFeeSats).toNumber();
}

export function getSbtcSponsoredCallBudgetSats(
  stxFeeMicro: number | string | BigNumber,
  { satsPerStx, minFeeSats, maxFeeSats }: SbtcSponsorshipFeeQuote
): number {
  const budgetSats = priceStxFeeInSats(stxFeeMicro, satsPerStx).plus(minFeeSats);
  return BigNumber.min(budgetSats, maxFeeSats).toNumber();
}

export function getSbtcSponsorshipContractId(chainId: number) {
  const network = getSbtcSponsorshipNetwork(chainId);
  if (!network) return undefined;
  return getPrincipalFromAssetString(
    network === 'mainnet' ? SBTC_ASSET_ID_MAINNET : SBTC_ASSET_ID_TESTNET
  );
}

interface GenerateSbtcSponsoredTransferTxArgs {
  contractId: string;
  sender: string;
  publicKey: string;
  network: StacksNetwork;
  recipient: string;
  feeRecipient: string;
  amount: bigint;
  feeAmount: bigint;
  memo?: string;
  nonce: number;
}
export function generateSbtcSponsoredTransferTx({
  contractId,
  publicKey,
  network,
  nonce,
  ...transfer
}: GenerateSbtcSponsoredTransferTxArgs) {
  const { contractAddress, contractName } = getStacksAssetStringParts(contractId);
  const params: SbtcSponsoredTransferParams = { contractAddress, contractName, ...transfer };

  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    contractAddress,
    contractName,
    functionName: sbtcTransferManyFunctionName,
    functionArgs: buildSbtcTransferManyArgs(params).map(arg => serializeCV(arg)),
    postConditions: [buildSbtcSponsoredTransferPostCondition(params)],
    postConditionMode: PostConditionMode.Deny,
    network,
    publicKey,
    sponsored: true,
    fee: createMoney(0, 'STX'),
    nonce,
  });
}

interface GenerateSbtcSponsoredCallTransactionsArgs {
  callOptions: StacksUnsignedContractCallOptions;
  contractId: string;
  sender: string;
  publicKey: string;
  network: StacksNetwork;
  quote: Pick<SbtcSponsorshipQuoteResponse, 'feeRecipientPrincipal'> & SbtcSponsorshipFeeQuote;
  stxFeeMicro: number | string | BigNumber;
  nonce: number;
}
export async function generateSbtcSponsoredCallTransactions({
  callOptions,
  contractId,
  sender,
  publicKey,
  network,
  quote,
  stxFeeMicro,
  nonce,
}: GenerateSbtcSponsoredCallTransactionsArgs) {
  const budgetSats = getSbtcSponsoredCallBudgetSats(stxFeeMicro, quote);
  const feeSats = getSbtcSponsorshipFeeSats(stxFeeMicro, quote);

  const paymentTx = await generateSbtcSponsoredTransferTx({
    contractId,
    sender,
    publicKey,
    network,
    recipient: quote.feeRecipientPrincipal,
    feeRecipient: quote.feeRecipientPrincipal,
    amount: BigInt(budgetSats),
    feeAmount: BigInt(feeSats),
    nonce,
  });
  const callTx = await generateStacksUnsignedTransaction({
    ...callOptions,
    sponsored: true,
    fee: createMoney(0, 'STX'),
    nonce: nonce + 1,
  });

  return { paymentTx, callTx };
}

const sbtcSponsoredCallMaxBytes = 16_384;
const hexCharsPerByte = 2;

function isInByteOrder(keys: string[]) {
  return keys.every((key, index) => index === 0 || keys[index - 1] < key);
}

function hasTupleKeysInByteOrder(value: ClarityValue): boolean {
  switch (value.type) {
    case ClarityType.Tuple:
      return (
        isInByteOrder(Object.keys(value.value)) &&
        Object.values(value.value).every(hasTupleKeysInByteOrder)
      );
    case ClarityType.List:
      return value.value.every(hasTupleKeysInByteOrder);
    case ClarityType.OptionalSome:
    case ClarityType.ResponseOk:
    case ClarityType.ResponseErr:
      return hasTupleKeysInByteOrder(value.value);
    default:
      return true;
  }
}

export function isSbtcSponsorableContractCall(tx: StacksTransactionWire) {
  const serialized = tx.serialize();
  if (serialized.length > sbtcSponsoredCallMaxBytes * hexCharsPerByte) return false;

  const { payload, postConditions } = deserializeTransaction(serialized);
  if (payload.payloadType !== PayloadType.ContractCall) return false;
  const nftAssetIds = postConditions.values.flatMap(condition =>
    condition.conditionType === PostConditionType.NonFungible ? [condition.assetName] : []
  );
  return [...payload.functionArgs, ...nftAssetIds].every(hasTupleKeysInByteOrder);
}

const sbtcSponsorshipRetryCodes: SbtcSponsorshipErrorCode[] = [
  'funding_pending',
  'upstream_unavailable',
  'broadcast_failed',
];
const paymentNotConfirmedReason = 'payment_not_confirmed';
const serverErrorStatus = 500;

interface GetSbtcSponsorshipRefusalActionOptions {
  awaitsPayment: boolean;
}
export function getSbtcSponsorshipRefusalAction(
  error: unknown,
  { awaitsPayment }: GetSbtcSponsorshipRefusalActionOptions
): 'retry' | 'requote' | 'stop' {
  if (!LeatherApiError.isLeatherApiError(error)) return 'retry';
  const code = getSbtcSponsorshipErrorCode(error);
  if (!code) return error.status >= serverErrorStatus ? 'retry' : 'stop';
  if (code === 'quote_expired') return 'requote';
  if (sbtcSponsorshipRetryCodes.includes(code)) return 'retry';
  if (!awaitsPayment) return 'stop';
  if (code === 'stale_nonce') return 'retry';
  const isPaymentNotConfirmed =
    code === 'not_eligible' &&
    getSbtcSponsorshipIneligibilityReason(error) === paymentNotConfirmedReason;
  return isPaymentNotConfirmed ? 'retry' : 'stop';
}
