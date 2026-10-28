export type JourneyKind = 'connect' | 'message' | 'proposal' | 'sign' | 'transaction' | 'broadcast';
type JourneySigner = 'software' | 'ledger';
type JourneyStage =
  | 'ready'
  | 'review'
  | 'device'
  | 'signed'
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'rejected';

type JourneyActionType =
  | 'configure'
  | 'request'
  | 'approve'
  | 'device-approved'
  | 'reject'
  | 'confirm'
  | 'fail'
  | 'continue';

interface JourneyLogEntry {
  id: string;
  type: JourneyActionType;
  label: string;
  at: number;
}

export interface JourneyTransaction {
  requestId: string;
  stepIndex: number;
  status: 'pending' | 'confirmed' | 'failed';
  feePaid: boolean;
  amounts: Record<string, string>;
}

export interface JourneyRun {
  id: string;
  journeyId: string;
  stepIndex: number;
  stage: JourneyStage;
  connected: boolean;
  signer: JourneySigner;
  revision: number;
  events: JourneyLogEntry[];
  completedSteps: number[];
  startedAt: number;
  amounts: Record<string, string>;
  transactions: JourneyTransaction[];
  requestId?: string;
  requestKind?: JourneyKind;
  feePaid?: boolean;
}

interface JourneyEventContext {
  runId: string;
  revision: number;
  at: number;
}

interface JourneyRequestEvent extends JourneyEventContext {
  type: 'request';
  requestId: string;
  kind: JourneyKind;
}

interface JourneyRequestAction extends JourneyEventContext {
  type: 'approve' | 'device-approved' | 'reject' | 'confirm' | 'continue';
  requestId: string;
}

interface JourneyFailureEvent extends JourneyEventContext {
  type: 'fail';
  requestId: string;
  feePaid?: boolean;
}

interface JourneyConfigureEvent extends JourneyEventContext {
  type: 'configure';
  signer?: JourneySigner;
  amount?: { stepId: string; value: string };
}

export type JourneyEvent =
  | JourneyRequestEvent
  | JourneyRequestAction
  | JourneyFailureEvent
  | JourneyConfigureEvent;

interface CreateJourneyRunOptions {
  id: string;
  journeyId: string;
  signer: JourneySigner;
  startedAt: number;
}

export function createJourneyRun({
  id,
  journeyId,
  signer,
  startedAt,
}: CreateJourneyRunOptions): JourneyRun {
  return {
    id,
    journeyId,
    signer,
    startedAt,
    stepIndex: 0,
    stage: 'ready',
    connected: false,
    revision: 0,
    events: [],
    completedSteps: [],
    amounts: {},
    transactions: [],
  };
}

function recordTransition(
  run: JourneyRun,
  event: JourneyEvent,
  changes: Partial<JourneyRun>,
  label: string
): JourneyRun {
  const revision = run.revision + 1;
  return {
    ...run,
    ...changes,
    revision,
    events: [
      ...run.events,
      { id: `${run.id}:${revision}:${event.type}`, type: event.type, label, at: event.at },
    ],
  };
}

function settleApproval(run: JourneyRun, event: JourneyEvent): JourneyRun {
  if (run.requestKind === 'connect') {
    return recordTransition(
      run,
      event,
      { stage: 'confirmed', connected: true },
      'Connected to app'
    );
  }
  if (run.requestKind === 'transaction' || run.requestKind === 'broadcast') {
    if (!run.requestId) return run;
    const transaction: JourneyTransaction = {
      requestId: run.requestId,
      stepIndex: run.stepIndex,
      status: 'pending',
      feePaid: false,
      amounts: { ...run.amounts },
    };
    return recordTransition(
      run,
      event,
      { stage: 'pending', transactions: [...run.transactions, transaction] },
      'Transaction submitted; waiting for confirmation'
    );
  }
  if (run.requestKind === 'proposal') {
    return recordTransition(
      run,
      event,
      { stage: 'signed' },
      'Proposal signed; funds have not moved'
    );
  }
  return recordTransition(run, event, { stage: 'signed' }, 'Signature returned; nothing broadcast');
}

export function reduceJourneyRun(run: JourneyRun, event: JourneyEvent): JourneyRun {
  if (event.runId !== run.id || event.revision !== run.revision || !Number.isFinite(event.at))
    return run;
  if (event.type === 'configure') {
    if (run.stage !== 'ready' && run.stage !== 'rejected' && run.stage !== 'failed') return run;
    if (!event.signer && !event.amount) return run;
    const amounts = event.amount
      ? { ...run.amounts, [event.amount.stepId]: event.amount.value }
      : run.amounts;
    return recordTransition(
      run,
      event,
      { signer: event.signer ?? run.signer, amounts },
      'Demo settings updated'
    );
  }
  if (event.type === 'request') {
    if (run.stage !== 'ready' && run.stage !== 'rejected' && run.stage !== 'failed') return run;
    if (
      !event.requestId ||
      run.transactions.some(transaction => transaction.requestId === event.requestId)
    )
      return run;
    return recordTransition(
      run,
      event,
      {
        stage: 'review',
        requestId: event.requestId,
        requestKind: event.kind,
        feePaid: false,
      },
      'Wallet review opened'
    );
  }
  if (!run.requestId || event.requestId !== run.requestId) return run;
  if (event.type === 'approve') {
    if (run.stage !== 'review') return run;
    if (run.signer === 'ledger' && run.requestKind !== 'broadcast' && run.requestKind !== 'connect')
      return recordTransition(run, event, { stage: 'device' }, 'Waiting for Ledger approval');
    return settleApproval(run, event);
  }
  if (event.type === 'device-approved') {
    if (run.stage !== 'device') return run;
    return settleApproval(run, event);
  }
  if (event.type === 'reject') {
    if (run.stage !== 'review' && run.stage !== 'device') return run;
    return recordTransition(
      run,
      event,
      { stage: 'rejected', feePaid: false },
      'Request rejected; no fee paid'
    );
  }
  if (event.type === 'confirm') {
    if (run.stage !== 'pending') return run;
    const transactions = run.transactions.map(transaction =>
      transaction.requestId === run.requestId
        ? ({ ...transaction, status: 'confirmed', feePaid: true } satisfies JourneyTransaction)
        : transaction
    );
    return recordTransition(
      run,
      event,
      { stage: 'confirmed', feePaid: true, transactions },
      'Transaction confirmed'
    );
  }
  if (event.type === 'fail') {
    if (run.stage !== 'pending') return run;
    const feePaid = event.feePaid ?? false;
    const label = feePaid
      ? 'Transaction failed; only the fee was paid'
      : 'Transaction failed; no fee paid';
    const transactions = run.transactions.map(transaction =>
      transaction.requestId === run.requestId
        ? ({ ...transaction, status: 'failed', feePaid } satisfies JourneyTransaction)
        : transaction
    );
    return recordTransition(run, event, { stage: 'failed', feePaid, transactions }, label);
  }
  if (run.stage !== 'confirmed' && run.stage !== 'signed') return run;
  const completedSteps = run.completedSteps.includes(run.stepIndex)
    ? run.completedSteps
    : [...run.completedSteps, run.stepIndex];
  return recordTransition(
    run,
    event,
    {
      stage: 'ready',
      stepIndex: run.stepIndex + 1,
      completedSteps,
      requestId: undefined,
      requestKind: undefined,
      feePaid: undefined,
    },
    'Next step started'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isJourneyKind(value: unknown): value is JourneyKind {
  return (
    value === 'connect' ||
    value === 'message' ||
    value === 'proposal' ||
    value === 'sign' ||
    value === 'transaction' ||
    value === 'broadcast'
  );
}

function isJourneyStage(value: unknown): value is JourneyStage {
  return (
    value === 'ready' ||
    value === 'review' ||
    value === 'device' ||
    value === 'signed' ||
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'failed' ||
    value === 'rejected'
  );
}

function isJourneyLogEntry(value: unknown): value is JourneyLogEntry {
  if (!isRecord(value)) return false;
  const validType =
    value.type === 'configure' ||
    value.type === 'request' ||
    value.type === 'approve' ||
    value.type === 'device-approved' ||
    value.type === 'reject' ||
    value.type === 'confirm' ||
    value.type === 'fail' ||
    value.type === 'continue';
  return (
    typeof value.id === 'string' &&
    validType &&
    typeof value.label === 'string' &&
    isFiniteNumber(value.at)
  );
}

function isJourneyTransaction(value: unknown): value is JourneyTransaction {
  if (!isRecord(value)) return false;
  return (
    typeof value.requestId === 'string' &&
    value.requestId.length > 0 &&
    isNonNegativeInteger(value.stepIndex) &&
    (value.status === 'pending' || value.status === 'confirmed' || value.status === 'failed') &&
    typeof value.feePaid === 'boolean' &&
    isRecord(value.amounts) &&
    Object.values(value.amounts).every(amount => typeof amount === 'string')
  );
}

export function isJourneyRun(value: unknown): value is JourneyRun {
  if (!isRecord(value)) return false;
  const hasRequestId = typeof value.requestId === 'string' && value.requestId.length > 0;
  const hasRequestKind = isJourneyKind(value.requestKind);
  const validRequest =
    value.stage === 'ready'
      ? value.requestId === undefined && value.requestKind === undefined
      : hasRequestId && hasRequestKind;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.journeyId === 'string' &&
    value.journeyId.length > 0 &&
    isNonNegativeInteger(value.stepIndex) &&
    isJourneyStage(value.stage) &&
    typeof value.connected === 'boolean' &&
    (value.signer === 'software' || value.signer === 'ledger') &&
    isNonNegativeInteger(value.revision) &&
    isFiniteNumber(value.startedAt) &&
    Array.isArray(value.events) &&
    value.events.every(isJourneyLogEntry) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isJourneyTransaction) &&
    Array.isArray(value.completedSteps) &&
    value.completedSteps.every(isNonNegativeInteger) &&
    isRecord(value.amounts) &&
    Object.values(value.amounts).every(amount => typeof amount === 'string') &&
    (value.feePaid === undefined || typeof value.feePaid === 'boolean') &&
    validRequest
  );
}
