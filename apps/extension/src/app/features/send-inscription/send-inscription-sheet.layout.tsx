import type { ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader, Spinner } from '@leather.io/ui';

interface SendInscriptionSheetLayoutProps {
  children: ReactNode;
  title: string;
  isShowing: boolean;
  onClose(): void;
  footer?: ReactNode;
}

export function SendInscriptionSheetLayout({
  children,
  title,
  isShowing,
  onClose,
  footer,
}: SendInscriptionSheetLayoutProps) {
  return (
    <Sheet
      header={<SheetHeader title={title} onClose={onClose} />}
      isShowing={isShowing}
      onClose={onClose}
      footer={footer}
    >
      {children}
    </Sheet>
  );
}

interface LoadingStateProps {
  error?: string | null;
  onClose(): void;
}

export function SendInscriptionLoadingState({ error, onClose }: LoadingStateProps) {
  return (
    <SendInscriptionSheetLayout title="Send" isShowing onClose={onClose}>
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        {error ? (
          <styled.p textStyle="body.02" color="red.action-primary-default">
            {error}
          </styled.p>
        ) : (
          <Spinner />
        )}
      </Box>
    </SendInscriptionSheetLayout>
  );
}

interface SuccessStateProps {
  txid: string | null;
  onClose(): void;
}

export function SendInscriptionSuccessState({ txid, onClose }: SuccessStateProps) {
  return (
    <SendInscriptionSheetLayout title="Sent!" isShowing onClose={onClose}>
      <Stack px="space.05" py="space.05" gap="space.04" alignItems="center">
        <styled.p textStyle="heading.05">Transaction broadcast</styled.p>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Your inscription has been sent.
        </styled.p>
        {txid && (
          <styled.p textStyle="caption.02" color="ink.text-subdued" wordBreak="break-all">
            TXID: {txid}
          </styled.p>
        )}
        <Button onClick={onClose} fullWidth>
          Done
        </Button>
      </Stack>
    </SendInscriptionSheetLayout>
  );
}

interface ErrorStateProps {
  error: string | null;
  onRetry(): void;
  onClose(): void;
}

export function SendInscriptionErrorState({ error, onRetry, onClose }: ErrorStateProps) {
  return (
    <SendInscriptionSheetLayout title="Error" isShowing onClose={onClose}>
      <Stack px="space.05" py="space.05" gap="space.04" alignItems="center">
        <styled.p textStyle="heading.05" color="red.action-primary-default">
          Transaction failed
        </styled.p>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {error || 'An unexpected error occurred'}
        </styled.p>
        <Button onClick={onRetry} fullWidth>
          Try again
        </Button>
      </Stack>
    </SendInscriptionSheetLayout>
  );
}
