import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router';

import type { SupportedBlockchains } from '@leather.io/models';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { isPopupMode } from '@app/common/utils';

import { consumeLedgerFlowHandoff, ledgerFlowHandoffParam } from './ledger-flow-handoff';
import type {
  ActiveLedgerFlowRequest,
  ActiveLedgerSigningRequest,
  LedgerFlowRequest,
  LedgerNonSigningFlowRequest,
  LedgerSigningFailure,
  LedgerSigningKind,
  LedgerSigningOutcome,
  LedgerSigningRequest,
  LedgerSigningResults,
  LedgerSigningTarget,
  LedgerStacksAppVersionInfo,
  LedgerStep,
} from './ledger-flow.types';

interface LedgerFlowState {
  request: ActiveLedgerFlowRequest;
  step: LedgerStep;
}

interface LedgerFlowContextValue {
  state: LedgerFlowState | null;
  open(request: LedgerNonSigningFlowRequest): void;
  sign<K extends LedgerSigningKind>(
    request: LedgerSigningRequest<K>
  ): Promise<LedgerSigningOutcome<LedgerSigningResults[K]>>;
  settle<T>(request: LedgerSigningTarget<T>, outcome: LedgerSigningOutcome<T>): void;
  close(): void;
  closeWithError(error: string): void;
  dismiss(): void;
  setStep(requestId: number, step: LedgerStep): void;
}

const ledgerFlowContext = createContext<LedgerFlowContextValue | null>(null);

const cancelledOutcome: LedgerSigningFailure = { status: 'cancelled' };

function settleIfSigning(request: ActiveLedgerFlowRequest | null, outcome: LedgerSigningFailure) {
  if (request && 'resolve' in request) request.resolve(outcome);
}

function toActiveSigningRequest<K extends LedgerSigningKind>(
  request: LedgerSigningRequest<K>,
  id: number,
  resolve: (outcome: LedgerSigningOutcome<LedgerSigningResults[K]>) => void
): ActiveLedgerSigningRequest;
function toActiveSigningRequest(
  request: LedgerSigningRequest<LedgerSigningKind>,
  id: number,
  resolve: (outcome: LedgerSigningOutcome<LedgerSigningResults[LedgerSigningKind]>) => void
): ActiveLedgerSigningRequest {
  return { ...request, id, resolve };
}

function getInitialStep(request: LedgerFlowRequest): LedgerStep {
  const autoConnect = request.kind === 'request-keys' && request.autoConnect;
  if (request.kind === 'request-keys' && request.chain === 'stacks')
    return { name: 'choose-address-standard', connectImmediatelyAfter: autoConnect };
  return { name: 'connect', retryImmediately: autoConnect };
}

interface LedgerFlowProviderProps {
  children: React.ReactNode;
}
export function LedgerFlowProvider({ children }: LedgerFlowProviderProps) {
  const [state, setState] = useState<LedgerFlowState | null>(null);
  const [searchParams] = useSearchParams();
  const activeRequest = useRef<ActiveLedgerFlowRequest | null>(null);
  const nextRequestId = useRef(0);

  const takeNextRequestId = useCallback(() => {
    nextRequestId.current += 1;
    return nextRequestId.current;
  }, []);

  const start = useCallback((request: ActiveLedgerFlowRequest) => {
    const previous = activeRequest.current;
    activeRequest.current = request;
    setState({ request, step: getInitialStep(request) });
    settleIfSigning(previous, cancelledOutcome);
  }, []);

  const end = useCallback((outcome: LedgerSigningFailure) => {
    const request = activeRequest.current;
    activeRequest.current = null;
    setState(null);
    settleIfSigning(request, outcome);
  }, []);

  const open = useCallback(
    (request: LedgerNonSigningFlowRequest) => start({ ...request, id: takeNextRequestId() }),
    [start, takeNextRequestId]
  );

  const sign = useCallback(
    <K extends LedgerSigningKind>(request: LedgerSigningRequest<K>) =>
      new Promise<LedgerSigningOutcome<LedgerSigningResults[K]>>(resolve =>
        start(toActiveSigningRequest(request, takeNextRequestId(), resolve))
      ),
    [start, takeNextRequestId]
  );

  const settle = useCallback(
    <T,>(request: LedgerSigningTarget<T>, outcome: LedgerSigningOutcome<T>) => {
      if (activeRequest.current?.id !== request.id) return;
      activeRequest.current = null;
      setState(null);
      request.resolve(outcome);
    },
    []
  );

  const close = useCallback(() => end(cancelledOutcome), [end]);

  const closeWithError = useCallback((error: string) => end({ status: 'failed', error }), [end]);

  const dismiss = useCallback(() => end({ status: 'dismissed' }), [end]);

  const setStep = useCallback((requestId: number, step: LedgerStep) => {
    setState(current => {
      if (!current || current.request.id !== requestId) return current;
      return { ...current, step };
    });
  }, []);

  useEffect(
    () => () => {
      const request = activeRequest.current;
      activeRequest.current = null;
      settleIfSigning(request, cancelledOutcome);
    },
    []
  );

  useOnMount(async () => {
    if (isPopupMode()) return;
    const request = await consumeLedgerFlowHandoff(searchParams.get(ledgerFlowHandoffParam));
    if (request) open(request);
  });

  const value = useMemo(
    () => ({ state, open, sign, settle, close, closeWithError, dismiss, setStep }),
    [state, open, sign, settle, close, closeWithError, dismiss, setStep]
  );

  return <ledgerFlowContext.Provider value={value}>{children}</ledgerFlowContext.Provider>;
}

function useLedgerFlowContext() {
  const context = useContext(ledgerFlowContext);
  if (!context) throw new Error('No LedgerFlowProvider found');
  return context;
}

export function useLedgerFlow() {
  const { state, open, sign, close, closeWithError } = useLedgerFlowContext();
  return useMemo(
    () => ({ request: state?.request ?? null, open, sign, close, closeWithError }),
    [state, open, sign, close, closeWithError]
  );
}

export function useLedgerFlowState() {
  return useLedgerFlowContext().state;
}

export function useLedgerStep(): LedgerStep {
  const state = useLedgerFlowState();
  if (!state) throw new Error('No active Ledger flow');
  return state.step;
}

interface ToConnectStepOptions {
  retryImmediately?: boolean;
}

interface ToAwaitingDeviceOperationArgs {
  hasApprovedOperation: boolean;
}

interface ToChooseAddressStandardStepArgs {
  connectImmediatelyAfter: boolean;
}

export function useLedgerSteps() {
  const { state, close, dismiss, settle, setStep } = useLedgerFlowContext();
  const requestId = state?.request.id;

  return useMemo(() => {
    function goToStep(step: LedgerStep) {
      if (requestId === undefined) return;
      setStep(requestId, step);
    }

    return {
      toConnectStep({ retryImmediately = false }: ToConnectStepOptions = {}) {
        goToStep({ name: 'connect', retryImmediately });
      },

      toConnectStepAndTryAgain() {
        goToStep({ name: 'connect', retryImmediately: true });
      },

      toCheckingAppVersion() {
        goToStep({ name: 'checking-app-version' });
      },

      toDeviceBusyStep(description?: string, address?: string) {
        goToStep({ name: 'device-busy', description, address });
      },

      toConnectionSuccessStep(chain: SupportedBlockchains) {
        goToStep({ name: 'connection-success', chain });
      },

      toErrorStep(chain: SupportedBlockchains, errorMessage?: string) {
        goToStep({ name: 'connection-error', chain, errorMessage });
      },

      toAwaitingDeviceOperation({ hasApprovedOperation }: ToAwaitingDeviceOperationArgs) {
        goToStep({ name: 'awaiting-device-operation', hasApprovedOperation });
      },

      toDevicePayloadInvalid() {
        goToStep({ name: 'payload-invalid' });
      },

      toOperationRejectedStep(description?: string) {
        goToStep({ name: 'operation-rejected', description });
      },

      toDeviceDisconnectStep() {
        goToStep({ name: 'disconnected' });
      },

      toStacksAppOutdatedWarning(versionInfo?: LedgerStacksAppVersionInfo) {
        goToStep({ name: 'outdated-stacks-app', versionInfo });
      },

      toChooseAddressStandardStep({ connectImmediatelyAfter }: ToChooseAddressStandardStepArgs) {
        goToStep({ name: 'choose-address-standard', connectImmediatelyAfter });
      },

      cancelLedgerAction() {
        close();
      },

      dismissLedgerAction() {
        dismiss();
      },

      settleLedgerAction<T>(request: LedgerSigningTarget<T>, outcome: LedgerSigningOutcome<T>) {
        settle(request, outcome);
      },
    };
  }, [requestId, setStep, close, dismiss, settle]);
}
