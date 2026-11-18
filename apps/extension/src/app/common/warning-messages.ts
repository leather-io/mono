export const SendFormWarningMessages = {
  AdjustedFeeBelowLowestEstimate: 'Fee lower than suggested. Transaction may fail.',
} as const;
export type SendFormWarningMessages =
  (typeof SendFormWarningMessages)[keyof typeof SendFormWarningMessages];
