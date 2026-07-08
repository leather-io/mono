import { HStack, styled } from 'leather-styles/jsx';

import { Button, CheckmarkIcon, SkeletonLoader } from '@leather.io/ui';

interface GetTransactionActionsArgs {
  isLoading: boolean;
  isError: boolean;
  isBroadcasting: boolean;
  isSubmitted: boolean;
  isApproveDisabled?: boolean;
  onCancel(): void;
  onApprove(): Promise<void> | void;
  approveLabel?: string;
  busyLabel?: string;
}
export function getTransactionActions({
  isError,
  isLoading,
  isBroadcasting,
  isSubmitted,
  isApproveDisabled = false,
  onCancel,
  onApprove,
  approveLabel = 'Approve',
  busyLabel = 'Submitting...',
}: GetTransactionActionsArgs) {
  if (isLoading) {
    return [
      <SkeletonLoader key="skeleton" isLoading height="40px" />,
      <SkeletonLoader key="skeleton" isLoading height="40px" />,
    ];
  }

  if (isError) return [];

  if (isBroadcasting) {
    return [
      <Button key="submitting" fullWidth aria-busy disabled>
        {busyLabel}
      </Button>,
    ];
  }

  if (isSubmitted) {
    return [
      <Button key="submitting" bg="green.action-primary-default" fullWidth disabled>
        <HStack justifyContent="center" alignItems="center" gap="space.02">
          <CheckmarkIcon color="ink.text-primary" variant="small" />
          <styled.span textStyle="label.02">Submitted</styled.span>
        </HStack>
      </Button>,
    ];
  }

  return [
    <Button key="cancel" onClick={onCancel} fullWidth variant="outline">
      <styled.span textStyle="label.02">Cancel</styled.span>
    </Button>,
    <Button type="submit" key="approve" onClick={onApprove} fullWidth disabled={isApproveDisabled}>
      <styled.span textStyle="label.02">{approveLabel}</styled.span>
    </Button>,
  ];
}
