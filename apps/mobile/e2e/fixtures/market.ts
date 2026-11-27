export const nativePrices = {
  BTC: { price: 45000, change24h: 2.5 },
  STX: { price: 0.85, change24h: -1.2 },
};

export const fiatRates = { rates: { EUR: 0.85, GBP: 0.73, JPY: 110.0 } };

export const bitcoinFeeRates = {
  low: { rate: 1 },
  standard: { rate: 5 },
  high: { rate: 10 },
};

const historyPoints = 24;
const historyStepMs = 60 * 60 * 1000;
const historyEnd = Date.parse('2026-11-01T00:00:00Z');

export function priceHistory(price: number) {
  return {
    changePercentage: 2.5,
    snapshots: Array.from({ length: historyPoints }, (_, index) => ({
      price: price * (0.97 + (index % 6) * 0.01),
      timestamp: new Date(historyEnd - (historyPoints - index) * historyStepMs).toISOString(),
    })),
  };
}

export const swapDexes = {
  alex: {
    id: 'alex',
    name: 'ALEX',
    url: 'https://app.alexlab.co',
    logo: '',
    description: '',
    addresses: [],
  },
  bitflow: {
    id: 'bitflow',
    name: 'Bitflow',
    url: 'https://app.bitflow.finance',
    logo: '',
    description: '',
    addresses: [],
  },
  velar: {
    id: 'velar',
    name: 'Velar',
    url: 'https://app.velar.com',
    logo: '',
    description: '',
    addresses: [],
  },
};
