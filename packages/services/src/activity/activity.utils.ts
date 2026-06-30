export function sortActivityByTimestampDesc(a: { timestamp: number }, b: { timestamp: number }) {
  return b.timestamp - a.timestamp;
}
