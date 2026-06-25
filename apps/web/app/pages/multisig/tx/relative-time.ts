const minuteMs = 60_000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;
const monthDays = 30;

// Compact relative time for proposal/broadcast timestamps ("just now", "12 min
// ago", "3 hr ago", "2 days ago"); falls back to a locale date past a month.
export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < minuteMs) return 'just now';
  if (diff < hourMs) {
    const minutes = Math.floor(diff / minuteMs);
    return `${minutes} min ago`;
  }
  if (diff < dayMs) {
    const hours = Math.floor(diff / hourMs);
    return `${hours} hr ago`;
  }
  const days = Math.floor(diff / dayMs);
  if (days < monthDays) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
}
