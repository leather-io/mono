import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

export async function fetchBinanceMarketData(currency: CryptoCurrency) {
  const resp = await axios.get(
    `https://api1.binance.com/api/v3/ticker/price?symbol=${currency}USDT`
  );
  return resp.data;
}

export function selectBinanceUsdPrice(resp: any) {
  return resp?.price;
}
