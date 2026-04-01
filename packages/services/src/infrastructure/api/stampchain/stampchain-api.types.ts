import { z } from 'zod';

import { stampchainStampSchema } from './stampchain-api.schema';

export type StampchainStamp = z.infer<typeof stampchainStampSchema>;
