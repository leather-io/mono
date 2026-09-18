import { useLedgerStep } from '../flow/ledger-flow.context';

export function useHasApprovedOperation() {
  const step = useLedgerStep();
  return step.name === 'awaiting-device-operation' && step.hasApprovedOperation;
}
