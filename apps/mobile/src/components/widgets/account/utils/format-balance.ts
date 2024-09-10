// FIXME: This is a temporary solution to format the balance. We need to use the same format as the extension.
// We should move the extension's formatBalance to the mono repo.

export const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
};
