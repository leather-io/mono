export class SwapSigningCancelledError extends Error {
  constructor() {
    super('Swap signing cancelled');
    this.name = 'SwapSigningCancelledError';
  }
}

export function isSwapSigningCancelledError(error: unknown): boolean {
  return error instanceof SwapSigningCancelledError;
}
