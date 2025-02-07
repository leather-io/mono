export const OnChainActivityStatuses = {
  pending: 'pending',
  success: 'success',
  failed: 'failed',
} as const;
export type OnChainActivityStatus = keyof typeof OnChainActivityStatuses;
