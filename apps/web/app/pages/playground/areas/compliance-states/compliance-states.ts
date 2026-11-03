// Every state the switcher lists, in recording order. 'surface' picks the
// frame size: the action popup is 390 × 600, a dApp request window 390 × 756.

export type ComplianceStateId =
  | 'home-to-lockout'
  | 'lockout'
  | 'why-created'
  | 'why-imported'
  | 'dispute'
  | 'review-clean'
  | 'review-recipient-flagged'
  | 'review-own-flagged'
  | 'review-no-answer'
  | 'approve-clean'
  | 'approve-counterparty-flagged'
  | 'approve-no-answer';

type ComplianceSurface = 'popup' | 'request-window';

export type ComplianceOutcome = 'clean' | 'refused' | 'locked' | 'no-answer' | 'transition';

export interface ComplianceState {
  id: ComplianceStateId;
  label: string;
  outcome: ComplianceOutcome;
  surface: ComplianceSurface;
  scenario: string;
  note: string;
}

interface ComplianceStateGroup {
  id: string;
  label: string;
  states: ComplianceState[];
}

export const complianceStateGroups: ComplianceStateGroup[] = [
  {
    id: 'lockout',
    label: 'Lockout',
    states: [
      {
        id: 'home-to-lockout',
        label: 'Home → lockout',
        outcome: 'transition',
        surface: 'popup',
        scenario: 'S2 · S3',
        note: 'Home loads with balances while screening runs in the background. A few seconds later the result arrives flagged, and the lockout replaces Home.',
      },
      {
        id: 'lockout',
        label: 'Leather is locked',
        outcome: 'locked',
        surface: 'popup',
        scenario: 'S2 · S11',
        note: 'Whole-app lockout, every wallet. No balances. Only two ways forward: “Why am I seeing this?” and “Dispute this”.',
      },
      {
        id: 'why-created',
        label: 'Why · created wallet',
        outcome: 'locked',
        surface: 'popup',
        scenario: 'S11a',
        note: 'Plain explanation. The Secret Key backup link shows because Wallet 1 was created in Leather.',
      },
      {
        id: 'why-imported',
        label: 'Why · imported wallet',
        outcome: 'locked',
        surface: 'popup',
        scenario: 'S11a',
        note: 'Same explanation. No backup link: the user typed the Secret Key in, so they already have it.',
      },
      {
        id: 'dispute',
        label: 'Dispute this',
        outcome: 'locked',
        surface: 'popup',
        scenario: 'S11b',
        note: 'Placeholder. The destination (form, email or support link) and its owner are still open.',
      },
    ],
  },
  {
    id: 'send-review',
    label: 'Send review · popup',
    states: [
      {
        id: 'review-clean',
        label: 'Clean',
        outcome: 'clean',
        surface: 'popup',
        scenario: 'S7',
        note: 'Every address comes back clean. Confirm is enabled and the user sends as usual.',
      },
      {
        id: 'review-recipient-flagged',
        label: 'Recipient flagged',
        outcome: 'refused',
        surface: 'popup',
        scenario: 'S6',
        note: 'Only this transaction is refused. Close is the only action. The app stays usable.',
      },
      {
        id: 'review-own-flagged',
        label: 'Own address flagged',
        outcome: 'transition',
        surface: 'popup',
        scenario: 'S5',
        note: 'The review screen screens every address, including the user’s own. Own address flagged: nothing is signed and the app goes straight into the lockout.',
      },
      {
        id: 'review-no-answer',
        label: 'No answer',
        outcome: 'no-answer',
        surface: 'popup',
        scenario: 'S7 · 7a',
        note: 'No provider answered. Inline error above the footer; “contact support” opens a pre-filled email. Try again reruns the check (here it comes back clean).',
      },
    ],
  },
  {
    id: 'approve',
    label: 'dApp approval · request window',
    states: [
      {
        id: 'approve-clean',
        label: 'Clean',
        outcome: 'clean',
        surface: 'request-window',
        scenario: 'S9',
        note: 'Every party comes back clean. Cancel and Confirm, as today.',
      },
      {
        id: 'approve-counterparty-flagged',
        label: 'Counterparty flagged',
        outcome: 'refused',
        surface: 'request-window',
        scenario: 'S8',
        note: 'Another party is restricted, so this signature is refused. Close only. The app stays usable.',
      },
      {
        id: 'approve-no-answer',
        label: 'No answer',
        outcome: 'no-answer',
        surface: 'request-window',
        scenario: 'S9 · 7a',
        note: 'Same inline error as the send review, above the footer. Cancel and Try again.',
      },
    ],
  },
];

export const complianceStates = complianceStateGroups.flatMap(group => group.states);

export const defaultComplianceStateId: ComplianceStateId = 'home-to-lockout';

export function findComplianceState(id: string | null) {
  return complianceStates.find(state => state.id === id);
}

export const surfaceLabels: Record<ComplianceSurface, string> = {
  popup: 'Extension popup · 390 × 600',
  'request-window': 'Request window · 390 × 756',
};
