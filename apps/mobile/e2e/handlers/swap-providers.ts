import { HttpResponse, http } from 'msw';

const velarSdkUrl = /^https:\/\/sdk\.velar\.network\//;
const alexSdkUrl = /^https:\/\/alex-sdk-api\.alexlab\.co\/?(\?.*)?$/;
const alexPricesUrl = /^https:\/\/api\.alexgo\.io\/v2\/public\/token-prices/;
const bitflowBffTokensUrl = /^https:\/\/bff\.bitflowapis\.finance\/api\/quotes\/v1\/tokens/;

export const swapProviderHandlers = [
  http.get(velarSdkUrl, () => HttpResponse.json({ data: [] })),
  http.get(alexSdkUrl, () => HttpResponse.json({ tokens: [], pools: [] })),
  http.get(alexPricesUrl, () => HttpResponse.json({ data: [] })),
  http.get(bitflowBffTokensUrl, () => HttpResponse.json({ tokens: [] })),
];
