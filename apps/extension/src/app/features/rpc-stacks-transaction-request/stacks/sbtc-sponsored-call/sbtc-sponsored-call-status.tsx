import { SbtcSponsoredCallSelectors } from '@tests/selectors/requests.selectors';
import { HStack, Stack, styled } from 'leather-styles/jsx';

import type { RpcMethodNames } from '@leather.io/rpc';
import {
  Approver,
  Button,
  Callout,
  CheckmarkCircleIcon,
  CircleIcon,
  ErrorCircleIcon,
  PendingIndicatorIcon,
} from '@leather.io/ui';

import { closeWindow } from '@shared/utils';

import { TransactionHeader } from '@app/components/rpc-transaction-request/transaction-header';
import { TransactionWrapper } from '@app/components/rpc-transaction-request/transaction-wrapper';

import { useStacksRpcTransactionRequestContext } from '../stacks-rpc-transaction-request.context';
import {
  type SbtcSponsoredCallFailure,
  type SbtcSponsoredCallProgress,
  type SbtcSponsoredCallStep,
  sbtcSponsoredCallPaymentTimeoutMinutes,
} from './use-sbtc-sponsored-call';

const steps: { step: SbtcSponsoredCallStep; label: string }[] = [
  { step: 'paying', label: 'Send the fee payment' },
  { step: 'confirming', label: 'Wait for the fee payment to confirm' },
  { step: 'calling', label: 'Send the contract call' },
];
const stepIconSize = 16;

const failures: Record<SbtcSponsoredCallFailure, { title: string; text: string }> = {
  'payment-unknown': {
    title: 'Fee payment status unknown',
    text: 'The fee payment may have been sent. The call was not sent. Check your activity before trying again.',
  },
  'payment-failed': {
    title: 'Fee payment failed',
    text: 'The fee payment did not go through, so the call was not sent.',
  },
  'payment-unconfirmed': {
    title: 'Fee payment not confirmed',
    text: `The fee payment has not confirmed after ${sbtcSponsoredCallPaymentTimeoutMinutes} minutes, so the call was not sent. If it confirms later, the fee is still spent.`,
  },
  'call-unknown': {
    title: 'Call status unknown',
    text: 'The fee was paid. The call may have been sent. Check your activity before trying again.',
  },
  'call-not-sent': {
    title: 'Fee paid',
    text: 'The fee was paid and the call was not sent.',
  },
};

function getTitle({ step, failure }: SbtcSponsoredCallProgress) {
  if (failure === 'call-unknown') return 'Call status unknown';
  if (failure) return 'Call not sent';
  return step === 'sent' ? 'Transactions sent' : 'Sending 2 transactions';
}

interface StepIconProps {
  isDone: boolean;
  isActive: boolean;
  isFailed: boolean;
}
function StepIcon({ isDone, isActive, isFailed }: StepIconProps) {
  if (isDone) return <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />;
  if (isFailed) return <ErrorCircleIcon variant="small" color="red.action-primary-default" />;
  if (isActive) return <PendingIndicatorIcon size={stepIconSize} />;
  return <CircleIcon variant="small" color="ink.text-non-interactive" />;
}

interface SbtcSponsoredCallStatusProps {
  method: RpcMethodNames;
  progress: SbtcSponsoredCallProgress;
}
export function SbtcSponsoredCallStatus({ method, progress }: SbtcSponsoredCallStatusProps) {
  const { origin, onClickRequestedByLink } = useStacksRpcTransactionRequestContext();
  const failure = progress.failure ? failures[progress.failure] : undefined;
  const isSent = progress.step === 'sent';
  const currentIndex = isSent
    ? steps.length
    : steps.findIndex(({ step }) => step === progress.step);

  return (
    <TransactionWrapper>
      <Approver requester={origin} width="100%">
        <TransactionHeader
          title={getTitle(progress)}
          onPressRequestedByLink={e => {
            e.preventDefault();
            onClickRequestedByLink(method);
          }}
        />
        <Approver.Section>
          {failure && (
            <Callout
              data-testid={SbtcSponsoredCallSelectors.FailureCallout}
              variant="error"
              title={failure.title}
            >
              {failure.text}
              {progress.failureDetail ? ` ${progress.failureDetail}` : ''}
            </Callout>
          )}
          {!failure && !isSent && (
            <Callout variant="warning" title="Keep this window open">
              If you close it before the call is sent, the fee is paid and the call is not sent.
            </Callout>
          )}
          <Stack gap="space.04" my="space.04">
            {steps.map(({ step, label }, index) => (
              <HStack key={step} gap="space.03">
                <StepIcon
                  isDone={index < currentIndex}
                  isActive={index === currentIndex && !failure}
                  isFailed={index === currentIndex && !!failure}
                />
                <styled.span textStyle="label.02">{label}</styled.span>
              </HStack>
            ))}
          </Stack>
        </Approver.Section>
        <Approver.Actions
          actions={[
            failure ? (
              <Button key="close" fullWidth onClick={() => closeWindow()}>
                Close
              </Button>
            ) : (
              <Button key="busy" fullWidth aria-busy={!isSent} disabled>
                {isSent ? 'Sent' : 'Sending...'}
              </Button>
            ),
          ]}
        />
      </Approver>
    </TransactionWrapper>
  );
}
