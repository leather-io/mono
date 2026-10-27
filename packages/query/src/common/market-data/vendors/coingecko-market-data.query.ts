import axios from 'axios';
import { first, values } from 'remeda';

import { type CryptoCurrency } from '@leather.io/models';

const currencyNameMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'blockstack',
};

type CoingeckoSimplePriceResponse = Record<string, { usd?: number } | undefined>;

export async function fetchCoingeckoMarketData(currency: CryptoCurrency) {
  const resp = await axios.get<CoingeckoSimplePriceResponse>(
    `https://api.coingecko.com/api/v3/simple/price?ids=${currencyNameMap[currency]}&vs_currencies=usd`
  );
  return resp.data;
}

export function selectCoingeckoUsdPrice(resp: CoingeckoSimplePriceResponse) {
  return first(values(resp))?.usd;
}
