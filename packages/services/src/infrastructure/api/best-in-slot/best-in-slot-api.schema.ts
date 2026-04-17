import { z } from 'zod';

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
