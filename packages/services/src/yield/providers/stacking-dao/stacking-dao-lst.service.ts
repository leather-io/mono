import { hexToCV, standardPrincipalCV } from '@stacks/transactions';
import { injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import {
  type StackingDaoLstHolding,
  type StackingDaoLstWithdrawal,
  type StackingDaoReward,
} from '@leather.io/models';
import { parseClarityUintResponse } from '@leather.io/stacks';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { FungibleAssetService } from '../../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type {
  HiroAddressFtBalancesResponse,
  HiroNftHolding,
} from '../../../infrastructure/api/hiro/hiro-stacks-api.types';
import { LeatherApiClient } from '../../../infrastructure/api/leather/leather-api.client';
import { MarketDataService } from '../../../market/market-data.service';
import { parseStackingDaoGetWithdrawalResponseCV } from './stacking-dao-lst.utils';
import {
  sbtcAssetIdentifier,
  stackingDaoProductionAddress,
  ststxAssetIdentifier,
  ststxWithdrawNftIdentifier,
  ststxbtcAssetIdentifier,
  ststxbtcWithdrawNftIdentifier,
} from './stacking-dao.constants';

const lstAssetIdentifierMap = {
  ststx: ststxAssetIdentifier,
  ststxbtc: ststxbtcAssetIdentifier,
};
const lstWithdrawalNftIdentifierMap = {
  ststx: ststxWithdrawNftIdentifier,
  ststxbtc: ststxbtcWithdrawNftIdentifier,
};

@injectable()
export class StackingDaoLstService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService
  ) {}

  public async getSbtcReward(
    address: string,
    signal?: AbortSignal
  ): Promise<StackingDaoReward | undefined> {
    const [pendingRewardsResponse, sbtcAsset] = await Promise.all([
      this.hiroStacksApiClient.callReadOnlyFunction(
        {
          contractAddress: stackingDaoProductionAddress,
          contractName: 'ststxbtc-tracking-v2',
          functionName: 'get-pending-rewards',
          functionArgs: [standardPrincipalCV(address), standardPrincipalCV(address)],
        },
        { signal }
      ),
      this.fungibleAssetService.getAsset({ protocol: 'sip10', id: sbtcAssetIdentifier }, signal),
    ]);
    const sbtcRewardSats = Number(parseClarityUintResponse(pendingRewardsResponse));
    if (sbtcRewardSats === 0) return;

    const sbtcMarketData = await this.marketDataService.getMarketData(sbtcAsset, signal);
    const balance = createMoney(sbtcRewardSats, sbtcAsset.symbol, sbtcAsset.decimals);
    return {
      asset: sbtcAsset,
      balance,
      balanceQuote: baseCurrencyAmountInQuote(balance, sbtcMarketData),
    };
  }

  public async getLstHolding(
    lst: 'ststx' | 'ststxbtc',
    ftBalances: HiroAddressFtBalancesResponse,
    signal?: AbortSignal
  ): Promise<StackingDaoLstHolding | undefined> {
    const ft = ftBalances.results.find(ft => ft.token === lstAssetIdentifierMap[lst]);
    if (!ft) return;

    const [asset, stackingDaoRates, stxMarketData] = await Promise.all([
      this.fungibleAssetService.getAsset(
        { protocol: 'sip10', id: lstAssetIdentifierMap[lst] },
        signal
      ),
      this.leatherApiClient.fetchStackingDaoRates({ signal }),
      this.marketDataService.getMarketData(stxAsset, signal),
    ]);

    const balance = createMoney(Number(ft.balance), asset.symbol, asset.decimals);
    const balanceStx = createMoney(
      Math.floor(Number(ft.balance) * stackingDaoRates.stx[lst]),
      stxAsset.symbol,
      stxAsset.decimals
    );

    return {
      asset: asset,
      balance,
      balanceStx,
      balanceQuote: baseCurrencyAmountInQuote(balanceStx, stxMarketData),
      stxConversionRate: stackingDaoRates.stx[lst],
      apy: stackingDaoRates.apy[lst],
    };
  }

  public async getLstWithdrawals(
    lst: 'ststx' | 'ststxbtc',
    nftHoldings: HiroNftHolding[],
    signal?: AbortSignal
  ): Promise<StackingDaoLstWithdrawal[]> {
    const withdrawalNftIds = nftHoldings
      .filter(nft => nft.asset_identifier === lstWithdrawalNftIdentifierMap[lst])
      .map(nft => hexToCV(nft.value.hex));
    if (withdrawalNftIds.length === 0) {
      return [];
    }

    const [asset, stxMarketData, serverStatus, withdrawalResponses] = await Promise.all([
      this.fungibleAssetService.getAsset(
        {
          protocol: 'sip10',
          id: lstAssetIdentifierMap[lst],
        },
        signal
      ),
      this.marketDataService.getMarketData(stxAsset, signal),
      this.hiroStacksApiClient.getApiStatus({ signal }),
      Promise.all(
        withdrawalNftIds.map(nftId =>
          this.hiroStacksApiClient.callReadOnlyFunction(
            {
              contractAddress: stackingDaoProductionAddress,
              contractName: lst === 'ststx' ? 'data-core-v1' : 'data-core-v2',
              functionName:
                lst === 'ststx' ? 'get-withdrawals-by-nft' : 'get-ststxbtc-withdrawals-by-nft',
              functionArgs: [nftId],
            },
            { signal }
          )
        )
      ),
    ]);

    return withdrawalResponses.map(withdrawalResponse => {
      const withdrawalData = parseStackingDaoGetWithdrawalResponseCV(withdrawalResponse);
      const balanceStx = createMoney(withdrawalData.stxAmount, stxAsset.symbol, stxAsset.decimals);
      return {
        asset,
        balance: createMoney(
          withdrawalData.ststxAmount ?? withdrawalData.stxAmount,
          asset.symbol,
          asset.decimals
        ),
        balanceStx,
        balanceQuote: baseCurrencyAmountInQuote(balanceStx, stxMarketData),
        unlockBurnHeight: withdrawalData.unlockBurnHeight,
        burnBlocksUntilUnlock:
          withdrawalData.unlockBurnHeight - serverStatus.chain_tip!.burn_block_height,
      };
    });
  }
}
