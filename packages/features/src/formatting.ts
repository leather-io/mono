/**
 * Formats a satoshi value with locale-specific thousands separators.
 * @param value - The satoshi amount as a string or number
 * @returns Formatted string like "1,234,567 sats"
 */
export function formatSats(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return `${n.toLocaleString()} sats`;
}

/**
 * Formats a Unix timestamp (seconds) to a human-readable date.
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string like "Jan 15, 2024"
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a Unix timestamp (seconds) to a date-time string with UTC.
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date-time string like "2024-01-15 14:30 UTC"
 */
export function formatTimestampWithTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}
