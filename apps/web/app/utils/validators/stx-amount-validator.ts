import { z } from 'zod';

export function stxAmountSchema() {
  return z
    .number({
      required_error: 'Enter an amount of STX',
      invalid_type_error: 'STX amount must be a number',
    })
    .positive('You must stack something');
}
