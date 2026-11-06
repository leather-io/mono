import { type StacksNetwork } from '@stacks/network';
import { Pc, type StacksTransactionWire, hexToCV, serializeCV } from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { getStacksTransactionFeesService } from '@leather.io/services';
import {
  TransactionTypes,
  createSip9FnArgs,
  createSip10FnArgs,
  formatAssetString,
  formatContractIdString,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { describeNft } from './move-to-fresh-account-nfts';

const transferFunctionName = 'transfer';

interface BuildTransferTxArgs {
  publicKey: string;
  network: StacksNetwork;
  nonce: number;
  sender: string;
  recipient: string;
}

interface BuildSip10TransferTxArgs extends BuildTransferTxArgs {
  assetId: string;
  amount: BigNumber;
}
function buildSip10TransferTx({
  publicKey,
  network,
  nonce,
  sender,
  recipient,
  assetId,
  amount,
}: BuildSip10TransferTxArgs) {
  const { contractAddress, contractName, contractAssetName } = getStacksAssetStringParts(assetId);
  const functionArgs = createSip10FnArgs({
    amount: amount.toString(),
    senderStacksAddress: sender,
    recipientStacksAddress: recipient,
  });
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    publicKey,
    network,
    nonce,
    fee: createMoney(0, 'STX'),
    contractAddress,
    contractName,
    functionName: transferFunctionName,
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    postConditions: [
      Pc.principal(sender)
        .willSendEq(amount.toString())
        .ft(formatContractIdString({ contractAddress, contractName }), contractAssetName),
    ],
  });
}

interface BuildNftTransferTxArgs extends BuildTransferTxArgs {
  assetIdentifier: string;
  tokenIdHex: string;
}
function buildNftTransferTx({
  publicKey,
  network,
  nonce,
  sender,
  recipient,
  assetIdentifier,
  tokenIdHex,
}: BuildNftTransferTxArgs) {
  const { contractAddress, contractName, contractAssetName } =
    getStacksAssetStringParts(assetIdentifier);
  const functionArgs = createSip9FnArgs({
    assetId: tokenIdHex,
    senderStacksAddress: sender,
    recipientStacksAddress: recipient,
  });
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    publicKey,
    network,
    nonce,
    fee: createMoney(0, 'STX'),
    contractAddress,
    contractName,
    functionName: transferFunctionName,
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    postConditions: [
      Pc.principal(sender)
        .willSendAsset()
        .nft(
          formatAssetString({ contractAddress, contractName, assetName: contractAssetName }),
          hexToCV(tokenIdHex)
        ),
    ],
  });
}

interface BuildStxTransferTxArgs extends BuildTransferTxArgs {
  amount: Money;
  fee: Money;
}
function buildStxTransferTx({
  publicKey,
  network,
  nonce,
  recipient,
  amount,
  fee,
}: BuildStxTransferTxArgs) {
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.StxTokenTransfer,
    publicKey,
    network,
    nonce,
    fee,
    recipient,
    amount,
  });
}

interface CalculateStxToMoveArgs {
  availableBalance: BigNumber;
  fees: BigNumber[];
}
export function calculateStxToMove({ availableBalance, fees }: CalculateStxToMoveArgs) {
  return availableBalance.minus(BigNumber.sum(0, ...fees));
}

async function estimateFee(tx: StacksTransactionWire) {
  const fees = await getStacksTransactionFeesService().getStacksTransactionFees(tx);
  return fees.options.standard.value.amount;
}

async function applyEstimatedFee(tx: StacksTransactionWire) {
  const fee = await estimateFee(tx);
  tx.setFee(fee.toString());
  return fee;
}

interface MoveItem {
  id: string;
  label: string;
  tx: StacksTransactionWire;
}

interface BlockedItem {
  id: string;
  label: string;
  reason: string;
}

interface MovePlanToken {
  assetId: string;
  symbol: string;
  decimals: number;
  amount: BigNumber;
}

interface MovePlanNft {
  assetIdentifier: string;
  tokenIdHex: string;
  tokenIdRepr: string;
}

interface BuildMovePlanArgs {
  publicKey: string;
  network: StacksNetwork;
  sender: string;
  recipient: string;
  startNonce: number;
  availableStx: Money;
  tokens: MovePlanToken[];
  nfts: MovePlanNft[];
}
export async function buildMovePlan({
  startNonce,
  availableStx,
  tokens,
  nfts,
  ...base
}: BuildMovePlanArgs) {
  const tokenItems: MoveItem[] = await Promise.all(
    tokens.map(async (token, index) => ({
      id: token.assetId,
      label: `${token.amount.shiftedBy(-token.decimals).toFormat()} ${token.symbol}`,
      tx: await buildSip10TransferTx({
        ...base,
        nonce: startNonce + index,
        assetId: token.assetId,
        amount: token.amount,
      }),
    }))
  );

  const describedNfts = await Promise.all(
    nfts.map(async nft => ({
      ...nft,
      id: `${nft.assetIdentifier}:${nft.tokenIdHex}`,
      description: await describeNft({ ...nft, network: base.network }),
    }))
  );

  const blockedNfts: BlockedItem[] = [];
  const movableNfts: typeof describedNfts = [];
  for (const nft of describedNfts) {
    const { label, blockedReason } = nft.description;
    if (blockedReason) blockedNfts.push({ id: nft.id, label, reason: blockedReason });
    else movableNfts.push(nft);
  }

  const nftItems: MoveItem[] = await Promise.all(
    movableNfts.map(async (nft, index) => ({
      id: nft.id,
      label: nft.description.label,
      tx: await buildNftTransferTx({
        ...base,
        nonce: startNonce + tokenItems.length + index,
        assetIdentifier: nft.assetIdentifier,
        tokenIdHex: nft.tokenIdHex,
      }),
    }))
  );

  const assetItems = [...tokenItems, ...nftItems];
  const assetFees = await Promise.all(assetItems.map(item => applyEstimatedFee(item.tx)));

  const stxNonce = startNonce + assetItems.length;
  const stxFee = await estimateFee(
    await buildStxTransferTx({
      ...base,
      nonce: stxNonce,
      amount: availableStx,
      fee: createMoney(0, 'STX'),
    })
  );
  const fees = [...assetFees, stxFee];
  const stxToMove = calculateStxToMove({ availableBalance: availableStx.amount, fees });
  if (!stxToMove.isGreaterThan(0)) throw new Error('Not enough STX to pay the fees');

  const stxAmount = createMoney(stxToMove, 'STX');
  const stxTx = await buildStxTransferTx({
    ...base,
    nonce: stxNonce,
    amount: stxAmount,
    fee: createMoney(stxFee, 'STX'),
  });

  return {
    tokens: tokenItems,
    nfts: nftItems,
    blockedNfts,
    stxAmount,
    totalFee: createMoney(BigNumber.sum(...fees), 'STX'),
    transactions: [...assetItems.map(item => item.tx), stxTx],
  };
}
