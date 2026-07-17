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

export async function readLeatherApiErrorData(
  response: Response
): Promise<{ error: string } | undefined> {
  try {
    const body: unknown = await response.clone().json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return { error: body.error };
    }
  } catch {
    return undefined;
  }
  return undefined;
}
