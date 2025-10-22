import { SpinnerIcon } from '@/components/spinner-icon';
import { t } from '@lingui/core/macro';

import { Approver, Box, Button, CheckmarkCircleIcon } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

import { useApproverButtons } from './use-approver-buttons';

interface ApproverButtonsProps {
  onBack(): void;
  onApprove(): void | Promise<void>;
  onClose(): void;
  onCopy?(): void;
  onViewDetails?(): void;
  isSubmitDisabled?: boolean;
}
export function ApproverButtons(props: ApproverButtonsProps) {
  const { approverState, approverButtons } = useApproverButtons();

  const { onBack, onApprove, onClose, onCopy, onViewDetails } = props;

  async function onApproveWrapper() {
    try {
      approverButtons.onSubmit();
      await onApprove();
      approverButtons.onSubmitSuccess();
    } catch {
      approverButtons.onSubmitFailure();
    }
  }

  switch (approverState) {
    case 'start_approver':
      return (
        <Approver.Actions>
          <Button variant="outline" flex={1} onPress={onBack}>
            {t`Cancel`}
          </Button>
          <Button flex={1} onPress={onApproveWrapper} disabled={props.isSubmitDisabled}>
            {t`Approve`}
          </Button>
        </Approver.Actions>
      );

    case 'retry':
      return (
        <Approver.Actions>
          <Button variant="outline" flex={1} onPress={onBack}>
            {t`Cancel`}
          </Button>
          <Button flex={1} onPress={onApproveWrapper} disabled={props.isSubmitDisabled}>
            {t`Retry`}
          </Button>
        </Approver.Actions>
      );
    case 'submitting':
      return (
        <Approver.Actions>
          <Button flex={1} iconStart={() => <SpinnerIcon invertColors />}>
            {t`Submitting...`}
          </Button>
        </Approver.Actions>
      );

    case 'submitted_checkmark':
      return (
        <Approver.Actions>
          <Button
            flex={1}
            iconStart={() => <CheckmarkCircleIcon color="ink.background-primary" />}
            bg="green.action-primary-default"
          >
            {t`Submitted`}
          </Button>
        </Approver.Actions>
      );
    case 'submitted_details':
      return (
        <Box gap="4">
          <Approver.Actions>
            {onCopy && (
              <Button flex={1} variant="outline" onPress={onCopy}>
                {t`Copy ID`}
              </Button>
            )}

            {onViewDetails && (
              <Button flex={1} variant="outline" onPress={onViewDetails}>
                {t`View details`}
              </Button>
            )}
          </Approver.Actions>
          <Button onPress={onClose}>{t`Close window`}</Button>
        </Box>
      );

    default:
      assertUnreachable(approverState);
  }
}
