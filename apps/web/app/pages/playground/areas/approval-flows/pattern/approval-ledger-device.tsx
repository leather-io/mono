import {
  type ReactNode,
  Suspense,
  createContext,
  lazy,
  useContext,
  useId,
  useState,
  useSyncExternalStore,
} from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ConnectLedgerErr,
  ConnectLedgerSuccess,
  LedgerIlluDisconnected,
  LedgerTxRejected,
  SignLedgerTransaction,
} from '@leather.io/ui';

import { useApprovalOptions } from './approval-options';

export type LedgerFlowStage =
  | 'review'
  | 'connect'
  | 'pairing-required'
  | 'pairing-tab'
  | 'pairing-chooser'
  | 'restart-request'
  | 'request-closed'
  | 'locked'
  | 'opening-app'
  | 'chooser'
  | 'checking'
  | 'policy'
  | 'device'
  | 'signed'
  | 'submitting'
  | 'broadcast'
  | 'submit-failed'
  | 'rejected'
  | 'disconnected'
  | 'wrong-device'
  | 'wrong-app'
  | 'busy'
  | 'outdated-app'
  | 'invalid-payload'
  | 'chooser-canceled'
  | 'canceled';

interface LedgerFlowContextValue {
  stages: Record<string, LedgerFlowStage>;
  setStage(flowId: string, stage: LedgerFlowStage): void;
}

const LedgerFlowContext = createContext<LedgerFlowContextValue>({
  stages: {},
  setStage() {
    return undefined;
  },
});

interface LedgerFlowProviderProps {
  children: ReactNode;
}

export function LedgerFlowProvider({ children }: LedgerFlowProviderProps) {
  const [stages, setStages] = useState<Record<string, LedgerFlowStage>>({});
  return (
    <LedgerFlowContext.Provider
      value={{
        stages,
        setStage(flowId, stage) {
          setStages(current => ({ ...current, [flowId]: stage }));
        },
      }}
    >
      {children}
    </LedgerFlowContext.Provider>
  );
}

export function useLedgerFlowStage(flowId: string) {
  const { stages, setStage } = useContext(LedgerFlowContext);
  return {
    stage: stages[flowId] ?? 'review',
    setStage(stage: LedgerFlowStage) {
      setStage(flowId, stage);
    },
  };
}

const recoveryControls: { label: string; stage: LedgerFlowStage }[] = [
  { label: 'Device locked', stage: 'locked' },
  { label: 'Opening app', stage: 'opening-app' },
  { label: 'Device rejected', stage: 'rejected' },
  { label: 'Disconnect', stage: 'disconnected' },
  { label: 'Wrong Ledger', stage: 'wrong-device' },
  { label: 'Wrong app', stage: 'wrong-app' },
  { label: 'Device busy', stage: 'busy' },
  { label: 'Outdated app', stage: 'outdated-app' },
  { label: 'Invalid payload', stage: 'invalid-payload' },
  { label: 'Chooser canceled', stage: 'chooser-canceled' },
];

interface LedgerPreviewControlsProps {
  scenarioId: string;
}

export function LedgerPreviewControls({ scenarioId }: LedgerPreviewControlsProps) {
  const { stage, setStage } = useLedgerFlowStage(scenarioId);
  const labelId = useId();
  if (!scenarioId.startsWith('ledger-flow-')) return null;
  const isDeviceWaiting = stage === 'device' || stage === 'policy';
  const isPairing = [
    'pairing-required',
    'pairing-tab',
    'pairing-chooser',
    'restart-request',
    'request-closed',
  ].includes(stage);
  const isFinished =
    stage === 'signed' || stage === 'broadcast' || stage === 'canceled' || isPairing;
  return (
    <Stack gap="space.03" role="group" aria-labelledby={labelId}>
      <Stack gap="space.01">
        <styled.h3 id={labelId} textStyle="label.03">
          Simulated Ledger
        </styled.h3>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          Interactive design preview. No hardware connection, signature or broadcast. Click the
          wallet’s button to start; use these controls for events from the device.
        </styled.p>
      </Stack>
      {(stage === 'connect' || stage === 'checking') && (
        <styled.button
          type="button"
          textStyle="label.03"
          textDecoration="underline"
          textAlign="left"
          cursor="pointer"
          onClick={() => setStage('pairing-required')}
        >
          Browser: no Ledger permission
        </styled.button>
      )}
      {(stage === 'locked' || stage === 'opening-app') && (
        <styled.button
          type="button"
          textStyle="label.03"
          textDecoration="underline"
          textAlign="left"
          cursor="pointer"
          onClick={() => setStage('checking')}
        >
          {stage === 'locked' ? 'Device unlocked' : 'Required app opened'}
        </styled.button>
      )}
      {(stage === 'chooser' || stage === 'pairing-chooser') && (
        <styled.button
          type="button"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
          px="space.03"
          py="space.02"
          textStyle="label.03"
          textAlign="left"
          cursor="pointer"
          onClick={() => setStage(stage === 'pairing-chooser' ? 'restart-request' : 'checking')}
        >
          Browser: device selected
        </styled.button>
      )}
      {stage === 'checking' && (
        <styled.button
          type="button"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
          px="space.03"
          py="space.02"
          textStyle="label.03"
          textAlign="left"
          cursor="pointer"
          onClick={() => setStage(scenarioId === 'ledger-flow-btc-vault' ? 'policy' : 'device')}
        >
          Device account matches
        </styled.button>
      )}
      <styled.button
        type="button"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        px="space.03"
        py="space.02"
        textStyle="label.03"
        textAlign="left"
        cursor="pointer"
        disabled={!isDeviceWaiting}
        opacity={isDeviceWaiting ? 1 : 0.4}
        onClick={() => setStage(stage === 'policy' ? 'device' : 'signed')}
      >
        {stage === 'policy' ? 'Device approved wallet policy' : 'Device approved'}
      </styled.button>
      {stage === 'submitting' && (
        <Flex gap="space.02" flexWrap="wrap">
          <styled.button
            type="button"
            textStyle="caption.01"
            px="space.02"
            py="space.02"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => setStage('broadcast')}
          >
            Node accepted transaction
          </styled.button>
          <styled.button
            type="button"
            textStyle="caption.01"
            px="space.02"
            py="space.02"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => setStage('submit-failed')}
          >
            Node rejected transaction
          </styled.button>
        </Flex>
      )}
      <Flex gap="space.02" flexWrap="wrap">
        {recoveryControls.map(control => (
          <styled.button
            key={control.stage}
            type="button"
            borderWidth={1}
            borderColor="ink.border-default"
            borderRadius="sm"
            px="space.02"
            py="space.02"
            textStyle="caption.01"
            cursor="pointer"
            disabled={
              control.stage === 'chooser-canceled'
                ? stage !== 'chooser' && stage !== 'pairing-chooser'
                : stage === 'review' ||
                  isFinished ||
                  stage === 'submitting' ||
                  stage === 'submit-failed'
            }
            onClick={() => setStage(stage === 'pairing-chooser' ? 'pairing-tab' : control.stage)}
          >
            {control.label}
          </styled.button>
        ))}
        <styled.button
          type="button"
          textStyle="caption.01"
          px="space.02"
          py="space.02"
          textDecoration="underline"
          cursor="pointer"
          onClick={() => setStage('review')}
        >
          Restart review
        </styled.button>
      </Flex>
      <styled.p textStyle="caption.01" color="ink.text-subdued" aria-live="polite">
        Preview state: {stage.replaceAll('-', ' ')}
      </styled.p>
    </Stack>
  );
}

interface ApprovalLedgerDeviceProps {
  stage: LedgerFlowStage;
}

const LedgerConnectionAnimation = lazy(() => import('./approval-ledger-animation'));

function subscribeHydration() {
  return () => undefined;
}

function readHydration() {
  return true;
}

function readServerHydration() {
  return false;
}

interface LedgerConnectionArtworkProps {
  isAnimated: boolean;
}

function LedgerConnectionArtwork({ isAnimated }: LedgerConnectionArtworkProps) {
  const isHydrated = useSyncExternalStore(subscribeHydration, readHydration, readServerHydration);
  return (
    <Box
      alignSelf="stretch"
      mx="-space.04"
      height="140px"
      overflow="hidden"
      aria-hidden="true"
      css={{ '& svg > g': { clipPath: 'none' } }}
      _dark={{ filter: 'invert(1)' }}
    >
      {isHydrated && (
        <Suspense fallback={null}>
          <LedgerConnectionAnimation isAnimated={isAnimated} />
        </Suspense>
      )}
    </Box>
  );
}

function isConnectionStage(stage: LedgerFlowStage) {
  return (
    stage === 'connect' ||
    stage === 'locked' ||
    stage === 'opening-app' ||
    stage === 'chooser' ||
    stage === 'checking' ||
    stage === 'chooser-canceled'
  );
}

function ledgerDeviceArtwork(stage: LedgerFlowStage) {
  if (stage === 'policy' || stage === 'device') return <SignLedgerTransaction />;
  if (stage === 'signed' || stage === 'broadcast') return <ConnectLedgerSuccess />;
  if (stage === 'rejected') return <LedgerTxRejected />;
  if (stage === 'disconnected') return <LedgerIlluDisconnected />;
  return <ConnectLedgerErr />;
}

export function ApprovalLedgerDevice({ stage }: ApprovalLedgerDeviceProps) {
  const { isSolo } = useApprovalOptions();
  const isWaiting = stage === 'policy' || stage === 'device';
  return (
    <Stack gap="space.02" py="space.02" alignItems="center" data-approval-zone="ledger-device">
      {isConnectionStage(stage) ? (
        <LedgerConnectionArtwork isAnimated={isSolo && stage === 'connect'} />
      ) : (
        <Flex
          width="100%"
          maxWidth="292px"
          minHeight="112px"
          alignItems="center"
          justifyContent="center"
          aria-hidden="true"
          color="ink.text-primary"
          css={{ '& > svg': { width: '100%', height: 'auto' } }}
        >
          {ledgerDeviceArtwork(stage)}
        </Flex>
      )}
      {isWaiting && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Waiting for confirmation on your Ledger
        </styled.span>
      )}
    </Stack>
  );
}
