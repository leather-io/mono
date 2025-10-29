import { z } from 'zod';

export const mempoolUtxoSchema = z.object({
  txid: z.string(),
  vout: z.number(),
  value: z.number(),
  status: z.object({
    confirmed: z.boolean(),
    block_height: nullishToUndefined(z.number()),
    block_hash: nullishToUndefined(z.string()),
    block_time: nullishToUndefined(z.number()),
  }),
});

export const mempoolTransactionSchema = z.object({
  txid: z.string(),
  status: z.object({
    confirmed: z.boolean(),
    block_height: nullishToUndefined(z.number()),
    block_hash: nullishToUndefined(z.string()),
    block_time: nullishToUndefined(z.number()),
  }),
  fees: nullishToUndefined(z.number()),
  vin: z.array(
    z.object({
      txid: z.string(),
      vout: z.number(),
      prevout: z
        .object({
          scriptpubkey_address: z.string(),
          value: nullishToUndefined(z.number()),
        })
        .nullish(),
    })
  ),
  vout: z.array(
    z.object({
      scriptpubkey_address: nullishToUndefined(z.string()),
      value: nullishToUndefined(z.number()),
    })
  ),
});

export type MempoolUtxo = z.infer<typeof mempoolUtxoSchema>;
export type MempoolTransaction = z.infer<typeof mempoolTransactionSchema>;

export interface MempoolDescriptorFields {
  address: string;
  path: string;
}

export type MempoolDescriptorUtxo = MempoolUtxo & MempoolDescriptorFields;
export type MempoolDescriptorTransaction = MempoolTransaction & MempoolDescriptorFields;

export function nullishToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish().transform(val => (val === null ? undefined : val));
}
