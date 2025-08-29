import z from 'zod';

const bnsV2ApiNameSchema = z.object({
  name_string: z.string(),
  namespace_string: z.string(),
  full_name: z.string(),
  owner: z.string(),
  registered_at: z.string(),
  renewal_height: z.string(),
  stx_burn: z.string(),
  revoked: z.boolean(),
  imported_at: z.string(),
  preordered_by: z.string(),
  is_valid: z.boolean(),
});
export const bnsV2ApiNameResponseSchema = z.object({
  current_burn_block: z.number(),
  status: z.string(),
  data: bnsV2ApiNameSchema,
});
export type BnsV2ApiName = z.infer<typeof bnsV2ApiNameSchema>;
export type BnsV2ApiNameResponse = z.infer<typeof bnsV2ApiNameResponseSchema>;

const bnsV2ApiAddressNameSchema = z.object({
  full_name: z.string(),
  name_string: z.string(),
  namespace_string: z.string(),
  owner: z.string(),
  registered_at: z.string(),
  renewal_height: z.string(),
  stx_burn: z.string(),
  revoked: z.boolean(),
});
export const bnsV2ApiAddressNamesResponseSchema = z.object({
  total: z.number(),
  current_burn_block: z.number(),
  limit: z.number(),
  offset: z.number(),
  names: z.array(bnsV2ApiAddressNameSchema),
});
export type BnsV2ApiAddressName = z.infer<typeof bnsV2ApiAddressNameSchema>;
export type BnsV2ApiAddressNamesResponse = z.infer<typeof bnsV2ApiAddressNamesResponseSchema>;

const bnsV2ApiZoneFileAddressSchema = z.object({
  network: z.string(),
  address: z.string(),
  type: z.string(),
});
const bnsV2ApiZoneFileSchema = z.object({
  owner: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  pfp: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
  btc: z.string().optional(),
  addresses: z.array(bnsV2ApiZoneFileAddressSchema).optional(),
});
export const bnsV2ApiZoneFileResponseSchema = z.object({
  full_name: z.string(),
  zonefile: bnsV2ApiZoneFileSchema,
});
export type BnsV2ApiZoneFilResponse = z.infer<typeof bnsV2ApiZoneFileResponseSchema>;
export type BnsV2ApiZoneFileAddress = z.infer<typeof bnsV2ApiZoneFileAddressSchema>;
export type BnsV2ApiZoneFile = z.infer<typeof bnsV2ApiZoneFileSchema>;
