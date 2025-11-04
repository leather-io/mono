import {
  EnrichedSwapQuote,
  SwapExecutionDependencies,
} from '@/features/swap/swap-state/swap-state.types';
import {
  calculatePriceImpactPercentage,
  estimateExchangeRate,
} from '@/features/swap/swap-state/utils/market-rates';

import { CoinSelectionRecipient } from '@leather.io/bitcoin';
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
  enrichQuote(quote: SwapQuote, fairMarketRate: number | null, slippage: number): EnrichedSwapQuote;
  getNetworkFee(
    dependencies: SwapExecutionDependencies,
    signal?: AbortSignal
  ): Promise<TransactionFees>;
}

const stacksContractCallStrategy: ExecutionStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: number | null, slippage: number) {
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
      providerFee: estimateLiquidityFeePercentage(swapQuote.dexPath),
      rate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
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
};

const sbtcBridgeTransferStrategy: ExecutionStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: number | null) {
    const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
    return {
      rawSwapQuote: swapQuote,
      baseAmount: swapQuote.baseAmount,
      dexPath: swapQuote.dexPath,
      assetPath: swapQuote.assetPath,
      quoteAmount: swapQuote.quote,
      slippageApplicable: false,
      provider: swapQuote.providerId,
      rate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
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
      bitcoin.bitcoinPayer
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
};

const strategyByExecutionType: Record<SwapExecutionType, ExecutionStrategy> = {
  'stacks-contract-call': stacksContractCallStrategy,
  'sbtc-bridge-transfer': sbtcBridgeTransferStrategy,
};

export function getExecutionTypeStrategy(type: SwapExecutionType): ExecutionStrategy {
  return strategyByExecutionType[type];
}
