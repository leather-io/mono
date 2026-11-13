import { LEATHER_DOCS } from '~/constants/leather-docs';

import { leatherDocsDiscontinuedUrl, leatherDocsGuideUrl } from './leather-docs-guides';
import { appsPagePath } from './retired-posts';

// Generated from the leather.io Framer sitemap audit (leather-io/mono#2579).
// Slugs from the retired Framer/Notion `/posts` collection that have no Sanity post or guide.
// Every target is a final URL (a Leather Docs page, the docs blog, or a page served by the app),
// never another redirect; content-slug-resolver.spec.ts guards against chains.

const legacyContentRedirects = new Map<string, string>([
  // Stamp Scan app listing; Stamps support ended (high confidence)
  ['app-stamp-scan', leatherDocsDiscontinuedUrl('stamps')],
  // Same app, Sanity post (high confidence)
  ['apps-arkadiko', appsPagePath],
  // BeFi Labs listing; no Sanity content (low confidence)
  ['apps-befi-labs', appsPagePath],
  // Same app, Sanity post (high confidence)
  ['apps-bitflow', appsPagePath],
  // Same app, Sanity post (high confidence)
  ['apps-lisa', appsPagePath],
  // Lockstacks listing; no Sanity content (low confidence)
  ['apps-lockstacks', appsPagePath],
  // Magic Eden (Ordinals/BRC-20 marketplace) listing; existing leather-magic-eden already maps here (high confidence)
  ['apps-magic-eden', leatherDocsDiscontinuedUrl('ordinals')],
  // Matrica (Ordinals holder verification) listing; Ordinals support ended (medium confidence)
  ['apps-matrica', leatherDocsDiscontinuedUrl('ordinals')],
  // OpenStamp (Stamps marketplace) listing; Stamps support ended (high confidence)
  ['apps-openstamp', leatherDocsDiscontinuedUrl('stamps')],
  // Ordinals Wallet listing; Ordinals support ended (high confidence)
  ['apps-ordinals-wallet', leatherDocsDiscontinuedUrl('ordinals')],
  // OrdinalsBot listing; existing leather-ordinalsbot already maps here (high confidence)
  ['apps-ordinalsbot', leatherDocsDiscontinuedUrl('ordinals')],
  // Ordio (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  ['apps-ordio', leatherDocsDiscontinuedUrl('ordinals')],
  // Ordzaar (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  ['apps-ordzaar', leatherDocsDiscontinuedUrl('ordinals')],
  // Rune Alpha (Runes marketplace) listing; Runes support ended (high confidence)
  ['apps-rune-alpha', leatherDocsDiscontinuedUrl('runes')],
  // sOrdinals (inscriptions on Stacks) listing; closest is the inscriptions deprecation notice (low confidence)
  ['apps-sordinals', leatherDocsDiscontinuedUrl('ordinals')],
  // Same app, Sanity post (high confidence)
  ['apps-stacking-dao', appsPagePath],
  // StackSwap is a Stacks DEX; generic Stacks swaps post (medium confidence)
  ['apps-stackswap', leatherDocsGuideUrl('stacks-swaps')],
  // STX20 (inscriptions on Stacks) listing; no Sanity content (low confidence)
  ['apps-stx20-com', appsPagePath],
  // UniSat listing; existing leather-unisat already maps here (high confidence)
  ['apps-unisat', leatherDocsDiscontinuedUrl('ordinals')],
  // Same app, Sanity post (high confidence)
  ['apps-velar', appsPagePath],
  // XLink rebranded as Brotocol (high confidence)
  ['apps-xlink', appsPagePath],
  // Same app, Sanity post (high confidence)
  ['apps-zest-protocol', appsPagePath],
  // BeFi Labs listing; no Sanity content (low confidence)
  ['befi-labs', LEATHER_DOCS.blog],
  // BNS app listing; BNS explainer (high confidence)
  ['bns-gateway', leatherDocsGuideUrl('bns')],
  // BNS app listing; BNS explainer (high confidence)
  ['bns-hub', leatherDocsGuideUrl('bns')],
  // BNS app listing; BNS explainer (high confidence)
  ['bns-one', leatherDocsGuideUrl('bns')],
  // Runes how-to; Runes support ended (high confidence)
  ['buy-and-sell-decentralized-runes-tokens', leatherDocsDiscontinuedUrl('runes')],
  // Ordinals FAQ; Ordinals support ended (high confidence)
  ['can-i-inscribe-and-trade-ordinals-with-leather', leatherDocsDiscontinuedUrl('ordinals')],
  // BRC-20 FAQ; BRC-20 slugs already map to the Ordinals deprecation post (high confidence)
  [
    'can-leather-users-also-conduct-transactions-with-brc-20-tokens',
    leatherDocsDiscontinuedUrl('ordinals'),
  ],
  // Same collection, Sanity collection guide (high confidence)
  ['collections-bitcoin-frogs', leatherDocsDiscontinuedUrl('ordinals')],
  // Ordinals collection page with no Sanity equivalent; Ordinals support ended (medium confidence)
  ['collections-bitcoin-puppets', leatherDocsDiscontinuedUrl('ordinals')],
  // Only Sanity post about BitcoinWhales (interview) (medium confidence)
  ['collections-bitcoin-whales', LEATHER_DOCS.blog],
  // Same collection, Sanity collection guide (high confidence)
  ['collections-nodemonkes', leatherDocsDiscontinuedUrl('ordinals')],
  // Same collection, Sanity collection guide (high confidence)
  ['collections-ordinal-maxi-biz', leatherDocsDiscontinuedUrl('ordinals')],
  // Same collection, Sanity collection guide (high confidence)
  ['collections-quantum-cats', leatherDocsDiscontinuedUrl('ordinals')],
  // Same collection, Sanity collection guide (high confidence)
  ['collections-runestones', leatherDocsDiscontinuedUrl('ordinals')],
  // Same collection, Sanity collection guide (high confidence)
  ['collections-taproot-wizards', leatherDocsDiscontinuedUrl('ordinals')],
  // Gamma (Ordinals creator) listing; existing create-ordinals-gamma already maps here (high confidence)
  ['gamma', leatherDocsDiscontinuedUrl('ordinals')],
  // Retired legacy guides section hub; help center is the hub now (high confidence)
  ['getting-started-guide', LEATHER_DOCS.guides],
  // Old FAQ; same topic guide (high confidence)
  ['how-can-i-secure-my-secret-key', leatherDocsGuideUrl('secure-secret-key')],
  // Old FAQ; Lock and Unlock Wallet (medium confidence)
  ['how-do-i-access-my-leather-account', leatherDocsGuideUrl('lock-and-unlock-wallet')],
  // Old FAQ; closest buy how-to (low confidence)
  ['how-do-i-buy-tokens-with-leather', leatherDocsGuideUrl('how-to-buy-bitcoin')],
  // Old FAQ; Connect to apps (high confidence)
  ['how-do-i-connect-my-leather-account-to-applications', leatherDocsGuideUrl('connect-apps')],
  // Old FAQ; same topic guide (high confidence)
  ['how-do-i-install-the-leather-browser-extension', leatherDocsGuideUrl('install-leather')],
  // Old FAQ; same topic guide (high confidence)
  ['how-do-you-receive-assets-via-leather', leatherDocsGuideUrl('receive-assets')],
  // Old FAQ; no generic send guide, Send Bitcoin is the closest (medium confidence)
  ['how-do-you-send-assets-via-leather', leatherDocsGuideUrl('send-bitcoin')],
  // Magic Eden (Ordinals/BRC-20 marketplace) listing; existing leather-magic-eden already maps here (high confidence)
  ['magic-eden', leatherDocsDiscontinuedUrl('ordinals')],
  // Matrica (Ordinals holder verification) listing; Ordinals support ended (medium confidence)
  ['matrica', leatherDocsDiscontinuedUrl('ordinals')],
  // Fast Pool minimum commitment; generic Stacking minimum commitment post (medium confidence)
  ['minimum-commitment-fast-pool', leatherDocsGuideUrl('stacking-minimum-commitment')],
  // Mobile wallet landing; downloads live on the home page (medium confidence)
  ['mobile-crypto-wallet', '/'],
  // Same collection (typo slug), Sanity collection guide (high confidence)
  ['omb-ordinal-maxi-bix', leatherDocsDiscontinuedUrl('ordinals')],
  // OpenStamp (Stamps marketplace) listing; Stamps support ended (high confidence)
  ['openstamp', leatherDocsDiscontinuedUrl('stamps')],
  // Ordinals Wallet listing; Ordinals support ended (high confidence)
  ['ordinals-wallet', leatherDocsDiscontinuedUrl('ordinals')],
  // OrdinalsBot listing; existing leather-ordinalsbot already maps here (high confidence)
  ['ordinalsbot', leatherDocsDiscontinuedUrl('ordinals')],
  // Ordio (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  ['ordio', leatherDocsDiscontinuedUrl('ordinals')],
  // Ordzaar (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  ['ordzaar', leatherDocsDiscontinuedUrl('ordinals')],
  // Rune Alpha (Runes marketplace) listing; Runes support ended (high confidence)
  ['rune-alpha', leatherDocsDiscontinuedUrl('runes')],
  // Extension stx_transferStx help link (/guides/send-stacks-from-app); Send STX guide (medium confidence)
  ['send-stacks-from-app', leatherDocsGuideUrl('send-stx')],
  // sOrdinals (inscriptions on Stacks) listing; closest is the inscriptions deprecation notice (low confidence)
  ['sordinals', leatherDocsDiscontinuedUrl('ordinals')],
  // StackSwap is a Stacks DEX; generic Stacks swaps post (medium confidence)
  ['stackswap', leatherDocsGuideUrl('stacks-swaps')],
  // Stamp Scan app listing; Stamps support ended (high confidence)
  ['stamp-scan', leatherDocsDiscontinuedUrl('stamps')],
  // Retired legacy guides section hub; help center is the hub now (high confidence)
  ['start-with-leather', LEATHER_DOCS.guides],
  // STX20 (inscriptions on Stacks) listing; no Sanity content (low confidence)
  ['stx20-com', LEATHER_DOCS.blog],
  // BRC-20 token page; BRC-20 slugs already map to the Ordinals deprecation post (high confidence)
  ['tokens-brc-20', leatherDocsDiscontinuedUrl('ordinals')],
  // BTC token directory page; no single equivalent (low confidence)
  ['tokens-btc', LEATHER_DOCS.blog],
  // Runes token page; Runes support ended (high confidence)
  ['tokens-runes', leatherDocsDiscontinuedUrl('runes')],
  // SIP-10 = Stacks contract tokens; help center guide (medium confidence)
  ['tokens-sip-10', leatherDocsGuideUrl('receive-stacks-contract-tokens')],
  // SRC-20 token page; Stamps/SRC-20 support ended (high confidence)
  ['tokens-src-20', leatherDocsDiscontinuedUrl('stamps')],
  // STX token page; Stacks token (STX) post (high confidence)
  ['tokens-stx', leatherDocsGuideUrl('stacks-token-stx')],
  // STX-20 token page; no Sanity content (low confidence)
  ['tokens-stx-20', LEATHER_DOCS.blog],
  // UniSat listing; existing leather-unisat already maps here (high confidence)
  ['unisat', leatherDocsDiscontinuedUrl('ordinals')],
  // Wallet comparison page; closest Sanity comparison post (low confidence)
  ['wallets-comparison', leatherDocsGuideUrl('custodial-vs-non-custodial-wallet')],
  // Stamps FAQ; Stamps support ended (high confidence)
  ['what-about-other-collectibles-like-bitcoin-stamps', leatherDocsDiscontinuedUrl('stamps')],
  // Old FAQ; install guide lists supported platforms (medium confidence)
  ['what-are-the-system-requirements-for-running-leather', leatherDocsGuideUrl('install-leather')],
  // Old FAQ; Recover Secret Key with Backup Data (medium confidence)
  ['what-do-i-do-if-i-ve-lost-my-secret-key', leatherDocsGuideUrl('recover-secret-key')],
  // Old FAQ; secret key guide (medium confidence)
  [
    'what-is-the-difference-between-a-secret-key-and-a-password',
    leatherDocsGuideUrl('secure-secret-key'),
  ],
  // Old FAQ; install guide lists supported platforms (medium confidence)
  [
    'what-operating-systems-and-browser-requirements-do-i-need-to-run-leather',
    leatherDocsGuideUrl('install-leather'),
  ],
  // Ordinals marketplaces list; Ordinals support ended (high confidence)
  ['where-to-buy-bitcoin-ordinals-marketplaces', leatherDocsDiscontinuedUrl('ordinals')],
  // Fast Pool yield detail; Fast Pool post (medium confidence)
  ['yield-type-fast-pool', leatherDocsGuideUrl('fast-pool')],
]);

export function getLegacyContentTarget(slug: string) {
  return legacyContentRedirects.get(slug) ?? null;
}

export function getLegacyContentEntries() {
  return [...legacyContentRedirects.entries()];
}
