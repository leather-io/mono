import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import type { SupportedBlockchains } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { isPopupMode } from '@app/common/utils';

import { consumeLedgerFlowHandoff } from './ledger-flow-handoff';
import type {
  ActiveLedgerFlowRequest,
  LedgerFlowRequest,
  LedgerStacksAppVersionInfo,
  LedgerStep,
} from './ledger-flow.types';

interface LedgerFlowState {
  request: ActiveLedgerFlowRequest;
  step: LedgerStep;
}

interface LedgerFlowContextValue {
  state: LedgerFlowState | null;
  open(request: LedgerFlowRequest): void;
  close(): void;
  setStep(requestId: number, step: LedgerStep): void;
}

const ledgerFlowContext = createContext<LedgerFlowContextValue | null>(null);

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
  const nextRequestId = useRef(0);

  const open = useCallback((request: LedgerFlowRequest) => {
    nextRequestId.current += 1;
    setState({
      request: { ...request, id: nextRequestId.current },
      step: getInitialStep(request),
    });
  }, []);

  const close = useCallback(() => setState(null), []);

  const setStep = useCallback((requestId: number, step: LedgerStep) => {
    setState(current => {
      if (!current || current.request.id !== requestId) return current;
      return { ...current, step };
    });
  }, []);

  useOnMount(async () => {
    if (isPopupMode()) return;
    const request = await consumeLedgerFlowHandoff();
    if (request) open(request);
  });

  const value = useMemo(() => ({ state, open, close, setStep }), [state, open, close, setStep]);

  return <ledgerFlowContext.Provider value={value}>{children}</ledgerFlowContext.Provider>;
}

function useLedgerFlowContext() {
  const context = useContext(ledgerFlowContext);
  if (!context) throw new Error('No LedgerFlowProvider found');
  return context;
}

export function useLedgerFlow() {
  const { state, open, close } = useLedgerFlowContext();
  return useMemo(() => ({ request: state?.request ?? null, open, close }), [state, open, close]);
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
  const { state, close, setStep } = useLedgerFlowContext();
  const navigate = useNavigate();
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

      toPublicKeyMismatchStep() {
        goToStep({ name: 'public-key-mismatch' });
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

      toBroadcastErrorStep(error: string) {
        goToStep({ name: 'broadcast-error', error });
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

      cancelLedgerActionAndReturnHome() {
        close();
        void navigate(RouteUrls.Home);
      },
    };
  }, [requestId, setStep, close, navigate]);
}
