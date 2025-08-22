import { inject, injectable } from 'inversify';
import { groupBy, isNonNullish } from 'remeda';

import {
  CryptoAssetBalance,
  CryptoAssetId,
  FungibleAssetId,
  SwapAsset,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwapQuote,
} from '@leather.io/models';
import {
  SerializedCryptoAssetId,
  deserializeAssetId,
  getAssetId,
  isSameAsset,
  matchesAssetId,
  serializeAssetId,
} from '@leather.io/utils';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import { AccountQuotedBtcBalance, BtcBalancesService } from '../balances/btc-balances.service';
import { Sip10AddressBalance, Sip10BalancesService } from '../balances/sip10-balances.service';
import { AddressQuotedStxBalance, StxBalancesService } from '../balances/stx-balances.service';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { AccountRequest } from '../types';
import { AlexSwapProviderService } from './alex-swap-provider.service';
import { BitflowSwapProviderService } from './bitflow-swap-provider.service';
import { SbtcBridgeSwapProviderService } from './sbtc-bridge-swap-provider.service';
import { SwapProviderService } from './swap-provider.interface';
import { VelarSwapProviderService } from './velar-swap-provider.service';

export interface AccountSwapAsset extends SwapAsset {
  balance?: {
    quote: CryptoAssetBalance;
    crypto: CryptoAssetBalance;
  };
}

@injectable()
export class SwapService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly stxBalancesService: StxBalancesService,
    private readonly btcBalancesService: BtcBalancesService,
    private readonly sip10BalancesService: Sip10BalancesService,
    private readonly fungibleAssetService: FungibleAssetService,
    // provider services
    private readonly velarProvider: VelarSwapProviderService,
    private readonly alexProvider: AlexSwapProviderService,
    private readonly bitflowProvider: BitflowSwapProviderService,
    private readonly sbtcBridgeProvider: SbtcBridgeSwapProviderService
  ) {}

  private getSwapProviderServices(): SwapProviderService[] {
    return [this.velarProvider, this.alexProvider, this.bitflowProvider, this.sbtcBridgeProvider];
  }

  private getSwapProviderServiceById(providerId: SwapProviderId): SwapProviderService {
    return this.getSwapProviderServices().find(service => service.providerId === providerId)!;
  }

  public async getAccountBaseSwapAssets(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<AccountSwapAsset[]> {
    const [baseSwapAssets, btcBalance, stxBalance, sip10Balances] = await Promise.all([
      this.getBaseSwapAssets(signal),
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
    ]);
    return baseSwapAssets.map(swapAsset =>
      this.applySwapAssetBalance(swapAsset, btcBalance, stxBalance, sip10Balances)
    );
  }

  public async getAccountTargetSwapAssets(
    request: AccountRequest,
    baseId: CryptoAssetId,
    signal?: AbortSignal
  ): Promise<AccountSwapAsset[]> {
    const [targetSwapAssets, btcBalance, stxBalance, sip10Balances] = await Promise.all([
      this.getTargetSwapAssets(baseId, signal),
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
    ]);
    return targetSwapAssets.map(swapAsset =>
      this.applySwapAssetBalance(swapAsset, btcBalance, stxBalance, sip10Balances)
    );
  }

  private applySwapAssetBalance(
    swapAsset: SwapAsset,
    btcBalance: AccountQuotedBtcBalance,
    stxBalance: AddressQuotedStxBalance,
    sip10Balance: Sip10AddressBalance
  ): AccountSwapAsset {
    if (swapAsset.asset.protocol === 'nativeBtc') {
      return {
        ...swapAsset,
        balance: {
          quote: btcBalance.quote,
          crypto: btcBalance.btc,
        },
      };
    } else if (swapAsset.asset.protocol === 'nativeStx') {
      return {
        ...swapAsset,
        balance: {
          quote: stxBalance.quote,
          crypto: stxBalance.stx,
        },
      };
    } else if (swapAsset.asset.protocol === 'sip10') {
      const match = sip10Balance.sip10s.find(sip10 => isSameAsset(swapAsset.asset, sip10.asset));
      if (match) {
        return {
          ...swapAsset,
          balance: {
            quote: match.quote,
            crypto: match.crypto,
          },
        };
      }
    }
    return swapAsset;
  }

  public async getBaseSwapAssets(signal?: AbortSignal): Promise<SwapAsset[]> {
    const providerSwapAssets = await Promise.all(
      this.getSwapProviderServices().map(service => service.getBaseSwapAssets(signal))
    );
    return await this.combineProviderAssets(providerSwapAssets.flat());
  }

  public async getTargetSwapAssets(
    baseAssetId: CryptoAssetId,
    signal?: AbortSignal
  ): Promise<SwapAsset[]> {
    const swapAssets = await this.getBaseSwapAssets(signal);

    const baseSwapAsset = swapAssets.find(swapAsset =>
      matchesAssetId(swapAsset.asset, baseAssetId)
    );
    if (!baseSwapAsset) {
      throw new Error('Base swap asset not found');
    }
    const providerServiceCalls = baseSwapAsset.providerAssets.map(providerBaseAsset =>
      this.getSwapProviderServiceById(providerBaseAsset.providerId).getTargetAssets(
        { baseAsset: baseSwapAsset.asset, baseProviderAsset: providerBaseAsset },
        signal
      )
    );
    const targetAssets = await Promise.all(providerServiceCalls);
    return await this.combineProviderAssets(targetAssets.flat());
  }

  private async combineProviderAssets(
    providerSwapAssets: SwapProviderAsset[]
  ): Promise<SwapAsset[]> {
    const groupedAssets = groupBy(providerSwapAssets, providerAsset =>
      serializeAssetId(providerAsset.assetId)
    );
    return (
      await Promise.allSettled(
        Object.keys(groupedAssets).map(key =>
          this.fungibleAssetService.getAsset(
            deserializeAssetId(key as SerializedCryptoAssetId) as FungibleAssetId
          )
        )
      )
    )
      .filter(result => result.status === 'fulfilled')
      .map(result => ({
        asset: result.value,
        providerAssets: groupedAssets[serializeAssetId(getAssetId(result.value))],
      }));
  }

  public async getSwapQuotes(
    baseAsset: SwapAsset,
    targetAsset: SwapAsset,
    baseAmount: number,
    signal?: AbortSignal
  ): Promise<SwapQuote[]> {
    const providerServiceCalls = targetAsset.providerAssets
      .map(targetProviderAsset => {
        const baseProviderAsset = baseAsset.providerAssets.find(
          b => b.providerId === targetProviderAsset.providerId
        );
        if (!baseProviderAsset) return;
        return this.getSwapProviderServiceById(targetProviderAsset.providerId).getSwapQuotes(
          {
            baseAsset: baseAsset.asset,
            baseProviderAsset: baseProviderAsset,
            targetAsset: targetAsset.asset,
            targetProviderAsset: targetProviderAsset,
            baseAmount,
          },
          signal
        );
      })
      .filter(isNonNullish);
    const swapQuotes = await Promise.all(providerServiceCalls);
    return swapQuotes.flat();
  }

  public async getSwapExecutionData(
    request: AccountRequest,
    quote: SwapQuote,
    slippage: number,
    signal?: AbortSignal
  ): Promise<SwapExecutionData> {
    return this.getSwapProviderServiceById(quote.providerId).getSwapExecutionData(
      { request, quote, slippage },
      signal
    );
  }
}
