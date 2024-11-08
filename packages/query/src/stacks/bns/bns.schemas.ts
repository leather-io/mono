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

export const bnsV2NamesByAddressSchema = z.object({
  total: z.number(),
  current_burn_block: z.number(),
  limit: z.number(),
  offset: z.number(),
  names: z.array(bnsV2NameSchema),
});
