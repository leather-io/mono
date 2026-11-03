import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowRotateClockwiseIcon, Badge, type BadgeProps, Button } from '@leather.io/ui';

import { backgroundHitDelayMs } from './compliance-content';
import {
  ApproveTransactionScreen,
  DisputeScreen,
  HomeToLockoutScreen,
  LockoutScreen,
  SendReviewScreen,
  WhyLockedScreen,
} from './compliance-screens';
import {
  type ComplianceOutcome,
  type ComplianceState,
  type ComplianceStateId,
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
  transition: { label: 'Transition', variant: 'info' },
};

function OutcomeBadge({ outcome }: { outcome: ComplianceOutcome }) {
  const badge = outcomeBadges[outcome];
  return <Badge label={badge.label} variant={badge.variant} flexShrink={0} />;
}

interface ComplianceScreenProps {
  stateId: ComplianceStateId;
  withScreening: boolean;
  onNavigate(id: ComplianceStateId): void;
}
function ComplianceScreen({ stateId, withScreening, onNavigate }: ComplianceScreenProps) {
  switch (stateId) {
    case 'home-to-lockout':
      return <HomeToLockoutScreen onNavigate={onNavigate} delayMs={backgroundHitDelayMs} />;
    case 'lockout':
      return <LockoutScreen onNavigate={onNavigate} />;
    case 'why-created':
      return <WhyLockedScreen onNavigate={onNavigate} isCreatedInLeather />;
    case 'why-imported':
      return <WhyLockedScreen onNavigate={onNavigate} isCreatedInLeather={false} />;
    case 'dispute':
      return <DisputeScreen onNavigate={onNavigate} />;
    case 'review-clean':
      return (
        <SendReviewScreen verdict="clean" startScreening={withScreening} onNavigate={onNavigate} />
      );
    case 'review-recipient-flagged':
      return (
        <SendReviewScreen
          verdict="recipient-flagged"
          startScreening={withScreening}
          onNavigate={onNavigate}
        />
      );
    case 'review-own-flagged':
      return <SendReviewScreen verdict="own-flagged" startScreening onNavigate={onNavigate} />;
    case 'review-no-answer':
      return (
        <SendReviewScreen
          verdict="no-answer"
          startScreening={withScreening}
          onNavigate={onNavigate}
        />
      );
    case 'approve-clean':
      return <ApproveTransactionScreen verdict="clean" startScreening={withScreening} />;
    case 'approve-counterparty-flagged':
      return (
        <ApproveTransactionScreen verdict="counterparty-flagged" startScreening={withScreening} />
      );
    case 'approve-no-answer':
      return <ApproveTransactionScreen verdict="no-answer" startScreening={withScreening} />;
    default:
      return null;
  }
}

// The frame is transformed so it becomes the containing block for
// position: fixed descendants — the real Approver pins its actions with
// position: fixed, and this keeps them inside the request window.
function ExtensionFrame({
  state,
  children,
}: {
  state: ComplianceState;
  children: React.ReactNode;
}) {
  return (
    <Box
      position="relative"
      width="popupWidth"
      height={state.surface === 'popup' ? 'dialogHeight' : 'popupHeight'}
      flexShrink={0}
      overflow="hidden"
      transform="translateZ(0)"
      bg="ink.background-primary"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      boxShadow="0 12px 40px rgba(18, 16, 15, 0.12)"
      data-testid="compliance-frame"
      data-surface={state.surface}
    >
      <Box height="100%" overflowY="auto">
        {children}
      </Box>
    </Box>
  );
}

function StateRow({
  state,
  isActive,
  onSelect,
}: {
  state: ComplianceState;
  isActive: boolean;
  onSelect(): void;
}) {
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
      py="space.02"
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
  const [runId, setRunId] = useState(0);
  const [withScreening, setWithScreening] = useState(false);
  const [isPanelHidden, setIsPanelHidden] = useState(searchParams.get('panel') === 'hidden');

  function select(id: ComplianceStateId, options?: { withScreening?: boolean }) {
    setWithScreening(options?.withScreening ?? false);
    setRunId(value => value + 1);
    const next = new URLSearchParams(searchParams);
    if (id === defaultComplianceStateId) next.delete('state');
    else next.set('state', id);
    setSearchParams(next, { replace: true });
  }

  function replay() {
    setWithScreening(true);
    setRunId(value => value + 1);
  }

  // Arrow keys step through states, R replays, H toggles the panel — so a
  // screen recording can run without touching the mouse.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea')) return;
      const index = complianceStates.findIndex(state => state.id === selected.id);
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        const next = complianceStates[Math.min(index + 1, complianceStates.length - 1)];
        if (next) select(next.id);
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        const previous = complianceStates[Math.max(index - 1, 0)];
        if (previous) select(previous.id);
      }
      if (event.key === 'r') replay();
      if (event.key === 'h') setIsPanelHidden(value => !value);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
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
              Extension screens from the compliance gate spec (v5). Static mock data, no screening
              calls. Not a production feature.
            </styled.p>
          </Stack>
          {complianceStateGroups.map(group => (
            <Stack key={group.id} gap="space.01">
              <styled.h2 textStyle="label.03" color="ink.text-subdued" px="space.03" pb="space.01">
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
            borderRadius="sm"
            bg="ink.background-secondary"
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
            <Flex gap="space.02" pt="space.02" flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={replay}
                iconStart={<ArrowRotateClockwiseIcon variant="small" />}
              >
                Replay with screening
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsPanelHidden(true)}>
                Hide panel
              </Button>
            </Flex>
          </Stack>
          <styled.p textStyle="caption.02" color="ink.text-subdued">
            Keys: ↑ ↓ change state · R replay · H hide or show this panel
          </styled.p>
        </styled.aside>
      )}
      <Flex flex={1} minHeight="100vh" alignItems="center" justifyContent="center" p="space.05">
        <ExtensionFrame state={selected}>
          <ComplianceScreen
            key={`${selected.id}-${runId}`}
            stateId={selected.id}
            withScreening={withScreening}
            onNavigate={id => select(id)}
          />
        </ExtensionFrame>
      </Flex>
    </Flex>
  );
}
