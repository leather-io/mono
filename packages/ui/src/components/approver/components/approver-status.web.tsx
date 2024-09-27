import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import { BulletSeparator } from '../../../components/bullet-separator/bullet-separator.web';

type ApproverStatusName = 'completed' | 'error' | 'pending';

export const loadingStripedGradient = css({
  pos: 'relative',
  overflow: 'hidden',
  _before: {
    content: '""',
    position: 'absolute',
    width: '500px',
    height: '500px',
    backgroundImage:
      'repeating-linear-gradient(45deg, #F07D12, #F07D12 16px, #FFB977 16px, #FFB977 32px)',
    animation: 'barberpole 40s linear infinite',
    backgroundSize: '193% 100%',
  },
});

interface StatusIndicatorLineProps {
  status: ApproverStatusName;
}
function StatusIndicatorLine({ status }: StatusIndicatorLineProps) {
  switch (status) {
    case 'pending':
      return <styled.div height="4px" className={loadingStripedGradient} />;
    case 'error':
      return <styled.div height="4px" bg="red.action-primary-default" />;
    case 'completed':
      return <styled.div height="4px" bg="green.action-primary-default" />;
    default:
      return null;
  }
}

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
