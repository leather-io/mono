import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

export const stxTransferSip9Nft = defineRpcEndpoint({
  method: 'stx_transferSip9Nft',
  params: z
    .object({
      recipient: z.string(),
      asset: z.string(),
      assetId: z.string(),
    })
    .passthrough(),
  result: stacksTransactionDetailsSchema,
});
