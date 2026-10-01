export type ApprovalIssueStatus = 'addressed' | 'partial' | 'decision' | 'not-yet' | 'out-of-scope';

type ApprovalIssueLink = 'initiative' | 'sub-issue' | 'unlinked';

interface ApprovalIssueAsk {
  ask: string;
  status: ApprovalIssueStatus;
}

interface ApprovalIssueEntry {
  number: number;
  title: string;
  short: string;
  link: ApprovalIssueLink;
  status: ApprovalIssueStatus;
  how: string;
  gap?: string;
  asks?: ApprovalIssueAsk[];
  screens: string[];
  decisions?: string[];
}

export interface ApprovalIssue extends ApprovalIssueEntry {
  url: string;
}

const githubIssuesUrl = 'https://github.com/leather-io/mono/issues/';

export function githubIssueUrl(number: number) {
  return `${githubIssuesUrl}${number}`;
}

export const issueStatusOrder: ApprovalIssueStatus[] = [
  'addressed',
  'partial',
  'decision',
  'not-yet',
  'out-of-scope',
];

export const issueStatusLabels: Record<ApprovalIssueStatus, string> = {
  addressed: 'Addressed',
  partial: 'Partial',
  decision: 'Decision',
  'not-yet': 'Not yet',
  'out-of-scope': 'Out of scope',
};

export const issueStatusDescriptions: Record<ApprovalIssueStatus, string> = {
  addressed: 'A screen shows the proposed behaviour for every approval-screen ask.',
  partial: 'Some asks have a screen; the rest are listed under Not shown.',
  decision: 'The ask is an open choice. The screens show what one answer looks like.',
  'not-yet': 'No screen or decision covers it yet.',
  'out-of-scope': 'No change to an approval screen. The linked screen is the nearest one.',
};

function toIssue(entry: ApprovalIssueEntry): ApprovalIssue {
  return { ...entry, url: githubIssueUrl(entry.number) };
}

export const initiativeIssue: ApprovalIssue = toIssue({
  number: 2741,
  title: 'Approval Flows Overhaul',
  short: 'Approval Flows Overhaul',
  link: 'initiative',
  status: 'addressed',
  how: 'Every screen here is built from one pattern, and every number on it is the one that gets signed.',
  asks: [
    { ask: 'Unify approval screens into one pattern', status: 'addressed' },
    { ask: 'Fix dishonest states', status: 'addressed' },
    { ask: 'De-alarm previews', status: 'addressed' },
    { ask: 'Pre-empt the Ledger blind-signing wall', status: 'addressed' },
  ],
  screens: [
    'contract-call-known',
    'state-insufficient',
    'contract-call-originator',
    'sign-transaction-app-fee',
    'ledger-preflight',
  ],
});

const issueEntries: ApprovalIssueEntry[] = [
  {
    number: 2587,
    title: 'Extension: Unify approval screens into one pattern + design polish',
    short: 'Unify approval screens into one pattern',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Every screen uses one shell: a shared header that always names the site and the network, a title Leather writes, what moves, then the fee and the buttons. Amounts are exact, and the fee shown is the one in the transaction that gets signed.',
    gap: 'Moving the extension’s three construction paths onto the pattern is engineering work; the playground shows the target.',
    asks: [
      { ask: 'One way to build an approval screen', status: 'addressed' },
      { ask: 'Shared header across all approval screens', status: 'addressed' },
      { ask: 'Always show the requesting domain', status: 'addressed' },
      { ask: 'Always show the network', status: 'addressed' },
      { ask: 'The fee displayed is the fee that gets signed', status: 'addressed' },
      { ask: 'Exact amounts, never rounded', status: 'addressed' },
    ],
    screens: [
      'transfer-stx-large',
      'contract-call-known',
      'sign-transaction-app-fee',
      'send-transfer-paying-from',
      'contract-call-multisig-propose',
      'sign-psbt-marketplace',
    ],
    decisions: ['network-label', 'verbs', 'account-placement', 'scope'],
  },
  {
    number: 2752,
    title: 'Active account and network handling',
    short: 'Active account and network handling',
    link: 'sub-issue',
    status: 'addressed',
    how: 'The screens write the rule down: a site signs with the account and network it connected with, switching in Leather never moves a site on its own, and an unknown network stops the request.',
    gap: 'The handshake itself, stx_getNetworks and the change events, is engineering work in #2807.',
    screens: [
      'connect-reconnect',
      'sign-mismatch',
      'network-unknown',
      'connect-network-optin',
      'sip030-account-change',
      'sip030-network-change',
    ],
    decisions: [
      'switching',
      'repeat-connect',
      'account-events',
      'network-switch-request',
      'address-mismatch',
    ],
  },
  {
    number: 2753,
    title: 'Sign in with Stacks',
    short: 'Sign in with Stacks',
    link: 'sub-issue',
    status: 'partial',
    how: 'The sign-in screen reads a sign-in message as rows, checks its domain and network against the site asking, and shows a human date. Whether sign-in joins the Connect screen is an open decision.',
    gap: 'The Sign in with Stacks message format isn’t settled, so the screen uses today’s sign-in text.',
    screens: ['message-sign-in'],
    decisions: ['sign-in-with-stacks'],
  },
  {
    number: 2754,
    title: 'Mobile connection path',
    short: 'Mobile connection path',
    link: 'sub-issue',
    status: 'partial',
    how: 'A site open in a normal mobile browser connects through WalletConnect, and Leather mobile shows the Connect screen with the session’s transport, its end date and how to end it.',
    gap: 'The Install prompt is drawn by the connect library on the site, not by Leather (#2594).',
    asks: [
      { ask: 'Mobile assumes the Leather app, store only as fallback', status: 'out-of-scope' },
      { ask: 'WalletConnect on extension and mobile', status: 'addressed' },
    ],
    screens: ['connect-walletconnect'],
  },
  {
    number: 2671,
    title: 'Design: connect approval quality basics',
    short: 'Connect approval quality basics',
    link: 'sub-issue',
    status: 'partial',
    how: 'Connect is one white surface that names the network and the account being connected, and a site asking for another network connects on it without moving Leather, with switching Leather as an opt-in.',
    gap: 'The network opt-in is drawn on Connect, not on message signing. Where sharper app icons come from is an engineering call.',
    asks: [
      { ask: 'One clean surface, no grey bands', status: 'addressed' },
      { ask: 'Always show the network', status: 'addressed' },
      { ask: 'Always show the account being connected', status: 'addressed' },
      { ask: 'High-resolution app icon', status: 'partial' },
      { ask: 'Network switch opt-in on connect', status: 'addressed' },
      { ask: 'Network switch opt-in on message signing', status: 'not-yet' },
    ],
    screens: ['connect-first', 'connect-network-optin', 'message-sign-in'],
  },
  {
    number: 2700,
    title: 'Extension: contract-call previews are faithful but alarming',
    short: 'Contract-call previews are faithful but alarming',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Leather writes the headline from the decoded call, post conditions read as limits that protect you, and known contracts get a plain name from a Leather-owned list, with the function name as the fallback.',
    asks: [
      { ask: 'Frame post conditions as protection', status: 'addressed' },
      { ask: 'Lead with a plain-language summary', status: 'addressed' },
      { ask: 'A curated list of known contracts', status: 'decision' },
    ],
    screens: [
      'contract-call-known',
      'contract-call-unknown',
      'contract-call-originator',
      'source-contract-confirmed',
      'contract-call-details-tray',
    ],
    decisions: ['registry', 'post-condition-modes'],
  },
  {
    number: 2699,
    title: 'Extension: pre-empt the Ledger blind-signing wall on Stacks contract calls',
    short: 'Pre-empt the Ledger blind-signing wall',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Before you press Sign, one line says the Ledger will ask for blind signing and warn you, and that the limits shown still apply on-chain. The device step and a device rejection stay inside the approval.',
    gap: 'Predicting the prompt needs a check that doesn’t exist yet. The line goes once the Ledger app fix ships.',
    asks: [
      { ask: 'A pre-signing notice that the device warning is expected', status: 'addressed' },
      { ask: 'Reassure with what Leather decoded', status: 'addressed' },
      { ask: 'A static note if the prompt can’t be predicted', status: 'decision' },
      { ask: 'Remove the notice once the fix ships', status: 'out-of-scope' },
    ],
    screens: [
      'ledger-preflight',
      'ledger-btc-preflight',
      'ledger-device',
      'ledger-rejected-payload',
      'vault-ledger-hash',
    ],
    decisions: ['ledger-preflight'],
  },
  {
    number: 2738,
    title: 'Design: show which addresses a Bitcoin transaction spends from',
    short: 'Show which addresses a Bitcoin send spends from',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Paying from lists each address the send spends from, by type and amount, and the Taproot row carries its own warning before Approve. Edit sources lets you pay from Native SegWit only.',
    gap: 'Mobile uses the same shell and isn’t drawn separately. Per-coin collectible detection is a follow-up.',
    asks: [
      { ask: 'One row per address spent from', status: 'addressed' },
      { ask: 'Label each row Taproot or Native SegWit', status: 'addressed' },
      { ask: 'The amount spent from each address', status: 'addressed' },
      { ask: 'The warning on the Taproot row itself', status: 'addressed' },
      { ask: 'Correct the account card balance', status: 'addressed' },
      { ask: 'Track acceptance as well as display', status: 'addressed' },
      { ask: 'Whether signPsbt adopts the pattern', status: 'decision' },
    ],
    screens: [
      'send-transfer-taproot',
      'send-transfer-segwit-only',
      'send-transfer-edit-sources',
      'send-transfer-paying-from',
      'sign-psbt-marketplace',
      'ledger-btc-preflight',
    ],
    decisions: ['spend-source'],
  },
  {
    number: 2326,
    title: 'Better post conditions security message',
    short: 'Better post conditions security message',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Each mode opens its line with a plain name, Strict, Your account only or Unrestricted, and the sentence changes with what is listed. Strict always gets a quiet line rather than a callout.',
    gap: 'Unrestricted with nothing listed isn’t drawn; it follows the same pattern.',
    asks: [
      { ask: 'Originator copy that branches on listed post conditions', status: 'addressed' },
      { ask: 'The same treatment for deny and allow', status: 'addressed' },
      { ask: 'Whether deny gets a callout', status: 'decision' },
    ],
    screens: [
      'contract-call-originator',
      'contract-call-allow',
      'contract-call-known',
      'stake-unstake',
      'deploy-contract',
    ],
    decisions: ['post-condition-modes'],
  },
  {
    number: 2624,
    title: 'stx_transferSip10Ft popup prices token base units as STX in total spend',
    short: 'SIP-10 transfer prices token units as STX',
    link: 'sub-issue',
    status: 'addressed',
    how: 'The token is priced as itself and the STX fee sits on its own line in the total, never converted into each other. The balance check compares like with like, in the asset being spent.',
    screens: ['transfer-sip10', 'state-insufficient', 'state-price-unavailable'],
    decisions: ['fiat-display'],
  },
  {
    number: 2659,
    title: 'Approval UI: originator post-condition mode is indistinguishable from deny',
    short: 'Originator mode reads like deny',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Originator mode gets its own badge, Your account only, and says what the contract may still move. A dry run warns when a strict call would fail on-chain.',
    screens: ['contract-call-originator', 'stake-unstake', 'contract-call-likely-fail'],
    decisions: ['post-condition-modes', 'simulation'],
  },
  {
    number: 2708,
    title:
      'Connect popup ignores the origin’s existing account grant, and Stacks methods ignore the `address` param',
    short: 'Connect ignores the existing grant and address param',
    link: 'sub-issue',
    status: 'addressed',
    how: 'Reconnect preselects the account the site is connected with, and signing always uses that account with a quiet line when Leather is set to another. A request naming another account is rejected with the standard mismatch error.',
    gap: 'Checking how the address param routes today, and the docs, are engineering work.',
    asks: [
      { ask: 'Connect preselects the site’s existing grant', status: 'addressed' },
      { ask: 'Verify whether address routes the Stacks methods', status: 'out-of-scope' },
      { ask: 'Honour address or return -32001', status: 'decision' },
      { ask: 'Document address on the Stacks method pages', status: 'out-of-scope' },
    ],
    screens: ['connect-reconnect', 'sign-mismatch', 'connect-first', 'sip030-account-change'],
    decisions: ['repeat-connect', 'address-mismatch', 'switching'],
  },
  {
    number: 2737,
    title: 'fix unexpected "embedded app" warning (likely cause chrome prerendering)',
    short: 'Unexpected embedded app warning',
    link: 'sub-issue',
    status: 'partial',
    how: 'The embedded caution shows only when a frame check confirms another site, naming both. When Leather can’t tell, the proposal keeps the normal header instead of warning.',
    gap: 'The false warning itself is a detection fix for engineering.',
    screens: ['state-embedded'],
    decisions: ['embedded-unknown'],
  },
  {
    number: 2807,
    title: 'SIP-030: stx_getNetworks, stx_accountChange, stx_networkChange',
    short: 'stx_getNetworks and the change events',
    link: 'unlinked',
    status: 'addressed',
    how: 'A switch in Leather opens a sheet that says which connected sites move and are told; each is off by default. A site asking to change network moves only its own connection.',
    gap: 'The stx_getNetworks handler, the listen method and the schema types are engineering work.',
    asks: [
      { ask: 'Handler for stx_getNetworks', status: 'out-of-scope' },
      { ask: 'Emit stx_accountChange and stx_networkChange', status: 'addressed' },
      { ask: 'Fix the stx_getNetworks schema types', status: 'out-of-scope' },
    ],
    screens: ['sip030-account-change', 'sip030-network-change', 'connect-reconnect'],
    decisions: ['account-events', 'network-switch-request'],
  },
  {
    number: 2808,
    title: 'SIP-030: stx_getAccounts and stx_updateProfile, implement or drop?',
    short: 'stx_getAccounts and stx_updateProfile',
    link: 'unlinked',
    status: 'decision',
    how: 'Both screens show what implementing would take: a storage key named on its own connect screen, and profile changes listed against what is there now. Keeping or dropping them is the open choice.',
    screens: ['sip030-get-accounts', 'sip030-update-profile'],
    decisions: ['gaia-methods', 'app-storage-key'],
  },
  {
    number: 2595,
    title: 'Add walletconnect integration to extension and mobile',
    short: 'WalletConnect in extension and mobile',
    link: 'unlinked',
    status: 'partial',
    how: 'The WalletConnect connect screen says the request comes through a relay, which chains it covers, and when the session ends.',
    gap: 'Pairing, the list of sessions and ending a session aren’t drawn.',
    screens: ['connect-walletconnect'],
  },
  {
    number: 2806,
    title: 'SIP-030 stx_getAddresses returns different shapes on extension and mobile',
    short: 'stx_getAddresses shapes differ',
    link: 'unlinked',
    status: 'out-of-scope',
    how: 'The response shape a site gets back. Nothing changes on the Connect screen that answers it.',
    screens: ['connect-first'],
  },
  {
    number: 2594,
    title: 'Improve support for connecting Leather from normal browser on mobile',
    short: 'Connect from a normal mobile browser',
    link: 'unlinked',
    status: 'out-of-scope',
    how: 'The Open in Leather prompt is drawn by the connect library on the site, and the link opens the site in Leather’s own browser, where the normal Connect screen runs unchanged.',
    screens: ['connect-first', 'connect-walletconnect'],
  },
  {
    number: 2442,
    title: 'Reown interoperability',
    short: 'Reown interoperability',
    link: 'unlinked',
    status: 'out-of-scope',
    how: 'No approval-screen ask yet. If Reown sessions land, they use the WalletConnect connect screen.',
    screens: ['connect-walletconnect'],
  },
];

export const approvalIssues: ApprovalIssue[] = issueEntries.map(toIssue);
