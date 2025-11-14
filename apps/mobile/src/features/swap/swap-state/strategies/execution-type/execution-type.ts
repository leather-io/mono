import {
  EnrichedSwapQuote,
  NetworkFee,
  SwapExecutionDependencies,
} from '@/features/swap/swap-state/swap-state.types';
import {
  calculatePriceImpactPercentage,
  estimateExchangeRate,
} from '@/features/swap/swap-state/utils/market-rates';
import * as btc from '@scure/btc-signer';
import BigNumber from 'bignumber.js';

import { CoinSelectionRecipient, getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';
import {
  StacksContractCallSwapExecutionData,
  SwapExecutionType,
  SwapQuote,
  TransactionFees,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { buildSbtcBridgeTransferTx } from './build-transaction/build-transaction/build-sbtc-bridge-transfer-tx';
import { buildStacksTx } from './build-transaction/build-transaction/build-stacks-tx';
import {
  calculateMinToReceiveAmount,
  estimateLiquidityFeePercentage,
} from './execution-type.utils';

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
  executeSwap(dependencies: SwapExecutionDependencies, fee: NetworkFee): Promise<void>;
}

const stacksContractCallStrategy: ExecutionStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: BigNumber | null, slippage: number) {
    const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
    return {
      rawSwapQuote: swapQuote,
      baseAmount: swapQuote.baseAmount,
      dexPath: swapQuote.dexPath,
      assetPath: swapQuote.assetPath,
      quoteAmount: swapQuote.quote,
      slippageApplicable: true,
      minReceive: calculateMinToReceiveAmount(swapQuote.quote, slippage),
      provider: swapQuote.providerId,
      providerFeePercentage: estimateLiquidityFeePercentage(swapQuote.dexPath),
      swapRate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
      score: swapQuote.targetAmount,
      priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
    };
  },
  async getNetworkFee(dependencies: SwapExecutionDependencies, signal?: AbortSignal) {
    const { executionData, stacks, services } = dependencies;
    const unsignedTx = await buildStacksTx(
      executionData as StacksContractCallSwapExecutionData,
      stacks.stacksNetwork,
      stacks.stacksSigner
    );
    return services.stacksTransactionFeesService.getStacksTransactionFees(unsignedTx, signal);
  },
  async executeSwap(dependencies, fee) {
    const { executionData, stacks, nonce } = dependencies;

    const unsignedTx = await buildStacksTx(
      executionData as StacksContractCallSwapExecutionData,
      stacks.stacksNetwork,
      stacks.stacksSigner,
      fee.calculation.value,
      nonce
    );
    const signed = await stacks.stacksSigner.sign(unsignedTx);
    await stacks.broadcast({ tx: signed, stacksNetwork: stacks.stacksNetwork });
  },
};

const sbtcBridgeTransferStrategy: ExecutionStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: BigNumber | null) {
    const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
    return {
      rawSwapQuote: swapQuote,
      baseAmount: swapQuote.baseAmount,
      dexPath: swapQuote.dexPath,
      assetPath: swapQuote.assetPath,
      quoteAmount: swapQuote.quote,
      slippageApplicable: false,
      provider: swapQuote.providerId,
      swapRate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
      score: swapQuote.targetAmount,
      priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
    };
  },
  async getNetworkFee(dependencies, signal?: AbortSignal) {
    const { accountRequest, derivedAmounts, isSendingMax, services, bitcoin } = dependencies;
    const deposit = await buildSbtcBridgeTransferTx(
      derivedAmounts.crypto?.amount.toNumber() ?? 0,
      bitcoin.network,
      accountRequest.account,
      bitcoin.bitcoinPayer,
      bitcoin.sbtcClient
    );
    const recipients: CoinSelectionRecipient[] = [
      {
        address: deposit.address,
        amount: derivedAmounts.crypto ?? createMoney(0, 'BTC'),
      },
    ];
    return services.bitcoinTransactionFeesService.getBitcoinTransactionFees(
      accountRequest,
      recipients,
      isSendingMax,
      signal
    );
  },
  async executeSwap(dependencies, fee) {
    const { accountRequest, derivedAmounts, isSendingMax, bitcoin, services } = dependencies;
    const deposit = await buildSbtcBridgeTransferTx(
      derivedAmounts.crypto?.amount.toNumber() ?? 0,
      bitcoin.network,
      accountRequest.account,
      bitcoin.bitcoinPayer,
      bitcoin.sbtcClient
    );

    if (fee.calculation.type !== 'bitcoinFeeRate') {
      return;
    }

    const recipients: CoinSelectionRecipient[] = [
      {
        address: deposit.address,
        amount: derivedAmounts.crypto ?? createMoney(0, 'BTC'),
      },
    ];

    const { inputs, outputs } = await services.bitcoinCoinSelectionService.performCoinSelection({
      account: accountRequest,
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
    await bitcoin.sbtcClient.broadcastTx(signedDepositTx);
    // Software wallets mutate the original transaction when signing and
    // finalizing the tx. Ledger devices return a new instance. Override tx
    // in `deposit` with the signed instance
    await bitcoin.sbtcClient.notifySbtc({ ...deposit, transaction: signedDepositTx });
  },
};

const strategyByExecutionType: Record<SwapExecutionType, ExecutionStrategy> = {
  'stacks-contract-call': stacksContractCallStrategy,
  'sbtc-bridge-transfer': sbtcBridgeTransferStrategy,
};

export function getExecutionTypeStrategy(type: SwapExecutionType): ExecutionStrategy {
  return strategyByExecutionType[type];
}
