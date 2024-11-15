import { z } from 'zod';

const bnsV2NameSchema = z.object({
  full_name: z.string(),
  name_string: z.string(),
  namespace_string: z.string(),
  owner: z.string(),
  registered_at: z.string(),
  renewal_height: z.string(),
  stx_burn: z.string(),
  revoked: z.boolean(),
});

export const bnsV2NamesByAddressResponseSchema = z.object({
  total: z.number(),
  current_burn_block: z.number(),
  limit: z.number(),
  offset: z.number(),
  names: z.array(bnsV2NameSchema),
});

export type BnsV2NamesByAddressResponse = z.infer<typeof bnsV2NamesByAddressResponseSchema>;

export const bnsV2ZoneFileDataSchema = z.object({
  owner: z.string(),
  general: z.string(),
  twitter: z.string(),
  url: z.string(),
  nostr: z.string(),
  lightning: z.string(),
  btc: z.string(),
  subdomains: z.array(z.string()),
});

export type BnsV2ZoneFileData = z.infer<typeof bnsV2ZoneFileDataSchema>;

export const bnsV2ZoneFileResponseSchema = z.object({
  zonefile: bnsV2ZoneFileDataSchema,
});

export type BnsV2ZoneFileDataResponse = z.infer<typeof bnsV2ZoneFileResponseSchema>;

export const bnsV2NameDataByNameResponseSchema = z.object({
  current_burn_block: z.number(),
  status: z.string(),
  data: z.object({
    name_string: z.string(),
    namespace_string: z.string(),
    full_name: z.string(),
    owner: z.string(),
    registered_at: z.string(),
    renewal_height: z.string(),
    stx_burn: z.string(),
    revoked: z.boolean(),
    imported_at: z.string().nullable(),
    is_valid: z.boolean(),
  }),
});

export type BnsV2NameDataByNameResponse = z.infer<typeof bnsV2NameDataByNameResponseSchema>;
