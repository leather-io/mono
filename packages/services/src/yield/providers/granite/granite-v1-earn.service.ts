import { standardPrincipalCV } from '@stacks/transactions';
import { injectable } from 'inversify';

import type {
  AccountAddresses,
  GraniteV1EarnPosition,
  YieldProduct,
  YieldProductCategory,
  YieldProductKey,
  YieldProvider,
  YieldProviderKey,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { FungibleAssetService } from '../../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import { LeatherApiClient } from '../../../infrastructure/api/leather/leather-api.client';
import { MarketDataService } from '../../../market/market-data.service';
import { YieldProductService } from '../../yield.service';
import { parseGraniteProtocolGetBalanceResponseCV } from './granite-v1.utils';
import { aeusdcAssetPrincipal, graniteProductionAddress } from './granite.constants';

@injectable()
export class GraniteV1EarnService implements YieldProductService {
  providerKey: YieldProviderKey = 'granite';
  productKey: YieldProductKey = 'granite-v1-earn';
  productCategory: YieldProductCategory = 'lending';

  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    private readonly leatherApiClient: LeatherApiClient
  ) {}

  getProvider(): Promise<YieldProvider> {
    return Promise.resolve({
      key: this.providerKey,
      name: 'Granite',
      logo: '',
      url: '',
    });
  }

  getProduct(): Promise<YieldProduct> {
    return Promise.resolve({
      key: this.productKey,
      provider: this.providerKey,
      category: this.productCategory,
      name: 'Granite V1 Earn',
      url: '',
    });
  }

  async getAccountPositions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<GraniteV1EarnPosition[]> {
    if (!account.stacks) {
      return [];
    }

    const aeusdcAsset = await this.fungibleAssetService.getAsset(
      { protocol: 'sip10', id: aeusdcAssetPrincipal },
      signal
    );
    const [v1Balance, aeusdcMarketData, marketRates] = await Promise.all([
      this.callStateV1GetBalance(account.stacks.stxAddress, signal),
      this.marketDataService.getMarketData(aeusdcAsset, signal),
      this.leatherApiClient.fetchGraniteMarket(aeusdcAssetPrincipal, { signal }),
    ]);

    const earnBalance = createMoney(v1Balance, aeusdcAsset.symbol, aeusdcAsset.decimals);

    if (!earnBalance.amount.isGreaterThan(0)) {
      return [];
    }

    const earnBalanceQuote = baseCurrencyAmountInQuote(earnBalance, aeusdcMarketData);

    return [
      {
        id: this.productKey,
        provider: 'granite',
        product: 'granite-v1-earn',
        totalBalance: earnBalanceQuote,
        apy: marketRates.earnApy,
        marketAsset: aeusdcAsset,
        marketAssetSupplyBalance: earnBalance,
        marketAssetSupplyBalanceQuote: earnBalanceQuote,
      },
    ];
  }

  private async callStateV1GetBalance(address: string, signal?: AbortSignal) {
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: graniteProductionAddress,
        contractName: 'state-v1',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
      },
      { signal }
    );
    return parseGraniteProtocolGetBalanceResponseCV(response);
  }
}
