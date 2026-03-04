import { styled } from 'leather-styles/jsx';

import { formatDateGroupLabel } from '@leather.io/features';

export { getDateGroupKey } from '@leather.io/features';

interface ActivityDateHeaderProps {
  timestamp: number;
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
