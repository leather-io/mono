import dayjs from 'dayjs';

export function formatSats(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return `${n.toLocaleString()} sats`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimestampWithTime(timestamp: number): string {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm');
}
