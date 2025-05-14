export class LeatherApiError extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly data?: { error: string }
  ) {
    super(`Leather API (${url}): ${status} ${statusText}`);
    this.name = 'LeatherApiError';
  }

  static isLeatherApiError(error: unknown): error is LeatherApiError {
    return error instanceof LeatherApiError;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isUnprocessableEntity(): boolean {
    return this.status === 422;
  }
}
