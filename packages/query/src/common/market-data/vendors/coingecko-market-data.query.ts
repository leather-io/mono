import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

const currencyNameMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'blockstack',
};

export async function fetchCoingeckoMarketData(currency: CryptoCurrency) {
  const resp = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${currencyNameMap[currency]}&vs_currencies=usd`
  );
  return resp.data;
}

export function selectCoingeckoUsdPrice(resp: any) {
  return (Object.values(resp)[0] as any)?.usd;
}
