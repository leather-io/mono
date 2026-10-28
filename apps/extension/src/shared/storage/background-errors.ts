import { z } from 'zod';

export const backgroundErrorsStorageKey = 'verify:backgroundErrors';
export const backgroundErrorsLimit = 100;

const backgroundErrorRecordSchema = z.object({ ts: z.string(), message: z.string() });
export const backgroundErrorsSchema = z.array(backgroundErrorRecordSchema);

export type BackgroundErrorRecord = z.infer<typeof backgroundErrorRecordSchema>;
