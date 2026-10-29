// Generated from the leather.io Framer sitemap audit (leather-io/mono#2579).
// Slugs from the retired Framer/Notion `/posts` collection that have no Sanity post or guide.
// Only consulted when Sanity has neither a post nor a guide for the slug. Every `to` is a final
// URL (a served Sanity post/guide or page), never another redirect; content-slug-resolver.spec.ts
// guards against chains. `retire` answers 410 Gone.

export type LegacyContentTarget = { action: 'redirect'; to: `/${string}` } | { action: 'retire' };

const legacyContentRedirects = new Map<string, LegacyContentTarget>([
  // Stamp Scan app listing; Stamps support ended (high confidence)
  ['app-stamp-scan', { action: 'redirect', to: '/posts/leather-stamps-src20-wallet' }],
  // Same app, Sanity post (high confidence)
  ['apps-arkadiko', { action: 'redirect', to: '/posts/arkadiko' }],
  // BeFi Labs listing; no Sanity content (low confidence)
  ['apps-befi-labs', { action: 'retire' }],
  // Same app, Sanity post (high confidence)
  ['apps-bitflow', { action: 'redirect', to: '/posts/bitflow' }],
  // Same app, Sanity post (high confidence)
  ['apps-lisa', { action: 'redirect', to: '/posts/lisa' }],
  // Lockstacks listing; no Sanity content (low confidence)
  ['apps-lockstacks', { action: 'retire' }],
  // Magic Eden (Ordinals/BRC-20 marketplace) listing; existing leather-magic-eden already maps here (high confidence)
  [
    'apps-magic-eden',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Matrica (Ordinals holder verification) listing; Ordinals support ended (medium confidence)
  [
    'apps-matrica',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // OpenStamp (Stamps marketplace) listing; Stamps support ended (high confidence)
  ['apps-openstamp', { action: 'redirect', to: '/posts/leather-stamps-src20-wallet' }],
  // Ordinals Wallet listing; Ordinals support ended (high confidence)
  [
    'apps-ordinals-wallet',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // OrdinalsBot listing; existing leather-ordinalsbot already maps here (high confidence)
  [
    'apps-ordinalsbot',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Ordio (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  [
    'apps-ordio',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Ordzaar (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  [
    'apps-ordzaar',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Rune Alpha (Runes marketplace) listing; Runes support ended (high confidence)
  ['apps-rune-alpha', { action: 'redirect', to: '/posts/leather-runes-wallet' }],
  // sOrdinals (inscriptions on Stacks) listing; closest is the inscriptions deprecation notice (low confidence)
  [
    'apps-sordinals',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Same app, Sanity post (high confidence)
  ['apps-stacking-dao', { action: 'redirect', to: '/posts/stacking-dao' }],
  // StackSwap is a Stacks DEX; generic Stacks swaps post (medium confidence)
  ['apps-stackswap', { action: 'redirect', to: '/posts/stacks-swaps' }],
  // STX20 (inscriptions on Stacks) listing; no Sanity content (low confidence)
  ['apps-stx20-com', { action: 'retire' }],
  // UniSat listing; existing leather-unisat already maps here (high confidence)
  [
    'apps-unisat',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Same app, Sanity post (high confidence)
  ['apps-velar', { action: 'redirect', to: '/posts/velar' }],
  // XLink rebranded as Brotocol (high confidence)
  ['apps-xlink', { action: 'redirect', to: '/posts/brotocol' }],
  // Same app, Sanity post (high confidence)
  ['apps-zest-protocol', { action: 'redirect', to: '/posts/zest' }],
  // BeFi Labs listing; no Sanity content (low confidence)
  ['befi-labs', { action: 'retire' }],
  // BNS app listing; BNS explainer (high confidence)
  ['bns-gateway', { action: 'redirect', to: '/posts/bns' }],
  // BNS app listing; BNS explainer (high confidence)
  ['bns-hub', { action: 'redirect', to: '/posts/bns' }],
  // BNS app listing; BNS explainer (high confidence)
  ['bns-one', { action: 'redirect', to: '/posts/bns' }],
  // Runes how-to; Runes support ended (high confidence)
  [
    'buy-and-sell-decentralized-runes-tokens',
    { action: 'redirect', to: '/posts/leather-runes-wallet' },
  ],
  // Ordinals FAQ; Ordinals support ended (high confidence)
  [
    'can-i-inscribe-and-trade-ordinals-with-leather',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // BRC-20 FAQ; BRC-20 slugs already map to the Ordinals deprecation post (high confidence)
  [
    'can-leather-users-also-conduct-transactions-with-brc-20-tokens',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Same collection, Sanity collection guide (high confidence)
  [
    'collections-bitcoin-frogs',
    {
      action: 'redirect',
      to: '/posts/guide-to-bitcoin-ordinals-collections-what-is-bitcoin-frogs',
    },
  ],
  // Ordinals collection page with no Sanity equivalent; Ordinals support ended (medium confidence)
  [
    'collections-bitcoin-puppets',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Only Sanity post about BitcoinWhales (interview) (medium confidence)
  [
    'collections-bitcoin-whales',
    { action: 'redirect', to: '/posts/building-bitcoin-culture-with-tosyo-of-bitcoinwhales' },
  ],
  // Same collection, Sanity collection guide (high confidence)
  [
    'collections-nodemonkes',
    { action: 'redirect', to: '/posts/guide-to-bitcoin-ordinals-collections-what-is-nodemonkes' },
  ],
  // Same collection, Sanity collection guide (high confidence)
  [
    'collections-ordinal-maxi-biz',
    {
      action: 'redirect',
      to: '/posts/guide-to-bitcoin-ordinals-collections-what-is-ordinal-maxi-biz',
    },
  ],
  // Same collection, Sanity collection guide (high confidence)
  [
    'collections-quantum-cats',
    { action: 'redirect', to: '/posts/guide-to-bitcoin-ordinal-collections-quantum-cats' },
  ],
  // Same collection, Sanity collection guide (high confidence)
  [
    'collections-runestones',
    { action: 'redirect', to: '/posts/guide-to-ordinal-collections-what-are-runestones' },
  ],
  // Same collection, Sanity collection guide (high confidence)
  [
    'collections-taproot-wizards',
    { action: 'redirect', to: '/posts/guide-to-ordinal-collections-what-are-taproot-wizards' },
  ],
  // Gamma (Ordinals creator) listing; existing create-ordinals-gamma already maps here (high confidence)
  [
    'gamma',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Retired legacy guides section hub; help center is the hub now (high confidence)
  ['getting-started-guide', { action: 'redirect', to: '/support' }],
  // Old FAQ; same topic guide (high confidence)
  ['how-can-i-secure-my-secret-key', { action: 'redirect', to: '/support/secure-secret-key' }],
  // Old FAQ; Lock and Unlock Wallet (medium confidence)
  [
    'how-do-i-access-my-leather-account',
    { action: 'redirect', to: '/support/lock-and-unlock-wallet' },
  ],
  // Old FAQ; closest buy how-to (low confidence)
  ['how-do-i-buy-tokens-with-leather', { action: 'redirect', to: '/posts/how-to-buy-bitcoin' }],
  // Old FAQ; Connect to apps (high confidence)
  [
    'how-do-i-connect-my-leather-account-to-applications',
    { action: 'redirect', to: '/posts/connect-apps' },
  ],
  // Old FAQ; same topic guide (high confidence)
  [
    'how-do-i-install-the-leather-browser-extension',
    { action: 'redirect', to: '/support/install-leather' },
  ],
  // Old FAQ; same topic guide (high confidence)
  ['how-do-you-receive-assets-via-leather', { action: 'redirect', to: '/support/receive-assets' }],
  // Old FAQ; no generic send guide, Send Bitcoin is the closest (medium confidence)
  ['how-do-you-send-assets-via-leather', { action: 'redirect', to: '/support/send-bitcoin' }],
  // Magic Eden (Ordinals/BRC-20 marketplace) listing; existing leather-magic-eden already maps here (high confidence)
  [
    'magic-eden',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Matrica (Ordinals holder verification) listing; Ordinals support ended (medium confidence)
  [
    'matrica',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Fast Pool minimum commitment; generic Stacking minimum commitment post (medium confidence)
  [
    'minimum-commitment-fast-pool',
    { action: 'redirect', to: '/posts/stacking-minimum-commitment' },
  ],
  // Mobile wallet landing; downloads live on the home page (medium confidence)
  ['mobile-crypto-wallet', { action: 'redirect', to: '/' }],
  // Same collection (typo slug), Sanity collection guide (high confidence)
  [
    'omb-ordinal-maxi-bix',
    {
      action: 'redirect',
      to: '/posts/guide-to-bitcoin-ordinals-collections-what-is-ordinal-maxi-biz',
    },
  ],
  // OpenStamp (Stamps marketplace) listing; Stamps support ended (high confidence)
  ['openstamp', { action: 'redirect', to: '/posts/leather-stamps-src20-wallet' }],
  // Ordinals Wallet listing; Ordinals support ended (high confidence)
  [
    'ordinals-wallet',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // OrdinalsBot listing; existing leather-ordinalsbot already maps here (high confidence)
  [
    'ordinalsbot',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Ordio (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  [
    'ordio',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Ordzaar (Ordinals marketplace) listing; Ordinals support ended (high confidence)
  [
    'ordzaar',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Rune Alpha (Runes marketplace) listing; Runes support ended (high confidence)
  ['rune-alpha', { action: 'redirect', to: '/posts/leather-runes-wallet' }],
  // Extension stx_transferStx help link (/guides/send-stacks-from-app); Send STX guide (medium confidence)
  ['send-stacks-from-app', { action: 'redirect', to: '/support/send-stx' }],
  // sOrdinals (inscriptions on Stacks) listing; closest is the inscriptions deprecation notice (low confidence)
  [
    'sordinals',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // StackSwap is a Stacks DEX; generic Stacks swaps post (medium confidence)
  ['stackswap', { action: 'redirect', to: '/posts/stacks-swaps' }],
  // Stamp Scan app listing; Stamps support ended (high confidence)
  ['stamp-scan', { action: 'redirect', to: '/posts/leather-stamps-src20-wallet' }],
  // Retired legacy guides section hub; help center is the hub now (high confidence)
  ['start-with-leather', { action: 'redirect', to: '/support' }],
  // STX20 (inscriptions on Stacks) listing; no Sanity content (low confidence)
  ['stx20-com', { action: 'retire' }],
  // BRC-20 token page; BRC-20 slugs already map to the Ordinals deprecation post (high confidence)
  [
    'tokens-brc-20',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // BTC token directory page; no single equivalent (low confidence)
  ['tokens-btc', { action: 'retire' }],
  // Runes token page; Runes support ended (high confidence)
  ['tokens-runes', { action: 'redirect', to: '/posts/leather-runes-wallet' }],
  // SIP-10 = Stacks contract tokens; help center guide (medium confidence)
  ['tokens-sip-10', { action: 'redirect', to: '/support/receive-stacks-contract-tokens' }],
  // SRC-20 token page; Stamps/SRC-20 support ended (high confidence)
  ['tokens-src-20', { action: 'redirect', to: '/posts/leather-stamps-src20-wallet' }],
  // STX token page; Stacks token (STX) post (high confidence)
  ['tokens-stx', { action: 'redirect', to: '/posts/stacks-token-stx' }],
  // STX-20 token page; no Sanity content (low confidence)
  ['tokens-stx-20', { action: 'retire' }],
  // UniSat listing; existing leather-unisat already maps here (high confidence)
  [
    'unisat',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Wallet comparison page; closest Sanity comparison post (low confidence)
  ['wallets-comparison', { action: 'redirect', to: '/posts/custodial-vs-non-custodial-wallet' }],
  // Stamps FAQ; Stamps support ended (high confidence)
  [
    'what-about-other-collectibles-like-bitcoin-stamps',
    { action: 'redirect', to: '/posts/leather-stamps-src20-wallet' },
  ],
  // Old FAQ; install guide lists supported platforms (medium confidence)
  [
    'what-are-the-system-requirements-for-running-leather',
    { action: 'redirect', to: '/support/install-leather' },
  ],
  // Old FAQ; Recover Secret Key with Backup Data (medium confidence)
  [
    'what-do-i-do-if-i-ve-lost-my-secret-key',
    { action: 'redirect', to: '/posts/recover-secret-key' },
  ],
  // Old FAQ; secret key guide (medium confidence)
  [
    'what-is-the-difference-between-a-secret-key-and-a-password',
    { action: 'redirect', to: '/support/secure-secret-key' },
  ],
  // Old FAQ; install guide lists supported platforms (medium confidence)
  [
    'what-operating-systems-and-browser-requirements-do-i-need-to-run-leather',
    { action: 'redirect', to: '/support/install-leather' },
  ],
  // Ordinals marketplaces list; Ordinals support ended (high confidence)
  [
    'where-to-buy-bitcoin-ordinals-marketplaces',
    { action: 'redirect', to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather' },
  ],
  // Fast Pool yield detail; Fast Pool post (medium confidence)
  ['yield-type-fast-pool', { action: 'redirect', to: '/posts/fast-pool' }],
]);

export function getLegacyContentTarget(slug: string) {
  return legacyContentRedirects.get(slug) ?? null;
}

export function getLegacyContentEntries() {
  return [...legacyContentRedirects.entries()];
}
