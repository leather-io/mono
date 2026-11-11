import { LEATHER_DOCS } from '~/constants/leather-docs';

// Help center slug → page path in the Guides space of the Leather Docs GitBook site. Taken from the
// GitBook page tree (Nov 2026); the GitBook page slugs match the Sanity guide slugs they replace.
// Blog pages are left out: their slugs belong to /posts.
const leatherDocsGuidePaths = new Map<string, string>([
  // Get started
  ['install-leather', 'get-started/install-leather'],
  ['create-new-wallet', 'get-started/create-new-wallet'],
  ['recovery-phrase', 'get-started/recovery-phrase'],
  ['receive-tokens', 'get-started/receive-tokens'],
  ['receive-assets', 'get-started/receive-assets'],
  ['lock-and-unlock-wallet', 'get-started/lock-and-unlock-wallet'],
  ['view-secret-key', 'get-started/view-secret-key'],
  ['add-or-restore-accounts', 'get-started/add-or-restore-accounts'],
  ['install-leather-source', 'get-started/install-leather-source'],
  ['recover-secret-key', 'get-started/recover-secret-key'],
  ['connect-ledger', 'get-started/connect-ledger'],
  ['install-desktop-bitcoin-wallet', 'get-started/install-desktop-bitcoin-wallet'],
  ['connect-dapps', 'get-started/connect-dapps'],
  ['buy-stx', 'get-started/buy-stx'],
  ['mobile-add-wallet', 'get-started/mobile-add-wallet'],
  ['mobile-remove-wallet', 'get-started/mobile-remove-wallet'],
  ['disconnect-apps', 'get-started/disconnect-apps'],
  ['connect-apps', 'get-started/connect-apps'],
  ['migrate-assets-wallets', 'get-started/migrate-assets-wallets'],
  // Transactions
  ['send-bitcoin', 'transactions/send-bitcoin'],
  ['receive-stx', 'transactions/receive-stx'],
  ['send-stx', 'transactions/send-stx'],
  ['receive-stacks-contract-tokens', 'transactions/receive-stacks-contract-tokens'],
  ['receive-btc', 'transactions/receive-btc'],
  ['receive-stacks-nfts', 'transactions/receive-stacks-nfts'],
  ['bitcoin-address-types', 'transactions/bitcoin-address-types'],
  ['increase-fee', 'transactions/increase-fee'],
  ['pending-transactions', 'transactions/pending-transactions'],
  ['send-bitcoin-from-app', 'transactions/send-bitcoin-from-app'],
  ['configure-transaction-fees', 'transactions/configure-transaction-fees'],
  ['configure-transaction-nonces', 'transactions/configure-transaction-nonces'],
  // Collectibles
  ['receive-collectibles', 'collectibles/receive-collectibles'],
  // Balances
  [
    'why-isnt-all-my-bitcoin-balance-available-spendable',
    'balances/why-isnt-all-my-bitcoin-balance-available-spendable',
  ],
  ['how-to-view-ledger-live-stx-funds-in', 'balances/how-to-view-ledger-live-stx-funds-in'],
  ['withdraw-btc-stacks-legacy-wallet', 'balances/withdraw-btc-stacks-legacy-wallet'],
  // Staking
  ['getting-started-with-stacking', 'stacking/getting-started-with-stacking'],
  ['choose-stacking-method', 'stacking/choose-stacking-method'],
  ['join-stacking-pool', 'stacking/join-stacking-pool'],
  ['track-stacking-rewards', 'stacking/track-stacking-rewards'],
  ['obtain-testnet-stx', 'stacking/obtain-testnet-stx'],
  ['exit-or-restake-stx', 'stacking/exit-or-restake-stx'],
  // sBTC
  ['choose-sbtc-provider', 'sbtc/choose-sbtc-provider'],
  ['withdraw-sbtc', 'sbtc/withdraw-sbtc'],
  ['track-sbtc-rewards', 'sbtc/track-sbtc-rewards'],
  ['swap-sbtc', 'sbtc/swap-sbtc'],
  ['bridge-sbtc', 'sbtc/bridge-sbtc'],
  ['get-sbtc', 'sbtc/get-sbtc'],
  // Wallet and security
  ['leather-password-strength', 'wallet-and-security/leather-password-strength'],
  ['account-privacy', 'wallet-and-security/account-privacy'],
  ['secure-secret-key', 'wallet-and-security/secure-secret-key'],
  ['security', 'wallet-and-security/security'],
  ['secure-crypto-wallet', 'wallet-and-security/secure-crypto-wallet'],
  ['collect-account-diagnostics', 'wallet-and-security/collect-account-diagnostics'],
  ['wallet-derivation-paths', 'wallet-and-security/wallet-derivation-paths'],
  ['multisig-wallet', 'wallet-and-security/multisig-wallet'],
  ['integrated-swap-disabled', 'wallet-and-security/integrated-swap-disabled'],
  // Settings and customization
  ['change-network', 'settings-and-customization/change-network'],
  ['change-theme', 'settings-and-customization/change-theme'],
  ['add-network', 'settings-and-customization/add-network'],
  ['mobile-switch-networks', 'settings-and-customization/mobile-switch-networks'],
  ['mobile-theme', 'settings-and-customization/mobile-theme'],
  ['mobile-app-authentication', 'settings-and-customization/mobile-app-authentication'],
  ['mobile-conversion-unit', 'settings-and-customization/mobile-conversion-unit'],
  ['mobile-account-identifier', 'settings-and-customization/mobile-account-identifier'],
  ['mobile-bitcoin-unit', 'settings-and-customization/mobile-bitcoin-unit'],
  ['mobile-analytics', 'settings-and-customization/mobile-analytics'],
  // Discontinued features
  ['ordinals-inscriptions', 'discontinued/ordinals-inscriptions'],
  ['runes', 'discontinued/runes'],
  ['stamps-src20', 'discontinued/stamps-src20'],
  // Learn
  [
    'what-are-bitcoin-layers-world-of-bitcoin-layer-2',
    'learn/what-are-bitcoin-layers-world-of-bitcoin-layer-2',
  ],
  ['bitcoin-stablecoins', 'learn/bitcoin-stablecoins'],
  ['bitcoin-transaction-fee', 'learn/bitcoin-transaction-fee'],
  ['bitcoin-remittances', 'learn/bitcoin-remittances'],
  ['custodial-vs-non-custodial-wallet', 'learn/custodial-vs-non-custodial-wallet'],
  ['swaps', 'learn/swaps'],
  ['btc-to-stx', 'learn/btc-to-stx'],
  ['bitcoin-transactions', 'learn/bitcoin-transactions'],
  ['how-does-bitcoin-s-utxo-model-work', 'learn/how-does-bitcoin-s-utxo-model-work'],
  ['accelerate-bitcoin-transactions-cpfp', 'learn/accelerate-bitcoin-transactions-cpfp'],
  ['how-to-buy-bitcoin', 'learn/how-to-buy-bitcoin'],
  ['create-bitcoin-wallet', 'learn/create-bitcoin-wallet'],
  ['recover-crypto-wallet', 'learn/recover-crypto-wallet'],
  ['open-bitcoin-account', 'learn/open-bitcoin-account'],
  ['paying-with-bitcoin', 'learn/paying-with-bitcoin'],
  ['how-to-read-a-bitcoin-block-explorer', 'learn/how-to-read-a-bitcoin-block-explorer'],
  ['sell-bitcoin', 'learn/sell-bitcoin'],
  ['how-to-send-bitcoin', 'learn/how-to-send-bitcoin'],
  ['public-private-keys', 'learn/public-private-keys'],
  ['segwit-native-segwit', 'learn/segwit-native-segwit'],
  ['what-are-bitcoin-addresses', 'learn/what-are-bitcoin-addresses'],
  ['bitcoin-atms', 'learn/bitcoin-atms'],
  ['what-are-bitcoin-crypto-swaps', 'learn/what-are-bitcoin-crypto-swaps'],
  ['bitcoin-wallet', 'learn/bitcoin-wallet'],
  ['taproot-address', 'learn/taproot-address'],
  ['use-cases-bitcoin-addresses', 'learn/use-cases-bitcoin-addresses'],
  ['utxos', 'learn/utxos'],
  ['what-are-web3-wallets', 'learn/what-are-web3-wallets'],
  ['what-is-a-bitcoin-hardware-wallet', 'learn/what-is-a-bitcoin-hardware-wallet'],
  ['what-is-a-bitcoin-segwit-address', 'learn/what-is-a-bitcoin-segwit-address'],
  ['what-is-a-blockchain-explorer', 'learn/what-is-a-blockchain-explorer'],
  ['what-is-crypto-dust-attack', 'learn/what-is-crypto-dust-attack'],
  ['what-is-a-legacy-bitcoin-address', 'learn/what-is-a-legacy-bitcoin-address'],
  ['lightning-address', 'learn/lightning-address'],
  ['mempool', 'learn/mempool'],
  ['what-is-a-native-segwit-address', 'learn/what-is-a-native-segwit-address'],
  ['what-is-a-self-custody-bitcoin-wallet', 'learn/what-is-a-self-custody-bitcoin-wallet'],
  ['stacks-wallet', 'learn/stacks-wallet'],
  ['txid', 'learn/txid'],
  [
    'what-is-bitcoin-fee-estimation-and-how-does-it-work',
    'learn/what-is-bitcoin-fee-estimation-and-how-does-it-work',
  ],
  ['bitcoin-halving', 'learn/bitcoin-halving'],
  ['bns', 'learn/bns'],
  ['what-is-decentralized-identity-on-bitcoin', 'learn/what-is-decentralized-identity-on-bitcoin'],
  ['what-is-bitcoin-defi', 'learn/what-is-bitcoin-defi'],
  ['double-spending', 'learn/double-spending'],
  ['op-cat', 'learn/op-cat'],
  ['proof-of-transfer-pox', 'learn/proof-of-transfer-pox'],
  ['replace-by-fee-rbf', 'learn/replace-by-fee-rbf'],
  ['segwit', 'learn/segwit'],
  ['lightning-network', 'learn/lightning-network'],
  ['what-is-stacks', 'learn/what-is-stacks'],
  ['transaction-malleability', 'learn/transaction-malleability'],
  ['witness-data', 'learn/witness-data'],
  ['what-is-bitcoin-web3', 'learn/what-is-bitcoin-web3'],
  [
    'what-makes-stacking-on-stacks-different-from-staking',
    'learn/what-makes-stacking-on-stacks-different-from-staking',
  ],
  [
    'why-transactions-fail-common-error-messages-and-their-solutions',
    'learn/why-transactions-fail-common-error-messages-and-their-solutions',
  ],
  // Staking and sBTC reference
  ['sbtc-rewards-basic', 'stacking-and-sbtc-reference/sbtc-rewards-basic'],
  ['buy-stacks-stx', 'stacking-and-sbtc-reference/buy-stacks-stx'],
  ['sbtc-rewards-provider', 'stacking-and-sbtc-reference/sbtc-rewards-provider'],
  ['fast-pool', 'stacking-and-sbtc-reference/fast-pool'],
  ['historical-yield', 'stacking-and-sbtc-reference/historical-yield'],
  ['liquid-stacking', 'stacking-and-sbtc-reference/liquid-stacking'],
  ['liquid-stacking-conditions', 'stacking-and-sbtc-reference/liquid-stacking-conditions'],
  ['stacking-lock-stx', 'stacking-and-sbtc-reference/stacking-lock-stx'],
  [
    'sbtc-rewards-minimum-commitment',
    'stacking-and-sbtc-reference/sbtc-rewards-minimum-commitment',
  ],
  ['stacking-minimum-commitment', 'stacking-and-sbtc-reference/stacking-minimum-commitment'],
  ['planbetter', 'stacking-and-sbtc-reference/planbetter'],
  ['pooled-stacking', 'stacking-and-sbtc-reference/pooled-stacking'],
  ['pooled-stacking-conditions', 'stacking-and-sbtc-reference/pooled-stacking-conditions'],
  ['pooled-stacking-delegation', 'stacking-and-sbtc-reference/pooled-stacking-delegation'],
  ['bitflow-sbtc-pools', 'stacking-and-sbtc-reference/bitflow-sbtc-pools'],
  ['velar-sbtc-pools', 'stacking-and-sbtc-reference/velar-sbtc-pools'],
  ['zest-sbtc-pools', 'stacking-and-sbtc-reference/zest-sbtc-pools'],
  ['stacking-rewards-tokens', 'stacking-and-sbtc-reference/stacking-rewards-tokens'],
  ['sbtc', 'stacking-and-sbtc-reference/sbtc'],
  ['sbtc-bridge', 'stacking-and-sbtc-reference/sbtc-bridge'],
  ['sbtc-rewards', 'stacking-and-sbtc-reference/sbtc-rewards'],
  ['sbtc-rewards-tokens', 'stacking-and-sbtc-reference/sbtc-rewards-tokens'],
  ['stacking-amount', 'stacking-and-sbtc-reference/stacking-amount'],
  ['stacking-contract-details', 'stacking-and-sbtc-reference/stacking-contract-details'],
  ['stacking-duration', 'stacking-and-sbtc-reference/stacking-duration'],
  ['stacking-liquid-token', 'stacking-and-sbtc-reference/stacking-liquid-token'],
  ['stacking-minimum-lockup-period', 'stacking-and-sbtc-reference/stacking-minimum-lockup-period'],
  ['stacking-pool-fees', 'stacking-and-sbtc-reference/stacking-pool-fees'],
  ['stacking-providers', 'stacking-and-sbtc-reference/stacking-providers'],
  ['stacking-rewards', 'stacking-and-sbtc-reference/stacking-rewards'],
  ['stacking-rewards-address', 'stacking-and-sbtc-reference/stacking-rewards-address'],
  ['stacking-upcoming-cycle', 'stacking-and-sbtc-reference/stacking-upcoming-cycle'],
  ['stacks-apps', 'stacking-and-sbtc-reference/stacks-apps'],
  ['stacks-blockchain', 'stacking-and-sbtc-reference/stacks-blockchain'],
  ['stacks-swaps', 'stacking-and-sbtc-reference/stacks-swaps'],
  ['stacks-token-stx', 'stacking-and-sbtc-reference/stacks-token-stx'],
  ['total-locked-value-tvl', 'stacking-and-sbtc-reference/total-locked-value-tvl'],
  [
    'pooled-stacking-upcoming-rewards',
    'stacking-and-sbtc-reference/pooled-stacking-upcoming-rewards',
  ],
  ['xverse-pool', 'stacking-and-sbtc-reference/xverse-pool'],
  // Sanity guide slugs that GitBook renamed
  ['what-are-bns-names-(.btc-names)-in-stacks?', 'learn/bns'],
]);

export function hasLeatherDocsGuide(slug: string) {
  return leatherDocsGuidePaths.has(slug);
}

/** The guide's Leather Docs page, or the Guides home when GitBook has no page for the slug. */
export function leatherDocsGuideUrl(slug: string) {
  const path = leatherDocsGuidePaths.get(slug);
  return path ? `${LEATHER_DOCS.guides}/${path}` : LEATHER_DOCS.guides;
}

/**
 * Old in-app help center paths (`/support`, `/support/:slug`) now live on Leather Docs. Redirect tables still name them by their old path; this maps them to the final
 * URL so each legacy link still resolves in a single hop. Other locations pass through unchanged.
 */
export function toLeatherDocsLocation(location: string) {
  if (location === '/support') return LEATHER_DOCS.guides;
  const guideSlug = /^\/support\/([^/]+)$/.exec(location)?.[1];
  return guideSlug ? leatherDocsGuideUrl(decodeURIComponent(guideSlug)) : location;
}
