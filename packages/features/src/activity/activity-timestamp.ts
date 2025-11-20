import dayjs from 'dayjs';

import type { Activity } from '@leather.io/models';

export function formatActivityCaption({ timestamp }: Pick<Activity, 'timestamp'>) {
  const timestampInSeconds = timestamp * 1000;
  const isRecent = !dayjs(timestampInSeconds).isBefore(dayjs().subtract(1, 'hour'));
  const time = dayjs(timestampInSeconds).format('MMM D, YYYY');

  const timestampText = isRecent
    ? `${dayjs().diff(dayjs(timestampInSeconds), 'minute')} ${`minutes ago`}`
    : time;

  return timestampText;
}
