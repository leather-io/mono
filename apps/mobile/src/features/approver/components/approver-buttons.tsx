import { SpinnerIcon } from '@/components/spinner-icon';
import { t } from '@lingui/macro';

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
          <Button
            buttonState="outline"
            title={t({
              id: 'approver.button.edit',
              message: 'Edit',
            })}
            flex={1}
            onPress={onBack}
          />
          <Button
            buttonState="default"
            title={t({
              id: 'approver.button.approve',
              message: 'Confirm',
            })}
            flex={1}
            onPress={onApprove}
          />
        </>
      );
    case 'submitting':
      return (
        <Button
          flex={1}
          buttonState="default"
          title={t({
            id: 'approver.button.submitting',
            message: 'Submitting',
          })}
          icon={<SpinnerIcon invertColors />}
        />
      );

    case 'submitted':
      return (
        <Button
          flex={1}
          buttonState="success"
          title={t({
            id: 'approver.button.submitted',
            message: 'Submitted',
          })}
          icon={<CheckmarkCircleIcon color="ink.background-primary" />}
        />
      );
    default:
      assertUnreachable(approverState);
  }
}
