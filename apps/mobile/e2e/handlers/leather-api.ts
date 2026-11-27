import { HttpResponse, http } from 'msw';

import { appConfig } from '../fixtures/app-config';
import {
  type LeatherBitcoinTx,
  type LeatherUtxo,
  fundedDescriptorTransactions,
  fundedDescriptorUtxos,
  transactionsPage,
} from '../fixtures/bitcoin';
import {
  bitcoinFeeRates,
  fiatRates,
  nativePrices,
  priceHistory,
  swapDexes,
} from '../fixtures/market';
import { sip10Analytics, sip10Prices, sip10Tokens } from '../fixtures/sip10';
import { rememberServedUtxos } from '../served-prevouts';
import { leatherApiUrl, readPathSegment } from './urls';

type ComplianceStatus = 'compliant' | 'non_compliant' | 'unavailable';

const notFound = { error: 'Not found' };

function mapFormat<T>(data: T) {
  return { format: 'map', data };
}

function readNativePrice(symbol: string) {
  if (symbol === 'BTC') return nativePrices.BTC;
  if (symbol === 'STX') return nativePrices.STX;
  return null;
}

function readSip10Price(principal: string) {
  const prices: Record<string, { price: number }> = sip10Prices;
  return prices[principal] ?? null;
}

export function bitcoinUtxosHandlers(readUtxos: (descriptor: string) => LeatherUtxo[]) {
  return [
    http.get(leatherApiUrl('/v1/utxos/addresses/:segment'), () => HttpResponse.json([])),
    http.get(leatherApiUrl('/v1/utxos/:segment'), ({ request }) => {
      const utxos = readUtxos(readPathSegment(request.url, -1));
      rememberServedUtxos(utxos);
      return HttpResponse.json(utxos);
    }),
  ];
}

export function bitcoinTransactionsHandlers(
  readTransactions: (descriptor: string) => LeatherBitcoinTx[]
) {
  return [
    http.get(leatherApiUrl('/v1/transactions/bitcoin/descriptors/:segment'), ({ request }) =>
      HttpResponse.json(transactionsPage(readTransactions(readPathSegment(request.url, -1))))
    ),
    http.get(leatherApiUrl('/v1/transactions/bitcoin/addresses/:segment'), () =>
      HttpResponse.json(transactionsPage([]))
    ),
    http.get(leatherApiUrl('/v1/transactions/bitcoin/:segment'), () =>
      HttpResponse.json(notFound, { status: 404 })
    ),
  ];
}

export function complianceHandler(status: ComplianceStatus) {
  const result = status === 'compliant' ? 'pass' : 'fail';
  return http.get(leatherApiUrl('/v1/compliance/addresses/:segment'), ({ request }) =>
    HttpResponse.json({
      address: readPathSegment(request.url, -1),
      status,
      checks: [
        { type: 'ofac', result },
        { type: 'risk_screening', result },
      ],
    })
  );
}

export const leatherApiHandlers = [
  ...bitcoinUtxosHandlers(fundedDescriptorUtxos),
  ...bitcoinTransactionsHandlers(fundedDescriptorTransactions),
  complianceHandler('compliant'),
  http.get(leatherApiUrl('/v1/staking/addresses/:segment/bonds'), () =>
    HttpResponse.json({ bonds: [] })
  ),
  http.get(leatherApiUrl('/v1/market/bitcoin/fees'), () => HttpResponse.json(bitcoinFeeRates)),
  http.get(leatherApiUrl('/v1/market/fiat-rates'), () => HttpResponse.json(fiatRates)),
  http.get(leatherApiUrl('/v1/market/prices/native/:segment/history'), ({ request }) =>
    HttpResponse.json(priceHistory(readNativePrice(readPathSegment(request.url, -2))?.price ?? 1))
  ),
  http.get(leatherApiUrl('/v1/market/prices/native/:segment'), ({ request }) => {
    const price = readNativePrice(readPathSegment(request.url, -1));
    return price ? HttpResponse.json(price) : HttpResponse.json(notFound, { status: 404 });
  }),
  http.get(leatherApiUrl('/v1/market/prices/native'), () =>
    HttpResponse.json(mapFormat(nativePrices))
  ),
  http.get(leatherApiUrl('/v1/market/prices/sip10s/:segment/history'), ({ request }) =>
    HttpResponse.json(priceHistory(readSip10Price(readPathSegment(request.url, -2))?.price ?? 1))
  ),
  http.get(leatherApiUrl('/v1/market/prices/sip10s/:segment'), ({ request }) => {
    const price = readSip10Price(readPathSegment(request.url, -1));
    return price ? HttpResponse.json(price) : HttpResponse.json(notFound, { status: 404 });
  }),
  http.get(leatherApiUrl('/v1/market/prices/sip10s'), () =>
    HttpResponse.json(mapFormat(sip10Prices))
  ),
  http.get(leatherApiUrl('/v1/tokens/native/:segment/description'), ({ request }) =>
    HttpResponse.json({
      description: `${readPathSegment(request.url, -2)} description served by the e2e mocks.`,
    })
  ),
  http.get(leatherApiUrl('/v1/tokens/sip10s/:segment/description'), () =>
    HttpResponse.json({ description: 'Token description served by the e2e mocks.' })
  ),
  http.get(leatherApiUrl('/v1/tokens/sip10s/:segment'), ({ request }) => {
    const token = sip10Tokens[readPathSegment(request.url, -1)];
    return token ? HttpResponse.json(token) : HttpResponse.json(notFound, { status: 404 });
  }),
  http.get(leatherApiUrl('/v1/tokens/sip10s'), () => HttpResponse.json(mapFormat(sip10Tokens))),
  http.get(leatherApiUrl('/v1/analytics/sip10s'), () =>
    HttpResponse.json(mapFormat(sip10Analytics))
  ),
  http.get(leatherApiUrl('/v1/defi/bitflow/pools'), () => HttpResponse.json(mapFormat({}))),
  http.get(leatherApiUrl('/v1/protocols'), () => HttpResponse.json({})),
  http.get(leatherApiUrl('/v1/app-config'), () => HttpResponse.json(appConfig)),
  http.get(leatherApiUrl('/v1/swap/dexes'), () => HttpResponse.json(swapDexes)),
  http.post(leatherApiUrl('/v1/notifications/register'), () => HttpResponse.json({})),
];
