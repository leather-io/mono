import { Activity } from '@leather.io/models';

export function sortActivityByTimestampDesc(a: Activity, b: Activity) {
  return b.timestamp - a.timestamp;
}
