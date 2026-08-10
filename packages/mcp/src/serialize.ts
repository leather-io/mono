import BigNumber from 'bignumber.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMoneyLike(
  value: Record<string, unknown>
): value is { amount: BigNumber; symbol: string; decimals: number } {
  return (
    BigNumber.isBigNumber(value.amount) &&
    typeof value.symbol === 'string' &&
    typeof value.decimals === 'number'
  );
}

export function toPlainJson(value: unknown): unknown {
  if (value === undefined || value === null) return value;
  if (BigNumber.isBigNumber(value)) return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toPlainJson);
  if (isRecord(value)) {
    if (isMoneyLike(value)) {
      return {
        amount: value.amount.shiftedBy(-value.decimals).toFixed(),
        symbol: value.symbol,
      };
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toPlainJson(entry)])
    );
  }
  return value;
}

export function encodeCursor(cursor: unknown): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCursor(encoded: string): unknown {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
}
