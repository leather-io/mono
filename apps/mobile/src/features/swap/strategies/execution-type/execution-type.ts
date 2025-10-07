import {
  calculateMinToReceiveAmount,
  estimateLiquidityFeePercentage,
} from '@/features/swap/strategies/execution-type/execution-type.utils';
import { EnrichedSwapQuote } from '@/features/swap/swap-state/swap-state.types';
import {
  calculatePriceImpactPercentage,
  estimateExchangeRate,
} from '@/features/swap/swap-state/swap-state.utils';

import { SwapQuote } from '@leather.io/models';

type SupportedExecutionType = 'stacks-contract-call' | 'sbtc-bridge-transfer';

interface ExecutionStrategy {
  enrichQuote(quote: SwapQuote, fairMarketRate: number | null, slippage: number): EnrichedSwapQuote;
}

const stacksContractCallStrategy = {
  enrichQuote(
    swapQuote: SwapQuote,
    fairMarketRate: number | null,
    slippage: number
  ): EnrichedSwapQuote {
    const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
    return {
      rawSwapQuote: swapQuote,
      dexPath: swapQuote.dexPath,
      assetPath: swapQuote.assetPath,
      quoteAmount: swapQuote.quote,
      minReceive: calculateMinToReceiveAmount(swapQuote.quote, slippage),
      provider: swapQuote.providerId,
      providerFee: estimateLiquidityFeePercentage(swapQuote.dexPath),
      rate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
      score: swapQuote.targetAmount,
      priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
    };
  },
};

const sbtcBridgeTransferStrategy = {
  enrichQuote(swapQuote: SwapQuote, fairMarketRate: number | null): EnrichedSwapQuote {
    const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
    return {
      rawSwapQuote: swapQuote,
      dexPath: swapQuote.dexPath,
      assetPath: swapQuote.assetPath,
      quoteAmount: swapQuote.quote,
      provider: swapQuote.providerId,
      rate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
      score: swapQuote.targetAmount,
      priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
    };
  },
};

const strategyByExecutionType: Record<SupportedExecutionType, ExecutionStrategy> = {
  'stacks-contract-call': stacksContractCallStrategy,
  'sbtc-bridge-transfer': sbtcBridgeTransferStrategy,
};

export function getExecutionTypeStrategy(type: SupportedExecutionType): ExecutionStrategy {
  return strategyByExecutionType[type];
}
