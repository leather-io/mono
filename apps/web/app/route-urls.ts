import type { Register } from 'react-router';

type RoutePath = keyof Register['pages'];

type NonProductionRoutePath =
  | '/multisig/transaction-preview'
  | '/multisig/sidebar-preview'
  | '/multisig/context-preview';

export const RouteUrls = {
  Index: '/',
  Sbtc: '/sbtc',
  Changelog: '/changelog',
  ChangelogEntry: '/changelog/:slug',
  ChangelogRss: '/changelog.xml',
  Portfolio: '/portfolio',
  Post: '/posts/:postSlug',
  Support: '/support',
  SupportSearch: '/support/search',
  SupportGuideRedirect: '/support/guide/:slug',
  SupportGuide: '/support/:guideSlug',
  HelpCenterRedirect: '/help-center',
  HelpCenterWildcardRedirect: '/help-center/*',
  StackingRedirect: '/stacking',
  StackingWildcardRedirect: '/stacking/*',
  MultisigTransactionPreview: '/multisig/transaction-preview',
  MultisigSidebarPreview: '/multisig/sidebar-preview',
  MultisigContextPreview: '/multisig/context-preview',
  Multisig: '/multisig',
  MultisigOnboarding: '/multisig/onboarding',
  MultisigCreateVault: '/multisig/create-vault',
  MultisigSettings: '/multisig/settings',
  MultisigVault: '/multisig/vault/:vaultId',
  MultisigAccount: '/multisig/vault/:vaultId/account/:accountId',
  MultisigActivityDetail: '/multisig/vault/:vaultId/account/:accountId/activity/:txid',
  MultisigTransaction: '/multisig/vault/:vaultId/tx/:txId',
  Playground: '/playground',
  PlaygroundStakingAcknowledgment: '/playground/staking-acknowledgment',
  PlaygroundComponentGallery: '/playground/component-gallery',
  PlaygroundPageGallery: '/playground/page-gallery',
  PlaygroundStakingStates: '/playground/staking-states',
  PlaygroundUpdateStakeSwitch: '/playground/update-stake-switch',
  Staking: '/staking',
  StakingStatus: '/staking/status',
  StakingByosm: '/staking/pool/byosm',
  StakingPool: '/staking/pool/:slug',
  StakingPoolActive: '/staking/pool/:slug/active',
  StakingPoolUpdate: '/staking/pool/:slug/update',
  NotFound: '/*',
} as const satisfies Record<string, RoutePath | NonProductionRoutePath>;

export type RouteUrls = (typeof RouteUrls)[keyof typeof RouteUrls];
