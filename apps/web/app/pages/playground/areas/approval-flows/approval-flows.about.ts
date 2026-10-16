interface AboutLink {
  label: string;
  url: string;
}

interface AboutSection {
  id: string;
  label: string;
}

export const aboutSections: AboutSection[] = [
  { id: 'in-short', label: 'In short' },
  { id: 'problem', label: 'The problem' },
  { id: 'pattern', label: 'The pattern' },
  { id: 'rules', label: 'The rules' },
  { id: 'principles', label: 'Principles' },
  { id: 'others', label: 'What others do' },
  { id: 'directions', label: 'Directions' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'issues', label: 'Issues' },
  { id: 'measurement', label: 'Measurement' },
  { id: 'roll-out', label: 'Roll-out' },
  { id: 'open-questions', label: 'Open questions' },
  { id: 'sources', label: 'Sources' },
];

export function aboutAnchorId(sectionId: string) {
  return `about-${sectionId}`;
}

export function principleAnchorId(principleId: string) {
  return `about-principle-${principleId}`;
}

export const aboutIntro = {
  eyebrow: 'Approval Flows Overhaul · design proposal',
  title: 'One approval pattern',
  lede: 'Every request a site can send to Leather, answered in the same order on the same surface: who is asking, as which account and on which network, what it does, what moves, what to watch, the details, and how to decide.',
};

export const aboutInShort: string[] = [
  'One shell with seven zones replaces today’s four ways of building an approval.',
  'The header has one job: the site and the network on one line, quiet on Mainnet and amber anywhere else. A second line appears only for exceptions.',
  'The title is a sentence Leather writes from the decoded request, amount included. Never the site’s own words.',
  'What moves is said as a guarantee. Post conditions become limits, with the mode as the first word: Strict, Your account only or Unrestricted.',
  'You choose an account only when connecting. Every signing request uses the connected account, read-only, on a network that is named on every screen.',
  'Every state keeps the frame and a way out: loading keeps its layout, Cancel never disappears, errors are screens, and each request ends with a result that matches what happened.',
];

export const aboutAsks: string[] = [
  'A call on the open decisions. The first six shape every screen.',
  'Whether send and swap review inside Leather use the same shell, after the site requests.',
  'Engineering answers to the open questions at the end of this page.',
];

export const aboutAgreed: string[] = [
  'One construction path: rules first, then specific cases. No rebuild.',
  'The connected account and network answer every request. The wallet’s active selection is no longer a fallback.',
  'An unknown network is an error, never a quiet fallback to another one.',
  'When the wallet is set to a different account or network than the site, that’s a quiet note. Leather never switches on its own.',
  'Reconnecting preselects the connected account.',
  'Always the full domain and the network, exact amounts, and the fee that actually gets signed.',
];

export const aboutHowToUse: string[] = [
  'Screens shows every screen as a thumbnail, in the direction you pick. Compare puts every direction side by side.',
  'Viewer shows one screen big, with today’s capture where one exists, its notes, the decisions it carries and the events it sends.',
  'Options switch the open layout calls, such as title type and where the account sits, across every frame at once.',
];

export const aboutBuiltInCode =
  'Everything here renders with the real @leather.io/ui components, fonts and tokens at the popup’s real size, so an approved piece can move into the design system unchanged.';

interface AboutFact {
  figure: string;
  label: string;
  detail: string;
}

export const aboutProblemLede =
  'Approvals are the moment a person decides whether money leaves their wallet. Today each kind of request is built a different way, and each gets a different set of facts right.';

export const aboutProblemFacts: AboutFact[] = [
  {
    figure: '4 → 1',
    label: 'ways an approval gets built',
    detail:
      'The six Stacks transactions share a layout. Send transfer and connect assemble the same parts by hand, add account uses a bare shell, and PSBT and message signing still sit on an older header.',
  },
  {
    figure: '0',
    label: 'transaction screens that name the network',
    detail:
      'Only the message screens say which network they use, and the structured message screen can show three sources that disagree. A request can set its popup’s network without saying so.',
  },
  {
    figure: '7 / 7',
    label: 'request types that can, or can’t, switch account',
    detail:
      'Connect, add account, message signing and PSBT signing offer a switcher; the Stacks transactions and send transfer don’t. A switch inside a popup changes the whole wallet, and the site is never told.',
  },
  {
    figure: '3',
    label: 'ways the fee is handled',
    detail:
      'Wallet-built transactions show the fee they sign. A transaction the app built has its fee and nonce replaced by Leather’s estimate, and the vault version hides both while the total prints an estimate.',
  },
];

export const aboutProblemReadsWrong: string[] = [
  '1,234,999 STX reads as “1.23M STX”.',
  'Your account only mode reads exactly like Strict, and Unrestricted replaces the post condition list with a warning.',
  'Token totals price base units as if they were STX.',
  'When a contract can’t be decoded, its arguments disappear but Approve stays enabled.',
  'Not enough balance removes Cancel, so the only way out is closing the window.',
  'The first window of a vault proposal shows 64 hex characters in a generic Sign message screen.',
  'The popup is blank while fees load, and some failures land on an error page with a stack trace.',
];

export const aboutProblemTrace =
  'Traced end to end, a single bond enrollment opens five Leather windows, three of them Connect, because every address request opens a full screen. One of them opens by itself minutes later.';

export const aboutTodayScreens: string[] = [
  'contract-call-known',
  'contract-call-allow',
  'transfer-stx-large',
  'state-insufficient',
  'message-stacks-structured',
  'connect-first',
];

interface AboutZone {
  number: number;
  title: string;
  rule: string;
}

export const aboutAnatomyScenario = 'contract-call-known';

export const aboutZones: AboutZone[] = [
  {
    number: 1,
    title: 'Who is asking',
    rule: 'The origin as it is: host and port, the scheme when it isn’t https, and the embedding site when the request comes from a frame. Never the name a site gives itself.',
  },
  {
    number: 2,
    title: 'Where, and as whom',
    rule: 'The network on the header line, quiet on Mainnet. The signing account in a With account block after what moves, read-only. Each account shows its own icon, a vault shows the vault icon, and Ledger accounts carry a badge.',
  },
  {
    number: 3,
    title: 'What this does',
    rule: 'One sentence written by Leather from the decoded request, amount included, with a kind line underneath that names the request type.',
  },
  {
    number: 4,
    title: 'What moves',
    rule: 'Exact amounts with direction, USD second. The recipient under an arrow, lined up with the amount. A guarantee line that starts with its mode. Never below the fold.',
  },
  {
    number: 5,
    title: 'Cautions',
    rule: 'At most one callout, only for what can’t be undone or couldn’t be checked, naming the check that raised it. Everything else is a quiet note.',
  },
  {
    number: 6,
    title: 'Details',
    rule: 'Folded to one line with the fee, and Leather remembers whether you left it open. Fee source, contract and function inside; arguments, nonce and the raw transaction one tap away in a tray.',
  },
  {
    number: 7,
    title: 'Footer',
    rule: 'The total for anything that spends. Cancel always. The verb on the primary button, and when it’s disabled, the reason.',
  },
];

export const aboutAnatomyNote =
  'The order follows what matters most: who is asking, what leaves the wallet, what else it allows, and what can’t be undone or checked. Markers follow the frame, so switching direction or options above moves them too.';

interface AboutRuleGroup {
  id: string;
  title: string;
  points: string[];
  screens: string[];
}

export const aboutRuleGroups: AboutRuleGroup[] = [
  {
    id: 'who-asks',
    title: 'Who asks',
    points: [
      'The registered domain stays in full weight; anything in front of it is cut from the left.',
      'Text the site wrote is marked as the site’s, never mixed into Leather’s sentence.',
      'Checks on the site and contract collapse when all is clear and open when something needs a look.',
    ],
    screens: ['source-long-subdomain', 'source-connect-new', 'source-contract-confirmed'],
  },
  {
    id: 'what-moves',
    title: 'What moves, as limits',
    points: [
      'Exact amounts, never rounded to thousands or millions.',
      'What you send, an arrow down, then who receives it.',
      'Locking is kept apart from spending, so staking says You lock, not You send.',
    ],
    screens: ['transfer-stx-large', 'contract-call-staking', 'send-transfer-multi'],
  },
  {
    id: 'details',
    title: 'Details',
    points: [
      'The fee says where it came from: Leather’s estimate, Set by app, or read from the transaction.',
      'Nothing that must be seen before approving hides in details.',
      'The tray opens over the review, so the site and the title stay in view.',
    ],
    screens: ['sign-transaction-app-fee', 'contract-call-details-tray', 'sign-psbt-details-tray'],
  },
  {
    id: 'footer',
    title: 'Footer and decision',
    points: [
      'Cancel plus the verb: Send, Approve, Sign, Connect, Deploy, Propose.',
      'The primary ignores clicks for a moment after it appears, and Enter never approves.',
      'One quiet line says whether the approval can be undone.',
      'Extra steps only where the risk is: hold for Unrestricted, a switch that names the fact for cautions, retype for lookalike addresses.',
    ],
    screens: ['contract-call-allow', 'source-recipient-lookalike', 'deploy-contract'],
  },
  {
    id: 'states',
    title: 'States',
    points: [
      'Loading keeps the frame with skeletons, never a blank window.',
      'Errors are screens that keep Cancel and say what to do.',
      'Leather warns before the Ledger does, in the device’s order.',
      'Each request ends with a result: sent, signed, proposed or failed.',
    ],
    screens: [
      'state-loading',
      'state-cant-decode',
      'ledger-preflight',
      'result-signed-not-broadcast',
    ],
  },
];

interface AboutGuaranteeMode {
  label: string;
  meaning: string;
  screen: string;
}

export const aboutGuaranteeModes: AboutGuaranteeMode[] = [
  {
    label: 'Strict',
    meaning: 'Only what’s listed can leave your account. The chain refuses anything else.',
    screen: 'contract-call-known',
  },
  {
    label: 'Your account only',
    meaning: 'Limits cover what leaves your account. Nothing limits what arrives.',
    screen: 'contract-call-originator',
  },
  {
    label: 'Unrestricted',
    meaning: 'The call can move more than the list. The list stays, under one caution.',
    screen: 'contract-call-allow',
  },
  {
    label: 'Outputs final',
    meaning: 'Your signature fixes every Bitcoin output. Nothing can be added later.',
    screen: 'sign-psbt-marketplace',
  },
  {
    label: 'Outputs can change',
    meaning: 'The signature leaves outputs open, so someone else can finish it.',
    screen: 'sign-psbt-sighash-none',
  },
  {
    label: 'Staking action',
    meaning: 'The call must, or may, change your staking, even though no asset moves.',
    screen: 'stake-unstake',
  },
  {
    label: 'Estimate',
    meaning: 'A dry run’s guess, marked ≈ with its source. Never counted in the total.',
    screen: 'contract-call-estimated',
  },
];

interface AboutAccountMoment {
  moment: string;
  today: string;
  proposed: string;
  screen: string;
}

export const aboutAccountMoments: AboutAccountMoment[] = [
  {
    moment: 'First connect',
    today: 'Opens on the wallet’s active account. Picking another switches the whole wallet.',
    proposed:
      'The one place to choose. The button names the account, and choosing doesn’t move the wallet’s own active account.',
    screen: 'connect-first',
  },
  {
    moment: 'Connect again, same site',
    today: 'Ignores the existing connection and quietly re-points the site on confirm.',
    proposed:
      'Preselects the connected account, labelled Connected, with one quiet line when the wallet is set elsewhere.',
    screen: 'connect-reconnect',
  },
  {
    moment: 'Any signing request',
    today: 'Seven request types offer a switcher, seven don’t.',
    proposed: 'Always the connected account, read-only. The site built the request for it.',
    screen: 'sign-mismatch',
  },
  {
    moment: 'Request names another account',
    today: 'Stacks requests ignore it; Bitcoin requests follow the index and drop a vault.',
    proposed: 'Reject with the standard address mismatch error. Never a quiet swap.',
    screen: 'sign-mismatch',
  },
  {
    moment: 'Vault connected, method isn’t vault-aware',
    today: 'The personal key signs without saying so.',
    proposed: 'Refuse and say why. Leather’s own vault proposals are the one exception.',
    screen: 'vault-method-refused',
  },
  {
    moment: 'Network',
    today: 'A request can set the popup’s network quietly; unknown names fall back.',
    proposed:
      'The connected network, named everywhere. Unknown is an error screen, a mismatch is a note, and switching Leather’s own network is an opt-in on connect.',
    screen: 'network-unknown',
  },
];

interface AboutPrinciple {
  id: string;
  title: string;
  why: string;
  sources: AboutLink[];
  screens: string[];
  sectionId?: string;
}

const erc7730: AboutLink = {
  label: 'ERC-7730 clear signing',
  url: 'https://eips.ethereum.org/EIPS/eip-7730',
};

const intentStudy: AboutLink = {
  label: 'Plain-language intent study (2026)',
  url: 'https://arxiv.org/html/2601.16751',
};

const chromiumUrlDisplay: AboutLink = {
  label: 'Chromium URL display guidelines',
  url: 'https://chromium.googlesource.com/chromium/src/+/main/docs/security/url_display_guidelines/url_display_guidelines.md',
};

const walletConnectVerify: AboutLink = {
  label: 'WalletConnect Verify',
  url: 'https://specs.walletconnect.com/2.0/specs/clients/core/verify',
};

const rabbyConnect: AboutLink = {
  label: 'Rabby connect rules',
  url: 'https://github.com/RabbyHub/rabby-security-engine/blob/master/src/rules/connect.ts',
};

const metamaskSimulations: AboutLink = {
  label: 'MetaMask transaction simulations',
  url: 'https://support.metamask.io/manage-crypto/transactions/simulations',
};

const sip045: AboutLink = {
  label: 'SIP-045, PoX-5 Bitcoin staking',
  url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-045/sip-045-pox-5-bitcoin-staking.md',
};

const sip030: AboutLink = {
  label: 'SIP-030, wallet interface',
  url: 'https://github.com/stacksgov/sips/blob/main/sips/sip-030/sip-030-wallet-interface.md',
};

const bravoLillo: AboutLink = {
  label: 'Bravo-Lillo et al., SOUPS 2013',
  url: 'https://cups.cs.cmu.edu/soups/2013/proceedings/a6_Bravo-Lillo.pdf',
};

const egelman: AboutLink = {
  label: 'Egelman et al., active vs passive warnings, CHI 2008',
  url: 'https://dl.acm.org/doi/10.1145/1357054.1357219',
};

const spenderStudy: AboutLink = {
  label: 'Spender warning study (2026)',
  url: 'https://eprint.iacr.org/2026/1310.pdf',
};

const anderson: AboutLink = {
  label: 'Anderson et al., warning habituation, CHI 2015',
  url: 'https://dl.acm.org/doi/10.1145/2702123.2702322',
};

const chromeLock: AboutLink = {
  label: 'Chrome, an update on the lock icon',
  url: 'https://blog.chromium.org/2023/05/an-update-on-lock-icon.html',
};

const chromiumInputDelay: AboutLink = {
  label: 'Chromium, input delay on prompts',
  url: 'https://issues.chromium.org/issues/40067456',
};

const doubleClickjacking: AboutLink = {
  label: 'DoubleClickjacking',
  url: 'https://www.evil.blog/2024/12/doubleclickjacking-what.html',
};

const ariaDialog: AboutLink = {
  label: 'WAI-ARIA modal dialog pattern',
  url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
};

const toctou: AboutLink = {
  label: 'Simulation evasion between check and sign (2026)',
  url: 'https://arxiv.org/html/2607.28747v1',
};

const wcagTiming: AboutLink = {
  label: 'WCAG 2.2.1 Timing adjustable',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html',
};

const ledgerGuidelines: AboutLink = {
  label: 'Ledger transaction design guidelines',
  url: 'https://developers.ledger.com/docs/device-app/integration/design-guidelines/transactions',
};

const safeVerify: AboutLink = {
  label: 'Safe, how to verify transactions',
  url: 'https://hackmd.io/@safe/verify-transactions',
};

const coldcard: AboutLink = {
  label: 'COLDCARD, ready to sign',
  url: 'https://coldcard.com/docs/ready-to-sign/',
};

const wcagErrorPrevention: AboutLink = {
  label: 'WCAG 3.3.4 Error prevention',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html',
};

const wcagStatus: AboutLink = {
  label: 'WCAG 4.1.3 Status messages',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
};

const securePaymentConfirmation: AboutLink = {
  label: 'W3C Secure Payment Confirmation',
  url: 'https://www.w3.org/TR/secure-payment-confirmation/',
};

const applePay: AboutLink = {
  label: 'Apple Pay, Human Interface Guidelines',
  url: 'https://developer.apple.com/design/human-interface-guidelines/apple-pay',
};

const akhawe: AboutLink = {
  label: 'Akhawe and Felt, USENIX Security 2013',
  url: 'https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe',
};

const felt: AboutLink = {
  label: 'Felt et al., CHI 2015',
  url: 'https://research.google/pubs/pub43265/',
};

const metamaskAlerts: AboutLink = {
  label: 'MetaMask security alerts',
  url: 'https://support.metamask.io/privacy-and-security/how-to-turn-on-security-alerts/',
};

const phantomSecurity: AboutLink = {
  label: 'Security at Phantom',
  url: 'https://phantom.com/learn/blog/security-at-phantom',
};

const eip5792: AboutLink = {
  label: 'EIP-5792 wallet call batches',
  url: 'https://eips.ethereum.org/EIPS/eip-5792',
};

const safeNonce: AboutLink = {
  label: 'Safe, transaction queue and nonces',
  url: 'https://help.safe.global/en/articles/40839',
};

const rabbySwap: AboutLink = {
  label: 'Rabby swap rules',
  url: 'https://github.com/RabbyHub/rabby-security-engine/blob/master/src/rules/swap.ts',
};

const rabbyCrossToken: AboutLink = {
  label: 'Rabby cross-chain rules',
  url: 'https://github.com/RabbyHub/rabby-security-engine/blob/master/src/rules/crossToken.ts',
};

const sip045Amendment: AboutLink = {
  label: 'SIP-045 open amendment',
  url: 'https://github.com/stacksgov/sips/pull/279',
};

const stxer: AboutLink = {
  label: 'stxer SDK',
  url: 'https://github.com/stxer/stxer-sdk',
};

const w3cBidi: AboutLink = {
  label: 'W3C inline bidi markup',
  url: 'https://www.w3.org/International/articles/inline-bidi-markup/',
};

const wiseSend: AboutLink = {
  label: 'Wise, send money',
  url: 'https://wise.com/us/send-money/',
};

const familyValues: AboutLink = {
  label: 'Family values',
  url: 'https://benji.org/family-values',
};

const familyShots: AboutLink = {
  label: 'Family on 60fps.design',
  url: 'https://60fps.design/apps/family',
};

export const aboutPrinciples: AboutPrinciple[] = [
  {
    id: 'leather-writes',
    title: 'Leather writes the sentence, never the site',
    why: 'A site can put anything in its own text, and a faithful but unreadable preview makes a correct request look wrong. The title is Leather’s reading of the decoded request, with the function name as the honest fallback.',
    sources: [erc7730, intentStudy],
    screens: ['contract-call-known', 'contract-call-unknown', 'message-sign-in'],
  },
  {
    id: 'real-origin',
    title: 'Show who is really asking',
    why: 'The registered domain is the one part of an address a scammer can’t copy, so it stays in full and anything in front of it is cut from the left. A site’s own name never stands in for its address.',
    sources: [chromiumUrlDisplay, walletConnectVerify, rabbyConnect],
    screens: [
      'source-long-subdomain',
      'source-connect-new',
      'source-contract-lookalike',
      'state-embedded',
    ],
  },
  {
    id: 'guarantee',
    title: 'Promise only what the chain enforces',
    why: 'Post conditions are enforced on chain, so they read as limits with the mode first. A dry run is a guess about one moment, so it gets ≈, an Estimate tag and its source, and never counts toward the total.',
    sources: [metamaskSimulations, sip045],
    screens: [
      'contract-call-known',
      'contract-call-originator',
      'contract-call-allow',
      'contract-call-estimated',
    ],
  },
  {
    id: 'friction',
    title: 'Friction in proportion to risk, aimed at the risky part',
    why: 'People click through warnings they only have to read. A hold, a switch that names the fact, or typing the middle of an address works because it’s rare and points at the one thing to check.',
    sources: [bravoLillo, egelman, spenderStudy],
    screens: [
      'contract-call-allow',
      'source-recipient-lookalike',
      'send-transfer-high-fee',
      'swap-high-slippage',
    ],
  },
  {
    id: 'scarce-warnings',
    title: 'Keep warnings rare, so the loud one still means something',
    why: 'Three levels, a quiet note, one caution, a blocking state, each naming the check that raised it. No positive safety icons: an all-clear badge teaches people to look for the badge instead of reading.',
    sources: [anderson, chromeLock],
    screens: [
      'source-contract-confirmed',
      'source-site-flagged',
      'state-cant-decode',
      'sign-mismatch',
    ],
  },
  {
    id: 'no-accidental-press',
    title: 'The first press is never an accident',
    why: 'A site can open the popup under a click meant for the page. The primary ignores clicks for about 600ms after it appears or a fact changes, and after any opening motion ends. Enter never approves.',
    sources: [chromiumInputDelay, doubleClickjacking, ariaDialog],
    screens: ['transfer-stx-large', 'queue-multiple-requests'],
  },
  {
    id: 'fresh-facts',
    title: 'Facts stay fresh, and requests can’t pile up',
    why: 'Prices and dry runs age, so screens say when they were checked and update when something changes. Requests share one window, expire, and a site that keeps asking after a cancel can be blocked for an hour.',
    sources: [toctou, wcagTiming],
    screens: [
      'state-refreshed',
      'state-request-expired',
      'queue-multiple-requests',
      'queue-repeat-after-reject',
    ],
  },
  {
    id: 'hardware',
    title: 'Rehearse the device before it speaks',
    why: 'Ledger warnings arrive with no word from the wallet and look like something broke. Leather can predict them from the unsigned transaction, so it lists them first in the device’s order.',
    sources: [ledgerGuidelines, safeVerify, coldcard],
    screens: ['ledger-preflight', 'ledger-btc-preflight', 'ledger-device', 'vault-ledger-hash'],
  },
  {
    id: 'way-out',
    title: 'Every state keeps the frame and a way out',
    why: 'Loading keeps the layout, Cancel never disappears, errors are screens, and each approval ends with a result that says what actually happened, including whether it can be undone.',
    sources: [wcagErrorPrevention, wcagStatus],
    screens: ['state-loading', 'state-insufficient', 'result-signed-not-broadcast', 'result-sent'],
  },
  {
    id: 'exact-numbers',
    title: 'Exact numbers; USD is a conversion at a moment',
    why: 'What is shown is what is signed: amounts in full, the fee that gets signed, and a USD value with one “Priced 1 min ago” line instead of pretending to be exact.',
    sources: [erc7730, securePaymentConfirmation],
    screens: ['transfer-stx-large', 'sign-transaction-app-fee', 'state-price-unavailable'],
  },
  {
    id: 'one-account',
    title: 'One account per site, on a network named everywhere',
    why: 'Choosing happens once, when connecting. Every signing request uses the connected account, read-only, so a signature never comes from an account the site never saw.',
    sources: [sip030, applePay],
    screens: ['connect-first', 'connect-reconnect', 'sign-mismatch', 'network-unknown'],
  },
  {
    id: 'measure',
    title: 'Measure whether the screens work',
    why: 'Six events say whether people read, whether cautions change what they do, and what happened after, without carrying an address, amount or site.',
    sources: [akhawe, felt],
    screens: [],
    sectionId: 'measurement',
  },
];

export interface AboutComparison {
  title: string;
  detail: string;
  screens: string[];
}

export const aboutBorrowed: AboutComparison[] = [
  {
    title: 'Guarantee only when it is one',
    detail:
      'MetaMask labels a simulation “Estimated changes” unless the outcome is enforced. Strict post conditions are enforcement, so Leather can say more, and says less when it can’t.',
    screens: ['contract-call-known', 'contract-call-estimated'],
  },
  {
    title: 'The total is a row, not a poster',
    detail:
      'Apple Pay and the W3C payment confirmation dialog put the amount in a labelled row next to the confirm action.',
    screens: ['transfer-stx-large'],
  },
  {
    title: 'Verb and object on the button',
    detail:
      'Apple and Stripe avoid Confirm and OK. The verb repeats the title at the moment of commitment.',
    screens: ['contract-call-known', 'deploy-contract'],
  },
  {
    title: 'Switch only when the request isn’t bound',
    detail:
      'Apple Pay lets you change cards, but a payment confirmation shows a fixed instrument when the request binds one.',
    screens: ['connect-first', 'sign-mismatch'],
  },
  {
    title: 'Intent first, fields in device order',
    detail:
      'Ledger’s review starts with the intent, then From, Amount, To and Fee. Rehearsing that order in the popup prepares people for the device.',
    screens: ['ledger-device'],
  },
  {
    title: 'Signature progress for shared accounts',
    detail:
      'Safe shows 1 of 2, and Liana and Bitcoin Core warn before signing when the wallet doesn’t hold the right keys.',
    screens: ['sign-transaction-multisig-cosign', 'account-not-signer'],
  },
  {
    title: 'Site checks that name their source',
    detail:
      'Rabby lists who vouches for a site and whether it’s on a phishing list; MetaMask and Phantom block known scam sites.',
    screens: ['source-connect-new', 'source-site-flagged'],
  },
  {
    title: 'Queues and Reject all',
    detail: 'MetaMask queues requests with a count and a way to reject the lot.',
    screens: ['queue-multiple-requests'],
  },
  {
    title: 'Fee guardrails',
    detail: 'COLDCARD and Ledger flag a fee that is a large share of what’s sent.',
    screens: ['send-transfer-high-fee'],
  },
];

export const aboutAhead: AboutComparison[] = [
  {
    title: 'Guaranteed outcomes by default',
    detail: 'Post conditions are limits the chain enforces, not a simulation that can be wrong.',
    screens: ['contract-call-known'],
  },
  {
    title: 'Honest about who broadcasts and who set the fee',
    detail: 'Sign-only requests say the site sends it, and an app’s fee stays labelled Set by app.',
    screens: ['sign-transaction-app-fee', 'send-transfer-sign-only'],
  },
  {
    title: 'Bitcoin, coin by coin',
    detail: 'Each input and output reads as yours, change, someone else’s or data.',
    screens: ['sign-psbt-marketplace', 'send-transfer-taproot'],
  },
  {
    title: 'Ledger warnings before the device',
    detail: 'Blind signing and external inputs are named before you press Sign.',
    screens: ['ledger-preflight', 'ledger-btc-preflight'],
  },
  {
    title: 'Contract ownership and decoded vault proposals',
    detail:
      'The Origin hackday project proves who owns a contract through its domain, and vault proposals are decoded inside the signing window.',
    screens: ['source-contract-confirmed', 'message-multisig-proposal'],
  },
];

interface AboutDirectionNote {
  directionId: string;
  borrowed: string;
  sources: AboutLink[];
}

export const aboutDirectionsLede =
  'Eight visual directions over the same pattern and the same facts. They’re ranked in the order of the switcher, with Baseline as the reference every other direction falls back to. Discarded directions stay here to look back at.';

export const aboutDirectionNotes: AboutDirectionNote[] = [
  {
    directionId: 'proposal',
    borrowed: 'Leather’s own order today, the rows MetaMask users know, and Ledger’s review order.',
    sources: [ledgerGuidelines],
  },
  {
    directionId: 'activity',
    borrowed:
      'Activity details read like the approval in the past tense: same slots, same order, so what you approve is what you find later.',
    sources: [],
  },
  {
    directionId: 'handshake',
    borrowed:
      'Plaid and Ramp open a connection by drawing the two brands together into one pair that stays at the top, then show read-only facts in a single outlined box and keep fills for what you can act on.',
    sources: [],
  },
  {
    directionId: 'breakdown',
    borrowed:
      'Wise shows money as an equation on a thin rail: you send, minus fees, what arrives. Fees are named and split, timing is its own line, and the guarantee sits on the number it protects.',
    sources: [wiseSend],
  },
  {
    directionId: 'balance',
    borrowed: 'Rabby and MetaMask show the change to your balances as plus and minus lines.',
    sources: [metamaskSimulations],
  },
  {
    directionId: 'receipt',
    borrowed:
      'Apple Pay and Stripe Checkout keep every fact as a labelled row in one sheet, with the total in the same list.',
    sources: [applePay],
  },
  {
    directionId: 'tactile',
    borrowed:
      'Family leads with the object that moves, uses compact trays instead of pages, and lets motion mark the step that matters.',
    sources: [familyValues, familyShots],
  },
  {
    directionId: 'phantom',
    borrowed: 'Calm consumer wallets centre the site and the title over soft grouped tiles.',
    sources: [],
  },
];

interface AboutDecisionGroup {
  label: string;
  decisionIds: string[];
}

export const aboutDecisionGroups: AboutDecisionGroup[] = [
  {
    label: 'Shape every screen',
    decisionIds: [
      'title-type',
      'headline',
      'account-placement',
      'details-default',
      'verbs',
      'network-label',
      'brand',
      'launch-moment',
      'reversibility-line',
      'fiat-display',
      'approval-activity-continuity',
      'scope',
    ],
  },
  {
    label: 'Accounts and networks',
    decisionIds: [
      'switching',
      'repeat-connect',
      'account-events',
      'network-switch-request',
      'address-mismatch',
      'vault-message',
      'app-storage-key',
      'gaia-methods',
    ],
  },
  {
    label: 'Who is asking',
    decisionIds: [
      'source-checks',
      'contract-origin',
      'scam-list-override',
      'domain-display',
      'embedded-unknown',
      'registry',
    ],
  },
  {
    label: 'What moves and fees',
    decisionIds: [
      'post-condition-modes',
      'simulation',
      'app-fee',
      'pending-nonce',
      'slippage-guardrail',
      'sbtc-bridge-framing',
      'staking-postconditions',
      'standing-permissions',
      'spend-source',
      'fee-guardrail',
      'multi-recipient-addresses',
      'recipient-names',
      'sighash-none',
      'speed-up',
    ],
  },
  {
    label: 'Warnings, friction and flow',
    decisionIds: [
      'risk-tiers',
      'confirm-friction',
      'click-guard',
      'request-queue',
      'results',
      'measurement',
      'sign-in-with-stacks',
      'message-format',
    ],
  },
  {
    label: 'Vaults and hardware',
    decisionIds: [
      'proposal-signing',
      'proposal-steps',
      'stx-key-order',
      'vault-queue',
      'vault-decline',
      'vault-hash-compare',
      'ledger-preflight',
    ],
  },
];

export const aboutMeasurementLede =
  'The pattern ships with six events, so the team can tell whether people read, whether cautions change what they do, whether extra steps hold people up without stopping them, and what happened after. None of them carries an address, amount, message, transaction id or site.';

interface AboutStep {
  title: string;
  detail: string;
  issues: number[];
}

export const aboutSteps: AboutStep[] = [
  {
    title: 'Header and footer rules on the shared Stacks layout',
    detail:
      'Site, network and account in one header; Cancel always; the verb on the primary; exact amounts. It covers every Stacks transaction at once. The approval events ship with it.',
    issues: [2587],
  },
  {
    title: 'Connect rebuilt against the same header',
    detail: 'The connected account preselected, the account in the button, the network named.',
    issues: [2671, 2708],
  },
  {
    title: 'PSBT and message screens move onto the shell',
    detail:
      'Four screens, keeping the PSBT fee read from the transaction, the raw view and the can’t-read state. Spend sources land here.',
    issues: [2587, 2738],
  },
  {
    title: 'Contract call language',
    detail:
      'Leather-written sentences, post condition modes in plain words, the known contract list, fee source labels and correct token totals.',
    issues: [2659, 2326, 2700, 2624],
  },
  {
    title: 'States and hardware',
    detail:
      'Loading keeps the frame, blocked states keep Cancel, results match outcomes, and Leather warns before the Ledger does.',
    issues: [2699, 2752],
  },
];

export const aboutStepsLede =
  'Incremental and rules first. Each step ships on its own and moves more screens onto the shell.';

interface AboutQuestion {
  question: string;
  detail: string;
  screens: string[];
}

export const aboutQuestions: AboutQuestion[] = [
  {
    question: 'Who runs the dry run?',
    detail:
      'A third-party simulator such as stxer sees every unsigned transaction first; a Leather-run node costs infrastructure. Either way, screens have to work when it’s unavailable.',
    screens: ['contract-call-estimated', 'contract-call-simulation-unavailable'],
  },
  {
    question: 'Where do rewards land for a native BTC bond?',
    detail: 'The bond entry screen needs to name the address that receives the weekly rewards.',
    screens: ['stake-bond-entry'],
  },
  {
    question: 'What is the bond’s exit co-signer?',
    detail:
      'SIP-045 describes a signer set; the developer docs describe a single service. The early exit screens name it.',
    screens: ['stake-announce-exit', 'sign-psbt-bond-exit'],
  },
  {
    question: 'Does pox-5 keep delegate-stx?',
    detail:
      'And can a pool’s contract extend or change a stake later without a new approval? The permission screen’s “can’t” line holds only if it can’t.',
    screens: ['permission-delegate-stx', 'permission-revoke'],
  },
  {
    question: 'How does the Stacks Ledger app show a vault co-sign hash?',
    detail:
      'The compare step groups the hash the way the device does, so the grouping has to be checked before build.',
    screens: ['vault-ledger-hash'],
  },
  {
    question: 'Can Leather tell that blind signing is already allowed?',
    detail:
      'Leather can predict when the Stacks app will ask for it, but not the device setting, and the device’s reason text is dropped today.',
    screens: ['ledger-preflight', 'ledger-rejected-payload'],
  },
  {
    question: 'Where do BNS lookups come from?',
    detail:
      'A Hiro API or a Leather-run node, and how old a lookup can be before the screen repeats it.',
    screens: ['transfer-bns-name', 'transfer-bns-name-changed'],
  },
  {
    question: 'What does press and hold become for screen readers?',
    detail:
      'Space works as a hold from the keyboard. Screen readers and switch access need an equivalent that is just as deliberate.',
    screens: ['contract-call-allow'],
  },
  {
    question: 'Who maintains the known contract list?',
    detail: 'How the extension reads it, and whether it is signed and versioned.',
    screens: ['contract-call-unknown'],
  },
  {
    question: 'Can vault proposals carry their payload?',
    detail:
      'Showing the proposal needs the payload sent alongside the hash, and one-step proposing needs the nonce fixed when the proposal is made.',
    screens: ['message-multisig-proposal', 'contract-call-multisig-propose'],
  },
  {
    question: 'Which error codes do sites get back?',
    detail:
      'Leather’s codes differ from SIP-030 today, and an unknown network or an address mismatch needs a code sites can act on.',
    screens: ['network-unknown', 'sign-mismatch'],
  },
  {
    question: 'Which storage hub goes with stx_getAccounts?',
    detail: 'If Leather hands sites a storage key, it has to pick the Gaia hub that comes with it.',
    screens: ['sip030-get-accounts'],
  },
  {
    question: 'Who provides the scam list?',
    detail: 'Blocking a flagged site depends on a list provider Leather doesn’t have yet.',
    screens: ['source-site-flagged'],
  },
  {
    question: 'Will sBTC apps send the deposit scripts?',
    detail:
      'Leather can only frame a deposit as a bridge if it can rebuild the deposit address from the scripts.',
    screens: ['sbtc-deposit'],
  },
];

interface AboutSourceGroup {
  label: string;
  links: AboutLink[];
}

export const aboutSourceGroups: AboutSourceGroup[] = [
  {
    label: 'Research',
    links: [
      bravoLillo,
      egelman,
      anderson,
      akhawe,
      felt,
      spenderStudy,
      intentStudy,
      toctou,
      doubleClickjacking,
    ],
  },
  {
    label: 'Standards and specs',
    links: [
      sip030,
      sip045,
      sip045Amendment,
      erc7730,
      eip5792,
      securePaymentConfirmation,
      walletConnectVerify,
      chromiumUrlDisplay,
      chromiumInputDelay,
      ariaDialog,
      wcagTiming,
      wcagErrorPrevention,
      wcagStatus,
      w3cBidi,
    ],
  },
  {
    label: 'Wallets and devices',
    links: [
      metamaskSimulations,
      metamaskAlerts,
      phantomSecurity,
      rabbyConnect,
      rabbySwap,
      rabbyCrossToken,
      safeVerify,
      safeNonce,
      ledgerGuidelines,
      coldcard,
      applePay,
      chromeLock,
      stxer,
    ],
  },
  {
    label: 'Inspiration',
    links: [wiseSend, familyValues, familyShots],
  },
];
