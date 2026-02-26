import dayjs from 'dayjs';
import { styled } from 'leather-styles/jsx';

interface ActivityDateHeaderProps {
  timestamp: number;
}

function formatDateGroupLabel(timestampSeconds: number): string {
  const date = dayjs(timestampSeconds * 1000);
  const now = dayjs();
  const today = now.startOf('day');
  const yesterday = today.subtract(1, 'day');

  if (date.isAfter(today)) return 'Today';
  if (date.isAfter(yesterday)) return 'Yesterday';
  return date.format('MMM DD, YYYY');
}

export function getDateGroupKey(timestampSeconds: number): string {
  return dayjs(timestampSeconds * 1000)
    .startOf('day')
    .valueOf()
    .toString();
}

export function ActivityDateHeader({ timestamp }: ActivityDateHeaderProps) {
  return (
    <styled.div px="space.05" py="space.02">
      <styled.p textStyle="label.03" color="ink.text-subdued">
        {formatDateGroupLabel(timestamp)}
      </styled.p>
    </styled.div>
  );
}
