import * as btc from '@scure/btc-signer';
import BigNumber from 'bignumber.js';

import {
  type CoinSelectionRecipient,
  getBtcSignerLibNetworkConfigByMode,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
import {
  type StacksContractCallSwapExecutionData,
  type SwapExecutionType,
  type SwapQuote,
  type TransactionFees,
} from '@leather.io/models';
import { assertExistence, createMoney } from '@leather.io/utils';

import {
  type EnrichedSwapQuote,
  type NetworkFee,
  type SwapExecutionDependencies,
  type SwapSubmissionResult,
} from '../../swap-state.types';
import { toNativeSegwitAccountRequest } from '../../utils/account-request';
import { estimateExchangeRate } from '../../utils/market-rates';
import { buildSbtcBridgeDepositTx } from './build-transaction/build-transaction/build-sbtc-bridge-deposit-tx';
import { buildStacksTx } from './build-transaction/build-transaction/build-stacks-tx';
import {
  calculateMinToReceiveAmount,
  createBaseEnrichedQuote,
  estimateLiquidityFeePercentage,
} from './execution-type.utils';

const sbtcDepositOutputIndex = 0;

interface ExecutionStrategy {
  enrichQuote(
    quote: SwapQuote,
    fairMarketRate: BigNumber | null,
    slippage: number
  ): EnrichedSwapQuote;
  getNetworkFee(
    dependencies: SwapExecutionDependencies,
    signal?: AbortSignal
  ): Promise<TransactionFees>;
  submitSwap(
    dependencies: SwapExecutionDependencies,
    fee: NetworkFee
  ): Promise<SwapSubmissionResult>;
}

const stacksContractCallStrategy: ExecutionStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: BigNumber | null, slippage: number) {
    return {
      ...createBaseEnrichedQuote(swapQuote, fairMarketRate),
      slippageApplicable: true,
      swapRate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
      minReceive: calculateMinToReceiveAmount(swapQuote.targetAmount, slippage),
      providerFeePercentage: estimateLiquidityFeePercentage(swapQuote.dexPath),
    };
  },
  async getNetworkFee(dependencies: SwapExecutionDependencies, signal?: AbortSignal) {
    const { executionData, stacks, services } = dependencies;
    const unsignedTx = await buildStacksTx(
      executionData as StacksContractCallSwapExecutionData,
      stacks.stacksNetwork,
      stacks.stacksSigner
    );
    return services.stacksTransactionFeesService.getStacksTransactionFees(
      unsignedTx,
      undefined,
      signal
    );
  },
  async submitSwap(dependencies, fee) {
    const { executionData, stacks, nonce } = dependencies;

    const unsignedTx = await buildStacksTx(
      executionData as StacksContractCallSwapExecutionData,
      stacks.stacksNetwork,
      stacks.stacksSigner,
      fee.calculation.value,
      nonce
    );
    const signed = await stacks.stacksSigner.sign(unsignedTx);
    const response = await stacks.broadcast({ tx: signed, stacksNetwork: stacks.stacksNetwork });
    return { status: 'submitted', txid: response.txid };
  },
};

const sbtcBridgeDepositStrategy: ExecutionStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: BigNumber | null) {
    return {
      ...createBaseEnrichedQuote(swapQuote, fairMarketRate),
      slippageApplicable: false,
      swapRate: BigNumber(1),
    };
  },
  async getNetworkFee(dependencies, signal?: AbortSignal) {
    const { accountRequest, derivedAmounts, isSendingMax, services, bitcoin } = dependencies;
    assertExistence(bitcoin, 'Bitcoin dependencies missing for sbtc-bridge-deposit fee estimation');
    const signersPublicKey = await services.swapService.getSbtcSignersPublicKey(signal);
    const deposit = buildSbtcBridgeDepositTx(
      derivedAmounts.crypto?.amount.toNumber() ?? 0,
      bitcoin.network,
      accountRequest.account,
      bitcoin.bitcoinPayer,
      signersPublicKey
    );
    const recipients: CoinSelectionRecipient[] = [
      {
        address: deposit.address,
        amount: derivedAmounts.crypto ?? createMoney(0, 'BTC'),
      },
    ];
    return services.bitcoinTransactionFeesService.getBitcoinTransactionFees(
      toNativeSegwitAccountRequest(accountRequest),
      recipients,
      isSendingMax,
      signal
    );
  },
  async submitSwap(dependencies, fee) {
    const { accountRequest, derivedAmounts, isSendingMax, bitcoin, services } = dependencies;
    assertExistence(bitcoin, 'Bitcoin dependencies missing for sbtc-bridge-deposit submission');
    const signersPublicKey = await services.swapService.getSbtcSignersPublicKey();
    const deposit = buildSbtcBridgeDepositTx(
      derivedAmounts.crypto?.amount.toNumber() ?? 0,
      bitcoin.network,
      accountRequest.account,
      bitcoin.bitcoinPayer,
      signersPublicKey
    );

    if (fee.calculation.type !== 'bitcoinFeeRate') {
      throw new Error(
        `sbtc-bridge-deposit submission requires a bitcoinFeeRate fee calculation, received: ${fee.calculation.type}`
      );
    }

    const recipients: CoinSelectionRecipient[] = [
      {
        address: deposit.address,
        amount: derivedAmounts.crypto ?? createMoney(0, 'BTC'),
      },
    ];

    const { inputs, outputs } = await services.bitcoinCoinSelectionService.performCoinSelection({
      account: toNativeSegwitAccountRequest(accountRequest),
      recipients,
      feeRate: fee.calculation.rate,
      isMaxSpend: isSendingMax,
    });

    const networkMode = getBtcSignerLibNetworkConfigByMode(bitcoin.network.chain.bitcoin.mode);
    const p2wpkh = btc.p2wpkh(bitcoin.bitcoinPayer.publicKey, networkMode);

    inputs.forEach(input => {
      deposit.transaction.addInput({
        txid: input.txid,
        index: input.vout,
        sequence: 0,
        witnessUtxo: {
          script: p2wpkh.script,
          amount: BigInt(input.value),
        },
        bip32Derivation: [payerToBip32Derivation(bitcoin.bitcoinPayer)],
      });
    });

    outputs.forEach(output => {
      // Add change output
      if (!output.address) {
        deposit.transaction.addOutputAddress(
          bitcoin.bitcoinPayer.address,
          BigInt(output.value),
          networkMode
        );
      }
    });

    const signedDepositTx = await bitcoin.signBitcoinPsbt(deposit.transaction.toPSBT());
    signedDepositTx.finalize();
    const txid = signedDepositTx.id;
    const broadcast = await bitcoin.broadcast(signedDepositTx.hex);
    if (broadcast.status === 'rejected') throw new Error(broadcast.errorMessage);
    // Software wallets mutate the original transaction when signing and
    // finalizing the tx. Ledger devices return a new instance. Override tx
    // in `deposit` with the signed instance
    const notification = await services.swapService.notifySbtcDeposit({
      bitcoinTxid: txid,
      bitcoinTxOutputIndex: sbtcDepositOutputIndex,
      depositScript: deposit.depositScript,
      reclaimScript: deposit.reclaimScript,
      transactionHex: signedDepositTx.hex,
    });
    if (broadcast.status === 'unknown') {
      return {
        status: 'broadcast-uncertain',
        txid,
        errorMessage: broadcast.errorMessage,
        notified: notification.status === 'notified',
      };
    }
    if (notification.status === 'failed') {
      const { errorMessage, httpStatus } = notification;
      if (httpStatus === undefined)
        return { status: 'sbtc-notification-failed', txid, errorMessage };
      return { status: 'sbtc-notification-failed', txid, errorMessage, httpStatus };
    }
    return { status: 'submitted', txid };
  },
};

const strategyByExecutionType: Record<SwapExecutionType, ExecutionStrategy> = {
  'stacks-contract-call': stacksContractCallStrategy,
  'sbtc-bridge-deposit': sbtcBridgeDepositStrategy,
};

export function getExecutionTypeStrategy(type: SwapExecutionType): ExecutionStrategy {
  return strategyByExecutionType[type];
}
