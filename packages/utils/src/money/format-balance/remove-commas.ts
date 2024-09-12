export function removeCommas(amountWithCommas: string) {
  if (typeof amountWithCommas !== 'string') {
    throw new Error('Amount with commas must be a string');
  }
  return amountWithCommas.replace(/,/g, '');
}
