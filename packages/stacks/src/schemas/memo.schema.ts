import { createMemoString } from '@stacks/transactions';
import { z } from 'zod';

export const stacksMemoSchema = z.string().refine(
  value => {
    try {
      createMemoString(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid memo string' }
);
