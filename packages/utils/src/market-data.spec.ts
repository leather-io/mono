import { describe, expect } from 'vitest';

import { createMarketData, createMarketPair } from '@leather.io/models';

import { invertExchangeRate, rebaseMarketData } from './market-data';
import { initBigNumber } from './math';
import { convertAmountToBaseUnit } from './money/calculate-money';
import { createMoneyFromDecimal } from './money/format-money';

describe('rebaseMarketData', () => {
  it('rebases marketData base currency against target quote currency of exchange rate', () => {
    const stxUsdMarketData = createMarketData(
      createMarketPair('STX', 'USD'),
      createMoneyFromDecimal(1.5, 'USD')
    );
    const gbpUsdExchangeRate = createMarketData(
      createMarketPair('GBP', 'USD'),
      createMoneyFromDecimal(1.2, 'USD')
    );
    const eurGbpExchangeRate = createMarketData(
      createMarketPair('EUR', 'GBP'),
      createMoneyFromDecimal(0.8, 'GBP')
    );
    const jpyEurExchangeRate = createMarketData(
      createMarketPair('JPY', 'EUR'),
      createMoneyFromDecimal(0.005, 'EUR')
    );
    const gbpStxMarketData = rebaseMarketData(stxUsdMarketData, gbpUsdExchangeRate);
    const eurStxMarketData = rebaseMarketData(gbpStxMarketData, eurGbpExchangeRate);
    const jpyStxMarketData = rebaseMarketData(eurStxMarketData, jpyEurExchangeRate);
    expect(convertAmountToBaseUnit(gbpStxMarketData.price)).toEqual(initBigNumber(1.25));
    expect(gbpStxMarketData.pair.base).toEqual('STX');
    expect(gbpStxMarketData.pair.quote).toEqual('GBP');
    expect(gbpStxMarketData.price.symbol).toEqual('GBP');
    expect(convertAmountToBaseUnit(eurStxMarketData.price)).toEqual(initBigNumber(1.5625));
    expect(eurStxMarketData.pair.base).toEqual('STX');
    expect(eurStxMarketData.pair.quote).toEqual('EUR');
    expect(eurStxMarketData.price.symbol).toEqual('EUR');
    expect(convertAmountToBaseUnit(jpyStxMarketData.price)).toEqual(initBigNumber(312.5));
    expect(jpyStxMarketData.pair.base).toEqual('STX');
    expect(jpyStxMarketData.pair.quote).toEqual('JPY');
    expect(jpyStxMarketData.price.symbol).toEqual('JPY');
  });

  it('throws an error if target quote currency does not match market data quote currency', () => {
    const stxUsdMarketData = createMarketData(
      createMarketPair('STX', 'USD'),
      createMoneyFromDecimal(1.5, 'USD')
    );
    const usdEurExchangeRate = createMarketData(
      createMarketPair('USD', 'EUR'),
      createMoneyFromDecimal(0.88, 'EUR')
    );
    const gbpCadExchangeRate = createMarketData(
      createMarketPair('GBP', 'CAD'),
      createMoneyFromDecimal(1.85, 'CAD')
    );
    expect(() => rebaseMarketData(stxUsdMarketData, usdEurExchangeRate)).toThrowError();
    expect(() => rebaseMarketData(stxUsdMarketData, gbpCadExchangeRate)).toThrowError();
  });

  it('throws an error if target currency is not a supported quote currency', () => {
    const stxUsdMarketData = createMarketData(
      createMarketPair('STX', 'USD'),
      createMoneyFromDecimal(1.5, 'USD')
    );
    const btcUsdExchangeRate = createMarketData(
      createMarketPair('BTC', 'USD'),
      createMoneyFromDecimal(100000, 'USD')
    );
    const stxUsdExchangeRate = createMarketData(
      createMarketPair('STX', 'USD'),
      createMoneyFromDecimal(2, 'USD')
    );
    expect(() => rebaseMarketData(stxUsdMarketData, btcUsdExchangeRate)).not.toThrowError();
    expect(() => rebaseMarketData(stxUsdMarketData, stxUsdExchangeRate)).toThrowError();
  });
});

describe('invertExchangeRate', () => {
  it('inverts exchange rate by swapping base/quote currencies', () => {
    const jpyGbpExchangeRate = createMarketData(
      createMarketPair('JPY', 'GBP'),
      createMoneyFromDecimal(0.005, 'GBP')
    );
    const usdEurExchangeRate = createMarketData(
      createMarketPair('USD', 'EUR'),
      createMoneyFromDecimal(0.8, 'EUR')
    );
    const eurUsdExchangeRate = invertExchangeRate(usdEurExchangeRate);
    expect(eurUsdExchangeRate.pair.base).toEqual('EUR');
    expect(eurUsdExchangeRate.pair.quote).toEqual('USD');
    expect(convertAmountToBaseUnit(eurUsdExchangeRate.price)).toEqual(initBigNumber(1.25));
    const gbpJpyExchangeRate = invertExchangeRate(jpyGbpExchangeRate);
    expect(gbpJpyExchangeRate.pair.base).toEqual('GBP');
    expect(gbpJpyExchangeRate.pair.quote).toEqual('JPY');
    expect(convertAmountToBaseUnit(gbpJpyExchangeRate.price)).toEqual(initBigNumber(200));
  });

  it('throws an error if base currency is not a supported quote currency', () => {
    const stxUsdExchangeRate = createMarketData(
      createMarketPair('STX', 'USD'),
      createMoneyFromDecimal(2, 'USD')
    );
    expect(() => invertExchangeRate(stxUsdExchangeRate)).toThrowError();
  });
});
