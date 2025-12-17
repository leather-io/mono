/* eslint-disable @typescript-eslint/require-await */
import { inject, injectable } from 'inversify';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { btcAsset } from '@leather.io/constants';
import {
  type SbtcBridgeSwapQuote,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
} from '@leather.io/models';
import { createMoney, getAssetId, isSameAsset, isSameAssetId } from '@leather.io/utils';

import { EmilyApiClient } from '../infrastructure/api/emily/emily-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import {
  calculateSignerSweepTxFee,
  getSbtcBridgeExecutionConstraints,
  getSbtcWithdrawalContractCallData,
  sbtcStacksAddressMap,
} from './sbtc-bridge-swap-provider.utils';
import {
  type GetSwapExecutionDataParams,
  GetSwapQuotesParams,
  GetTargetProviderAssetsParams,
  SwapProviderService,
} from './swap-provider.interface';
import { mapToSwapDex } from './swap.utils';

@injectable()
export class SbtcBridgeSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'sbtc-bridge';

  private readonly btcSwapAsset: SwapProviderAsset = {
    providerId: this.providerId,
    providerAssetId: btcAsset.symbol,
    assetId: getAssetId(btcAsset),
  };

  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly emilyApiClient: EmilyApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  private getSbtcSwapAsset(): SwapProviderAsset {
    const network = bitcoinNetworkModeToCoreNetworkMode(
      selectBitcoinNetworkMode(this.settingsService.getSettings())
    );
    const sbtcAddress = sbtcStacksAddressMap[network];
    return {
      providerId: this.providerId,
      providerAssetId: `${sbtcAddress}.sbtc-token::sbtc-token`,
      assetId: {
        protocol: 'sip10',
        id: `${sbtcAddress}.sbtc-token::sbtc-token`,
      },
    };
  }

  async getBaseProviderAssets(): Promise<SwapProviderAsset[]> {
    return [this.btcSwapAsset, this.getSbtcSwapAsset()];
  }

  async getTargetProviderAssets({
    baseProviderAsset,
  }: GetTargetProviderAssetsParams): Promise<SwapProviderAsset[]> {
    if (isSameAssetId(baseProviderAsset.assetId, this.getSbtcSwapAsset().assetId)) {
      return [this.btcSwapAsset];
    }
    if (isSameAssetId(baseProviderAsset.assetId, this.btcSwapAsset.assetId)) {
      return [this.getSbtcSwapAsset()];
    }
    return [];
  }

  async getSwapQuotes(
    { baseAsset, baseAmount, targetAsset }: GetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<SbtcBridgeSwapQuote[]> {
    const [swapDexMap, sbtcLimits, btcFeeRates] = await Promise.all([
      this.leatherApiClient.fetchSwapDexes({ signal }),
      this.emilyApiClient.getSbtcLimits({ signal }),
      this.leatherApiClient.fetchBitcoinFeeRates(),
    ]);
    const bridgeTxType = baseAsset.symbol === btcAsset.symbol ? 'deposit' : 'withdrawal';

    const executionConstraints = getSbtcBridgeExecutionConstraints({
      bridgeTxType,
      bridgeAmount: baseAmount.amount,
      sbtcLimits,
    });
    // Use high rate to calculate estimated signer Tx fee
    const signerSweepTxFeeSats = calculateSignerSweepTxFee(bridgeTxType, btcFeeRates.high.rate);

    return [
      {
        executionType: bridgeTxType === 'deposit' ? 'sbtc-bridge-deposit' : 'stacks-contract-call',
        providerId: 'sbtc-bridge',
        baseAsset,
        targetAsset,
        baseAmount,
        targetAmount: createMoney(
          baseAmount.amount.minus(signerSweepTxFeeSats),
          targetAsset.symbol,
          targetAsset.decimals
        ),
        providerQuoteData: {
          signerSweepTxFeeSats,
        },
        dexPath: swapDexMap['sbtc-bridge'] ? [mapToSwapDex(swapDexMap['sbtc-bridge'])] : [],
        assetPath: [baseAsset, targetAsset],
        isExecutable: executionConstraints.length === 0,
        executionConstraints,
        createdAt: new Date(),
      },
    ];
  }

  async getSwapExecutionData({
    request,
    quote,
  }: GetSwapExecutionDataParams): Promise<SwapExecutionData> {
    if (quote.providerId !== 'sbtc-bridge') {
      throw new Error('Invalid quote provider id');
    }
    if (isSameAsset(quote.baseAsset, btcAsset)) {
      // deposit transaction - all execution data derived directly by client
      return {
        executionType: 'sbtc-bridge-deposit',
        providerId: this.providerId,
        quote,
      };
    }

    const network = selectBitcoinNetworkMode(this.settingsService.getSettings());
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('sBTC withdrawals not supported for network');
    }
    if (!request.account.bitcoin?.zeroIndexNativeSegwitPayerAddress) {
      throw new Error('Unable to Determine sBTC Withdrawal Address');
    }
    if (!request.account.stacks?.stxAddress) {
      throw new Error('Unable to Determine Stacks Address for sBTC Withdrawal');
    }

    return {
      providerId: this.providerId,
      executionType: 'stacks-contract-call',
      quote,
      ...getSbtcWithdrawalContractCallData({
        stxAddress: request.account.stacks.stxAddress,
        withdrawalBtcAddress: request.account.bitcoin.zeroIndexNativeSegwitPayerAddress,
        quoteAmount: quote.targetAmount,
        withdrawalSweepTxFee: quote.providerQuoteData.signerSweepTxFeeSats,
        network,
      }),
    };
  }
}
