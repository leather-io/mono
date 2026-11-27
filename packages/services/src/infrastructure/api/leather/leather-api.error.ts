export interface LeatherApiErrorData {
  error: string;
  code?: string;
  reason?: string;
  txid?: string;
  transaction?: string;
}

export class LeatherApiError extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly data?: LeatherApiErrorData
  ) {
    const baseMessage = `Leather API (${url}): ${status} ${statusText}`;
    super(data?.error ? `${baseMessage} — ${data.error}` : baseMessage);
    this.name = 'LeatherApiError';
  }

  static isLeatherApiError(error: unknown) {
    return error instanceof LeatherApiError;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isUnprocessableEntity(): boolean {
    return this.status === 422;
  }
}

export function getErrorDetail(error: unknown): string | undefined {
  if (LeatherApiError.isLeatherApiError(error) && error.data?.error.trim()) {
    return error.data.error.trim();
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return undefined;
}

export async function readLeatherApiErrorData(
  response: Response
): Promise<LeatherApiErrorData | undefined> {
  try {
    const body: unknown = await response.clone().json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      const code = 'code' in body && typeof body.code === 'string' ? body.code : undefined;
      const reason = 'reason' in body && typeof body.reason === 'string' ? body.reason : undefined;
      const txid = 'txid' in body && typeof body.txid === 'string' ? body.txid : undefined;
      const transaction =
        'transaction' in body && typeof body.transaction === 'string'
          ? body.transaction
          : undefined;
      return { error: body.error, code, reason, txid, transaction };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function assertLeatherApiData<T>(data: T | undefined): T {
  if (data === undefined) throw new Error('Leather API returned an empty response');
  return data;
}
