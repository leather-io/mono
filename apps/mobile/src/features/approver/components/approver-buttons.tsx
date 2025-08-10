import { SpinnerIcon } from '@/components/spinner-icon';
import { t } from '@lingui/core/macro';

import { Button, CheckmarkCircleIcon } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

import { ApproverState } from '../utils';

interface ApproverButtonsProps {
  approverState: ApproverState;
  onBack(): void;
  onApprove(): void;
}

export function ApproverButtons({ approverState, onBack, onApprove }: ApproverButtonsProps) {
  switch (approverState) {
    case 'start':
      return (
        <>
          <Button variant="outline" flex={1} onPress={onBack}>
            {t`Edit`}
          </Button>
          <Button flex={1} onPress={onApprove}>
            {t`Approve`}
          </Button>
        </>
      );
    case 'submitting':
      return (
        <Button flex={1} iconStart={() => <SpinnerIcon invertColors />}>
          {t`Submitting...`}
        </Button>
      );

    case 'submitted':
      return (
        <Button flex={1} iconStart={() => <CheckmarkCircleIcon color="ink.background-primary" />}>
          {t`Submitted`}
        </Button>
      );
    default:
      assertUnreachable(approverState);
  }
}
