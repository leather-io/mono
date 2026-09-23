import {
  type SbtcSponsorshipErrorCode,
  type SbtcSponsorshipIneligibilityReason,
  sbtcSponsorshipErrorCodeSchema,
  sbtcSponsorshipIneligibilityReasonSchema,
} from './leather-sponsorship-api.types';

export interface LeatherApiErrorData {
  error: string;
  code?: string;
  reason?: string;
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

export function getErrorDetail(error: unknown): string | undefined {
  if (LeatherApiError.isLeatherApiError(error) && error.data?.error.trim()) {
    return error.data.error.trim();
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return undefined;
}

export function getSbtcSponsorshipErrorCode(error: unknown): SbtcSponsorshipErrorCode | undefined {
  if (!LeatherApiError.isLeatherApiError(error)) return undefined;
  const parsed = sbtcSponsorshipErrorCodeSchema.safeParse(error.data?.code);
  return parsed.success ? parsed.data : undefined;
}

export function getSbtcSponsorshipIneligibilityReason(
  error: unknown
): SbtcSponsorshipIneligibilityReason | undefined {
  if (!LeatherApiError.isLeatherApiError(error)) return undefined;
  const parsed = sbtcSponsorshipIneligibilityReasonSchema.safeParse(error.data?.reason);
  return parsed.success ? parsed.data : undefined;
}

export async function readLeatherApiErrorData(
  response: Response
): Promise<LeatherApiErrorData | undefined> {
  try {
    const body: unknown = await response.clone().json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      const code = 'code' in body && typeof body.code === 'string' ? body.code : undefined;
      const reason = 'reason' in body && typeof body.reason === 'string' ? body.reason : undefined;
      return { error: body.error, code, reason };
    }
  } catch {
    return undefined;
  }
  return undefined;
}
