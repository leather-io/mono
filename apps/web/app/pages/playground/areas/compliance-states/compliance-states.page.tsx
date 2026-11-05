import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowRotateClockwiseIcon, Badge, type BadgeProps, Button } from '@leather.io/ui';

import { type BuildNotes } from '../compliance-shared/compliance-build-notes';
import { BuildNotesContent } from '../compliance-shared/compliance-build-notes-view';
import { type MailKind } from '../compliance-shared/compliance-content';
import { BrowserTabFrame, ExtensionFrame } from '../compliance-shared/compliance-frames';
import { ComplianceActionsProvider } from '../compliance-shared/compliance-screen-parts';
import {
  ApproveTransactionScreen,
  LockoutScreen,
  SendReviewScreen,
  WhyLockedScreen,
} from '../compliance-shared/compliance-screens';
import {
  HomeScreen,
  KeyBackupPasswordScreen,
  KeyBackupRevealScreen,
  SendFormScreen,
} from './compliance-demo-screens';
import { MailWindow } from './compliance-mail-window';
import {
  OnboardingPassword,
  OnboardingSecretKey,
  OnboardingWelcome,
} from './compliance-onboarding';
import { buildNotes } from './compliance-state-notes';
import {
  type ComplianceOutcome,
  type ComplianceState,
  type ComplianceStateId,
  type FlowStepId,
  complianceStateGroups,
  complianceStates,
  defaultComplianceStateId,
  findComplianceState,
  surfaceLabels,
} from './compliance-states';

const outcomeBadges: Record<
  ComplianceOutcome,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  clean: { label: 'Clean', variant: 'success' },
  refused: { label: 'Refused', variant: 'error' },
  locked: { label: 'Locked', variant: 'default' },
  'no-answer': { label: 'No answer', variant: 'warning' },
  flow: { label: 'Flow', variant: 'info' },
};

function OutcomeBadge({ outcome }: { outcome: ComplianceOutcome }) {
  const badge = outcomeBadges[outcome];
  return <Badge label={badge.label} variant={badge.variant} flexShrink={0} />;
}

interface ComplianceScreenProps {
  stateId: ComplianceStateId;
  stepId: FlowStepId | undefined;
  onAdvance(): void;
}
function ComplianceScreen({ stateId, stepId, onAdvance }: ComplianceScreenProps) {
  const isScreening = stepId === 'screening';
  switch (stateId) {
    case 'onboarding-to-lockout':
      if (stepId === 'welcome') return <OnboardingWelcome onContinue={onAdvance} />;
      if (stepId === 'secret-key') return <OnboardingSecretKey onContinue={onAdvance} />;
      if (stepId === 'password') return <OnboardingPassword onContinue={onAdvance} />;
      if (stepId === 'home-loading') return <HomeScreen layout="full" isLoading />;
      if (stepId === 'home') return <HomeScreen layout="full" />;
      return <LockoutScreen layout="full" />;
    case 'home-to-lockout':
      return stepId === 'home' ? <HomeScreen layout="popup" /> : <LockoutScreen />;
    case 'lockout':
    case 'dispute-email':
      return <LockoutScreen />;
    case 'why-created':
      return <WhyLockedScreen backupWalletNames={['Wallet 1']} />;
    case 'why-imported':
      return <WhyLockedScreen backupWalletNames={[]} />;
    case 'key-backup':
      if (stepId === 'backup-password') return <KeyBackupPasswordScreen onContinue={onAdvance} />;
      return <KeyBackupRevealScreen />;
    case 'review-recipient-flagged':
      if (stepId === 'send-form') return <SendFormScreen onContinue={onAdvance} />;
      return <SendReviewScreen verdict="recipient-flagged" isScreening={isScreening} />;
    case 'review-own-flagged':
      if (stepId === 'send-form') return <SendFormScreen onContinue={onAdvance} />;
      if (isScreening) return <SendReviewScreen verdict="recipient-flagged" isScreening />;
      return <LockoutScreen />;
    case 'review-multisig-member-flagged':
      return <SendReviewScreen verdict="member-flagged" isScreening={isScreening} />;
    case 'review-no-answer':
      return <SendReviewScreen verdict="no-answer" isScreening={isScreening} />;
    case 'approve-clean':
      return <ApproveTransactionScreen verdict="clean" isScreening={isScreening} />;
    case 'approve-counterparty-flagged':
      return <ApproveTransactionScreen verdict="counterparty-flagged" isScreening={isScreening} />;
    case 'approve-no-answer':
      return <ApproveTransactionScreen verdict="no-answer" isScreening={isScreening} />;
    case 'approve-stacks-btc-flagged':
      if (isScreening)
        return <ApproveTransactionScreen verdict="clean" isScreening request="stacks" />;
      return <LockoutScreen />;
    default:
      return null;
  }
}

function BuildNotesPanel({ notes }: { notes: BuildNotes }) {
  return (
    <styled.aside
      display="flex"
      flexDirection="column"
      gap="space.04"
      width="320px"
      flexShrink={0}
      height="100vh"
      position="sticky"
      top={0}
      overflowY="auto"
      p="space.05"
      bg="ink.background-primary"
      borderLeftWidth="1px"
      borderLeftStyle="solid"
      borderColor="ink.border-default"
      data-testid="compliance-build-notes"
    >
      <styled.h2 textStyle="heading.05">Build notes</styled.h2>
      <BuildNotesContent notes={notes} />
    </styled.aside>
  );
}

interface StateRowProps {
  state: ComplianceState;
  isActive: boolean;
  onSelect(): void;
}
function StateRow({ state, isActive, onSelect }: StateRowProps) {
  return (
    <styled.button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
      data-testid={`compliance-state-${state.id}`}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="space.02"
      width="100%"
      px="space.03"
      py="6px"
      borderRadius="sm"
      textAlign="left"
      cursor="pointer"
      bg={isActive ? 'ink.component-background-pressed' : 'transparent'}
      _hover={{
        bg: isActive ? 'ink.component-background-pressed' : 'ink.component-background-hover',
      }}
    >
      <styled.span textStyle="label.02" color="ink.text-primary">
        {state.label}
      </styled.span>
      <OutcomeBadge outcome={state.outcome} />
    </styled.button>
  );
}

export function ComplianceStatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = findComplianceState(searchParams.get('state')) ?? complianceStates[0];
  const steps = selected.steps ?? [];
  const [runId, setRunId] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [mailKind, setMailKind] = useState<MailKind | null>(null);
  const [isPanelHidden, setIsPanelHidden] = useState(searchParams.get('panel') === 'hidden');

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  function restart() {
    setStepIndex(0);
    setIsAutoplay(true);
    setMailKind(null);
    setRunId(value => value + 1);
  }

  function select(id: ComplianceStateId) {
    restart();
    const next = new URLSearchParams(searchParams);
    if (id === defaultComplianceStateId) next.delete('state');
    else next.set('state', id);
    setSearchParams(next, { replace: true });
  }

  function jumpToStep(index: number) {
    if (steps.length === 0) return;
    setIsAutoplay(false);
    setMailKind(null);
    setStepIndex(Math.max(0, Math.min(index, steps.length - 1)));
  }

  function advance() {
    setStepIndex(index => Math.min(index + 1, Math.max(steps.length - 1, 0)));
  }

  useEffect(() => {
    if (!isAutoplay || !step?.durationMs) return;
    const timeout = window.setTimeout(() => setStepIndex(index => index + 1), step.durationMs);
    return () => window.clearTimeout(timeout);
  }, [isAutoplay, step, runId]);

  useEffect(() => {
    if (step?.id === 'email') setMailKind('dispute');
  }, [step]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea')) return;
      const index = complianceStates.findIndex(state => state.id === selected.id);
      if (event.key === 'ArrowDown') {
        const next = complianceStates[Math.min(index + 1, complianceStates.length - 1)];
        if (next) select(next.id);
      }
      if (event.key === 'ArrowUp') {
        const previous = complianceStates[Math.max(index - 1, 0)];
        if (previous) select(previous.id);
      }
      if (event.key === 'ArrowRight') jumpToStep(stepIndex + 1);
      if (event.key === 'ArrowLeft') jumpToStep(stepIndex - 1);
      if (event.key === 'r') restart();
      if (event.key === 'h') setIsPanelHidden(value => !value);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const actions = {
    goTo: select,
    openMail: setMailKind,
  };

  const screen = (
    <ComplianceScreen
      key={`${selected.id}-${runId}`}
      stateId={selected.id}
      stepId={step?.id}
      onAdvance={advance}
    />
  );
  const mailWindow = mailKind ? (
    <MailWindow kind={mailKind} onClose={() => setMailKind(null)} />
  ) : null;

  return (
    <ComplianceActionsProvider value={actions}>
      <Flex minHeight="100vh" bg="ink.background-secondary">
        {isPanelHidden ? null : (
          <styled.aside
            display="flex"
            flexDirection="column"
            width="340px"
            flexShrink={0}
            height="100vh"
            position="sticky"
            top={0}
            overflowY="auto"
            gap="space.04"
            p="space.05"
            bg="ink.background-primary"
            borderRightWidth="1px"
            borderRightStyle="solid"
            borderColor="ink.border-default"
          >
            <Stack gap="space.02">
              <styled.h1 textStyle="heading.05">Compliance states</styled.h1>
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                Extension screens for the agreed compliance model (Nov 2 sync, signed off by Rena on
                Nov 4). Static mock data, no screening calls. Not a production feature. Build notes
                on the right are for engineering.
              </styled.p>
            </Stack>
            {complianceStateGroups.map(group => (
              <Stack key={group.id} gap="space.01">
                <styled.h2
                  textStyle="label.03"
                  color="ink.text-subdued"
                  px="space.03"
                  pb="space.01"
                >
                  {group.label}
                </styled.h2>
                {group.states.map(state => (
                  <StateRow
                    key={state.id}
                    state={state}
                    isActive={state.id === selected.id}
                    onSelect={() => select(state.id)}
                  />
                ))}
              </Stack>
            ))}
            <Stack
              gap="space.02"
              p="space.04"
              mt="auto"
              position="sticky"
              bottom={0}
              borderRadius="sm"
              bg="ink.background-secondary"
              boxShadow="0 -12px 16px -8px rgba(255, 255, 255, 0.9)"
              data-testid="compliance-state-note"
            >
              <Flex justifyContent="space-between" alignItems="center" gap="space.02">
                <styled.span textStyle="label.02">{selected.label}</styled.span>
                <styled.span textStyle="caption.02" color="ink.text-subdued">
                  {selected.scenario}
                </styled.span>
              </Flex>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {surfaceLabels[selected.surface]}
              </styled.span>
              <styled.p textStyle="caption.01" color="ink.text-secondary">
                {selected.note}
              </styled.p>
              {steps.length > 0 ? (
                <Flex gap="space.01" flexWrap="wrap" pt="space.01" data-testid="compliance-steps">
                  {steps.map((flowStep, index) => (
                    <Button
                      key={flowStep.id}
                      size="sm"
                      variant={index === stepIndex ? 'solid' : 'outline'}
                      onClick={() => jumpToStep(index)}
                    >
                      {index + 1}. {flowStep.label}
                    </Button>
                  ))}
                </Flex>
              ) : null}
              <Flex gap="space.02" pt="space.01" flexWrap="wrap" alignItems="center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={restart}
                  iconStart={<ArrowRotateClockwiseIcon variant="small" />}
                >
                  Replay
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsPanelHidden(true)}>
                  Hide panel
                </Button>
                <styled.span textStyle="caption.02" color="ink.text-subdued">
                  ↑↓ state · ←→ step · R · H
                </styled.span>
              </Flex>
            </Stack>
          </styled.aside>
        )}
        <Flex
          position="relative"
          flex={1}
          minWidth={0}
          minHeight="100vh"
          alignItems="center"
          justifyContent="center"
          gap="space.06"
          p="space.05"
        >
          {selected.surface === 'tab' ? (
            <>
              <BrowserTabFrame>{screen}</BrowserTabFrame>
              {mailWindow ? (
                <Box position="absolute" right="space.07" bottom="space.07" zIndex={10}>
                  {mailWindow}
                </Box>
              ) : null}
            </>
          ) : (
            <>
              <ExtensionFrame
                surface={selected.surface === 'request-window' ? 'request-window' : 'popup'}
              >
                {screen}
              </ExtensionFrame>
              {mailWindow}
            </>
          )}
        </Flex>
        {isPanelHidden ? null : <BuildNotesPanel notes={buildNotes[selected.id]} />}
      </Flex>
    </ComplianceActionsProvider>
  );
}
