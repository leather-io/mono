import { z } from 'zod';

import { sumNumbers } from '@leather.io/utils';

/** @knipignore */
export interface MempoolWsBitcoinTx {
  txid: string;
  vin: MempoolWsBitcoinVin[];
  vout: MempoolWsBitcoinVout[];
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number | null;
  };
}

interface MempoolWsBitcoinVin {
  txid: string;
  prevout: MempoolWsBitcoinVout;
}

interface MempoolWsBitcoinVout {
  scriptpubkey_address: string;
  value: number;
}

function parseEach<T>(schema: z.ZodType<T>, values: unknown[]) {
  return values.flatMap(value => {
    const parsedValue = schema.safeParse(value);
    return parsedValue.success ? [parsedValue.data] : [];
  });
}

const mempoolWsBitcoinVoutSchema = z.object({
  scriptpubkey_address: z.string(),
  value: z.number(),
});

const mempoolWsBitcoinVinSchema = z.object({
  txid: z.string(),
  prevout: mempoolWsBitcoinVoutSchema,
});

const mempoolWsBitcoinTxSchema = z.object({
  txid: z.string(),
  vin: z.array(z.unknown()).transform(vins => parseEach(mempoolWsBitcoinVinSchema, vins)),
  vout: z.array(z.unknown()).transform(vouts => parseEach(mempoolWsBitcoinVoutSchema, vouts)),
  fee: z.number(),
  status: z.object({
    confirmed: z.boolean(),
    block_height: z.number().nullish(),
  }),
});

const mempoolWsAddressTransactionsSchema = z
  .object({
    confirmed: z
      .array(z.unknown())
      .transform(transactions => parseEach(mempoolWsBitcoinTxSchema, transactions)),
  })
  .catch({ confirmed: [] });

const mempoolWsBitcoinTxMessageSchema = z.object({
  'multi-address-transactions': z.record(z.string(), mempoolWsAddressTransactionsSchema),
});
export type MempoolWsBitcoinTxMessage = z.infer<typeof mempoolWsBitcoinTxMessageSchema>;

export function parseMempoolWsBitcoinTxMessage(message: unknown) {
  const parsedMessage = mempoolWsBitcoinTxMessageSchema.safeParse(message);
  return parsedMessage.success ? parsedMessage.data : null;
}

export interface MempoolWsBtcPrice {
  time: number;
  USD: number;
}

export function readMempooWsBtcPriceUsd(mempoolWsPrice: MempoolWsBtcPrice) {
  return mempoolWsPrice.USD;
}

export function readMempoolWsBitcoinTxAddressResult(
  address: string,
  transaction: MempoolWsBitcoinTx
) {
  let satValue = 0;
  let isSender = false;

  const vin = transaction.vin.find(vin => vin.prevout.scriptpubkey_address === address);

  if (vin) {
    // address is sender, value is sum of all vouts not to same address
    isSender = true;
    satValue = sumNumbers(
      transaction.vout.filter(vout => vout.scriptpubkey_address !== address).map(vout => vout.value)
    ).toNumber();
  } else {
    const vout = transaction.vout.find(vout => vout.scriptpubkey_address === address);
    if (vout) {
      // address is receiver, value is in matching vout
      isSender = false;
      satValue = vout.value;
    }
  }
  return {
    isSender,
    satValue,
    fee: transaction.fee,
    blockHeight: transaction.status.block_height ?? 0,
  };
}
