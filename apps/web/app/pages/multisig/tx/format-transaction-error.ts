import { LeatherApiError } from '@leather.io/services';

function extractRejectionReason(message: string): string | undefined {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  if (start === -1 || end <= start) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(message.slice(start, end + 1));
  } catch {
    return undefined;
  }

  if (typeof parsed !== 'object' || parsed === null || !('reason' in parsed)) return undefined;
  const reason = parsed.reason;
  return typeof reason === 'string' && reason.trim() ? reason.trim() : undefined;
}

function getErrorDetail(error: Error): string | undefined {
  if (LeatherApiError.isLeatherApiError(error) && error.data?.error?.trim()) {
    return error.data.error.trim();
  }
  return error.message?.trim() || undefined;
}

export function formatTransactionActionError(error: Error): string | undefined {
  const detail = getErrorDetail(error);
  if (!detail) return undefined;
  const reason = extractRejectionReason(detail);
  return reason ? `Transaction rejected: ${reason}` : detail;
}
