import { z } from 'zod';

const bitcoinTxVectorOutputSchema = z.object({
  scriptpubkey: z.string(),
  scriptpubkey_asm: z.string(),
  scriptpubkey_type: z.string(),
  scriptpubkey_address: z.string(),
  value: z.number(),
  valuecommitment: z.number().optional(),
  asset: z.string().optional(),
  assetcommitment: z.number().optional(),
  pegout: z
    .object({
      genesis_hash: z.string(),
      scriptpubkey: z.string(),
      scriptpubkey_asm: z.string(),
      scriptpubkey_address: z.string(),
    })
    .nullish(),
});

const bitcoinTxVectorInputSchema = z.object({
  inner_redeemscript_asm: z.string().optional(),
  inner_witnessscript_asm: z.string().optional(),
  is_coinbase: z.boolean(),
  is_pegin: z.boolean().optional(),
  issuance: z
    .object({
      asset_id: z.string(),
      is_reissuance: z.boolean(),
      asset_blinding_nonce: z.number(),
      asset_entropy: z.number(),
      contract_hash: z.string(),
      assetamount: z.number().optional(),
      assetamountcommitment: z.number().optional(),
      tokenamount: z.number().optional(),
      tokenamountcommitment: z.number().optional(),
    })
    .nullish(),
  prevout: bitcoinTxVectorOutputSchema,
  scriptsig: z.string(),
  scriptsig_asm: z.string(),
  sequence: z.number(),
  txid: z.string(),
  vout: z.number(),
  witness: z.array(z.string()),
});

export const increaseBtcFeeRouteStateSchema = z.object({
  btcTx: z.object({
    fee: z.number(),
    locktime: z.number(),
    size: z.number(),
    status: z.object({
      confirmed: z.boolean(),
      block_height: z.number().nullish(),
      block_hash: z.string().nullish(),
      block_time: z.number().nullish(),
    }),
    tx_type: z.string().optional(),
    txid: z.string(),
    version: z.number(),
    vin: z.array(bitcoinTxVectorInputSchema),
    vout: z.array(bitcoinTxVectorOutputSchema),
    weight: z.number(),
  }),
});
