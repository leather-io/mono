import { MEMO_MAX_LENGTH_BYTES } from '@stacks/transactions';

function exceedsMaxLengthBytes(value: string, maxLengthBytes: number): boolean {
  return value ? Buffer.from(value).length > maxLengthBytes : false;
}

export function isValidStacksMemo(memo: string) {
  return !exceedsMaxLengthBytes(memo, MEMO_MAX_LENGTH_BYTES);
}
