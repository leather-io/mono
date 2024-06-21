import { useCallback } from 'react';

import { Currency, type TokenInfo } from 'alex-sdk';
import { AlexSDK } from 'alex-sdk';
import BigNumber from 'bignumber.js';

import { MarketData, Money, createMarketData, createMarketPair } from '@leather.io/models';
import {
  convertAmountToFractionalUnit,
  createMoney,
  getPrincipalFromContractId,
  isDefined,
  sortAssetsByName,
} from '@leather.io/utils';

import { useStxAvailableUnlockedBalance } from '../../stacks/balance/account-balance.hooks';
import { useTransferableSip10Tokens } from '../../stacks/sip10/sip10-tokens.hooks';
import { useAlexSdkLatestPricesQuery } from './alex-sdk-latest-prices.query';
import { useAlexSdkSwappableCurrencyQuery } from './alex-sdk-swappable-currency.query';

// TODO: Import from ui pkg or move to utils?
function getAvatarFallback(val: string) {
  return val.slice(0, 2);
}

export const alex = new AlexSDK();

// TODO: Coordinate this with how we handle other assets
export interface SwapAsset {
  address?: string;
  balance: Money;
  currency: Currency;
  displayName?: string;
  fallback: string;
  icon: string;
  name: string;
  marketData: MarketData | null;
  principal: string;
}

export const defaultSwapFee = createMoney(1000000, 'STX');

export function useAlexCurrencyPriceAsMarketData() {
  const { data: supportedCurrencies = [] } = useAlexSdkSwappableCurrencyQuery();
  const { data: prices } = useAlexSdkLatestPricesQuery();

  return useCallback(
    (principal: string, symbol: string) => {
      const tokenInfo = supportedCurrencies
        .filter(isDefined)
        .find(token => getPrincipalFromContractId(token.contractAddress) === principal);
      if (!prices || !tokenInfo)
        return createMarketData(createMarketPair(symbol, 'USD'), createMoney(0, 'USD'));
      const currency = tokenInfo.id as Currency;
      const price = convertAmountToFractionalUnit(new BigNumber(prices[currency] ?? 0), 2);
      return createMarketData(createMarketPair(symbol, 'USD'), createMoney(price, 'USD'));
    },
    [prices, supportedCurrencies]
  );
}

function useCreateSwapAsset(address: string) {
  const { data: prices } = useAlexSdkLatestPricesQuery();
  const priceAsMarketData = useAlexCurrencyPriceAsMarketData();
  const availableUnlockedBalance = useStxAvailableUnlockedBalance(address);
  const sip10Tokens = useTransferableSip10Tokens(address);

  return useCallback(
    (tokenInfo?: TokenInfo): SwapAsset | undefined => {
      if (!prices) return;
      if (!tokenInfo) {
        // logger.error('No token data found to swap');
        return;
      }

      const currency = tokenInfo.id as Currency;
      const principal = getPrincipalFromContractId(tokenInfo.contractAddress);
      const availableBalance = sip10Tokens.find(token => token.info.contractId === principal)
        ?.balance.availableBalance;

      const swapAsset = {
        currency,
        fallback: getAvatarFallback(tokenInfo.name),
        icon: tokenInfo.icon,
        name: tokenInfo.name,
        principal,
      };

      if (currency === Currency.STX) {
        return {
          ...swapAsset,
          balance: availableUnlockedBalance,
          displayName: 'Stacks',
          marketData: priceAsMarketData(principal, availableUnlockedBalance.symbol),
        };
      }

      return {
        ...swapAsset,
        balance: availableBalance ?? createMoney(0, tokenInfo.name, tokenInfo.decimals),
        marketData: availableBalance
          ? priceAsMarketData(principal, availableBalance.symbol)
          : priceAsMarketData(principal, tokenInfo.name),
      };
    },
    [availableUnlockedBalance, priceAsMarketData, prices, sip10Tokens]
  );
}

export function useAlexSwappableAssets(address: string) {
  const createSwapAsset = useCreateSwapAsset(address);
  return useAlexSdkSwappableCurrencyQuery({
    select: resp => sortAssetsByName(resp.map(createSwapAsset).filter(isDefined)),
  });
}
