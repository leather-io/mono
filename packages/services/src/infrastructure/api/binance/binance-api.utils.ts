import { BinanceMarketData } from './binance-api.client';

export function readBinanceMarketDataPrice(marketData: BinanceMarketData): number | undefined {
  const price = parseFloat(marketData.price);
  if (isNaN(price)) return;
  return price;
}
