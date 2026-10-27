import axios from 'axios';

import { type CryptoCurrency } from '@leather.io/models';

interface BinanceTickerPriceResponse {
  symbol: string;
  price: string;
}

export async function fetchBinanceMarketData(currency: CryptoCurrency) {
  const resp = await axios.get<BinanceTickerPriceResponse>(
    `https://api1.binance.com/api/v3/ticker/price?symbol=${currency}USDT`
  );
  return resp.data;
}

export function selectBinanceUsdPrice(resp?: BinanceTickerPriceResponse) {
  return resp?.price;
}
