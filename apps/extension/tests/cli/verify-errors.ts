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
