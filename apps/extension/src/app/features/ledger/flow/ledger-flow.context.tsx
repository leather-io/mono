import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';

import type { SupportedBlockchains } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { appEvents } from '@app/common/publish-subscribe';
import { isPopupMode } from '@app/common/utils';

import { consumeLedgerFlowHandoff, ledgerFlowHandoffParam } from './ledger-flow-handoff';
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
  closeWithError(error: string): void;
  setStep(requestId: number, step: LedgerStep): void;
}

const ledgerFlowContext = createContext<LedgerFlowContextValue | null>(null);

function settlePendingSigning(request: LedgerFlowRequest, error?: string) {
  const errorPayload = error === undefined ? {} : { error };
  switch (request.kind) {
    case 'sign-bitcoin-tx':
      appEvents.publish('ledgerBitcoinTxSigningCancelled', {
        unsignedPsbt: bytesToHex(request.psbt),
        ...errorPayload,
      });
      return;
    case 'sign-stacks-tx':
      appEvents.publish('ledgerStacksTxSigningCancelled', {
        unsignedTx: request.tx,
        ...errorPayload,
      });
      return;
    case 'sign-stacks-message':
      appEvents.publish('ledgerStacksMessageSigningCancelled', {
        unsignedMessage: request.message,
        ...errorPayload,
      });
      return;
    default:
      return;
  }
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

  const replaceRequest = useCallback((request: ActiveLedgerFlowRequest | null, error?: string) => {
    const previous = activeRequest.current;
    activeRequest.current = request;
    if (previous) settlePendingSigning(previous, error);
  }, []);

  const open = useCallback(
    (request: LedgerFlowRequest) => {
      nextRequestId.current += 1;
      const activeFlowRequest = { ...request, id: nextRequestId.current };
      replaceRequest(activeFlowRequest);
      setState({ request: activeFlowRequest, step: getInitialStep(request) });
    },
    [replaceRequest]
  );

  const close = useCallback(() => {
    replaceRequest(null);
    setState(null);
  }, [replaceRequest]);

  const closeWithError = useCallback(
    (error: string) => {
      replaceRequest(null, error);
      setState(null);
    },
    [replaceRequest]
  );

  const setStep = useCallback((requestId: number, step: LedgerStep) => {
    setState(current => {
      if (!current || current.request.id !== requestId) return current;
      return { ...current, step };
    });
  }, []);

  useOnMount(async () => {
    if (isPopupMode()) return;
    const request = await consumeLedgerFlowHandoff(searchParams.get(ledgerFlowHandoffParam));
    if (request) open(request);
  });

  const value = useMemo(
    () => ({ state, open, close, closeWithError, setStep }),
    [state, open, close, closeWithError, setStep]
  );

  return <ledgerFlowContext.Provider value={value}>{children}</ledgerFlowContext.Provider>;
}

function useLedgerFlowContext() {
  const context = useContext(ledgerFlowContext);
  if (!context) throw new Error('No LedgerFlowProvider found');
  return context;
}

export function useLedgerFlow() {
  const { state, open, close, closeWithError } = useLedgerFlowContext();
  return useMemo(
    () => ({ request: state?.request ?? null, open, close, closeWithError }),
    [state, open, close, closeWithError]
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
