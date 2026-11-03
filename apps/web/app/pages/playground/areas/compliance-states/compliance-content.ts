// Copy and mock data for the compliance-states area. Copy follows the
// "Compliance gate: how it behaves" spec (v5, Nov 2), extension rows.
// Everything here is static: no screening calls, no stores.

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
  backupLink: 'Back up Wallet 1 Secret Key',
  backupNote: 'Shown only for wallets created in Leather',
};

export const disputeCopy = {
  title: 'Dispute this',
  calloutTitle: 'Destination TBD',
  calloutBody: 'Form, email or support link. Owner to be named by Rena.',
  fieldLabel: 'What should we know?',
  fieldPlaceholder: 'Tell us what happened…',
  submit: 'Send',
};

export const recipientRefusedCopy = {
  title: 'Leather can’t send this',
  body: 'The recipient address is restricted. Nothing was sent. Your wallet isn’t affected.',
};

export const counterpartyRefusedCopy = {
  title: 'Leather can’t sign this',
  body: 'This transaction involves a restricted address. Nothing was signed.',
};

export const screeningUnavailableCopy = {
  lead: 'Screening is currently unavailable, so this transaction can’t be signed. Nothing was sent. Try again in a moment or ',
  linkLabel: 'contact support',
  trail: '.',
};

const supportEmail = 'support@leather.io';
const supportSubject = 'Transaction couldn’t be screened';
const supportBody = [
  'Anything else we should know? (optional)',
  '',
  '— Filled in by Leather —',
  'App version: Leather 6.x.x (extension)',
  'Platform: Chrome · macOS',
  'Time: 2026-11-02 14:32 UTC',
  'Error: leather_api_network_error',
].join('\n');

export const supportMailto = `mailto:${supportEmail}?subject=${encodeURIComponent(supportSubject)}&body=${encodeURIComponent(supportBody)}`;

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

// How long the simulated screening takes before a verdict lands, and how
// long Home stays on screen before the mid-session background hit.
export const screeningDelayMs = 1600;
export const backgroundHitDelayMs = 3000;
