import { truncateMiddle } from '@leather.io/utils';

export function formatAccountName(input: string | undefined, maxLength = 20, offset = 4) {
  // eslint-disable-next-line no-restricted-syntax -- empty in, empty out string transform
  if (!input) return '';

  if (input.length > maxLength) {
    return truncateMiddle(input, offset);
  }
  return input;
}
