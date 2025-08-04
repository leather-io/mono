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
          <Button buttonState="outline" title={t`Edit`} flex={1} onPress={onBack} />
          <Button buttonState="default" title={t`Approve`} flex={1} onPress={onApprove} />
        </>
      );
    case 'submitting':
      return (
        <Button
          flex={1}
          buttonState="default"
          title={t`Submitting...`}
          icon={<SpinnerIcon invertColors />}
        />
      );

    case 'submitted':
      return (
        <Button
          flex={1}
          buttonState="success"
          title={t`Submitted`}
          icon={<CheckmarkCircleIcon color="ink.background-primary" />}
        />
      );
    default:
      assertUnreachable(approverState);
  }
}
