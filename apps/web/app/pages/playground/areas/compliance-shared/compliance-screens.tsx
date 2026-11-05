import { useEffect, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Approver, Button, Callout, Link, QuestionCircleIcon } from '@leather.io/ui';

import {
  complianceActionCopy,
  counterpartyRefusedCopy,
  lockoutCopy,
  mockDappRequest,
  mockMultisigReview,
  mockSendReview,
  mockStacksRequest,
  multisigRefusedCopy,
  recipientRefusedCopy,
  screeningDelayMs,
  whyLockedCopy,
} from './compliance-content';
import {
  FooterActionsSkeleton,
  InfoRow,
  PopupBody,
  PopupFooter,
  PopupHeader,
  SentenceLines,
  UnavailableCallout,
  useComplianceActions,
} from './compliance-screen-parts';
import lockSticker from './lock-sticker.png';

// The new compliance screens for the extension. One implementation, rendered by both the
// walkthrough demo (compliance-states) and the static handoff board (compliance-ui).

export type ScreenLayout = 'popup' | 'full';

// Try again reruns the check and comes back clean. The static board passes onRetry to keep
// the no-answer state pinned instead.
function useRetry(onRetry?: () => void) {
  const [phase, setPhase] = useState<'idle' | 'screening' | 'clean'>('idle');
  useEffect(() => {
    if (phase !== 'screening') return;
    const timeout = window.setTimeout(() => setPhase('clean'), screeningDelayMs);
    return () => window.clearTimeout(timeout);
  }, [phase]);
  return { phase, retry: onRetry ?? (() => setPhase('screening')) };
}

interface LockoutScreenProps {
  layout?: ScreenLayout;
}
export function LockoutScreen({ layout = 'popup' }: LockoutScreenProps) {
  const { goTo, openMail } = useComplianceActions();
  const isFull = layout === 'full';
  return (
    <Flex
      direction="column"
      height="100%"
      width="100%"
      maxWidth={isFull ? '440px' : undefined}
      mx="auto"
      animation="fadein 240ms ease-out"
      data-testid="compliance-lockout"
    >
      {isFull ? null : <PopupHeader showLogo showSettings={false} />}
      <Box px="space.05" pt={isFull ? 'space.07' : 'space.01'}>
        <styled.h1 textStyle="heading.03" pb="space.04">
          {lockoutCopy.title}
        </styled.h1>
        <styled.p textStyle="label.01">{lockoutCopy.body}</styled.p>
      </Box>
      <Flex flex={1} minHeight={0} alignItems="center" justifyContent="center" py="space.03">
        <styled.img
          src={lockSticker}
          alt=""
          width={isFull ? '240px' : '184px'}
          height={isFull ? '240px' : '184px'}
          objectFit="contain"
          data-testid="compliance-lock-sticker"
        />
      </Flex>
      <Stack px="space.05" pb="space.05" gap="space.02">
        <Button fullWidth variant="ghost" onClick={() => openMail('dispute')}>
          {lockoutCopy.disputeCta}
        </Button>
        <Button fullWidth onClick={() => goTo('why-created')}>
          {lockoutCopy.whyCta}
        </Button>
      </Stack>
    </Flex>
  );
}

interface WhyLockedScreenProps {
  // Names of the software wallets created in Leather: one backup link each. Imported and
  // Ledger wallets get none.
  backupWalletNames: readonly string[];
}
export function WhyLockedScreen({ backupWalletNames }: WhyLockedScreenProps) {
  const { goTo, openMail } = useComplianceActions();
  return (
    <Flex direction="column" height="100%" data-testid="compliance-why-locked">
      <PopupHeader onBack={() => goTo('lockout')} showSettings={false} />
      <PopupBody>
        <Stack px="space.05" gap="space.04">
          <styled.h1 textStyle="heading.03">{whyLockedCopy.title}</styled.h1>
          {whyLockedCopy.paragraphs.map(paragraph => (
            <styled.p key={paragraph} textStyle="body.02" color="ink.text-secondary">
              {paragraph}
            </styled.p>
          ))}
          {backupWalletNames.length > 0 ? (
            <Stack gap="space.01" mt="space.02">
              {backupWalletNames.map(walletName => (
                <Box key={walletName}>
                  <Link
                    href="#"
                    onClick={event => {
                      event.preventDefault();
                      goTo('key-backup');
                    }}
                  >
                    {whyLockedCopy.backupLink(walletName)}
                  </Link>
                </Box>
              ))}
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {whyLockedCopy.backupNote}
              </styled.span>
            </Stack>
          ) : null}
        </Stack>
      </PopupBody>
      <PopupFooter bordered>
        <Button fullWidth variant="outline" onClick={() => openMail('dispute')}>
          {lockoutCopy.disputeCta}
        </Button>
      </PopupFooter>
    </Flex>
  );
}

export type ReviewVerdict = 'recipient-flagged' | 'member-flagged' | 'no-answer';

interface SendReviewScreenProps {
  verdict: ReviewVerdict;
  isScreening: boolean;
  onRetry?(): void;
}
export function SendReviewScreen({ verdict, isScreening, onRetry }: SendReviewScreenProps) {
  const { phase, retry } = useRetry(onRetry);
  const showSkeleton = isScreening || phase === 'screening';
  const isMultisig = verdict === 'member-flagged';
  const review = isMultisig ? mockMultisigReview : mockSendReview;
  const refusedCopy = isMultisig ? multisigRefusedCopy : recipientRefusedCopy;
  const isRefused = !showSkeleton && (verdict === 'recipient-flagged' || isMultisig);
  const isUnavailable = !showSkeleton && verdict === 'no-answer' && phase === 'idle';

  function renderActions() {
    if (showSkeleton) return <FooterActionsSkeleton count={1} />;
    if (isRefused) {
      return (
        <Button fullWidth variant="outline">
          {complianceActionCopy.close}
        </Button>
      );
    }
    if (isUnavailable) {
      return (
        <Flex gap="space.04">
          <Button flex={1} variant="outline">
            {complianceActionCopy.cancel}
          </Button>
          <Button flex={1} onClick={retry}>
            {complianceActionCopy.tryAgain}
          </Button>
        </Flex>
      );
    }
    return (
      <Button fullWidth>
        {isMultisig ? 'Propose transaction' : 'Confirm and send transaction'}
      </Button>
    );
  }

  return (
    <Flex direction="column" height="100%" data-testid="compliance-send-review">
      <PopupHeader title="Review" onBack={() => undefined} />
      <PopupBody>
        {isUnavailable ? (
          <Box pt="space.02" animation="fadein 240ms ease-out">
            {/* pl lines the text up with the review rows (space.06), as the shipped send review does */}
            <UnavailableCallout pl="space.02" />
          </Box>
        ) : null}
        {isRefused ? (
          <Box pt="space.02" pb="space.05" animation="fadein 240ms ease-out">
            <Callout
              variant="error"
              title={refusedCopy.title}
              pl="space.02"
              data-testid={
                isMultisig ? 'compliance-multisig-refused' : 'compliance-recipient-refused'
              }
            >
              <SentenceLines text={refusedCopy.body} />
            </Callout>
          </Box>
        ) : (
          <Stack alignItems="center" gap="space.01" py="space.05" mb="space.05">
            <styled.h1 textStyle="heading.03">
              {review.amount}&nbsp;{review.symbol}
            </styled.h1>
            <styled.span textStyle="label.01">~ {review.fiat}&nbsp;USD</styled.span>
          </Stack>
        )}
        <Stack px="space.06" pb="space.06" gap="space.03">
          {review.rows.map(row => (
            <InfoRow key={row.label} {...row} />
          ))}
        </Stack>
      </PopupBody>
      <PopupFooter>{renderActions()}</PopupFooter>
    </Flex>
  );
}

export type ApproveVerdict = 'clean' | 'counterparty-flagged' | 'no-answer';

interface ApproveTransactionScreenProps {
  verdict: ApproveVerdict;
  isScreening: boolean;
  request?: 'bitcoin' | 'stacks';
  onRetry?(): void;
}
export function ApproveTransactionScreen({
  verdict,
  isScreening,
  request = 'bitcoin',
  onRetry,
}: ApproveTransactionScreenProps) {
  const details = request === 'stacks' ? mockStacksRequest : mockDappRequest;
  const { phase, retry } = useRetry(onRetry);
  const showSkeleton = isScreening || phase === 'screening';
  const isRefused = !showSkeleton && verdict === 'counterparty-flagged';
  const isUnavailable = !showSkeleton && verdict === 'no-answer' && phase === 'idle';

  function getActions() {
    if (showSkeleton) return [<FooterActionsSkeleton key="skeleton" count={2} />];
    if (isRefused) {
      return [
        <Button key="close" fullWidth variant="outline">
          {complianceActionCopy.close}
        </Button>,
      ];
    }
    return [
      <Button key="cancel" fullWidth variant="outline">
        <styled.span textStyle="label.02">{complianceActionCopy.cancel}</styled.span>
      </Button>,
      isUnavailable ? (
        <Button key="retry" fullWidth onClick={retry}>
          <styled.span textStyle="label.02">{complianceActionCopy.tryAgain}</styled.span>
        </Button>
      ) : (
        <Button key="confirm" fullWidth>
          <styled.span textStyle="label.02">Confirm</styled.span>
        </Button>
      ),
    ];
  }

  return (
    <Approver requester={details.origin} width="100%" data-testid="compliance-approve">
      <Approver.Header
        title={request === 'stacks' ? 'Call contract' : 'Approve transaction'}
        info={
          <styled.span display="block" p="space.01">
            <QuestionCircleIcon variant="small" />
          </styled.span>
        }
      />
      {isRefused || isUnavailable ? (
        <Approver.Section
          className="approver-section skip-animation"
          px="0"
          py="0"
          animation="fadein 240ms ease-out"
        >
          {isRefused ? (
            <Callout
              variant="error"
              title={counterpartyRefusedCopy.title}
              data-testid="compliance-counterparty-refused"
            >
              <SentenceLines text={counterpartyRefusedCopy.body} />
            </Callout>
          ) : (
            <UnavailableCallout />
          )}
        </Approver.Section>
      ) : null}
      <Approver.Section>
        <styled.p textStyle="body.02" color="ink.text-secondary">
          {details.intro}
        </styled.p>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Transaction</Approver.Subheader>
        <Stack gap="space.03" pb="space.03">
          {details.rows.map(row => (
            <InfoRow key={row.label} {...row} />
          ))}
        </Stack>
      </Approver.Section>
      <Approver.Actions actions={getActions()} />
    </Approver>
  );
}
