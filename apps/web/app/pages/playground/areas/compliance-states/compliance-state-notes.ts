import { type BuildNotes, complianceNotes } from '../compliance-shared/compliance-build-notes';
import { type ComplianceStateId } from './compliance-states';

// The demo's build-notes panel, per walkthrough state. The notes themselves are keyed by UI
// piece in compliance-shared so the static board can show the same text.
export const buildNotes: Record<ComplianceStateId, BuildNotes> = {
  'onboarding-to-lockout': complianceNotes['background-screening'],
  'home-to-lockout': {
    ...complianceNotes['background-screening'],
    trigger: 'A periodic rescreen comes back flagged while the app is open.',
  },
  lockout: complianceNotes.lockout,
  'why-created': complianceNotes['why-locked-created'],
  'why-imported': complianceNotes['why-locked-imported'],
  'key-backup': complianceNotes['key-backup'],
  'dispute-email': complianceNotes.dispute,
  'review-recipient-flagged': complianceNotes['send-review-recipient-flagged'],
  'review-own-flagged': complianceNotes['send-review-own-flagged'],
  'review-multisig-member-flagged': complianceNotes['multisig-member-flagged'],
  'review-no-answer': complianceNotes['send-review-no-answer'],
  'approve-clean': complianceNotes['approval-screening'],
  'approve-counterparty-flagged': complianceNotes['approval-counterparty-flagged'],
  'approve-no-answer': complianceNotes['approval-no-answer'],
  'approve-stacks-btc-flagged': complianceNotes['approval-own-btc-flagged'],
};
