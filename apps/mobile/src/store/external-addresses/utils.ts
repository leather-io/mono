import z from 'zod';

export const externalAddressSchema = z.object({
  address: z.string(),
  type: z.enum(['BTC', 'STX']),
});

export type ExternalAddress = z.infer<typeof externalAddressSchema>;
