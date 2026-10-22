export class VerifyUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerifyUsageError';
  }
}

export class VerifyEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerifyEnvironmentError';
  }
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return `unexpected error ${JSON.stringify(error)}`;
}
