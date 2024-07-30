import { z } from 'zod';

import { networkModes, testnetModes } from './network.model';

export const bitcoinNetworkModesSchema = z.enum([...networkModes, ...testnetModes]);

export const networkConfigurationSchema = z.object({
  name: z.string(),
  id: z.string(),
  chain: z.object({
    bitcoin: z.object({
      blockchain: z.literal('bitcoin'),
      bitcoinUrl: z.string(),
      bitcoinNetwork: bitcoinNetworkModesSchema,
    }),
    stacks: z.object({
      blockchain: z.literal('stacks'),
      url: z.string(),
      chainId: z.number(),
      subnetChainId: z.number().optional(),
    }),
  }),
});
