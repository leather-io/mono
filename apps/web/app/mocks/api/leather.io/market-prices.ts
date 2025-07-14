const resp = {
  format: 'map',
  meta: {
    count: 2,
    timestamp: '2025-07-16T14:23:03.755Z',
  },
  data: {
    BTC: {
      price: 118487.9388888889,
      change24h: 0.45,
      lastPriceAt: '2025-07-16T14:13:57.094Z',
    },
    STX: {
      price: 0.8032193333333333,
      change24h: 2.13,
      lastPriceAt: '2025-07-16T14:13:55.985Z',
    },
  },
};

export const leatherMarketPricesHandler = {
  path: 'https://*.leather.io/v1/market/prices/native',
  resp,
  method: 'get',
} as const;
