import { SpinnerIcon } from '@/components/spinner-icon';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Button, CheckmarkCircleIcon, Theme } from '@leather.io/ui/native';

import { type PsbtApproverState } from '../utils';

interface PsbtButtonsProps {
  approverState: PsbtApproverState;
  onEdit(): void;
  onApprove(): void;
}

export function PsbtButtons({ approverState, onEdit, onApprove }: PsbtButtonsProps) {
  const theme = useTheme<Theme>();
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
            onPress={onEdit}
          />
          <Button
            buttonState="default"
            title={t({
              id: 'approver.button.approve',
              message: 'Approve',
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
          icon={<CheckmarkCircleIcon color={theme.colors['ink.background-primary']} />}
        />
      );
  }
}
