import { buildSbtcBridgeTransferTx } from '@/features/swap/swap-state/strategies/execution-type/build-transaction/build-transaction/build-sbtc-bridge-transfer-tx';
import { buildStacksTx } from '@/features/swap/swap-state/strategies/execution-type/build-transaction/build-transaction/build-stacks-tx';
import {
  calculateMinToReceiveAmount,
  estimateLiquidityFeePercentage,
} from '@/features/swap/swap-state/strategies/execution-type/execution-type.utils';
import { DerivedAmounts, EnrichedSwapQuote } from '@/features/swap/swap-state/swap-state.types';
import {
  calculatePriceImpactPercentage,
  estimateExchangeRate,
} from '@/features/swap/swap-state/utils/market-rates';
import { StacksNetwork } from '@stacks/network';

import { BitcoinNativeSegwitPayer, CoinSelectionRecipient } from '@leather.io/bitcoin';
import {
  NetworkConfiguration,
  StacksContractCallSwapExecutionData,
  SwapExecutionData,
  SwapExecutionType,
  SwapQuote,
  TransactionFees,
} from '@leather.io/models';
import {
  AccountRequest,
  BitcoinTransactionFeesService,
  StacksTransactionFeesService,
} from '@leather.io/services';
import { StacksSigner } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

export interface FeeDependencies {
  isSendingMax: boolean;
  derivedAmounts: DerivedAmounts;
  executionData: SwapExecutionData;
  stacksTransactionFeesService: StacksTransactionFeesService;
  bitcoinTransactionFeesService: BitcoinTransactionFeesService;
  bitcoinPayer: BitcoinNativeSegwitPayer;
  network: NetworkConfiguration;
  stacksNetwork: StacksNetwork;
  stacksSigner: StacksSigner;
  accountRequest: AccountRequest;
}

interface ExecutionStrategy {
  enrichQuote(quote: SwapQuote, fairMarketRate: number | null, slippage: number): EnrichedSwapQuote;
  getNetworkFee(dependencies: FeeDependencies): Promise<TransactionFees>;
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
  async getNetworkFee(dependencies: FeeDependencies) {
    const { executionData, stacksSigner, stacksNetwork, stacksTransactionFeesService } =
      dependencies;
    const unsignedTx = await buildStacksTx(
      executionData as StacksContractCallSwapExecutionData,
      stacksNetwork,
      stacksSigner
    );
    return stacksTransactionFeesService.getStacksTransactionFees(unsignedTx);
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
  async getNetworkFee(dependencies: FeeDependencies) {
    const {
      derivedAmounts,
      isSendingMax,
      bitcoinPayer,
      network,
      accountRequest,
      bitcoinTransactionFeesService,
    } = dependencies;
    const deposit = await buildSbtcBridgeTransferTx(
      derivedAmounts.crypto?.amount.toNumber() ?? 0,
      network,
      accountRequest.account,
      bitcoinPayer
    );
    const recipients: CoinSelectionRecipient[] = [
      {
        address: deposit.address,
        amount: derivedAmounts.crypto ?? createMoney(0, 'BTC'),
      },
    ];
    return bitcoinTransactionFeesService.getBitcoinTransactionFees(
      accountRequest,
      recipients,
      isSendingMax
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
