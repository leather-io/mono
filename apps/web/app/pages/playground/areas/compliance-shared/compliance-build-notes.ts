// Engineering handoff, keyed by UI piece. Code references were read at mono dev 07348542a
// (extension paths are relative to apps/extension/src/app). The walkthrough demo maps its
// states onto these (compliance-states/compliance-state-notes.ts); the static board shows
// them per section.

export interface BuildNotes {
  trigger: string;
  screens: string;
  result: string;
  today?: string;
  code?: string[];
  open?: string[];
}

export type ComplianceNoteId =
  | 'background-screening'
  | 'lockout'
  | 'why-locked-created'
  | 'why-locked-imported'
  | 'key-backup'
  | 'dispute'
  | 'send-review-recipient-flagged'
  | 'send-review-own-flagged'
  | 'send-review-screening'
  | 'multisig-member-flagged'
  | 'send-review-no-answer'
  | 'approval-screening'
  | 'approval-counterparty-flagged'
  | 'approval-no-answer'
  | 'approval-own-btc-flagged'
  | 'mobile';

export interface ComplianceNote extends BuildNotes {
  title: string;
}

function reviewCheck(screeningPoint: string) {
  return [
    `useBreakOnNonCompliantEntity in query/common/compliance-checker/compliance-checker.query.ts (screening point ${screeningPoint})`,
    'Replace the throw (“Unable to handle request, errorCode: 1398”) with a verdict the screen renders.',
  ];
}

export const complianceNotes: Record<ComplianceNoteId, ComplianceNote> = {
  'background-screening': {
    title: 'Background screening',
    trigger:
      'Wallet restored, imported or added, and on a periodic rescreen. Runs in the background; Home loads as usual.',
    screens:
      'Every address of every wallet: native segwit, taproot and Stacks, all accounts. Same endpoint as today (GET /v1/compliance/addresses/{address}), batched under the 20 req/s limiter.',
    result:
      'Any non_compliant → set an app-wide locked flag and render the lockout over whatever screen is open. Stop balance and other Leather API queries. Unavailable → show nothing and retry in the background.',
    today:
      'No background screening exists. Results cache for a week (refetch every 5 min only while unavailable).',
    code: [
      'packages/services/src/compliance/compliance.service.ts (reuse)',
      'packages/queries/src/compliance/compliance.query-config.ts (cache and refetch)',
      'packages/state wallet slice: candidate home for the locked flag',
      'routes/account-gate.tsx: where the extension can swap in the lockout',
    ],
    open: [
      'Rescreen cadence: today’s cache is one week. OFAC delta files as a trigger?',
      'Mainnet only today: the service returns compliant on any other Bitcoin network.',
    ],
  },
  lockout: {
    title: 'Lockout',
    trigger:
      'Locked flag set by background screening or by a review-screen check on an own address.',
    screens: 'Nothing new. The lockout itself makes no Leather API calls.',
    result:
      'Full-screen lockout in every surface (popup, tab, request window). Only two ways out: “Why am I seeing this?” and “Dispute this”. No Settings, no wallet switching, no Remove wallet.',
    code: ['routes/account-gate.tsx', 'app.tsx (LeatherQueryProvider)'],
    open: [
      'Analytics: no lockout, why or dispute events exist yet (packages/analytics/src/events.ts).',
    ],
  },
  'why-locked-created': {
    title: 'Why · created wallet',
    trigger: '“Why am I seeing this?” on the lockout.',
    screens: 'Nothing.',
    result:
      'Plain explanation. Shows “Back up <wallet> Secret Key” for each software wallet created in Leather. Imported and Ledger wallets get no link.',
    today: 'Leather does not record whether a software wallet was created or imported.',
    code: [
      'packages/state/src/wallet/wallet.utils.ts: WalletStore has type software | ledger, no origin',
      'Add a persisted origin field (created | imported) and a migration. Legacy wallets: decide a default.',
    ],
    open: ['Counsel’s OK on key backup under a lockout (Rena with Rodrigo).'],
  },
  'why-locked-imported': {
    title: 'Why · imported wallet',
    trigger: '“Why am I seeing this?” on the lockout.',
    screens: 'Nothing.',
    result:
      'Same explanation, no backup link: the user typed the Secret Key in, so they already have it.',
    code: ['Depends on the same created | imported field as the created-wallet state.'],
  },
  'key-backup': {
    title: 'Key backup',
    trigger: '“Back up <wallet> Secret Key” inside “Why am I seeing this?”.',
    screens: 'Nothing.',
    result:
      'Reuse the existing View Secret Key flow: password (Face ID or PIN on mobile), then reveal. Back returns to the lockout.',
    code: [
      'pages/view-secret-key/view-secret-key.tsx (RouteUrls.ViewSecretKey, state: { fingerprint })',
      'AccountGate has to let this one route through while locked.',
      'Mobile: /settings/wallet/configure/[wallet]/view-secret-key',
    ],
    open: ['Counsel’s OK on key backup under a lockout (Rena with Rodrigo).'],
  },
  dispute: {
    title: 'Dispute and support email',
    trigger: '“Dispute this” on the lockout or on “Why am I seeing this?”.',
    screens: 'Nothing.',
    result:
      'Open a mailto: to compliance@leather.io with subject, app version, platform, time and a reference ID. The inbox goes to Gina, Mitchell and Rena.',
    open: ['May the draft include the flagged address? Asked Rena on Nov 5.'],
  },
  'send-review-recipient-flagged': {
    title: 'Send review · recipient flagged',
    trigger: 'The send review screen opens (not while typing the recipient).',
    screens: 'Every address in the transaction: own inputs and change, recipient.',
    result:
      'Refusal callout replaces the amount; Confirm becomes Close. Only this transaction is refused, the app stays usable.',
    today:
      'BTC and STX recipients are checked while typing (complianceValidator, “Compliance check failed”) and fail open. The review screen checks nothing.',
    code: [
      'common/validation/forms/compliance-validators.ts (remove or keep as a hint)',
      'BTC: use-btc-send-form.tsx:83 · STX: recipient-validators.ts:21',
    ],
  },
  'send-review-own-flagged': {
    title: 'Send review · own address flagged',
    trigger: 'The send review screen opens.',
    screens: 'Same as recipient flagged. One of the user’s own addresses comes back flagged.',
    result: 'Nothing is signed. Set the locked flag; the lockout replaces the review screen.',
    today:
      'STX send forms don’t screen the own BTC address. Taproot and non-index-0 addresses are never screened.',
  },
  'send-review-screening': {
    title: 'Send review · screening',
    trigger: 'The send review screen opens.',
    screens: 'Every address in the transaction: own inputs and change, recipient.',
    result:
      'Amount and details render as usual; the footer action is a skeleton until the verdict comes back. Never sign without a verdict.',
  },
  'multisig-member-flagged': {
    title: 'Multisig · member flagged',
    trigger:
      'The first proposal from a multisig account (agreed with Rena: refuse at first proposal, not at creation).',
    screens:
      'Every member address, derived from the BTC wsh descriptor or the STX publicKeys, plus the transaction’s addresses.',
    result: 'Refusal callout; Propose becomes Close. Only this multisig account is affected.',
    code: [
      'features/multisig/use-propose-multisig-transaction.ts: single chokepoint for all proposal paths',
      'store/policy (PolicyStore): member keys',
    ],
    open: ['Mobile has no multisig yet (psbt-signer/signer.ts throws “Unimplemented”).'],
  },
  'send-review-no-answer': {
    title: 'Send review · no answer',
    trigger: 'The review screen check returns unavailable, or the request fails.',
    screens: 'Same as the other review states.',
    result:
      'Signing blocked. General error above the footer, “contact support” opens a mailto: to compliance@leather.io, Try again reruns the check. Never sign without a verdict.',
    today:
      'Fails open everywhere. 86 of 96 unavailable checks (Oct 3 – Nov 2) were network errors before reaching a provider.',
    code: ['compliance-checker.query.ts:43-56 and compliance-validators.ts: unavailable → true'],
    open: ['Auto-retry once in the app before showing the error?'],
  },
  'approval-screening': {
    title: 'dApp approval · screening and clean',
    trigger:
      'A dApp request window opens (PSBT, send transfer, Stacks transfer, contract call, deploy, sign transaction, swap).',
    screens:
      'Own addresses plus every party in the request. Today PSBT inputs are never screened, only outputs.',
    result: 'Skeleton actions while screening, then Cancel / Confirm as today.',
    code: [
      'features/psbt-signer/psbt-signer.tsx:97 · pages/rpc-send-transfer · pages/rpc-stx-*',
      'pages/swap/swap-container.tsx:36 (own BTC only today)',
    ],
    open: ['Message and structured-data signing are not screened today. In scope?'],
  },
  'approval-counterparty-flagged': {
    title: 'dApp approval · counterparty flagged',
    trigger: 'A dApp request window opens.',
    screens: 'Same as clean. Another party comes back flagged.',
    result: 'Refusal callout above the details; only Close. The app stays usable.',
    code: reviewCheck('rpc_*'),
  },
  'approval-no-answer': {
    title: 'dApp approval · no answer',
    trigger: 'A dApp request window opens and screening is unavailable.',
    screens: 'Same as clean.',
    result: 'Same general error as the send review. Cancel and Try again; nothing is signed.',
    code: reviewCheck('rpc_*'),
  },
  'approval-own-btc-flagged': {
    title: 'Stacks request · own BTC flagged',
    trigger:
      'A Stacks request (contract call shown) from an account whose Bitcoin address is flagged.',
    screens:
      'The account’s BTC address (already screened on every request today) and its STX address (txSenderAddress).',
    result: 'Set the locked flag and show the lockout. No raw error, no crash.',
    today:
      'Detection already works: the hook screens own BTC index 0 on every Stacks page, then throws errorCode 1398 into RouterErrorBoundary.',
    code: [
      ...reviewCheck('rpc_stx_call_contract'),
      'features/errors/app-error-boundary.tsx',
      'tests/specs/compliance-checks/compliance-checks.spec.ts:33-69 expects 1398 and fail-open; both change',
    ],
  },
  mobile: {
    title: 'Mobile',
    trigger:
      'Same model as the extension: background screening sets the locked flag; the send review and dApp approvals screen every address.',
    screens: 'Same as the extension.',
    result:
      'Built natively in apps/mobile. Lockout is full screen with the CTAs at the bottom; the refusal, screening and no-answer states live in the send sheet’s approver footer.',
    today:
      'Mobile only checks recipients while typing in the send form, memoized with p-memoize for the whole session, and fails open. No lockout, no review-screen check, no multisig.',
    code: [
      'apps/mobile/src/features/send/utils.ts:99-133 (addressComplianceValidator)',
      'Used by forms/btc/btc-form-schema.ts and forms/stx/stx-form-schema.ts',
      'Key backup: /settings/wallet/configure/[wallet]/view-secret-key',
    ],
    open: ['Mobile has no multisig yet (psbt-signer/signer.ts throws “Unimplemented”).'],
  },
};
