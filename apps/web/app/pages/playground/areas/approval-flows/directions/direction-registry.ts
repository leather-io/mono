import type { ApprovalDirection } from '../pattern/approval-direction';
import { activityDirection } from './activity-direction';
import { balanceDirection } from './balance-direction';
import { breakdownDirection } from './breakdown-direction';
import { handshakeDirection } from './handshake-direction';
import { phantomDirection } from './phantom-direction';
import { receiptDirection } from './receipt-direction';
import { tactileDirection } from './tactile-direction';

export const proposalDirection: ApprovalDirection = {
  id: 'proposal',
  name: 'Baseline',
  description: 'The reference pattern: plain sections, icon lane, quiet guarantee line.',
  inspiration: 'Leather today, MetaMask, Ledger review order',
};

export const approvalDirections: ApprovalDirection[] = [
  proposalDirection,
  activityDirection,
  handshakeDirection,
  breakdownDirection,
  balanceDirection,
  receiptDirection,
  tactileDirection,
  phantomDirection,
];

export const defaultDiscardedDirectionIds = [phantomDirection.id];

export function findApprovalDirection(id: string | null) {
  return approvalDirections.find(direction => direction.id === id) ?? proposalDirection;
}
