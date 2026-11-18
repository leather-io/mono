import type { ReactNode } from 'react';

import type { ApprovalEvent } from '../approval-flows.events';

type ScenarioFamily =
  | 'rules'
  | 'connect'
  | 'contract-call'
  | 'transfer'
  | 'sign-transaction'
  | 'bitcoin'
  | 'message'
  | 'account'
  | 'state'
  | 'sip-030'
  | 'source';

export interface Scenario {
  id: string;
  family: ScenarioFamily;
  label: string;
  method: string;
  note: string;
  refs?: string[];
  captureId?: string;
  events?: ApprovalEvent[];
  render(): ReactNode;
  history?(): ReactNode;
}
