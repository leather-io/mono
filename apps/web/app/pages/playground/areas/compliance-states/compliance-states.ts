export type ComplianceStateId =
  | 'onboarding-to-lockout'
  | 'home-to-lockout'
  | 'lockout'
  | 'why-created'
  | 'why-imported'
  | 'key-backup'
  | 'dispute-email'
  | 'review-recipient-flagged'
  | 'review-own-flagged'
  | 'review-multisig-member-flagged'
  | 'review-no-answer'
  | 'approve-clean'
  | 'approve-counterparty-flagged'
  | 'approve-no-answer'
  | 'approve-stacks-btc-flagged';

type ComplianceSurface = 'popup' | 'request-window' | 'tab';

export type ComplianceOutcome = 'clean' | 'refused' | 'locked' | 'no-answer' | 'flow';

export type FlowStepId =
  | 'welcome'
  | 'secret-key'
  | 'password'
  | 'home-loading'
  | 'home'
  | 'locked'
  | 'email'
  | 'backup-password'
  | 'backup-reveal'
  | 'send-form'
  | 'screening'
  | 'verdict';

interface FlowStep {
  id: FlowStepId;
  label: string;
  durationMs?: number;
}

export interface ComplianceState {
  id: ComplianceStateId;
  label: string;
  outcome: ComplianceOutcome;
  surface: ComplianceSurface;
  scenario: string;
  note: string;
  steps?: FlowStep[];
}

interface ComplianceStateGroup {
  id: string;
  label: string;
  states: ComplianceState[];
}

const screeningStep: FlowStep = { id: 'screening', label: 'Screening', durationMs: 1600 };

export const complianceStateGroups: ComplianceStateGroup[] = [
  {
    id: 'onboarding',
    label: 'Onboarding · full-page tab',
    states: [
      {
        id: 'onboarding-to-lockout',
        label: 'Restore → lockout',
        outcome: 'flow',
        surface: 'tab',
        scenario: 'S1 · S2',
        note: 'The opening shot. Welcome → Use existing key → Secret Key → password, then Home loads as usual. Screening runs in the background; a few seconds later the result comes back flagged and the lockout replaces Home.',
        steps: [
          { id: 'welcome', label: 'Welcome', durationMs: 2600 },
          { id: 'secret-key', label: 'Secret Key', durationMs: 3000 },
          { id: 'password', label: 'Password', durationMs: 2600 },
          { id: 'home-loading', label: 'Home loading', durationMs: 2000 },
          { id: 'home', label: 'Home', durationMs: 2600 },
          { id: 'locked', label: 'Locked' },
        ],
      },
    ],
  },
  {
    id: 'lockout',
    label: 'Lockout · popup',
    states: [
      {
        id: 'home-to-lockout',
        label: 'Home → lockout',
        outcome: 'flow',
        surface: 'popup',
        scenario: 'S3',
        note: 'Mid-session hit. Home shows balances, a background rescreen comes back flagged, and the lockout replaces whatever is on screen.',
        steps: [
          { id: 'home', label: 'Home', durationMs: 3000 },
          { id: 'locked', label: 'Locked' },
        ],
      },
      {
        id: 'lockout',
        label: 'Leather is locked',
        outcome: 'locked',
        surface: 'popup',
        scenario: 'S2 · S11',
        note: 'Whole-app lockout, every wallet, no balances. Two ways forward: “Why am I seeing this?” (primary) and “Dispute this” (secondary, opens an email).',
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
        id: 'key-backup',
        label: 'Key backup · created wallet',
        outcome: 'flow',
        surface: 'popup',
        scenario: 'S11a',
        note: 'From “Why am I seeing this?”, “Back up Wallet 1 Secret Key” asks for the password, then reveals the key the way Settings › View Secret Key does today. Settings is unreachable under the lockout, so this is the only way back to the key.',
        steps: [
          { id: 'backup-password', label: 'Password', durationMs: 2600 },
          { id: 'backup-reveal', label: 'Reveal' },
        ],
      },
      {
        id: 'dispute-email',
        label: 'Dispute this → email',
        outcome: 'flow',
        surface: 'popup',
        scenario: 'S11b',
        note: '“Dispute this” opens the user’s mail app with a pre-filled draft to compliance@leather.io (Gina, Mitchell, Rena): subject, app version, platform, time and a reference ID. No addresses yet: whether the flagged address may go in the draft is with Rena.',
        steps: [
          { id: 'locked', label: 'Locked', durationMs: 1400 },
          { id: 'email', label: 'Email draft' },
        ],
      },
    ],
  },
  {
    id: 'send-review',
    label: 'Send review · popup',
    states: [
      {
        id: 'review-recipient-flagged',
        label: 'Recipient flagged',
        outcome: 'refused',
        surface: 'popup',
        scenario: 'S6',
        note: 'Send form → Continue. Screening runs as the review screen opens, and the refusal shows before the user can send: the Confirm button is replaced by Close. Only this transaction is refused; the app stays usable.',
        steps: [
          { id: 'send-form', label: 'Send form', durationMs: 2600 },
          screeningStep,
          { id: 'verdict', label: 'Refused' },
        ],
      },
      {
        id: 'review-own-flagged',
        label: 'Own address flagged',
        outcome: 'locked',
        surface: 'popup',
        scenario: 'S5',
        note: 'Send form → Continue. The review screen screens every address, including the user’s own. Own address flagged: nothing is signed and the app goes straight into the lockout.',
        steps: [
          { id: 'send-form', label: 'Send form', durationMs: 2600 },
          screeningStep,
          { id: 'verdict', label: 'Locked' },
        ],
      },
      {
        id: 'review-multisig-member-flagged',
        label: 'Multisig member flagged',
        outcome: 'refused',
        surface: 'popup',
        scenario: 'S8 · multisig',
        note: 'A 2-of-3 multisig account proposes its first transaction. One member’s address is restricted, so the proposal is refused before it is created: Propose becomes Close. Agreed with Rena: refuse at first proposal, not at account creation.',
        steps: [screeningStep, { id: 'verdict', label: 'Refused' }],
      },
      {
        id: 'review-no-answer',
        label: 'No answer',
        outcome: 'no-answer',
        surface: 'popup',
        scenario: 'S7',
        note: 'No provider answered. A general error sits above the footer; “contact support” opens a pre-filled email to compliance@leather.io. Try again reruns the check (here it comes back clean).',
        steps: [screeningStep, { id: 'verdict', label: 'No answer' }],
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
        note: 'The contrast. Every party comes back clean while the window opens, and Cancel / Confirm appear as today.',
        steps: [screeningStep, { id: 'verdict', label: 'Clean' }],
      },
      {
        id: 'approve-counterparty-flagged',
        label: 'Counterparty flagged',
        outcome: 'refused',
        surface: 'request-window',
        scenario: 'S8',
        note: 'Screening runs as the approval window opens. Another party is restricted, so the refusal shows before the user can approve: Close only. The app stays usable.',
        steps: [screeningStep, { id: 'verdict', label: 'Refused' }],
      },
      {
        id: 'approve-no-answer',
        label: 'No answer',
        outcome: 'no-answer',
        surface: 'request-window',
        scenario: 'S9',
        note: 'Same general error as the send review, above the footer. Cancel and Try again.',
        steps: [screeningStep, { id: 'verdict', label: 'No answer' }],
      },
      {
        id: 'approve-stacks-btc-flagged',
        label: 'Stacks call · own BTC flagged',
        outcome: 'locked',
        surface: 'request-window',
        scenario: 'S5 · cross-chain',
        note: 'A Stacks contract call from an account whose Bitcoin address is flagged (Werner’s case). The approval window screens the account’s BTC and STX addresses, and the flag puts the app into the lockout. Replaces today’s raw “Unable to handle request, errorCode: 1398”.',
        steps: [screeningStep, { id: 'verdict', label: 'Locked' }],
      },
    ],
  },
];

export const complianceStates = complianceStateGroups.flatMap(group => group.states);

export const defaultComplianceStateId: ComplianceStateId = 'onboarding-to-lockout';

export function findComplianceState(id: string | null) {
  return complianceStates.find(state => state.id === id);
}

export const surfaceLabels: Record<ComplianceSurface, string> = {
  popup: 'Extension popup · 390 × 600',
  'request-window': 'Request window · 390 × 756',
  tab: 'Full-page tab',
};
