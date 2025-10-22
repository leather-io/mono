import { Box } from '@leather.io/ui/native';

import { RunningAnimation } from './running-animation';

type Status = 'pending' | 'success' | 'failed' | 'stalled';

const barHeight = 5;

export function StatusBar({ status }: { status: Status }) {
  const bg = (
    {
      pending: 'yellow.action-primary-default',
      success: 'green.action-primary-default',
      failed: 'red.action-primary-default',
      stalled: 'yellow.action-primary-default',
    } as const
  )[status];

  if (status === 'pending' || status === 'stalled') return <RunningAnimation status={status} />;

  return <Box height={barHeight} flex={1} bg={bg} flexDirection="row" />;
}
