import { hexToCV, standardPrincipalCV } from '@stacks/transactions';
import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { parseClarityUintResponse } from '@leather.io/stacks';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { FungibleAssetService } from '../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  HiroAddressFtBalancesResponse,
  HiroNftHolding,
} from '../../infrastructure/api/hiro/hiro-stacks-api.types';
import { LeatherApiClient } from '../../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../../infrastructure/settings/settings.service';
import { Types } from '../../inversify.types';
import { MarketDataService } from '../../market/market-data.service';
import { parseStackingDaoGetWithdrawalResponseCV } from './stacking-dao.utils';

export interface StackingDaoPosition {
  totalValue: Money;
  withdrawalsValue: Money;
  ststxPosition?: StackingDaoLstPosition;
  ststxbtcPosition?: StackingDaoLstPosition;
  sbtcReward?: StackingDaoReward;
  withdrawals: StackingDaoLstWithdrawal[];
}

export interface StackingDaoLstPosition {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceStx: Money;
  balanceQuote: Money;
  stxConversionRate: number;
  apy: number;
}

export interface StackingDaoReward {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
}

export interface StackingDaoLstWithdrawal {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceStx: Money;
  balanceQuote: Money;
  burnBlocksUntilUnlock: number;
  unlockBurnHeight: number;
}

const stackingDaoProductionAddress = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG';
const sbtcAssetIdentifier = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token';

const lstAssetIdentifier = {
  ststx: `${stackingDaoProductionAddress}.ststx-token::ststx`,
  ststxbtc: `${stackingDaoProductionAddress}.ststxbtc-token-v2::ststxbtc`,
};
const withdrawalNftIdentifiers = {
  ststx: `${stackingDaoProductionAddress}.ststx-withdraw-nft-v2::ststx-withdraw`,
  ststxbtc: `${stackingDaoProductionAddress}.ststxbtc-withdraw-nft::ststxbtc-withdraw`,
};

@injectable()
export class StackingDaoService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  public async getLiquidStackingPosition(
    address: string,
    signal?: AbortSignal
  ): Promise<StackingDaoPosition> {
    const [ftBalances, nftHoldings, sbtcReward] = await Promise.all([
      this.hiroStacksApiClient.getAddressFtBalances(address, {
        signal,
      }),
      this.hiroStacksApiClient.getNftHoldings(address, {
        signal,
      }),
      this.getSbtcReward(address, signal),
    ]);

    const [ststxPosition, ststxbtcPosition, ststxWithdrawals, ststxbtcWithdrawals] =
      await Promise.all([
        this.getLstPosition('ststx', ftBalances, signal),
        this.getLstPosition('ststxbtc', ftBalances, signal),
        this.getLstWithdrawals('ststx', nftHoldings, signal),
        this.getLstWithdrawals('ststxbtc', nftHoldings, signal),
      ]);

    const withdrawals = [...ststxWithdrawals, ...ststxbtcWithdrawals];
    const withdrawalsValue = withdrawals.length
      ? sumMoney(withdrawals.map(withdrawal => withdrawal.balanceQuote))
      : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return {
      totalValue: sumMoney([
        ...[
          ststxPosition?.balanceQuote,
          ststxbtcPosition?.balanceQuote,
          sbtcReward?.balanceQuote,
        ].filter(isNonNullish),
        withdrawalsValue,
      ]),
      withdrawalsValue,
      ...(ststxPosition && { ststxPosition }),
      ...(ststxbtcPosition && { ststxbtcPosition }),
      ...(sbtcReward && { sbtcReward }),
      withdrawals,
    };
  }

  private async getSbtcReward(
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

  private async getLstPosition(
    lst: 'ststx' | 'ststxbtc',
    ftBalances: HiroAddressFtBalancesResponse,
    signal?: AbortSignal
  ): Promise<StackingDaoLstPosition | undefined> {
    const ft = ftBalances.results.find(ft => ft.token === lstAssetIdentifier[lst]);
    if (!ft) return;

    const [asset, stackingDaoRates, stxMarketData] = await Promise.all([
      this.fungibleAssetService.getAsset(
        { protocol: 'sip10', id: lstAssetIdentifier[lst] },
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

  private async getLstWithdrawals(
    lst: 'ststx' | 'ststxbtc',
    nftHoldings: HiroNftHolding[],
    signal?: AbortSignal
  ): Promise<StackingDaoLstWithdrawal[]> {
    const withdrawalNftIds = nftHoldings
      .filter(nft => nft.asset_identifier === withdrawalNftIdentifiers[lst])
      .map(nft => hexToCV(nft.value.hex));
    if (withdrawalNftIds.length === 0) {
      return [];
    }

    const [asset, stxMarketData, serverStatus, withdrawalResponses] = await Promise.all([
      this.fungibleAssetService.getAsset(
        {
          protocol: 'sip10',
          id: lstAssetIdentifier[lst],
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
