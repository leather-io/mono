// Copy deck for the compliance UI. Shared by the walkthrough demo (compliance-states)
// and the static handoff board (compliance-ui); the board renders every string here.

export const lockoutCopy = {
  title: 'Leather is locked',
  body: 'An address in one of your wallets is restricted, so Leather can’t show balances or make transactions.',
  whyCta: 'Why am I seeing this?',
  disputeCta: 'Dispute this',
};

export const whyLockedCopy = {
  title: 'Why Leather is locked',
  paragraphs: [
    'Leather checks wallet addresses against sanctions and risk data. One of yours matched, so we can’t provide service in this app.',
    'Your funds stay on the blockchain and remain under your control.',
  ],
  backupLink: (walletName: string) => `Back up ${walletName} Secret Key`,
  backupNote: 'Shown only for wallets created in Leather',
};

export const recipientRefusedCopy = {
  title: 'Leather can’t send this',
  body: 'The recipient address is restricted. Nothing was sent. Your wallet isn’t affected.',
};

export const keyBackupCopy = {
  passwordTitle: 'Back up your Secret Key',
  passwordBody: 'Enter your password to view Wallet 1’s Secret Key.',
  revealTitle: 'Wallet 1 Secret Key',
  revealBody: 'Never share it. Anyone with these words controls the funds.',
  revealCta: 'Click to reveal',
  doneCta: 'I’ve backed it up',
};

export const counterpartyRefusedCopy = {
  title: 'Leather can’t sign this',
  body: 'This transaction involves a restricted address. Nothing was signed.',
};

export const multisigRefusedCopy = {
  title: 'Leather can’t propose this',
  body: 'A member of this multisig account has a restricted address. Nothing was proposed. Your other accounts aren’t affected.',
};

// Footer actions that replace Confirm / Propose / Approve on the compliance states.
export const complianceActionCopy = {
  close: 'Close',
  cancel: 'Cancel',
  tryAgain: 'Try again',
};

export const unavailableCopy = {
  lead: 'This transaction can’t be completed right now. Please try again later, or ',
  linkLabel: 'contact support',
  trail: ' if the issue persists.',
};

export type MailKind = 'dispute' | 'support';

interface MailDraft {
  to: string;
  subject: string;
  body: string;
}

// Agreed with Rena (Nov 4): one compliance-owned inbox for both drafts, read by Gina, Mitchell and Rena.
export const complianceEmail = 'compliance@leather.io';

const diagnostics = [
  '— Filled in by Leather —',
  'App version: Leather 6.x.x (extension)',
  'Platform: Chrome · macOS',
  'Time: 2026-11-03 14:32 UTC',
];

export const mailDrafts: Record<MailKind, MailDraft> = {
  dispute: {
    to: complianceEmail,
    subject: 'Dispute: Leather account restricted',
    body: [
      'Hi Leather team,',
      '',
      'Leather says one of my addresses is restricted, and I think this is a mistake.',
      '',
      'Anything else we should know? (optional)',
      '',
      '',
      ...diagnostics,
      'Reference ID: LTR-7F3K-92QD',
    ].join('\n'),
  },
  support: {
    to: complianceEmail,
    subject: 'Transaction couldn’t be completed',
    body: [
      'Hi Leather team,',
      '',
      'A transaction couldn’t be completed. Anything else we should know? (optional)',
      '',
      '',
      ...diagnostics,
      'Error: leather_api_network_error',
      'Reference ID: LTR-4C8M-31HV',
    ].join('\n'),
  },
};

export function getMailto(kind: MailKind) {
  const draft = mailDrafts[kind];
  return `mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
}

export const onboardingCopy = {
  tagline: ['Buy. send.', 'swap. earn.', 'grow.'],
  subheader:
    'Leather is a wallet for Bitcoin and Stacks, designed for security, clarity, and growth. Join 100,000+ users on your favorite platform.',
  signInTitle: 'Sign in with your Secret Key',
  signInDescription: 'Speed things up by pasting your entire Secret Key in one go.',
  passwordTitle: 'Set a password',
  passwordDescription:
    'Your password protects your Secret Key on this device only. To access your wallet on another device, you’ll need just your Secret Key.',
};

export const mockSecretKey = [
  'ocean',
  'vivid',
  'rally',
  'timber',
  'glove',
  'canyon',
  'spirit',
  'lemon',
  'orbit',
  'humble',
  'piano',
  'marble',
];

export const mockAccount = {
  name: 'Account 1',
  walletLabel: 'Wallet 1 · Account 1',
  totalBalance: '$12,480.20',
};

export const mockTokens = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', fiat: '$8,210.00', amount: '0.0821 BTC' },
  { id: 'stx', name: 'Stacks', symbol: 'STX', fiat: '$4,270.20', amount: '4,812 STX' },
  { id: 'usdcx', name: 'USDCx', symbol: 'USDCx', fiat: '$0.00', amount: '0 USDCx' },
];

// One wallet of each kind, for the "Why Leather is locked" multi-wallet variant: one backup
// link per software wallet created in Leather, none for imported or Ledger wallets.
export const mockWallets = [
  { name: 'Wallet 1', origin: 'created' },
  { name: 'Wallet 2', origin: 'imported' },
  { name: 'Wallet 3', origin: 'created' },
  { name: 'Ledger', origin: 'ledger' },
] as const;

export function getBackupWalletNames(wallets: readonly { name: string; origin: string }[]) {
  return wallets.filter(wallet => wallet.origin === 'created').map(wallet => wallet.name);
}

export const mockSendForm = {
  amount: '0.05',
  symbol: 'BTC',
  fiat: '~ $3,284.00 USD',
  assetName: 'Bitcoin',
  recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx7m2k',
  available: '0.0821 BTC',
};

export const mockSendReview = {
  amount: '0.05',
  symbol: 'BTC',
  fiat: '$3,286.10',
  rows: [
    { label: 'From', value: 'Wallet 1 · Account 1' },
    { label: 'To', value: 'bc1q…7m2k', isAddress: true },
    { label: 'Fee', value: '0.00002 BTC' },
    { label: 'Total spend', value: '$3,286.10' },
  ],
};

export const mockDappRequest = {
  origin: 'https://dapp.example',
  intro:
    'Please review the recipient address, amount, and associated fees. Authorize only transactions you fully understand.',
  rows: [
    { label: 'From', value: 'Account 1' },
    { label: 'To', value: 'bc1q…4hd0', isAddress: true },
    { label: 'Amount', value: '1.2 BTC' },
    { label: 'Fee', value: '0.00004 BTC' },
    { label: 'Total spend', value: '$98,640.00' },
  ],
};

export const mockStacksRequest = {
  origin: 'https://dapp.example',
  intro:
    'Please review the contract call and associated fees. Authorize only transactions you fully understand.',
  rows: [
    { label: 'From', value: 'Account 1 · SP2J…9EJ7', isAddress: true },
    { label: 'Contract', value: 'SP3K…QF2.amm-swap-pool-v1-1', isAddress: true },
    { label: 'Function', value: 'swap-helper' },
    { label: 'Fee', value: '0.003 STX' },
  ],
};

export const mockMultisigReview = {
  amount: '0.2',
  symbol: 'BTC',
  fiat: '$13,144.40',
  rows: [
    { label: 'From', value: 'Treasury · 2-of-3 multisig' },
    { label: 'To', value: 'bc1q…7m2k', isAddress: true },
    { label: 'Fee', value: '0.00004 BTC' },
    { label: 'Total spend', value: '$13,147.03' },
  ],
};

export const screeningDelayMs = 1600;
