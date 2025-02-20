import { z } from 'zod';

import { createPageSchema } from './leather-api.pagination';

export const leatherApiUtxoSchema = z.object({
  txid: z.string(),
  vout: z.number(),
  value: z.string(),
  height: z.number().optional(),
  address: z.string(),
  path: z.string(),
});

export const leatherApiBitcoinTransactionSchema = z.object({
  txid: z.string(),
  height: z.number().optional(),
  time: z.number().optional(),
  vin: z.array(
    z.object({
      txid: z.string(),
      n: z.number(),
      owned: z.boolean().optional(),
      address: z.string().optional(),
      path: z.string().optional(),
      value: z.string(),
    })
  ),
  vout: z.array(
    z.object({
      n: z.number(),
      owned: z.boolean().optional(),
      address: z.string().optional(),
      path: z.string().optional(),
      value: z.string(),
    })
  ),
});
export const leatherApiBitcoinTransactionPageSchema = createPageSchema(
  leatherApiBitcoinTransactionSchema
);

export const leatherApiFiatRatesSchema = z.object({
  timestamp: z.string().datetime(),
  rates: z.object({
    EUR: z.number(),
    GBP: z.number(),
    AUD: z.number(),
    CAD: z.number(),
    CNY: z.number(),
    JPY: z.number(),
    KRW: z.number(),
  }),
});

export const leatherApiCryptoPricesSchema = z.object({
  timestamp: z.string().datetime(),
  prices: z.object({
    STX: z.number(),
    BTC: z.number(),
  }),
});

export const leatherApiSip10PricesSchema = z.object({
  timestamp: z.string().datetime(),
  prices: z.array(
    z.object({
      symbol: z.string(),
      principal: z.string(),
      price: z.number(),
    })
  ),
});

export const leatherApiRegisterNotificationsResponseSchema = z.object({
  success: z.boolean(),
});
