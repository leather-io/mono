import { z } from 'zod';

import { stampchainBalanceResponseSchema, stampchainStampSchema } from './stampchain-api.schema';

export type StampchainStamp = z.infer<typeof stampchainStampSchema>;

export type StampchainBalanceResponse = z.infer<typeof stampchainBalanceResponseSchema>;
