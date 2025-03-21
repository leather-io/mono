import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

const currencyNameMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'stacks',
};

export async function fetchCoincapMarketData(currency: CryptoCurrency) {
  const resp = await axios.get(`https://api.coincap.io/v2/assets/${currencyNameMap[currency]}`);
  return resp.data;
}

export function selectCoincapUsdPrice(resp: any) {
  return resp?.data?.priceUsd;
}
