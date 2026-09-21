import { styled } from 'leather-styles/jsx';

import { BulletSeparator } from '../../../components/bullet-separator/bullet-separator.web';
import { StatusIndicatorLine } from '../../status-indicator-line/status-indicator-line.web';

type ApproverStatusName = 'completed' | 'error' | 'pending';

interface ApproverStatusProps {
  status: ApproverStatusName;
}
export function ApproverStatus({ status }: ApproverStatusProps) {
  return (
    <styled.div pos="relative">
      <StatusIndicatorLine status={status} />
      <styled.div
        textStyle="label.03"
        background="ink.background-primary"
        px="space.05"
        py="space.03"
      >
        <BulletSeparator spacing="space.02">
          <styled.span textTransform="capitalize">{status}</styled.span>
          <styled.span>Some mock date</styled.span>
        </BulletSeparator>
      </styled.div>
    </styled.div>
  );
}
