import { z } from 'zod';

export const bisRuneValidOutputsSchema = z.object({
  pkscript: z.string(),
  wallet_addr: z.string(),
  output: z.string(),
  rune_ids: z.array(z.string()),
  balances: z.array(z.string()),
  min_price: z.number().nullable(),
  unisat_price: z.number().nullable(),
  derivation_path: z.string(),
  rune_names: z.array(z.string()),
  spaced_rune_names: z.array(z.string()),
  decimals: z.array(z.number()),
});

const bisInscriptionDelegateSchema = z.object({
  delegate_id: z.string(),
  render_url: z.string().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  content_url: z.string(),
  bis_url: z.string(),
});

export const bisInscriptionSchema = z.object({
  inscription_name: z.string().nullable().optional(),
  inscription_id: z.string(),
  inscription_number: z.number(),
  parent_ids: z.array(z.string()),
  metadata: z.any().nullable(),
  owner_wallet_addr: z.string(),
  mime_type: z.string().nullable().optional(),
  last_sale_price: z.number().nullable().optional(),
  slug: z.string().nullable().optional(),
  collection_name: z.string().nullable().optional(),
  satpoint: z.string(),
  last_transfer_block_height: z.number().nullable().optional(),
  genesis_height: z.number(),
  content_url: z.string(),
  bis_url: z.string(),
  render_url: z.string().nullable().optional(),
  bitmap_number: z.number().nullable().optional(),
  delegate: bisInscriptionDelegateSchema.nullable().optional(),
  output_value: z.number(),
  genesis_ts: z.string(),
  genesis_block_hash: z.string(),
});

export const bisBrc20MarketInfoSchema = z.object({
  marketcap: z.number(),
  min_listed_unit_price: z.number(),
  min_listed_unit_price_ordinalswallet: z.number(),
  min_listed_unit_price_unisat: z.number(),
  min_listed_unit_price_okx: z.number(),
  listed_supply: z.number(),
  listed_supply_ratio: z.number(),
});
